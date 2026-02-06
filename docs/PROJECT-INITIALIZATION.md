# Level One Radiology: Quick-Start Guide

*Executable initialization checklist for Astro-based implementation*

**For rationale:** See [TECHNICAL-ARCHITECTURE.md](TECHNICAL-ARCHITECTURE.md), [DESIGN-TOKENS.md](DESIGN-TOKENS.md), [COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md)

---

## Stack Decisions

| Category | Choice | Migrate When |
|----------|--------|--------------|
| Framework | Astro + React islands | User accounts needed (12-18mo) |
| Content | Markdown + frontmatter | Publishing 5+/week or git friction |
| Hosting | Vercel | Never |
| Component Primitives | Base UI (via shadcn/ui) | Never (abstraction allows swapping) |
| Visual Style | Lyra or Nova | Personal preference after testing |
| Newsletter | Buttondown | 500+ subscribers â†’ ConvertKit |
| Analytics | Plausible | Never |
| Search | (defer) | 15+ articles â†’ Pagefind |
| Comments | (defer) | 500+ subscribers â†’ Giscus |
| Database | (defer) | User accounts needed â†’ Supabase |

**Monthly cost:** $18 (Buttondown $9 + Plausible $9)

**Why Astro over Next.js:**
- Zero JavaScript by default (articles are pure HTML)
- Built for content-first sites
- React components only where needed (Case Viewer, forms)
- Simpler to learn, faster to ship
- Migration path exists if needs evolve

---

## Primitive Library Selection

### The Component Stack

Modern React component systems have three layers:

| Layer | What It Does | Level One Choice |
|-------|--------------|------------------|
| **Primitives** | Accessibility, behavior, keyboard nav | Base UI |
| **Abstraction** | Unified API over primitives + styling | shadcn/ui |
| **Visual Style** | Shapes, spacing, typography defaults | Lyra or Nova |

### Why Base UI Over Radix

Both Radix and Base UI provide the same thing: headless components with accessibility built in. The difference is trajectory:

| Aspect | Radix | Base UI |
|--------|-------|---------|
| **Backing** | WorkOS (team departed) | MUI (profitable, dedicated team) |
| **Status** | Mature but slowing | 1.0 released, active development |
| **Animation support** | Good | Better (transition data attributes) |
| **Future features** | Uncertain | Drawer, headless DataGrid coming |

**shadcn/ui now supports both.** When you run `npx shadcn create`, you choose your primitive layer. The abstraction means your component code stays identical regardless of choice.

### Mixing Primitives

You're not locked in. Since shadcn/ui copies code to your project (not installed as a dependency), you can:

```tsx
// shadcn component (uses your chosen primitive)
import { Dialog } from "@/components/ui/dialog"

// Direct Radix import for a specific feature
import * as Tooltip from "@radix-ui/react-tooltip"

// Custom component using neither
import { CaseViewer } from "@/components/case-viewer"
```

**When to use each approach:**

| Scenario | Recommendation |
|----------|----------------|
| Standard UI (dialogs, dropdowns, forms) | shadcn/ui with Base UI |
| Component shadcn doesn't have | Import directly from Base UI or Radix |
| Highly custom interaction (Case Viewer) | Build from scratch, use primitives Ã  la carte |
| Need specific Radix feature Base UI lacks | Import that one Radix component directly |

---

## Visual Style Selection

The `npx shadcn create` command offers five visual styles that go beyond themingâ€”they rewrite component structure:

| Style | Description | Level One Fit |
|-------|-------------|---------------|
| **Vega** | Classic shadcn look | Baseline reference |
| **Nova** | Reduced padding, compact layouts | Goodâ€”aligns with "tight not cramped" |
| **Lyra** | Boxy, sharp, pairs with mono fonts | Bestâ€”HUD aesthetic, Eurostile-friendly |
| **Mira** | Compact, dense interfaces | Good for Case Viewer density |
| **Maia** | Soft, rounded, generous spacing | Not a fit |

**Recommendation:** Start with **Lyra** for its sharp, technical aesthetic that complements the HUD framing and Eurostile UI typography. Test **Nova** if Lyra feels too rigid.

---

## Initial Setup

### 1. Create Astro Project

```bash
cd ~/Projects
npm create astro@latest leveloneradiology

# Choose:
# - Empty project
# - Yes to TypeScript
# - Strict mode
# - Yes to install dependencies

cd leveloneradiology
```

### 2. Initialize shadcn/ui with Base UI

```bash
# New unified command (December 2025+)
npx shadcn create

# Choose when prompted:
# - Component library: Base UI
# - Visual style: Lyra (recommended) or Nova
# - Base color: Slate or Zinc (will customize via tokens)
# - CSS variables: Yes
# - React Server Components: No (Astro uses islands)
```

This generates a `components.json` configured for your choices:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "lyra",
  "library": "base-ui",
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "rsc": false,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3. Add React and Tailwind to Astro

```bash
# Add Astro integrations
npx astro add react tailwind

# Markdown processing
npm install remark-gfm rehype-raw date-fns
```

### 4. Add shadcn Components

