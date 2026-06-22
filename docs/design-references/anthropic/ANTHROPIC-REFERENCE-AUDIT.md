# Anthropic mobile reference audit

Source: `design-references/anthropic/IMG_4635.PNG` through `IMG_4646.PNG`.

These are 1206 × 2622 iPhone screenshots. They appear to be captured at a 3× device pixel ratio, so the underlying browser viewport is approximately **402 × 874 CSS px**. Measurements below are therefore reported as likely CSS values after dividing screenshot pixels by three. They should be treated as close implementation targets, not claims about Anthropic's source CSS.

## Shared visual system

### Page geometry

- Primary mobile gutter: **32px** on both sides.
- Main text and cards therefore use a **338px content width** on a 402px viewport.
- A few illustrated modules deliberately go full bleed, while their internal content returns to the 32px grid.
- Background is a warm off-white, approximately `#f7f6f2` to `#f8f7f3`.
- Secondary surfaces are a slightly darker warm stone, approximately `#eceae3` or `#e5dfd3` depending on the component.
- Primary text is a soft near-black, approximately `#171716`, rather than absolute black.

### Header

- The visible site header occupies approximately **105–112px** beneath the iOS status area.
- Logo left edge: **32px**.
- Logo rendered box: approximately **32px wide × 23px high**.
- Hamburger right edge: **36–37px** from the viewport edge.
- Hamburger visual box: approximately **23px wide × 17px high**.
- Logo and hamburger are vertically centered on the same line.
- There is no visible header container, shadow, or strong bottom border in the closed state.
- The header behaves as a persistent or sticky element in the article screenshots.

### Hamburger

- Three horizontal 1px strokes.
- Top and middle strokes are approximately **23px** wide.
- Bottom stroke is shorter, approximately **15–16px**, left aligned.
- Vertical spacing between strokes is approximately **7px**.
- The icon is intentionally thin and editorial, not a heavy app-style menu glyph.

### Typography

The screenshots use three functional faces:

1. **Grotesque sans** for display headings, section headings, navigation, labels, and controls.
2. **Editorial serif** for long-form article prose, landing-page introductions, quotations, and card summaries.
3. **Monospace** for code blocks.

The exact families cannot be proved from raster screenshots alone. Visually, the sans resembles Anthropic's geometric/grotesque brand face and the serif resembles a high-contrast editorial text face. For a close implementation, preserve the role split and metrics before chasing a family name.

Likely mobile type tokens:

| Role | Size | Line height | Weight | Tracking |
|---|---:|---:|---:|---:|
| Large landing hero | 44–46px | 0.96–1.00 | 650–700 | -0.045em |
| Article title | 32–34px | 0.98–1.02 | 650–700 | -0.035em |
| Large serif introduction | 27–29px | 1.18–1.25 | 400 | -0.015em |
| Article serif body | 20–21px | 1.25–1.30 | 400 | -0.01em |
| Sans section heading | 21–24px | 1.08–1.15 | 650–700 | -0.025em |
| Card title | 24–27px | 1.05–1.12 | 650–700 | -0.03em |
| Card serif summary | 19–21px | 1.23–1.30 | 400 | -0.01em |
| Caption / figure note | 16–18px | 1.05–1.15 | 400 | -0.015em |
| Nav top-level item | 23–25px | 1.0 | 650–700 | -0.025em |
| Nav child item | 17–19px | 1.25 | 400 | -0.01em |
| Metadata label/value | 15–17px | 1.2 | 400–500 | labels about 0.04em |
| Button | 16–18px | 1 | 400–500 | -0.015em |
| Code | 16–17px | 1.28–1.35 | 400 | 0 |

Kerning is mostly accomplished with negative `letter-spacing` on large sans headings. Serif text appears close to the font's native kerning, with only slight tightening. Uppercase metadata labels are the exception and use visibly positive tracking.

### Vertical rhythm

- Major page sections commonly use **64–96px** of vertical separation.
- Paragraph spacing is approximately **24–32px**.
- Heading-to-body spacing is approximately **14–20px**.
- Card internal padding is approximately **28px**.
- Card-to-card spacing is approximately **28px**.
- Rules are 1px and use a low-contrast warm gray.
- Rounded corners are restrained: usually **8–10px** on cards and **8px** on buttons; some large media panels use about **16px**.

