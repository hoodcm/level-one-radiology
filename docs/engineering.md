# Level One Radiology: Technical Architecture

*Stack, implementation, and operational workflows*

[← Docs](README.md)

---

## Technical Principles

*Based on Fictive Kin: Simplicity, Stability, Security, Speed*

The technical stack should be:
- **Simple** — Easy to understand and maintain by a solo operator
- **Stable** — Minimal dependencies, proven technologies
- **Secure** — No unnecessary attack surface
- **Fast** — Performance is a feature

---

## Recommended Stack (MVP)

### Content

**Markdown files with YAML frontmatter in repository**

- Simple, no external dependencies
- Version-controlled
- Publishing requires git commit (acceptable friction for single author)

### Framework

**Astro + React Islands**

- Content-first, zero JavaScript by default
- React components only where interaction needed
- Excellent performance for article-heavy sites
- Simple migration path if needs evolve

### Component Primitives

**Base UI via shadcn/ui**

- Headless components with accessibility built in
- shadcn/ui provides abstraction layer + styling
- Active development backed by MUI
- Not locked in—can mix with Radix or custom code
- This document is the canonical home for primitive-library guidance (see [Primitive Library Flexibility](#primitive-library-flexibility) below)

### Hosting

**GitHub Pages**

- Static deploy from the repository—no server to run
- Custom domain via `CNAME` file in `public/` (committed; served at the apex domain)
- Automatic HTTPS once the custom domain is verified
- Free for public repositories
- Deploys on push to the Pages branch via GitHub Actions

### Email Service

**Buttondown or ConvertKit**

- Writer-friendly
- Simple integration
- Avoid embedded Mailchimp forms (styling nightmares)

### Analytics

**Plausible or Fathom**

- Privacy-respecting
- Simple dashboards
- Better than Google Analytics complexity
- No cookie banners required

### Search (when needed)

**Pagefind**

- Static site search
- Simple to add when content volume justifies
- No server required

### RSS

**Build in from day one**

- Essential for academic audience
- Simple to implement
- Signals professionalism

---

## Future Considerations

### CMS Migration

If publishing friction becomes a barrier, migrate to headless CMS:
- Contentful
- Sanity
- Payload

Not needed for MVP. The friction of git-based publishing is acceptable for a single author and provides version control benefits.

### Light Mode

Consider adding light mode toggle for:
- Daytime reading contexts
- Accessibility preferences
- Print-friendly output

Not in MVP. Dark-first is the brand identity.

### Primitive Library Flexibility

The shadcn/ui abstraction allows swapping primitive libraries without rewriting component code:

- **Current:** Base UI (recommended for active development)
- **Alternative:** Radix (if specific feature needed)
- **Escape hatch:** Direct primitive imports or custom code

Since shadcn copies code to your project (not installed as dependency), you can mix approaches:

```tsx
// shadcn component (uses configured primitive)
import { Dialog } from "@/components/ui/dialog"

// Direct import for specific feature
import * as Tooltip from "@radix-ui/react-tooltip"

// Custom component
import { CaseViewer } from "@/components/case-viewer"
```

---

## Performance Targets

| Metric | Minimum | Target |
|--------|---------|--------|
| Lighthouse Score | 85+ | 90+ |
| Core Web Vitals | Passing | All green |
| First Contentful Paint | < 2s | < 1.5s |
| Time to Interactive | < 4s | < 3s |

### Image Optimization

- Format: WebP with fallbacks
- Sizing: Responsive srcset
- Loading: Lazy load below fold
- Compression: Aggressive for non-clinical images

### Font Optimization

- Subset to necessary characters
- Preload critical fonts
- Use `font-display: swap`
- Consider variable fonts for size savings

---

## CSS Architecture

### Approach

CSS custom properties (variables) for design tokens, component-scoped styles. shadcn/ui components adapt to your chosen visual style (this project uses Mira) and can be further customized via Tailwind classes.

### File Structure

The stylesheet entry point is `src/styles/main.css`, the import manifest that pulls in every layer (`tokens/`, `base/`, `components/`). See `main.css` for the authoritative file list and the Architecture section of `CLAUDE.md` for the directory layout.

### Token Organization

See [design/tokens.md](design/tokens.md) for complete token specifications.

Tokens are organized in three layers:
1. **Primitive tokens** — Raw values (hex codes, pixel values)
2. **Semantic tokens** — Purpose-named (--color-bg-deepest, --space-gutter)
3. **Component tokens** — Component-specific (--nav-height, --callout-color)

### CSS Rules

1. Never use hardcoded values — always reference tokens
2. Component styles are self-contained
3. Avoid nesting beyond 2 levels
4. Mobile-first media queries
5. Use logical properties where supported

---

## Publishing Workflow

### Content Pipeline

1. **Draft** — Initial writing, rough ideas
2. **Review** — Self-editing, fact-checking
3. **Stage** — Final formatting, image optimization
4. **Publish** — Git commit, automatic deploy
5. **Promote** — LinkedIn sharing, newsletter mention

### Workflow Steps

**To publish an article:**

1. Create markdown file with frontmatter
2. Add images to appropriate directory
3. Optimize images (WebP, appropriate sizing)
4. Test locally
5. Commit and push
6. Verify deployment
7. Share on LinkedIn

### Content Maintenance

For the review cadence (quarterly and annual audits), see [design/philosophy.md](design/philosophy.md).

---

## Minimum Viable System

*Launch lean, learn fast. Launch is a beginning, not an ending.*

### MVP Components

| Component | Specification |
|-----------|---------------|
| **Articles** | 3-5 published: 1 educational deep-dive, 1 case analysis, 1 timely commentary |
| **Case Viewer** | Functional for at least 1 case, inline within article |
| **Newsletter** | Signup working, connected to email service |
| **Homepage** | Clear value proposition, featured articles, newsletter CTA |
| **About** | Bio, site mission, ends with CTA |
| **Article Index** | Simple list, sorted by date |
| **Design** | Complete and polished—not "coming soon" feel |
| **Analytics** | Basic tracking in place |

### Not in MVP (add later)

- Case gallery (until 5+ cases)
- Filtering/search
- Tags/categories index pages
- Automated related articles (manual at first)
- Comments
- User accounts
- Light mode toggle

### Launch Criteria

- [ ] Would be proud to share any page with respected colleague
- [ ] Core flow (land → read → subscribe) works on mobile and desktop
- [ ] Lighthouse score 85+
- [ ] No broken links, no placeholder content

---

## Success Criteria

### At Launch

- [ ] 3-5 articles published
- [ ] Case viewer functional in at least 1 article
- [ ] Newsletter signup working
- [ ] Analytics tracking active
- [ ] Lighthouse score 85+
- [ ] Mobile experience polished
- [ ] Would proudly share with respected colleague

### At 6 Months

- [ ] 6+ articles published (maintaining monthly cadence)
- [ ] 100+ email subscribers
- [ ] Returning visitor pattern established
- [ ] Case gallery live (if 5+ cases)
- [ ] First quarterly review completed

### At 12 Months

- [ ] 12+ articles published
- [ ] 500+ email subscribers
- [ ] Measurable organic search traffic
- [ ] Clear understanding of what content resonates
- [ ] Platform recognized in professional circles

---

## Browser Support

### Primary (must work perfectly)

- Chrome (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)

### Secondary (must work)

- Edge (latest)
- Mobile Safari
- Chrome for Android

### Testing Checklist

- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)
- [ ] Tablet Safari (iPad)

---

## Accessibility Requirements

**Target: WCAG 2.1 AA.**

- The accessibility floor and its reasoning (contrast, keyboard, screen readers, motion) live in [design/reasoning/accessibility.md](design/reasoning/accessibility.md).
- Measured contrast ratios for the palette live in [design/tokens.md](design/tokens.md) (Accessibility section).

---

## SEO Technical Requirements

### Per-Page

- Unique, descriptive `<title>`
- Meta description (150-160 characters)
- Open Graph tags for social sharing
- Canonical URL
- Structured data (Article schema)

### Site-Wide

- XML sitemap
- robots.txt
- Fast load times
- Mobile-friendly
- HTTPS

### URLs

- Descriptive paths (`/articles/approach-to-splenic-trauma`)
- Lowercase, hyphenated
- No file extensions
- No query parameters for content

---

## Security Considerations

### Minimal Attack Surface

- Static site = no database to breach
- No user accounts = no credentials to steal
- Third-party integrations minimized

### Best Practices

- HTTPS everywhere
- Content Security Policy headers
- No inline scripts where possible
- Regular dependency updates

---

## Monitoring

### What to Track

**Performance:**
- Core Web Vitals via Search Console
- Lighthouse scores monthly

**Errors:**
- 404 pages hit
- Console errors (if any)
- Form submission failures

**Analytics:**
- Keystone metrics (see [brand.md](brand.md))
- Traffic sources
- Top content

---

## Documentation Checklist

For ongoing maintenance, ensure documentation of:

- [ ] Design system (see other docs in this series)
- [ ] Content model (frontmatter fields, required vs optional)
- [ ] Publishing workflow (step-by-step)
- [ ] Site architecture (templates, how pages compose)
- [ ] Deployment process
- [ ] Emergency procedures (rollback, etc.)

---

*Document created: December 2024*
*Last updated: January 2025*
