# Joon InfoSec Playground

Personal blog of Joonyoung Jeong — information security, wireless tech, and horse riding.

Live at <https://mango0727-github.github.io/c4py6ara.io/>.

Built with [Astro](https://astro.build) and the [AstroPaper](https://github.com/satnaing/astro-paper) theme (migrated from Jekyll/Hydejack in July 2026). Deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Writing a post

Add a Markdown file under `src/content/posts/<category>/<slug>.md`:

```yaml
---
title: "Post title"
description: "One-or-two sentence summary."
pubDatetime: 2026-07-26T12:00:00+09:00
tags:
  - "5G security"
---
```

Put images next to the post (e.g. `src/content/posts/<category>/assets/...`) and reference them relatively: `![caption](./assets/figure.png)`. LaTeX math (`$...$`, `$$...$$`) is rendered with KaTeX.

## Development

Requires Node 22+.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
```

Old Jekyll URLs (`/<category>/<YYYY-MM-DD-name>/`) redirect to the new `/posts/...` structure — see `redirects.ts`. The last Jekyll version of the site is preserved on the `jekyll-backup` branch.