## Screenshot-by-screenshot assessment

## IMG_4635.PNG — article opening

### Composition

- Closed mobile header at the top, followed by a decorative evaluation illustration, article title, deck, publication rule/date, and the beginning of the article.
- Everything except the decorative illustration sits on the **32px text gutter**.
- The gap from the header controls to the illustration is approximately **20px**.
- Illustration height is about **55px CSS**, followed by approximately **38px** before the title.

### Typography

- Article title: grotesque sans, approximately **33px**, weight **700**, line-height about **0.98**, tracking around **-0.04em**.
- Deck: grotesque sans, approximately **23–24px**, regular weight, line-height about **1.42**. This is unusually airy compared with the title.
- Published date: sans, approximately **16px**, line-height about **1.2**.
- “Introduction”: sans bold, approximately **22px**, tracking around **-0.025em**.
- Article prose: editorial serif, approximately **20–21px**, line-height about **1.28**.

### Spacing

- Title to deck: approximately **43px**.
- Deck to horizontal rule: approximately **34px**.
- Rule to date: approximately **30px**.
- Date to “Introduction”: approximately **74px**.
- Introduction heading to body: approximately **24px**.
- Rule width matches the 338px content column.

### Notable detail

- The title and deck use the same width but different rhythm: the title is compact and blocky, while the deck is deliberately open.
- The decorative graphic works as a category/subject marker rather than a conventional hero image.

## IMG_4636.PNG — article prose with figure

### Composition

- Sticky header remains visible while the body scrolls beneath it.
- Serif prose uses the standard 32px gutter.
- The figure also uses the standard content width and has a pale rounded outer frame.
- Figure caption is sans and gray, visually subordinate to both prose and image.

### Typography

- Serif body: approximately **20px**, line-height **1.27**.
- Bold inline serif remains the same size and line-height; only weight changes.
- Figure title inside the artwork is a bold sans.
- Caption: approximately **16px**, line-height about **1.08**, color around `#66645f`.
- Following emphasized paragraph appears as bold serif at the normal body size.

### Card / figure geometry

- Figure outer width: **338px**.
- Outer corner radius: approximately **8px**.
- Figure begins roughly **28px** after the preceding paragraph.
- Caption begins approximately **10–12px** after the figure.
- Caption-to-next paragraph gap: approximately **29px**.

### Notable detail

- Anthropic does not enlarge body pull-outs merely because they are important; emphasis is frequently achieved through weight alone.
- Captions switch from serif to sans, creating a clean editorial hierarchy.

## IMG_4637.PNG — list, diagram, and section transition

### Composition

- Body text includes underlined inline links and a bullet list.
- A full-width diagram card follows the list.
- The caption then leads into a bold sans section heading.

### Typography

- Body and list: editorial serif, approximately **20px**, line-height **1.27**.
- Links use a conventional solid underline, about **2px** thick, with a small underline offset.
- Bullet is a standard round disc. The bullet column begins at the main 32px gutter, while text begins approximately **21px** farther right.
- Caption: gray sans, approximately **16px**.
- “Why build evaluations?”: sans bold, approximately **23px**, line-height about **1.1**.

### Spacing

- List item text aligns to a stable hanging indent.
- List to diagram: approximately **26px**.
- Diagram to caption: approximately **10px**.
- Caption to next heading: approximately **27px**.
- Heading to following serif body: approximately **18px**.

### Notable detail

- The transition from serif article voice to sans navigational/structural voice is consistent and strong.
- Underlines are prominent enough to remain legible inside dense serif text.

## IMG_4638.PNG — section heading and comparison card

### Composition

- A sans section heading introduces a serif paragraph.
- A large warm-gray information card follows.
- The card contains a title hierarchy, divider, then compact bullet content.

### Typography

- Section heading: sans bold, approximately **22px**.
- Intro paragraph: serif, approximately **20px**, line-height **1.27**.
- Card title: sans bold, approximately **25px**.
- Card sublabels (“Methods,” “Strengths,” “Weaknesses”): sans bold, approximately **18px**, line-height about **1.4**.
- Card list: sans, approximately **16–17px**, line-height about **1.25**.

