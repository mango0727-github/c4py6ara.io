/**
 * Redirects preserving the URL structure of the previous Jekyll (Hydejack) site,
 * so existing links and search-engine results keep working.
 * Old scheme: /<category>/<YYYY-MM-DD-name>/  →  new: /posts/<category>/<slug>/
 */
const oldPostUrls: Record<string, string> = {
  "/mal_analysis/2025-03-03-redline": "/posts/mal-analysis/redline",
  "/mal_analysis/2025-05-21-deathin": "/posts/mal-analysis/deathin",
  "/mal_analysis/2025-06-12-notpetya": "/posts/mal-analysis/notpetya",
  "/mal_analysis/2025-06-20-mags": "/posts/mal-analysis/mags",
  "/fuzzing/2025-08-25-recon-process": "/posts/fuzzing/recon-process",
  "/fuzzing/2026-03-09-pwn": "/posts/fuzzing/pwn",
  "/fuzzing/2026-04-25-single-process-fuzzer":
    "/posts/fuzzing/single-process-fuzzer",
  "/5g_sec/2025-08-23-SKTIncidentInitAssessmnt":
    "/posts/5g-security/skt-incident-init-assessmnt",
  "/5g_sec/2025-08-25-SKT-FinalAssessment":
    "/posts/5g-security/skt-final-assessment",
  "/5g_sec/2025-10-04-IMS-arch": "/posts/5g-security/ims-arch",
  "/5g_sec/2026-01-12-open5gs": "/posts/5g-security/open5gs",
  "/data_analytics/2025-10-08-final-report":
    "/posts/data-analytics/final-report",
  "/data_analytics/2025-11-25-ANOVA": "/posts/data-analytics/anova",
  "/crypto_analysis/2026-05-03-literature-review":
    "/posts/crypto-analysis/literature-review",
  "/learning/2025-09-12-basics": "/posts/learning/basics",
  "/hobbies/2025-03-02-horse": "/posts/hobbies/horse",
  "/hobbies/2025-09-19-understanding_horse":
    "/posts/hobbies/understanding-horse",
};

const oldCategoryUrls: Record<string, string> = {
  "/mal_analysis": "/tags/malware-analysis",
  "/fuzzing": "/tags/fuzzing",
  "/5g_sec": "/tags/5g-security",
  "/data_analytics": "/tags/data-analytics",
  "/crypto_analysis": "/tags/crypto-analysis",
  "/learning": "/tags/learning",
  "/hobbies": "/tags/hobbies",
};

const misc: Record<string, string> = {
  "/feed.xml": "/rss.xml",
  "/cv": "/about",
  "/download": "/about",
};

// Astro does not prepend `base` to redirect destinations in static builds,
// so it must be baked into each target here. Keys (the old routes) stay
// base-less — Astro places their stub pages under `base` on its own.
const BASE = "/c4py6ara.io";

export default Object.fromEntries(
  Object.entries({ ...oldPostUrls, ...oldCategoryUrls, ...misc }).map(
    ([from, to]) => [from, BASE + to]
  )
);
