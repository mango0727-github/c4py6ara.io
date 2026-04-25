---
layout: post
title: Building a Single-Process PDF Fuzzer
description: >
  Notes from building a coverage-guided PDF fuzzer that avoids repeated shell launches, shares inputs through mmap, and keeps a hooked target resident behind a small forkserver loop.
sitemap: false
math: false
hide_last_modified: true
---

I built this project as part of a fuzzing exercise, but it ended up becoming a useful small case study in fuzzer engineering. The repository is here: [project_fuzzer](https://github.com/mango0727-github/project_fuzzer).

The main goal was simple: reduce execution overhead enough that the fuzzer spends more time exercising the target and less time rebuilding process state. My earlier versions launched the target through `system()`, which meant paying for a shell on every iteration. Later versions moved to `fork()` and `execl()`, which was already better, but the design still restarted too much machinery for each test case. The final version moved closer to a single-process workflow by keeping a hooked target process alive and sending it new work through a lightweight control channel.

## Why I focused on process overhead

Fuzzers live and die by throughput. If two fuzzers mutate inputs with similar quality but one runs meaningfully more test cases per second, the faster one will usually explore more states and find bugs earlier.

My optimization path looked roughly like this:

1. Start from a black-box design that shells out with `system()`.
2. Remove the shell and invoke the target directly with `fork()` and `execl()`.
3. Move input delivery into shared memory with `mmap()`.
4. Keep a hooked target resident and let it repeatedly fork children for each test case.

This last step is the most important architectural change. Strictly speaking, the target still forks child processes to isolate executions, so this is not a pure in-process persistent fuzzer. However, the controller no longer rebuilds the full target invocation path on every iteration, and the design behaves much more like a single long-lived fuzzing session than a naive “spawn everything again” loop.

## Architecture

The implementation has three moving parts.

First, the fuzzer creates a temporary PDF file in `/dev/shm` and maps it with `mmap()`. That gives the mutator a shared buffer to edit directly in memory without repeatedly writing a new file through ordinary I/O calls.

Second, the fuzzer starts the target once and injects a small hook with `LD_PRELOAD`. The hook replaces `__libc_start_main`, captures the real `main`, and routes execution through a wrapper:

```c
int fake_main(int argc, char **argv, char **envp) {
  while (1) {
    char cmd;
    if (read(198, &cmd, 1) != 1)
      break;

    pid_t child = fork();

    if (child == 0) {
      exit(target_main(argc, argv, envp));
    } else {
      int status;
      waitpid(child, &status, 0);
      write(199, &status, sizeof(status));
    }
  }
  return 0;
}
```

This turns the target into a very small forkserver. The parent stays alive, waits for a one-byte wakeup signal, forks a child, runs the real target `main()` in the child, and sends the exit status back to the fuzzer through a response pipe.

Third, the fuzzer maintains two coverage maps: the global map and a temporary map for the latest execution. After each run, it reads the current coverage bitmap and checks whether any edge counter increased. If so, the input is considered interesting and added to the in-memory seed pool.

## Coverage-guided seed management

The seed queue is represented as an array of small structs:

```c
typedef struct seed_struct {
  unsigned char *data;
  size_t size;
} seed_struct;
```

At startup, the fuzzer loads seed PDFs from disk, executes them once, and only keeps the ones that actually contribute new coverage. This is a useful filtering step. A seed corpus can contain many files that are technically valid but redundant from the fuzzer’s point of view.

During fuzzing, every mutated input goes through the same test:

1. Execute the target.
2. Read the latest coverage map.
3. Compare it against the global map.
4. If coverage increased, save the input and add it back into the seed pool.

That means the corpus evolves toward inputs that penetrate deeper into the parser rather than simply accumulating random files.

## Mutation strategy

The interesting part of this project is that it is not just a blind bit-flipper. Since the target format is PDF, pure random mutation causes too many files to die in shallow parsing stages. I added several format-aware mutations to improve the odds of reaching deeper logic.

One mutation swaps object bodies between two seed PDFs. The code looks for `obj ... endobj` ranges and replaces one object body with another while keeping the broader file structure intact. That gives the fuzzer a way to make larger semantic jumps than byte-level corruption usually allows.

Another mutation inserts keywords from an external dictionary file, `pdf.dict`, at random positions. This helps the fuzzer inject tokens that are syntactically meaningful to the parser.

I also added mutations that specifically target numeric fields tied to parsing and allocation behavior, such as `/Length`, `/Size`, `/Count`, `/Columns`, `/Predictor`, and font-related entries. These values often influence buffer sizing, loop bounds, decompression behavior, or layout calculations, so they are attractive mutation points.

Finally, the mutator flips bytes inside `stream ... endstream` regions and then repairs the PDF’s cross-reference table and trailer by appending a reconstructed `xref` section. That repair step is important. Without it, many mutated files would be rejected immediately as malformed and never reach the interesting code paths.

In other words, the mutator tries to be destructive enough to find bugs, but not so destructive that the target refuses to parse the file at all.

## Handling crashes and timeouts

The fuzzer separates three outcomes:

1. Normal exit
2. Real crash by signal
3. Timeout terminated by `SIGKILL`

Crashing inputs are saved for later triage. Timeout cases are also saved, but they are not added back into the seed pool. I think this is the right tradeoff. A crashing input is valuable for debugging. A hanging input is useful for performance and denial-of-service analysis. But neither is a good candidate for continued mutation if the goal is efficient path exploration.

This distinction also keeps the corpus healthier. If crashers and pathological hang cases are allowed to dominate the pool, the fuzzer wastes cycles mutating inputs that terminate too early or consume too much time.

## What this design improved

Two improvements mattered most.

The first was removing unnecessary process-launch overhead. Earlier measurements from the intermediate version already showed that replacing `system()` with direct `fork()` and `execl()` reduced runtime overhead. The final hooked-target design pushes that idea further by leaving a controller process resident and reducing the per-test-case control path to pipe notification, fork, execute, collect status, and coverage comparison.

The second was avoiding ordinary file I/O in the hot path. By writing fuzz inputs into an `mmap()`-backed file in `/dev/shm`, the mutator can update test cases in memory and let the target consume them from a RAM-backed location. That is a much better fit for a tight fuzzing loop than creating and rewriting files on slower storage.

## Limits and next steps

This is still a small research fuzzer, not a production-quality engine. The coverage map is external, the target-specific logic is tuned for PDF structure, and the corpus strategy is intentionally simple.

If I continue this project, the next improvements I would make are:

1. Replace the external coverage handoff with a cleaner shared-memory coverage interface.
2. Add stronger minimization for interesting inputs so the corpus grows more slowly.
3. Improve the PDF-aware mutator with object dictionary parsing instead of string-based heuristics.
4. Add crash deduplication so multiple mutations of the same bug are grouped automatically.

Even with those limitations, the project was a good reminder that fuzzing performance is not just about mutation quality. Process architecture matters. Input transport matters. Coverage bookkeeping matters. A fuzzer that wastes less time around the edges gets more chances to hit the bug.