```bash
# Add components as needed
npx shadcn add button input dialog form label

# Components are copied to /components/ui/
# You own the codeâ€”customize freely
```

### 5. Create Folder Structure

```bash
mkdir -p src/content/{articles,cases}
mkdir -p src/components/{layout,article,case,shared}
mkdir -p src/layouts
mkdir -p public/images/{articles,cases}
mkdir -p public/fonts/{utopia,lab-grotesque,eurostile}
```

### 6. Configure Environment

```bash
cat > .env << EOF
BUTTONDOWN_API_KEY=
PUBLIC_PLAUSIBLE_DOMAIN=leveloneradiology.com
EOF

cp .env .env.example
# Remove actual keys from .env.example before committing
```

### 7. Git Setup

```bash
git init
git add .
git commit -m "Initial Astro setup with Base UI"
git remote add origin https://github.com/yourusername/leveloneradiology.git
git push -u origin main
```

---

## Critical Configs

### `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  integrations: [react(), tailwind()],
  markdown: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-raw'],
  },
})
```

### `tailwind.config.mjs` (Design Tokens)

```javascript
// See DESIGN-TOKENS.md for complete specification
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deepest': '#0B0A08',
        'bg-secondary': '#1B1A18',
        'text-primary': '#F9F3EB',
        'text-ivory': '#F5E6C2',
        'signal-red': '#D03454',
        'signal-cyan': '#2ACEC2',
        // ... full list in DESIGN-TOKENS.md
      },
      fontFamily: {
        display: ['Utopia Std', 'Georgia', 'serif'],
        body: ['Lab Grotesque', 'system-ui', 'sans-serif'],
        ui: ['Eurostile LT Std', 'monospace'],
      },
    },
  },
}
```

### `src/content/config.ts` (Content Schema)

```typescript
import { defineCollection, z } from 'astro:content'

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishDate: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    primaryTag: z.string(),
    contentType: z.enum(['educational', 'commentary', 'case-analysis']),
    featured: z.boolean(),
    keyPoints: z.array(z.string()).optional(),
    caseImages: z.array(z.string()).optional(),
  }),
})

export const collections = { articles }
```

---

## File Organization

**Project structure:**
```
src/
  content/
    articles/           # Markdown files
    config.ts           # Content schema
  components/
    layout/             # Header, Footer, Container
    article/            # Article-specific modules
    case/               # Case Viewer components
    shared/             # Reusable components
    ui/                 # shadcn (auto-generated)
  pages/
    articles/
      [slug].astro      # Article template
      index.astro       # Article listing
    index.astro         # Homepage
  layouts/
    Layout.astro        # Base layout

public/
  images/
    articles/
      [slug]/           # Article images by slug
  fonts/                # Self-hosted fonts
```

**Components by context:**
- `components/layout/` â†’ site-header.astro, site-footer.astro
- `components/article/` â†’ TableOfContents.astro, KeyPoints.astro, NewsletterCTA.jsx
- `components/case/` â†’ CaseViewer.jsx (custom, not shadcn)
- `components/shared/` â†’ tag.astro, article-card.astro
- `components/ui/` â†’ shadcn components (dialog.tsx, button.tsx, etc.)

**Content by type:**
- `src/content/articles/splenic-trauma.md`
- `public/images/articles/splenic-trauma/figure-01.jpg`

**Routes = URLs:**
- `src/pages/articles/[slug].astro` â†’ `/articles/splenic-trauma`

---

## Essential Components

### Table of Contents

```astro
---
// src/components/article/TableOfContents.astro
const { headings } = Astro.props
---

