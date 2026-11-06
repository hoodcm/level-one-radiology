# Level One Radiology: Writing Style Guide

*The human voice and the structure that carries it*

[← Docs](README.md)

---

## Core Philosophy

Writing style follows the same "tight, not cramped" principle as design. Professional density with human warmth: not sparse, not padded, not performed.

Structure organizes the piece. The human layer provides the voice. Structure without voice feels like a textbook. Voice without structure wastes the reader's time. You need both.

Write like a colleague at the next workstation talking the reader, Sarah in [brand.md](brand.md), through it, not a textbook and not a marketer. Warmth in this register is directness: short sentences that respect her time, first person where it's natural, and no performed authority. She can hear a sales voice instantly, and it costs the piece her trust.

---

## Part One: The Human Layer

How a Level One teaching article teaches and sounds lives in the global `teaching` skill, in its register, `references/register.md`, and its article node, `references/article.md`, with the voice skill holding every sentence. `.claude/rules/content.md` loads them for article prose.

---

## Part Two: Content Organization

These are formatting tools, not templates. Use them to organize your human voice, not to replace it.

### The Core Structure

Every piece of Level One content can use this architecture, but hold it loosely.

| Component | Specification |
|-----------|---------------|
| **Headline** | ≤6 words. Strong verb, specific topic. A headline states the take, so no question heads, curiosity-gap teasers, listicle framing such as "5 things," or colon-subtitle heads. |
| **Lede** | One or two sentences. Tell me something useful immediately. |
| **Why it matters** | Connect finding to clinical action or consequence. |
| **Go deeper** | Optional expansion. The reader's choice. |

**The 200-word test:** If a reader stops after 200 words, did they get the essential teaching point? Structure so the answer is yes.

**Endings:** End a piece on what the reader does with it where the topic has an action. A section ends when its information does.

### Axiom Labels

Use these as signposts when they help, not as mandatory headers.

| Label | Use when... |
|-------|-------------|
| **Why it matters** | Connecting imaging to clinical action |
| **What you're looking for** | Describing the actual findings |
| **The mechanism** | Explaining why something looks the way it does |
| **Where people miss it** | Teaching common errors |
| **The practical reality** | Describing how things actually work |
| **The bottom line** | Summarizing a takeaway |
| **Go deeper** | Linking to sources or related content |

These are tools. If a natural paragraph break works better than a labeled section, use the paragraph break. And a label never substitutes for arrangement: if the prose hasn't already made the reader feel the stakes, a bold header announcing them is performance.

Axiom labels are the licensed exception to the voice core's Performative emphasis entry. The license holds only while the prose beneath a label still arranges its own case. The moment a label carries the claim itself, the exception is void and the core ban applies.

### When to Use Bullets

Bullets are for genuinely parallel items that benefit from visual separation. Not for everything.

**Use bullets for:**
- Lists of discrete findings
- Step-by-step sequences
- Multiple concrete scenarios

**Don't use bullets for:**
- Explanation that flows logically (use prose)
- Single items (just write the sentence)
- Making thin content look substantial

### Bold for Scanning

Bold the phrases a skimmer needs to catch. Not every key term, only the ones that orient the reader. Bold an orienting phrase, not a crafted aphorism: styling a kicker in bold spends a landing line from the voice core's Earned emphasis budget on typography.

> **Reduced wall enhancement** is the most specific finding for nonviable bowel. Judge it against adjacent normal loops on the portal venous phase.

### Paragraphs, headers, and images

- Short paragraphs: two or three sentences, one idea each.
- Headers describe content, such as "AAST Grading Criteria," never a generic label such as "Discussion."
- Emojis go in headers and navigation only, never in body text.
- Images teach, never decorate.

---

## Part Three: Content Types

### Collectors (Educational Articles)

**Voice:** Teaching attending. Ground the learner first. Framework before findings. Physical reality before pattern recognition. Explain what signs represent.

**Structure:**
- Opening that starts with shared experience or names the confusion
- Problem statement (what makes this hard?)
- Framework section (what is this thing, grounded in physics/anatomy/pathophys?)
- Findings section (what do I look for?)
- Practical section (what do I do with this?)
- Go deeper (references, related content)

**Length:** 1,500–3,000 words. Long enough to be comprehensive, tight enough to respect time.

### Attractors (Commentary)

**Voice:** Informed peer. Plant your flag. Flip the frame. Concede partial truth. Be blunt when warranted.

Flipping the frame is a bounded permission: at most one frame-flip per piece, at the thesis, earned by the evidence already arranged. It is the same dosage as the voice core's binary-contrast exception, and the slick tells the core catalogs, such as pull-quote closers, staged reversals, and "What X was Y" pseudo-clefts, stay tells here.

**Structure:**
- Headline that signals the take
- Lede that states your position
- 2-3 paragraphs of argument
- Actionable implication

**Length:** 600–1,200 words. Speed matters. Respond within days, not weeks.

### Newsletter

**Format:**
```
Level One weekly

The big thing
[Most important item, 2-3 paragraphs max]

Also this week
[1-2 shorter items]

Quick pearls
• [Pearl 1]
• [Pearl 2]
• [Pearl 3]

One more thing
[Humanizing closer: casual, personal, or funny]
```

**Voice:** Slightly more casual than articles. First person. Conversational transitions.

**Length:** 600–900 words total, 5 to 10 items at most. Respect the inbox.

### Social (LinkedIn)

**Format:**
```
[One-line hook: the take, not a teaser]

[2-3 sentences of context or argument]

[Link or call to action]
```

**Voice:** Direct. No preamble. Plant the flag immediately. The core message lands before "see more."

