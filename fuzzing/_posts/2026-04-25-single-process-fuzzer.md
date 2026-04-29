---
layout: post
title: Building a Single-Process PDF Fuzzer
description: >
  Notes on a coverage-guided PDF fuzzer that executes the target in a single process and restores target state between test cases.
sitemap: false
categories: [fuzzing]
math: false
hide_last_modified: true
---

The repository is here: [project_fuzzer](https://github.com/mango0727-github/project_fuzzer).

This work was also informed by ideas from two papers: [_ClosureX: Compiler Support for Correct Persistent Fuzzing_](https://dl.acm.org/doi/pdf/10.1145/3669940.3707281) and [_No Linux, No Problem: Fast and Correct Windows Binary Fuzzing via Target-embedded Snapshotting_](https://www.usenix.org/system/files/usenixsecurity23-stone.pdf).

The goal of this version is to run a PDF parser repeatedly in one process instead of launching a new process for each input. The target is executed re-entrantly, coverage is checked after each run, and target state is restored before the next testcase begins.

## Process overhead

Fuzzers live and die by throughput. If two fuzzers mutate inputs with similar quality but one runs meaningfully more test cases per second, the faster one will usually explore more states and find bugs earlier.

For file-based targets, per-testcase process creation adds avoidable overhead. The `master` version is structured around a persistent execution model. Instead of `fork()` for every input, it links the target with the fuzzer runtime, renames the target entry point to `targetMain`, and calls that function repeatedly from the fuzzing loop.

## Architecture

The implementation has three moving parts.

First, `main.c` manages the top-level fuzzing loop. It opens a reusable temporary input file under `/dev/shm/temp_fuzzer_workdir`, maps it with `mmap()`, loads the initial seed PDFs, and runs trials. Each testcase is written into the same mapped buffer and then passed to the target through the re-entrant runtime.

Second, `runtime.c` is responsible for re-entering the target safely. The target is compiled with its entry point renamed to `targetMain`, and the fuzzer calls it through `call_targetMain_cpp()`. Before each run, the runtime clears the sanitizer counter region. After each run, it copies the current coverage bytes into `coverage_map_tmp`, cleans up tracked state, restores global data, and zeroes the inline coverage counters again.

The core execution path is small:

```c
if (setjmp(init_state) == 0) {
  in_target = 1;
  char *args[] = {(char *)target, (char *)"-q", (char *)file_path,
                  (char *)"/dev/null", NULL};
  status = call_targetMain_cpp(4, args);
  in_target = 0;
  memcpy(coverage_map_tmp, start_address, cov_size);
} else {
  in_target = 0;
  memcpy(coverage_map_tmp, start_address, cov_size);
  status = -1000 - last_target_exit_status;
}
```

Third, `target_shim.cc` and `trace_counter.c` provide the runtime support that makes repeated execution possible. `trace_counter.c` exposes the LLVM inline-8bit counter section boundaries, while `target_shim.cc` wraps allocation, file, and exit-related functions so that leftover state from one testcase does not contaminate the next.

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

That means the corpus evolves toward inputs that penetrate deeper into the parser rather than simply accumulating random files. Coverage is stored in a 64 KB map, and an input is considered interesting when at least one byte in the latest execution exceeds the previous global maximum.

## Mutation strategy

This project is not just a blind bit-flipper. Since the target format is PDF, pure random mutation causes too many files to die in shallow parsing stages. The mutator in `mutator.c` uses several PDF-aware heuristics to improve the odds of reaching deeper logic.

One mutation swaps object bodies between two seed PDFs. The code looks for `obj ... endobj` ranges and replaces one object body with another while keeping the broader file structure intact. That gives the fuzzer a way to make larger semantic jumps than byte-level corruption usually allows.

Another mutation inserts keywords from an external dictionary file, `pdf.dict`, at random positions. This helps the fuzzer inject tokens that are syntactically meaningful to the parser.

The implementation also targets numeric fields tied to parsing and allocation behavior, such as `/Length`, `/Size`, `/Count`, `/Columns`, `/Predictor`, and font-related entries. These values often influence buffer sizing, loop bounds, decompression behavior, or layout calculations, so they are attractive mutation points.

Finally, the mutator flips bytes inside `stream ... endstream` regions and then repairs the PDF’s cross-reference table and trailer by appending a reconstructed `xref` section. That repair step is important. Without it, many mutated files would be rejected immediately as malformed and never reach the interesting code paths.

In other words, the mutator tries to be destructive enough to find bugs, but not so destructive that the target refuses to parse the file at all.

## State reset between runs

The key difference in this version is the reset model. Because the target is not discarded after each testcase, the runtime must restore enough state to make repeated execution valid.

The implementation currently does four main things:

1. It tracks heap allocations created while `in_target` is set and frees any remaining tracked chunks after the run.
2. It tracks opened `FILE *` objects and closes any remaining tracked handles after the run.
3. It snapshots the writable global section at startup and restores it after each run using `CLOSURE_GLOBAL_SECTION_ADDR` and `CLOSURE_GLOBAL_SECTION_SIZE`.
4. It intercepts `exit()` and redirects it through `longjmp()` so that an explicit process exit from the target does not terminate the fuzzer itself.

That reset logic is the core requirement for single-process fuzzing. The throughput benefit only matters if the target can be re-entered without carrying corrupted state into the next iteration.

## What this design improved

Two improvements mattered most.

The first was removing per-input process creation from the hot path. The fuzzing loop no longer needs to launch a fresh target for every testcase. Instead, it reuses the same process, resets counters and tracked resources, and invokes `targetMain` again.

The second was keeping the input path simple and cheap. The fuzzer reuses one mapped temporary file in `/dev/shm`, mutates it in place, truncates it to the current testcase size, and passes the same path to the target on each run. This avoids repeated file creation and keeps most of the hot path memory-backed.

## Limits and next steps

This is still a target-specific research implementation rather than a general-purpose fuzzing framework. Correctness depends on how well the runtime resets target state, and the current build assumes a specially instrumented and linked Xpdf `pdftotext` target.

Possible next improvements include:

1. Expand the reset mechanism beyond heap, `FILE *`, and writable globals.
2. Add stronger corpus minimization so interesting seeds do not grow too quickly.
3. Improve the PDF-aware mutator with more structure-aware parsing.
4. Add explicit crash handling and deduplication in the main loop.

Even in this form, the implementation is a useful example of what single-process fuzzing requires in practice. Running the target in one process is only one part of the problem. Coverage reset, resource cleanup, global-state restoration, and exit interception are what make repeated execution possible.
