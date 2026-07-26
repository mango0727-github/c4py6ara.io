import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

/**
 * Remark plugin: rewrite root-relative src/href inside raw HTML blocks in .md files.
 * Markdown raw HTML (e.g. <img src="/assets/...">) stays as mdast 'html' nodes and
 * is never parsed into hast elements — string replacement is the only reliable path.
 */
function remarkBasePaths() {
  const base = (process.env.ASTRO_BASE ?? '').replace(/\/$/, '');
  if (!base) return (tree) => tree;

  // Match src="/" or href="/" but not src="//" (protocol-relative)
  const re = /((?:src|href)=")\/(?!\/)/g;

  function walk(node) {
    if (node.type === 'html' && typeof node.value === 'string') {
      node.value = node.value.replace(re, `$1${base}/`);
    }
    node.children?.forEach(walk);
  }

  return (tree) => walk(tree);
}

/**
 * Rehype plugin: rewrite root-relative src/href on hast element nodes.
 * Handles standard markdown images (![](/)  → <img src="/">) and MDX JSX elements
 * after remark-rehype converts them to hast.
 */
function rehypeBasePaths() {
  const base = (process.env.ASTRO_BASE ?? '').replace(/\/$/, '');
  if (!base) return (tree) => tree;

  function walk(node) {
    if (node.type === 'element') {
      const src = node.properties?.src;
      if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')) {
        node.properties.src = `${base}${src}`;
      }
      const href = node.properties?.href;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = `${base}${href}`;
      }
    }
    node.children?.forEach(walk);
  }

  return (tree) => walk(tree);
}

/**
 * Redirects preserving URLs from this site's previous incarnations:
 * - the original Jekyll/Hydejack site (/<category>/<YYYY-MM-DD-name>/)
 * - the short-lived AstroPaper deployment (/posts/<category>/<slug>/)
 * Astro does not prepend `base` to redirect destinations in static builds,
 * so it is baked into each target below.
 */
const REDIRECT_BASE = (process.env.ASTRO_BASE ?? '').replace(/\/$/, '');

// old-path fragments → new blog slug (Jekyll dir, Jekyll post name, AstroPaper category dir)
const POST_MOVES = [
  ['mal_analysis', '2025-03-03-redline', 'mal-analysis', 'redline'],
  ['mal_analysis', '2025-05-21-deathin', 'mal-analysis', 'deathin'],
  ['mal_analysis', '2025-06-12-notpetya', 'mal-analysis', 'notpetya'],
  ['mal_analysis', '2025-06-20-mags', 'mal-analysis', 'mags'],
  ['fuzzing', '2025-08-25-recon-process', 'fuzzing', 'recon-process'],
  ['fuzzing', '2026-03-09-pwn', 'fuzzing', 'pwn'],
  ['fuzzing', '2026-04-25-single-process-fuzzer', 'fuzzing', 'single-process-fuzzer'],
  ['5g_sec', '2025-08-23-SKTIncidentInitAssessmnt', '5g-security', 'skt-incident-init-assessmnt'],
  ['5g_sec', '2025-08-25-SKT-FinalAssessment', '5g-security', 'skt-final-assessment'],
  ['5g_sec', '2025-10-04-IMS-arch', '5g-security', 'ims-arch'],
  ['5g_sec', '2026-01-12-open5gs', '5g-security', 'open5gs'],
  ['data_analytics', '2025-10-08-final-report', 'data-analytics', 'final-report'],
  ['data_analytics', '2025-11-25-ANOVA', 'data-analytics', 'anova'],
  ['crypto_analysis', '2026-05-03-literature-review', 'crypto-analysis', 'literature-review'],
  ['learning', '2025-09-12-basics', 'learning', 'basics'],
  ['hobbies', '2025-03-02-horse', 'hobbies', 'horse'],
  ['hobbies', '2025-09-19-understanding_horse', 'hobbies', 'understanding-horse'],
];

// Jekyll category dir → as-folio category slug
const CATEGORY_MOVES = [
  ['mal_analysis', 'malware-analysis'],
  ['fuzzing', 'fuzzing'],
  ['5g_sec', '5g-security'],
  ['data_analytics', 'data-analytics'],
  ['crypto_analysis', 'crypto-analysis'],
  ['learning', 'learning'],
  ['hobbies', 'hobbies'],
];

