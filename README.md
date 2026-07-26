# Joonyoung Jeong — academic homepage & blog

Personal academic site of Joonyoung Jeong: about/news, publications, CV, and the
"Joon InfoSec Playground" blog (information security, wireless tech, and horse riding).

Live at <https://mango0727-github.github.io/c4py6ara.io/>.

Built with [Astro](https://astro.build) and the [as-folio](https://github.com/dadangnh/as-folio)
academic theme (an al-folio–style portfolio). Deployed to GitHub Pages via GitHub Actions
on every push to `main`.

## Editing content

| What | Where |
| --- | --- |
| Site settings, navbar, socials | `src/config/site.ts` |
| About page bio | `src/data/about.mdx` |
| News/announcements | `src/content/announcements/*.md` |
| Publications | `src/data/papers.bib` (al-folio BibTeX conventions) |
| CV page | `src/data/cv.yml` (RenderCV format) + PDF in `public/assets/pdf/` |
| Blog posts | `src/content/posts/<slug>.md` |
| Profile photo | `public/assets/img/prof_pic.jpg` |

### Writing a post

```yaml
---
title: "Post title"
description: "One-or-two sentence summary."
date: 2026-07-26
categories: [5g-security]
math: true # only if the post uses LaTeX math
---
```

Put images under `src/content/posts/assets/` and reference them relatively,
e.g. `![caption](./assets/my-post/figure.png)`.

## Development

Requires Node 24+ and corepack (yarn 4).

```bash
corepack enable
yarn install
ASTRO_SITE=https://mango0727-github.github.io ASTRO_BASE=/c4py6ara.io yarn dev
yarn build   # production build into dist/
```

## History

- Jekyll (Hydejack) era: preserved on the `jekyll-backup` branch.
- Old URLs (`/<category>/<YYYY-MM-DD-name>/` and the interim `/posts/...` scheme)
  redirect to `/blog/<slug>/` — see the redirects block in `astro.config.mjs`.