### Card geometry

- Card width: **338px**.
- Corner radius: approximately **8px**.
- Card padding: approximately **24px** left/right and **27px** top.
- Internal divider begins after approximately **18px** of breathing room.
- Card background is only slightly darker than the page, keeping the interface quiet.

### Notable detail

- The card uses sans throughout, even when surrounded by serif prose. This makes it read as reference material rather than narrative.
- The upper card labels appear stacked before their corresponding content at this mobile breakpoint, suggesting a responsive table transformed into a vertical layout.

## IMG_4639.PNG — code block

### Composition

- Serif body leads into a large code panel.
- The code panel has a scrollable or clipped code area and a persistent control footer with “Copy” and “Expand.”
- Serif narrative resumes below.

### Typography

- Body: same approximately **20px** editorial serif.
- Code: approximately **16px** monospace, line-height around **1.32**.
- Control labels: sans, approximately **17px**.

### Code panel geometry

- Width: **338px**.
- Corner radius: approximately **9px**.
- Code-area padding: approximately **18px** top and **17px** horizontal.
- Footer height: approximately **39px**.
- Footer controls are right aligned with about **25px** between groups.
- Panel background is warm gray; footer is subtly darker.

### Notable detail

- Controls are integrated into the block rather than floating above it.
- The code is visually large for mobile, favoring readability over showing many characters per line.

## IMG_4640.PNG — end of article and footer

### Composition

- Final serif paragraph ends the article.
- Footer begins as a hard full-width color transition to near-black.
- The footer uses the same **32px** internal gutter.
- White Anthropic logo sits near the upper-left, followed by a large vertical gap and a single-column sitemap.

### Footer geometry

- Footer starts immediately after approximately **52px** of white-space below the last paragraph.
- Footer logo: approximately **45px wide × 32px high**, noticeably larger than the header logo.
- Footer top padding: approximately **32px**.
- Logo to first column heading: approximately **66px**.
- Sitemap is one column at mobile width.
- Link row rhythm is approximately **32px** from baseline to baseline.

### Footer typography and color

- Column heading: white sans bold, approximately **16px**.
- Links: warm gray sans, approximately **15–16px**.
- Footer background: approximately `#171716`.
- Link color: approximately `#b9b7b1`, avoiding high-contrast white for secondary navigation.

### Notable detail

- The footer is intentionally long and utilitarian. It does not compress into accordions.
- The logo is the dominant footer marker; sitemap typography stays modest.

## IMG_4641.PNG — closed mobile menu

### Composition

- Full-screen navigation overlay with the normal warm-white background.
- Header is separated from menu content by a subtle 1px rule.
- Hamburger changes into a thin blue X.
- Top-level links are large horizontal rows with generous vertical padding.
- Two CTA buttons are fixed or placed at the bottom.

### Header and close control

- Header content still uses the **32px** gutter.
- Header height beneath the status area is approximately **93px**.
- Blue close icon visual size: approximately **19–20px**.
- Close strokes are about **1.5px** thick.

### Navigation rows

- Menu content left/right gutter: **32px**.
- Each top-level row is approximately **76px** tall.
- Row text: sans bold, approximately **24px**, line-height **1**.
- Dividers are 1px warm gray.
- Chevron visual width: approximately **16px**.
- Rows without children omit the chevron.

### Buttons

- Button width: approximately **370px**, using a narrower **16px outer gutter** than the menu text.
- Button height: approximately **51px**.
- Primary fill: muted terracotta, approximately `#c36a49`.
- Primary text: white, approximately **17px**.
- Secondary button: transparent/off-white with a 1px pale border.
- Button corner radius: approximately **8px**.
- Gap between buttons: approximately **17px**.

### Notable detail

- Navigation and CTA gutters intentionally differ: text aligns to 32px, but actions become nearly full width at 16px.
- The expanded menu uses almost no decorative styling; hierarchy comes from size, rules, and disclosure arrows.

## IMG_4642.PNG — expanded “Commitments” menu

### Composition

- Same overlay as 4641 with “Commitments” expanded.
- Expanded parent label changes from near-black to muted gray.
- Chevron rotates upward.
- Child group appears directly beneath the parent within the same section.