const redirects = Object.fromEntries(
  [
    ...POST_MOVES.flatMap(([jekyllDir, jekyllName, paperDir, slug]) => [
      [`/${jekyllDir}/${jekyllName}`, `/blog/${slug}/`],
      [`/posts/${paperDir}/${slug}`, `/blog/${slug}/`],
    ]),
    ...CATEGORY_MOVES.flatMap(([jekyllDir, category]) => [
      [`/${jekyllDir}`, `/blog/category/${category}/`],
      [`/tags/${category}`, `/blog/category/${category}/`],
    ]),
    ['/posts', '/blog/'],
    ['/archives', '/blog/'],
    ['/tags', '/blog/'],
    ['/about', '/'],
    ['/download', '/cv/'],
    ['/feed.xml', '/rss.xml'],
  ].map(([from, to]) => [from, `${REDIRECT_BASE}${to}`]),
);

// https://astro.build/config
//
// Deployment config is env-first:
// - local development: copy `.env.example` to `.env`
// - GitHub Pages: set repository variables `ASTRO_SITE` and `ASTRO_BASE`
//
// `src/config/site.ts` consumes the resolved Astro values via
// `import.meta.env.SITE` and `import.meta.env.BASE_URL`; it is not the
// source of truth for deployment URLs.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://mango0727-github.github.io', // override via ASTRO_SITE env var or edit directly
  base: process.env.ASTRO_BASE ?? '/c4py6ara.io', // override via ASTRO_BASE env var or set '' for user/org pages
  redirects,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    // Allow Astro's <Image> component to optimise images from these remote domains.
    // Used for book covers (Open Library) and GitHub stats cards.
    domains: [
      'covers.openlibrary.org',
      'github-readme-stats.vercel.app',
      'github-profile-trophy.vercel.app',
    ],
  },
  integrations: [
    react(),
    mdx(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    icon({
      include: {
        'fa-brands': [
          'twitter',
          'linkedin',
          'github',
          'gitlab',
          'youtube',
          'medium',
          'mastodon',
          'discord',
          'whatsapp',
          'telegram',
          'weibo',
          'instagram',
          'facebook',
          'pinterest',
        ],
        'fa-solid': [
          'envelope',
          'file-pdf',
          'rss',
          'moon',
          'sun',
          'bars',
          'times',
          'certificate',
          'code',
          'quote-left',
          'chevron-up',
          'search',
          'link',
          'star',
          'book',
          'graduation-cap',
          'user',
          'users',
          'building',
          'calendar',
          'tag',
          'tags',
          'newspaper',
          'chalkboard-teacher',
          'flask',
          'award',
          'language',
          'briefcase',
          'globe',
          'info-circle',
          'video',
          'music',
          'map-pin',
          'hashtag',
          'magnifying-glass',
          'thumbtack',
          'external-link-alt',
          'circle-arrow-right',
          'book-open',
          'check',
          'clock',
          'pause',
          'eye',
          'redo',
          'share-alt',
        ],
        'fa-regular': ['comment', 'star', 'bookmark', 'heart'],
        academicons: [
          'google-scholar',
          'orcid',
          'researchgate',
          'inspire',
          'arxiv',
          'hal',
          'semantic-scholar',
          'ieee',
          'acm',
          'springer',
          'elsevier',
          'pubmed',
          'clarivate',
          'zotero',
          'mendeley',
          'academia',
          'cv',
          'figshare',
          'zenodo',
          'dataverse',
          'open-access',
          'open-data',
          'open-materials',
          'osf',
          'overleaf',
          'impactstory',
          'scirate',
          'isidore',
          'hypothesis',
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts',
        '@styles': '/src/styles',
        '@assets': '/src/assets',
        '@config': '/src/config',
        '@utils': '/src/utils',
        '@content': '/src/content',
        '@data': '/src/data',
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Shorter, readable asset paths (e.g. _s/abc123.js instead of _astro/abc123.js)
          assetFileNames: '_s/[hash][extname]',
          chunkFileNames: '_s/[hash].js',
          entryFileNames: '_s/[hash].js',
        },
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkBasePaths],
    rehypePlugins: [
      [rehypeKatex, { strict: false }],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
      rehypeBasePaths,
    ],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
