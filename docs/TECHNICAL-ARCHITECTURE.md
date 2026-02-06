# Level One Radiology: Technical Architecture

*Stack, implementation, and operational workflows*

**Navigation:** [README](../README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· [Design Methodology](DESIGN-METHODOLOGY.md) Â· [Design Principles](DESIGN-PRINCIPLES.md) Â· [Design Tokens](DESIGN-TOKENS.md) Â· [Component Library](COMPONENT-LIBRARY.md) Â· **Technical Architecture**

---

## Technical Principles

*Based on Fictive Kin: Simplicity, Stability, Security, Speed*

The technical stack should be:
- **Simple** â€” Easy to understand and maintain by a solo operator
- **Stable** â€” Minimal dependencies, proven technologies
- **Secure** â€” No unnecessary attack surface
- **Fast** â€” Performance is a feature

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
- Not locked inâ€”can mix with Radix or custom code

See [PROJECT-INITIALIZATION.md](PROJECT-INITIALIZATION.md) for detailed primitive library guidance.

### Hosting

**Netlify or Vercel**

- Simple deployment
- Good performance
- Free tier sufficient initially
- Automatic HTTPS
- Branch previews for testing

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

CSS custom properties (variables) for design tokens, component-scoped styles. shadcn/ui components adapt to your chosen visual style (Lyra, Nova, etc.) and can be further customized via Tailwind classes.

### File Structure

```
styles/
â”œâ”€â”€ tokens/
â”‚   â”œâ”€â”€ colors.css      # Surface hierarchy, text hierarchy, signals
â”‚   â”œâ”€â”€ typography.css  # Font families, scale, classes
â”‚   â””â”€â”€ spacing.css     # Spacing scale, semantic tokens
â”œâ”€â”€ base/
â”‚   â”œâ”€â”€ reset.css       # Minimal reset
â”‚   â””â”€â”€ global.css      # Body, root styles
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ button.css
â”‚   â”œâ”€â”€ tag.css
â”‚   â”œâ”€â”€ nav.css
â”‚   â”œâ”€â”€ callout.css
â”‚   â”œâ”€â”€ hud-frame.css
â”‚   â”œâ”€â”€ article-card.css
â”‚   â”œâ”€â”€ article-header.css
â”‚   â”œâ”€â”€ prose.css
â”‚   â””â”€â”€ ...
â””â”€â”€ main.css            # Imports all
```

### Token Organization

See [DESIGN-TOKENS.md](DESIGN-TOKENS.md) for complete token specifications.

Tokens are organized in three layers:
1. **Primitive tokens** â€” Raw values (hex codes, pixel values)
2. **Semantic tokens** â€” Purpose-named (--color-bg-deepest, --space-gutter)
3. **Component tokens** â€” Component-specific (--nav-height, --callout-color)

### CSS Rules

1. Never use hardcoded values â€” always reference tokens
2. Component styles are self-contained
3. Avoid nesting beyond 2 levels
4. Mobile-first media queries
5. Use logical properties where supported

---

## Publishing Workflow

### Content Pipeline

1. **Draft** â€” Initial writing, rough ideas
2. **Review** â€” Self-editing, fact-checking
3. **Stage** â€” Final formatting, image optimization
4. **Publish** â€” Git commit, automatic deploy
5. **Promote** â€” LinkedIn sharing, newsletter mention

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

**Quarterly:**
- Review analytics
- Update outdated articles
- Check for broken links
- Plan next quarter's content

**Annually:**
- Full content audit
- Performance review
- Stack evaluation

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
| **Design** | Complete and polishedâ€”not "coming soon" feel |
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
- [ ] Core flow (land â†’ read â†’ subscribe) works on mobile and desktop
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

### WCAG 2.1 AA Compliance

**Color contrast:**
- Body text: 4.5:1 minimum (we exceed this)
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Keyboard navigation:**
- All interactive elements focusable
- Visible focus indicators
- Logical tab order

**Screen readers:**
- Semantic HTML
- ARIA labels where needed
- Alt text on all images

**Motion:**
- Respect `prefers-reduced-motion`
- No auto-playing animations

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
- Keystone metrics (see [BRAND-FOUNDATION.md](BRAND-FOUNDATION.md))
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