### Typography

- Parent label: approximately **24px** bold sans.
- Group heading “Initiatives”: approximately **18px** bold sans.
- Child links: approximately **17–18px** regular sans.
- “Trust center” after the divider: approximately **18px** bold sans.

### Spacing

- Parent to group heading: approximately **31px**.
- Group heading to first child: approximately **20px**.
- Child links use approximately **38px** baseline spacing.
- Expanded section bottom divider sits approximately **24px** below the final child.
- “Trust center” sits approximately **30px** below that divider.

### Notable detail

- Expansion does not introduce a nested box, indent rail, or different background. It relies on typography and vertical rhythm.
- The parent becoming gray is a subtle but effective active-state cue.

## IMG_4643.PNG — research landing hero

### Composition

- Standard header, then a very large blank hero lead-in.
- Large sans headline followed by a large serif mission statement.
- A rounded media/card surface begins below the fold.

### Typography

- Headline: grotesque sans, approximately **45px**, line-height **0.98**, weight **700**, tracking around **-0.045em**.
- Underlined phrases use a heavy underline around **3px**, close to the baseline.
- Mission statement: editorial serif, approximately **27px**, line-height about **1.23**.

### Spacing

- Header bottom to headline: approximately **100px**.
- Headline to mission statement: approximately **22px**.
- Mission statement to next rounded panel: approximately **83px**.
- Both headline and statement use the 32px gutter.

### Notable detail

- The enormous blank area before the headline is intentional pacing. The page feels like a poster rather than an app.
- Underlines are used as conceptual emphasis inside the display headline, not merely as link styling.

## IMG_4644.PNG — interactive globe and release card

### Composition

- Standard header.
- A full-bleed globe visualization sits directly beneath it.
- “Latest releases” returns to the 32px content gutter.
- Release card uses the standard 338px width.

### Globe module

- Full viewport width.
- Visible height in this state: approximately **186px**.
- Quote and geographic label are overlaid on the illustration.
- Geographic pill: mustard fill, bold uppercase sans, approximately **11px**.
- Quote: editorial serif, approximately **16px**, line-height about **1.2**.
- Carousel dots are small outlined circles, about **7px** diameter with **8px** gaps.

### Section and release card

- “Latest releases”: sans bold, approximately **25px**.
- Section top/bottom spacing is large: about **53px** above heading and **31px** below.
- Card background: warm beige.
- Card radius: approximately **8px**.
- Card padding: approximately **28px**.
- Card title: sans bold, approximately **26px**, line-height **1.08**.
- Summary: serif, approximately **20px**, line-height **1.25**.
- Internal rule and metadata rows use low-contrast gray.
- Metadata labels are uppercase sans with positive tracking.
- Values are right aligned.
- CTA: black filled button, approximately **203px × 48px**, radius about **8px**.

### Notable detail

- This card is almost a miniature editorial page: headline, deck, rules, metadata, then action.
- Metadata alignment is tabular but still visually soft because of generous row height.

## IMG_4645.PNG — research feature card

### Composition

- Captures the tail of the mission statement followed by a large illustrated feature card.
- Card contains centered title, centered supporting copy, centered button, then a globe visualization.

### Typography

- Feature title: centered editorial serif, approximately **29–30px**, line-height about **1.0**.
- Supporting copy: centered sans, approximately **18px**, line-height about **1.2**.
- Button label: sans, approximately **17px**.
- Geographic label: uppercase bold sans, approximately **12px**.

### Card geometry

- Card width: approximately **350px**, with about **26px** side margins—slightly wider than the standard 338px content card.
- Corner radius: approximately **15–16px**.
- Top padding: approximately **35px**.
- Title to support copy: approximately **18px**.
- Support copy to button: approximately **23px**.
- Outlined button: approximately **132px × 47px**, radius about **8px**.
- The globe artwork fills most of the lower card and is clipped by the rounded container.

### Notable detail

- Centering is reserved for the promotional feature module; the rest of the site is strongly left aligned.
- The visual density increases down the card: quiet typography at top, detailed illustration below.

## IMG_4646.PNG — second release card and following section

### Composition

