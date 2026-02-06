# Level One Radiology: Design Methodology

*Foundational principles from Fictive Kin's web systems approach*

**Navigation:** [README](README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· **Design Methodology** Â· [Design Principles](DESIGN-PRINCIPLES.md) Â· [Design Tokens](DESIGN-TOKENS.md) Â· [Component Library](COMPONENT-LIBRARY.md) Â· [Technical Architecture](TECHNICAL-ARCHITECTURE.md)

---

> âš ï¸ **FOUNDATIONAL DOCUMENT**
>
> The principles in this document are methodological foundations adapted from Fictive Kin's web systems approach. They inform all other documentation and should be modified only with careful consideration of downstream effects.

---

## Core Philosophy

Level One Radiology is built on principles from Fictive Kin's web systems methodology, adapted for a solo-authored professional publication.

These principles provide the decision-making framework for strategy, design, and implementation choices across the project.

---

## The Eight Principles

### 1. Systems, Not Sites

The platform evolves and compounds value over time. It's not a static brochure but a living system that grows with each piece of content published.

**Application:**
- Design for iteration, not perfection
- Build infrastructure that supports future expansion
- Content is a compounding asset

### 2. Facts, Not Feelings

Design decisions are driven by conversion data, not pure aesthetics. Every choice should be evaluated against measurable outcomes.

**Application:**
- Test assumptions with real users
- Track keystone metrics religiously
- Beautiful design that doesn't convert is failed design

### 3. Modules, Not Pages

Reusable components enable consistent, efficient publishing. The module library is the foundation of scalable content creation.

**Application:**
- Build a library of branded, reusable chunks
- Consistency through components, not manual styling
- New content uses existing modules; new modules are rare

### 4. Beginning, Not Ending

Launch is the start; continuous improvement is the norm. The MVP is permission to learn, not the finished product.

**Application:**
- Ship lean, learn fast
- Quarterly reviews and iteration cycles
- Perfection is the enemy of presence

### 5. Keystone Metrics

One primary metric focuses all decisions. Maximum two. Everything else is diagnostic.

**Application:**
- **Primary:** Email subscribers
- **Secondary:** Returning visitors
- Every decision evaluated against: "Does this help or hurt subscriber conversion?"

### 6. Minimum Viable System

Launch lean, learn fast, iterate based on data. The MVP includes only what's necessary to prove the concept and begin learning.

**Application:**
- 3-5 articles, not 30
- Case viewer in 1 article, not a full gallery
- Features earn their place through demonstrated need

### 7. Tight, Not Cramped

Density through restraint, not emptiness as elegance. Trust typography to do its job without excessive padding.

**Application:**
- Compact navigation (48px height, 16px gaps)
- Restrained font sizes (16px body, 11px UI)
- Every gap has a purposeâ€”whitespace is hierarchy, not decoration
- Same philosophy on mobileâ€”don't "loosen up" for small screens

### 8. Bespoke Warmth

The crimson-biased palette distinguishes from generic dark modes. Warmth is achieved through color, typography, and spacing, not decoration.

**Application:**
- Crimson warmth bias (R+6, B-4) creates warmth without visible tint
- Ivory text for headlines adds warmth to emphasis
- Humanist sans-serif for approachable body text

---

## Module System Philosophy

*Based on Fictive Kin's module approach: reusable, branded, editable chunks*

### Module Standards

Every module must be:

| Standard | Requirement |
|----------|-------------|
| **Performant** | Optimized images (WebP, lazy loading), fast load times |
| **AA Accessible** | 4.5:1 contrast for body text, keyboard navigable, alt text on images |
| **Responsive** | Works 320px through 1440px+, no horizontal scroll, 44x44px minimum tap targets |
| **SEO-Optimized** | Semantic HTML, proper heading hierarchy, schema markup |

### Module Tiers

**Workhorse Modules (8-10 total)**
Used constantly. High investment in getting these right. Examples: Article Header, Body Text, Newsletter CTA.

**High-Touch Modules**
Custom but reusable. Plan for iteration. Examples: Comparison Slider, Timeline/Sequence.

**Showstopper Module (one)**
The signature differentiator. High investment, high impact. For Level One: the Case Viewer.

### Showstopper Discipline

Do not build a second showstopper until:
- 20+ articles published
- Data on first showstopper engagement collected
- Clear need identified for new feature

---

## Problem Prevention Framework

*Design to avoid common issues*

### Content Problems

- Write for actual audience, not imagined one
- Peer review before publishing
- If piece underperforms, first question is whether content delivers value

### Navigation Problems

- Keep nav simple (4 items)
- Clear labeling ("ARTICLES" not "The Reading Room")
- Add search when content volume justifies

### Design Problems

- Test with non-designers
- CTAs must look like buttons (solid, not ghost)
- Don't sacrifice readability for aesthetics
- Avoid the modern tendency toward excessive padding

### Device-Specific Problems

- Design mobile-first
- Test on actual devices
- Case viewer must be touch-friendly
- Same tight spacing philosophy on mobile

### Engineering Problems

- Lighthouse 85+
- Test multiple browsers (Chrome, Safari, Firefox)
- No layout shift during load

---

## Decision Framework

When facing a design or content decision, apply this evaluation sequence:

1. **Does it support the keystone metric?** (subscriber conversion)
2. **Does it follow the eight principles?**
3. **Does it meet module standards?**
4. **Does it avoid known problem patterns?**

If yes to all four, proceed. If no to any, reconsider.

---

## Quarterly Review Cycle

The methodology includes built-in reflection:

**Every Quarter:**
- Review analytics (subscribers, traffic, top content)
- Assess what's working, what isn't
- Update outdated articles
- Plan next quarter's content
- Check for broken links, stale content

**Annually:**
- Full methodology review
- Assess if principles still serve goals
- Identify patterns in what succeeded/failed

---

## Principle Precedence

When principles conflict, use this hierarchy:

1. **Keystone Metrics** â€” Conversion trumps aesthetics
2. **Facts, Not Feelings** â€” Data trumps intuition
3. **Systems, Not Sites** â€” Long-term value trumps short-term ease
4. **Tight, Not Cramped** â€” Density trumps trend
5. **All others** â€” Context-dependent

---

## Relationship to Other Documents

This methodology document **informs** all other documentation:

| Document | How Methodology Applies |
|----------|------------------------|
| [Brand Foundation](BRAND-FOUNDATION.md) | Keystone metrics, content types, conversion flow |
| [Design Principles](DESIGN-PRINCIPLES.md) | Tight not cramped, bespoke warmth, module philosophy |
| [Design Tokens](DESIGN-TOKENS.md) | Values that implement the principles |
| [Component Library](COMPONENT-LIBRARY.md) | Module standards, workhorse/showstopper tiers |
| [Technical Architecture](TECHNICAL-ARCHITECTURE.md) | Performance targets, problem prevention |

---

*Document created: December 2024*
*Last updated: December 2024*
*Status: Foundationalâ€”modify with care*