**Example:**
> New ACR guidelines: most adrenal incidentalomas don't need follow-up.
>
> I think it's a good move. We perform way too many unnecessary follow-up exams, and it clogs the system. The truly concerning ones are hyperdense, enhance, or exist in the presence of known cancer.
>
> [Link to full commentary]

---

## Part Four: Word Choice

### Purge Radiology-Speak

These phrases add nothing. Delete them.

| Delete | Replace with |
|--------|--------------|
| "There is a finding of..." | [Just state the finding] |
| "Cannot be excluded" | Possible / Consider |
| "Correlate clinically" | [State what correlation you need] |
| "Suggestive of" | Suggests / Indicates / Consistent with |
| "Attention is directed to..." | [Just direct attention] |

### Shorter Words

Prefer one syllable over two, and two over three.

### Manufactured Urgency

Manufactured urgency, such as "Your report macros need an update," tells instead of showing. State the implication, and let the evidence carry the urgency. `docs/register-bans.json` holds the emphasis crutches, such as "Full stop." and "Let that sink in," that `voice-lint --register-file docs/register-bans.json` flags in site copy.

### Active Voice

The finding did something. Say so.

| Passive | Active |
|---------|--------|
| "A laceration was identified extending to the hilum" | "The laceration extends to the hilum" |
| "Enhancement is noted within the lesion" | "The lesion enhances" |
| "The examination was performed" | [Delete, since we know it was performed] |

---

## Part Five: Examples

Never take register exemplars from the site's published articles: they were AI-generated, so they show the failure mode, not the register. Exemplars come from prose Michael wrote or approves.

### Educational Article Opening

**Before (textbook voice):**
> Closed-loop small bowel obstruction is a surgical emergency characterized by obstruction of both the afferent and efferent limbs of a bowel segment, resulting in a closed system that cannot decompress. This entity is associated with rapid progression to strangulation and requires prompt recognition. The following imaging findings should be sought...

**After (human voice):**
> Closed-loop obstruction is a surgical emergency. A closed-loop obstruction means a segment of bowel where both the afferent and efferent ends are obstructed, often at the same point, usually from an adhesive band. The bowel can't decompress in either direction, so it strangulates faster than a simple obstruction.
>
> Here are some concrete things to look for.

### Educational Article Opening (Grounded)

**Before (concept-first):**
> Window width and window level control how CT densities are displayed on your monitor. Understanding these controls is essential for optimal image interpretation.

**After (experience-first):**
> I'm sure you've sat next to a radiologist before and watched them jerk the mouse around with small movements that alter the appearance of the image on screen. You might be wondering what they're doing and why? These controls are especially difficult when you first start looking at CTs yourself, and it's understandably easiest to default to the preset window widths and levels.
>
> Let's break down what exactly window width and window level mean in simple terms.

### Commentary Opening

**Before (hedged):**
> The ACR recently released updated guidelines regarding the management of incidentally discovered adrenal lesions. These guidelines represent a shift in recommendations that may have implications for clinical practice. There are several perspectives to consider...

**After (flag planted):**
> I think it's a good idea. We perform way too many unnecessary follow-up exams nowadays, and it clogs the system.
>
> By far the majority of adrenal nodules are adenomas. And I honestly feel that the 10 Hounsfield unit cut-off is too strict for the more nitpicky among us. What do you do if the average density is 12 or 15? Does that really make you less certain that it's a benign adenoma?

### Handling Uncertainty

**Before (false confidence):**
> The presence of free fluid in the setting of trauma is a significant finding that warrants surgical evaluation.

**After (operational honesty):**
> I'd say "not unless *you* think they do." There are so many reasons a trauma activation patient could have fluid. What if they are a cirrhotic, or they have heart failure, or they have CKD?
>
> Nowadays, the surgical services are so busy that unless the patient has active bleeding or clear signs of injury, they will not take the patient to the OR unless the clinical exam dictates it to be so. And in the end, remember that the decision to take a patient to the OR is entirely the surgeon's, not yours.

---

## Case Viewer Authoring

Embedding a scrollable stack in an article. The build mechanics and interaction model live in [design/components.md](design/components.md#showstopper-case-viewer); this section is the author's side.

### Directive syntax

```
::case[Scroll through the exam. Portal venous phase at the transition point.]{id="ct-abd-001"}
```

The `[caption]` renders as the figcaption; the `id` names a case under `public/cases/<id>/`, assembled from a prepared case folder in the private `prepare-radiology-content` repo: `npm run case:build -- --id <id> --in ../prepare-radiology-content/cases/<id>` (see the header of `scripts/build-case.mjs` for the full flags). A build fails loudly if the case's manifest or any referenced frame is missing.

### Curation

`--start` sets the frame the reader lands on, and the slice index is preserved when they switch windows. Which slices to keep, and whether a case is a worked example or an unknown, is teaching guidance in the `teaching` skill's article node. Curation itself, the images, order, labels, and crops, happens in the private pipeline's review tool, not here.

### De-identification

Handled entirely upstream in the private `prepare-radiology-content` pipeline: anonymized export, human redaction gate, metadata strip. Prepared images arrive clean by construction; this repo's assembler only downscales them (see CLAUDE.md → Case Images).

---

## Quick Reference Checklist

Before publishing, verify:

- [ ] **200-word test:** Does the opening deliver value immediately?
- [ ] **Endings:** Where the topic has an action, does the reader know what to do?
- [ ] **Teaching and voice:** Did the article pass the `teaching` register and the voice skill's checks?

---

## Register corrections fold back here

Generalize a register-quality correction that surfaces during site writing into this guide in the session it lands, as a failure mode with its licensing condition, never a bare instance.

---

Last updated: 2026-11-06