- Standard header.
- A small beige rounded strip or tail of the preceding component appears below the header.
- Another release card follows with the same internal system as 4644.
- A large standalone sans mission statement begins after the card.

### Release card

- Width: **338px**.
- Padding: approximately **28px**.
- Title: sans bold, approximately **25px**, line-height about **1.1**.
- Summary: serif, approximately **20px**, line-height about **1.25**.
- Summary block has substantial height before metadata, preserving equalized card structure.
- Metadata rows: about **47px** tall.
- CTA: approximately **203px × 48px**.

### Following section

- Card bottom to next statement: approximately **53px**.
- Statement: sans bold, approximately **29–30px**, line-height about **1.08**, tracking around **-0.035em**.
- Subsequent content title: sans bold, approximately **20px**.
- Category label is gray and approximately **17px**.

### Notable detail

- Cards appear designed around consistent internal zones rather than content-driven collapse: title/summary, metadata, then CTA.
- Large sans declarations are used to reset rhythm between groups of cards.

## Implementation blueprint

The closest reusable mobile tokens are:

```css
:root {
  --anthropic-page: #f7f6f2;
  --anthropic-surface: #e8e3d8;
  --anthropic-surface-soft: #eeece6;
  --anthropic-ink: #171716;
  --anthropic-muted: #686660;
  --anthropic-rule: rgba(23, 23, 22, 0.12);
  --anthropic-terracotta: #c36a49;

  --anthropic-gutter: 2rem;       /* 32px */
  --anthropic-card-padding: 1.75rem; /* 28px */
  --anthropic-radius: 0.5rem;     /* 8px */
  --anthropic-radius-large: 1rem; /* 16px */
}

.anthropic-display-xl {
  font-family: var(--font-sans);
  font-size: clamp(2.75rem, 11vw, 2.875rem);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.045em;
}

.anthropic-display-article {
  font-family: var(--font-sans);
  font-size: 2.0625rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
}

.anthropic-serif-lede {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  line-height: 1.23;
  letter-spacing: -0.015em;
}

.anthropic-serif-body {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  line-height: 1.28;
  letter-spacing: -0.01em;
}
```

## What to copy most faithfully

1. The **32px mobile gutter** and disciplined return to it after full-bleed media.
2. The sharp role separation between **sans structure** and **serif narrative**.
3. Tight sans display tracking paired with comfortable serif line-height.
4. The header's small logo, thin asymmetrical hamburger, and generous surrounding empty space.
5. Card padding around **28px**, low-contrast surfaces, 1px rules, and modest 8px radii.
6. Very large vertical pauses between major editorial sections.
7. Footer contrast strategy: white logo, warm-gray links, single-column sitemap.
8. Mobile menu hierarchy built from row height and typography, without boxed submenus.

## Caveats

- iOS Safari chrome obscures the bottom of several screenshots, so footer and card measurements near the bottom edge are partial.
- The screenshots contain both page pixels and operating-system/browser UI pixels; the 3× conversion is inferred from the 1206px capture width.
- Exact font family, font optical sizing, variable-font axes, and browser kerning settings cannot be identified with certainty from PNGs alone.
- Colors are visually estimated because screenshots can include display color-management and compression differences.

Yes. The live source confirms that Anthropic uses design tokens plus media queries—not manually chosen spacing for every page.
One important discovery: the screenshots cover two separate site implementations:
Engineering article: Next.js with CSS Modules
Homepage/navigation/cards: Webflow-generated CSS with GSAP interactions
They share the same brand system, but not exactly the same code.
How responsive spacing works
The engineering site defines global CSS variables and changes their values at breakpoints:
Token	Mobile	≥992px	≥1024px
Page margins	32px	48px	64px
Main section spacing	64px	80px	96px
Card padding, medium	24px	32px	32px
Large gap	32px	48px	48px
Large radius	16px	24px	24px
Article headline	32px	44px	52px
Large body text	22px	22px	25px

