// @ts-check
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import {
  remarkCallouts,
  remarkCaseViewer,
  remarkReadingTime,
  rehypeFootnotePopovers,
  rehypeTableScroll,
} from './src/lib/markdown-plugins.mjs';
import { CASE_DIRECTIVE_RE, validateCaseAssets } from './src/lib/case-shell.mjs';
import { apparatus } from './src/lib/apparatus.ts';

// Every ::case embed in a NON-DRAFT article is validated against disk at
// build start. remarkCaseViewer validates too, but the content layer caches
// rendered articles — a case deleted after its article was last edited would
// sail through a cached render. This hook has no cache in front of it.
const caseViewerValidation = () => ({
  name: 'case-viewer-validation',
  hooks: {
    'astro:build:start': () => {
      // Recursive to match the loader's '**/*.md' glob (content.config.ts):
      // a nested article's ::case embed must be validated here too, or it
      // sails through this cache-less net. CASE_DIRECTIVE_RE is the shared
      // scan pattern (case-shell.mjs) — caption-optional, either quote style.
      // encoding pins the string[] overload (no encoding → string[] | Buffer[]).
      for (const f of readdirSync('src/content/articles', { recursive: true, encoding: 'utf8' })) {
        if (!f.endsWith('.md')) continue;
        const md = readFileSync(`src/content/articles/${f}`, 'utf8');
        if (/^draft:\s*true/m.test(md)) continue; // drafts don't build
        for (const m of md.matchAll(CASE_DIRECTIVE_RE)) {
          validateCaseAssets(m[1], `src/content/articles/${f}`);
        }
      }
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://leveloneradiology.com',
  // Static site, small pages: hover-prefetch every internal link so card →
  // article navigation (and its view transition) starts from cache.
  prefetch: {
    prefetchAll: true,
  },
  integrations: [react(), sitemap(), caseViewerValidation()],
  markdown: {
    // Shiki emits CSS variables; prose.css maps them to the color tokens so
    // code blocks ride the design system instead of a canned theme.
    shikiConfig: {
      theme: 'css-variables',
    },
    remarkPlugins: [remarkDirective, remarkCallouts, remarkCaseViewer, remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['heading-anchor'], ariaLabel: 'Link to this section' },
          content: { type: 'text', value: '#' },
        },
      ],
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      // Always registered: the phantom-heading fix must run even when the
      // popover upgrade is switched off (flag off → plain GFM refs + plate).
      [rehypeFootnotePopovers, { popovers: apparatus.footnotePopovers }],
      rehypeTableScroll,
    ],
  },
  vite: {
    // Cast: @tailwindcss/vite types against the root vite package while astro
    // bundles its own — structurally identical plugins, nominally distinct
    // Plugin types. Runtime is unaffected.
    plugins: [/** @type {import('astro').ViteUserConfig['plugins']} */ ([tailwindcss()])],
  },
});