<nav class="toc">
  <h2 class="font-ui text-ui uppercase text-text-muted mb-4">Contents</h2>
  <ul class="space-y-2">
    {headings.filter(h => h.depth <= 3).map(h => (
      <li class={h.depth === 3 ? 'ml-4' : ''}>
        <a href={`#${h.slug}`} class="text-text-secondary hover:text-text-primary">
          {h.text}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

### Key Points Callout

```astro
---
// src/components/article/KeyPoints.astro
const { points } = Astro.props
---

<div class="border-l-2 border-signal-cyan bg-bg-secondary p-6 rounded-r-lg mb-8">
  <h3 class="font-ui text-ui uppercase text-signal-cyan mb-3">Key Points</h3>
  <ul class="space-y-2">
    {points.map(point => <li class="text-text-secondary">â€¢ {point}</li>)}
  </ul>
</div>
```

### Newsletter CTA (React Island)

```jsx
// src/components/article/NewsletterCTA.jsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    
    const res = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${import.meta.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="bg-bg-secondary p-6 rounded-lg">
        <p className="text-text-primary">âœ“ You're in. Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary p-6 rounded-lg">
      <h3 className="font-display text-headline text-text-ivory mb-2">
        Get Weekly Insights
      </h3>
      <p className="text-text-secondary text-sm mb-4">
        Emergency radiology updates delivered every week. No spam.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button 
          type="submit" 
          disabled={status === 'loading'}
          variant="default"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  )
}
```

### Article Page Template

```astro
---
// src/pages/articles/[slug].astro
import { getCollection } from 'astro:content'
import Layout from '../../layouts/Layout.astro'
import TableOfContents from '../../components/article/TableOfContents.astro'
import KeyPoints from '../../components/article/KeyPoints.astro'
import NewsletterCTA from '../../components/article/NewsletterCTA.jsx'

export async function getStaticPaths() {
  const articles = await getCollection('articles')
  return articles.map(article => ({
    params: { slug: article.slug },
    props: { article },
  }))
}

const { article } = Astro.props
const { Content, headings } = await article.render()
---

<Layout title={article.data.title}>
  <article class="max-w-7xl mx-auto px-6 py-8">
    <div class="grid lg:grid-cols-[1fr_250px] gap-12">
      <div class="prose prose-invert max-w-prose">
        <h1 class="font-display text-display-l text-text-ivory mb-4">
          {article.data.title}
        </h1>
        
        <div class="flex gap-4 text-sm text-text-muted mb-8">
          <time>{new Date(article.data.publishDate).toLocaleDateString()}</time>
          <span>Â·</span>
          <span>{article.data.readingTime} min read</span>
        </div>
        
        {article.data.keyPoints && <KeyPoints points={article.data.keyPoints} />}
        
        <Content />
        
        <NewsletterCTA client:load />
      </div>
      
      <aside class="hidden lg:block">
        {headings.length > 3 && <TableOfContents headings={headings} />}
      </aside>
    </div>
  </article>
</Layout>
```

---

## Example Article

**File:** `src/content/articles/splenic-trauma.md`

```markdown
---
title: "Approach to Splenic Trauma on CT"
publishDate: "2025-01-15"
description: "Systematic approach to grading splenic injuries on CT"
tags: ["trauma", "abdomen", "CT", "spleen"]
primaryTag: "trauma"
contentType: "educational"
featured: true
keyPoints:
  - "AAST grading determines operative vs non-operative management"
  - "Active extravasation indicates angiography need"
  - "Pseudoaneurysms may require delayed intervention"
readingTime: 12
---

# Introduction

Splenic trauma is one of the most common injuries in blunt abdominal trauma...

## CT Technique

Proper technique is critical for accurate assessment...

## AAST Grading Scale

### Grade I
- Subcapsular hematoma <10% surface area
- Parenchymal laceration <1cm depth

[Continue content...]
```

---

## Daily Commands

```bash
npm run dev                    # Dev server (localhost:4321)
npm run build                  # Production build
npm run preview                # Preview production build

# Add new shadcn component
npx shadcn add [component-name]

# New article
touch src/content/articles/new-article.md
mkdir -p public/images/articles/new-article

# Deploy (Vercel auto-deploys on push)
git add .
git commit -m "Add article: Title"
git push origin main
```

---

## Vercel Deployment

1. **Import GitHub repo** at vercel.com
2. Vercel auto-detects Astro
3. **Add environment variables:**
   - `BUTTONDOWN_API_KEY`
   - `PUBLIC_PLAUSIBLE_DOMAIN`
4. **Deploy**
5. **Custom domain** (optional):
   - GoDaddy DNS: A record `@` â†’ `76.76.21.21`
   - CNAME `www` â†’ `cname.vercel-dns.com`
   - Wait 1-48 hours for DNS propagation

---

## When to Add Features

| Feature | Trigger | Effort | Tool |
|---------|---------|--------|------|
| Search | 15+ articles | 2-4 hours | Pagefind |
| Comments | 500+ subscribers | 1 hour | Giscus |
| CMS | Publishing 5+/week | Weekend | Contentful |
| Database | User accounts | 2-3 weeks | Supabase + Next.js migration |

See [TECHNICAL-ARCHITECTURE.md](TECHNICAL-ARCHITECTURE.md) for migration guides.

---

## React Islands Pattern

**Concept:** Most of your site is static HTML. React loads only where needed.

**Static components** (`.astro` files):
- Header, Footer, Layout
- Table of Contents
- Article cards
- Most of the site

**Interactive components** (`.jsx` files with `client:load`):
- Newsletter signup form
- Case Viewer (image slider)
- Search interface (when added)
- Comment system (when added)

**Usage:**
```astro
---
import NewsletterCTA from '../components/article/NewsletterCTA.jsx'
---

<NewsletterCTA client:load />
<!-- Loads React only for this component -->
```

---

## Key Differences from Next.js

| Aspect | Astro | Next.js |
|--------|-------|---------|
| **Default output** | Static HTML, zero JS | Static HTML + React hydration |
| **Article pages** | Pure HTML | Includes React runtime |
| **Interactive components** | Islands (opt-in) | Everywhere (default) |
| **Learning curve** | Moderate | Steep |
| **Performance** | Instant load | Fast but heavier |
| **When to migrate** | Need user accounts/API routes | â€” |

---

*For design system details: [DESIGN-TOKENS.md](DESIGN-TOKENS.md)*  
*For component specs: [COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md)*  
*For content strategy: [BRAND-FOUNDATION.md](BRAND-FOUNDATION.md)*  
*For architecture rationale: [TECHNICAL-ARCHITECTURE.md](TECHNICAL-ARCHITECTURE.md)*