The container rule is essentially:
.page-wrapper {
  width: 100%;
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: var(--page-margins);
}
That explains the screenshots’ exact 32px mobile gutter. On larger displays, the content expands until reaching 1400px, then remains centered.
Their principal breakpoints are:
567px   /* mobile → larger mobile */
992px   /* tablet/layout transition */
1024px  /* desktop token scale */
Additional component-specific breakpoints include 700px, 800px, 950px, 1200px, and 1250px.
Fonts
The current engineering site self-hosts:
--anthropic-sans: "Anthropic Sans";
--anthropic-serif: "Anthropic Serif";
--anthropic-mono: "Anthropic Mono";
It also loads older or secondary brand fonts:
Copernicus
Styrene A
Styrene B
Tiempos Text
JetBrains Mono
The actual eval article uses:
Anthropic Sans for headings, navigation, metadata, captions
Anthropic Serif for article prose
JetBrains Mono for technical/code elements
This corrects one estimate from my visual audit: normal article prose is actually 17px, not 20–21px:
.body-2 {
  font-family: var(--anthropic-sans);
  font-size: 17px;
  line-height: 155%;
}

.body-2.serif {
  font-family: var(--anthropic-serif);
}
So article prose is:
font-size: 17px;
line-height: 26.35px;
font-family: "Anthropic Serif";
The screenshot looks larger because of the serif’s proportions, the narrow reading column, and generous line-height.
Article formatting
The reading column is:
.reading-column {
  width: 100%;
  max-width: 640px;
  margin-inline: auto;
}

@media (max-width: 800px) {
  .reading-column {
    max-width: none;
  }
}
Paragraph and heading rhythm is explicit:
.post-text {
  margin-bottom: 1rem;
}

.post-text + .post-text {
  margin-top: 1rem;
}

.post-section,
.post-subsection {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

@media (min-width: 567px) {
  .post-section,
  .post-subsection {
    margin-top: 2rem;
  }
}
Media changes more dramatically:
.media-column {
  margin: 1.5rem auto;
  max-width: 880px;
}

@media (min-width: 567px) {
  .media-column {
    margin: 6em auto;
  }
}
That is why figures gain enormous breathing room beyond phone size.
Header behavior
The engineering header is:
header {
  position: sticky;
  top: 0;
  padding-block: 16px;
  z-index: 9999;
}
Other responsive decisions:
Header height token: 64px mobile, 68px from 950px
Mobile hamburger disappears at 950px
Desktop navigation appears at 950px
Compact Anthropic symbol remains until 1250px
Full desktop logo appears at 1250px
Optional hide-on-scroll uses transform: translateY(-100%)
So “mobile versus desktop” is not one breakpoint. Navigation changes at 950px, spacing at 992/1024px, and logo treatment at 1250px.
Article hero reflow
On mobile:
Illustration and title stack vertically
Metadata is flex-direction: column-reverse
Summary appears before publication date
Summary gets a bottom border
At ≥992px:
Illustration and title become a row
Metadata becomes a row
A top border is introduced
Date receives a fixed 250px column
Summary fills the remaining width
That is responsive composition, not merely shrinking text.
Cards and code blocks
Their core card values are:
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;

--card-padding-sm: 16px;
--card-padding-md: 24px;
--card-padding-lg: 48px;
At 992px, these grow to 12/16/24px radii and 24/32/64px padding.
The article code block uses:
.code-block {
  padding: var(--card-padding-sm)
           var(--card-padding-sm) 0;
  border-radius: var(--radius-sm);
  background: var(--background-secondary);
}
Its control bar uses negative margins equal to the parent padding, allowing the footer to touch both card edges.
Mobile navigation
The homepage navigation uses a full-viewport overlay:
.nav-menu {
  min-height: 100dvh;
  padding-top: var(--nav-height);
}
Rows use:
.nav-link {
  padding: 1.4rem 0;
  border-bottom: 1px solid;
}
JavaScript only manages state—open/closed menu and expanded accordion. CSS handles sizing, rotation, visibility, layout, and colors.
The central technique
Anthropic generally does this:
.component {
  padding: var(--card-padding-md);
  gap: var(--gap-md);
  border-radius: var(--radius-md);
}
Then globally changes the token values:
@media (min-width: 992px) {
  :root {
    --page-margins: 48px;
    --card-padding-md: 32px;
    --gap-md: 32px;
    --radius-md: 16px;
  }
}
That is how the whole site grows coherently. Components reference semantic tokens; breakpoints modify the tokens rather than rewriting every component.