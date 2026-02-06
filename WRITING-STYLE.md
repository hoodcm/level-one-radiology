# Level One Radiology: Writing Style Guide

*Smart Brevity structure with human voice*

**Navigation:** [README](README.md) Â· [Brand Foundation](BRAND-FOUNDATION.md) Â· [Design Methodology](DESIGN-METHODOLOGY.md) Â· [Design Principles](DESIGN-PRINCIPLES.md) Â· [Design Tokens](DESIGN-TOKENS.md) Â· [Component Library](COMPONENT-LIBRARY.md) Â· [Technical Architecture](TECHNICAL-ARCHITECTURE.md) Â· **Writing Style**

---

## Core Philosophy

> **Brevity is confidence. Length is fear. Short, not shallow.**

Writing style follows the same "tight, not cramped" principle as design. Professional density with human warmthâ€”not sparse, not padded, not performed.

Smart Brevity provides the structure. The human layer provides the voice. Structure without voice feels like a textbook. Voice without structure wastes the reader's time. You need both.

---

## Part One: The Human Layer

These principles define how Level One sounds. They're drawn from how an experienced radiologist actually teachesâ€”not how textbooks are written or how medical educators perform expertise.

### Ground the Learner First

Before teaching a concept, orient the learner. Start with what they've experienced, name their confusion, and frame the problem before solving it.

#### 1. Start with shared experience

Don't open with the conceptâ€”open with the confusion or observation that makes the concept necessary. Put the reader in a situation they recognize.

| Abstract opening | Grounded opening |
|------------------|------------------|
| "Window width and window level control how CT densities are displayed." | "I'm sure you've sat next to a radiologist and watched them jerk the mouse around with small movements that alter the image. You might be wondering what they're doing." |
| "Closed-loop obstruction is characterized by..." | "You've probably seen SBOs where you can't find a single transition point. That's often a closed-loop." |
| "The Lisfranc joint complex consists of..." | "You're reading a foot CT after an MVC, and something looks off at the midfoot, but you're not sure what you're looking at." |

This validates the learner's existing uncertainty rather than jumping straight to explanation. They feel seen before they feel taught.

#### 2. Name the disorientation

Acknowledge the general feeling of being lost, not just specific confusions. This builds trust because it's accurate.

- "These controls are especially difficult when you first start looking at CTs yourself, and it's understandably easiest to default to the preset windows."
- "You might open one of these studies and wonder why there are so many sequences. Which one do I look at?"
- "This is one of those diagnoses that's obvious once you know what you're looking for, but completely invisible until then."

#### 3. State the problem before the solution

Technical concepts feel arbitrary unless learners understand what problem they solve. State the problem explicitly, let it sit for a moment, then introduce the solution as inevitable.

> "Since there's such a big range of densities to represent, we have a problem. Your monitor can only display a few hundred shades of gray. And even more, your eye can only distinguish a few dozen shades. So, how do we represent all these values? The answer is, we can'tâ€”at least not all at once."

The solution (windowing) now feels like *the obvious answer to an obvious problem* rather than an arbitrary technical feature someone invented.

#### 4. Ground teaching points in physical reality

Ensure learners build their understanding on a clear foundation of physics, anatomy, and pathophysiologyâ€”not just pattern recognition. Don't use measurements or concepts as given. Explain what they capture physically.

| Ungrounded | Grounded |
|------------|----------|
| "CT scanners measure density in Hounsfield units." | "When we describe something as dense in x-ray or CT terms, we're saying how effectively that material reduces the intensity of a radiation beamâ€”the linear attenuation coefficient. Hounsfield units are the standardized scale for this." |
| "Look for a T2 hyperintense lesion." | "T2 signal reflects how quickly protons lose their transverse magnetization. Fluid loses it slowly, so it stays bright. This lesion is holding onto signal like fluid does." |
| "The AAST grade determines management." | "The grading system is really asking: how much of the spleen is devascularized? That's what predicts whether it will heal or keep bleeding." |

This makes findings *findable* rather than just *recognizable*. When learners understand the physics or pathophysiology, they can reason through cases they haven't seen before.

---

### Teaching Structure

#### 5. Build the framework first

Explain what the thing *is* before listing what to look for. Once the mental model is clear, the findings follow logically.

**Don't do this:**
> Look for the double beak sign, mesenteric swirl, and hub-and-spoke edema pattern.

**Do this:**
> A closed-loop obstruction means a segment of bowel where both the afferent and efferent ends are obstructedâ€”often at the same point, usually from an adhesive band. The bowel can't decompress in either direction.

The framework does the heavy lifting. Once someone understands the anatomy, the signs make sense as manifestations of it.

#### 6. Explain what signs represent

Don't just describe appearancesâ€”teach the underlying mechanism. This makes findings *findable* rather than just *recognizable*.

| Sign | What to write |
|------|---------------|
| Hub-and-spoke mesenteric edema | "This represents venous congestionâ€”the mesenteric veins are obstructed before the arteries, so fluid backs up into the mesentery." |
| Double beak sign | "What this actually represents is the single point where the segment is being pinched off." |
| Thick sections less grainy | "We take the geometric average of multiple thin sections, which improves the signal-to-noise ratio." |

#### 7. Use physical analogies

If someone can imagine holding it or doing it, the concept sticks. These aren't literary metaphorsâ€”they're mental models with physical logic.

- "Think of twisting a balloon animalâ€”you create one twist, but it obstructs the balloon on both sides of it."
- "Think of the foot as an arched tic-tac-toe boardâ€”two longitudinal arches and two struts supporting them."
- "The patient goes through the donut, gets scanned, and the raw output is converted into thin-sliced sections."

#### 8. Give concrete scenarios

Specific situations are more memorable than categories.

| Abstract | Concrete |
|----------|----------|
| High-energy mechanism | Foot pressing against the footboard in a head-on MVC |
| Axial loading injury | Falling from a height and landing directly on your midfoot |
| Incidental finding | You're reading a trauma CT and there's a tiny focus of free fluid in the pelvisâ€”no solid organ injury, no other findings |

#### 9. Technical terms come second

Build intuitive understanding first, then name it. The term becomes a label for something they already grasp, not a concept they have to decode.

**Don't do this:**
> The spatial resolution is higher on thin sections, but contrast resolution suffers due to increased noise.

**Do this:**
> When we scroll on the thin sections, we get great spatial resolution, but they are grainy. On the thicks, it's much easier to see the difference between structuresâ€”the signal-to-noise ratio is better.

#### 10. Show tradeoffs unfolding

Don't just state that a choice has consequencesâ€”demonstrate the consequence by showing what happens when you make the choice.

> "Now see the trade-off that we accept with this window. We can differentiate the very similarly dense tissues here, but look at the calvarium. We can't make out any detail in it at all. It's all pure white. Now watch as I widen the window and the brain parenchyma converges on a single shade of gray, but more cortical and trabecular detail come into view."

This teaches *why* the tradeoff exists, not just *that* it exists.

---

### Engaging the Learner

#### 11. Name the learner's confusion

Acknowledge what the reader is probably experiencing. This isn't performative empathyâ€”it's accurate, and naming it builds trust.

- "You might open one of these studies and wonder why there are so many sequences. Which one do I look at?"
- "A common question is: Is this hyperdense pixel on this head CT actually subarachnoid hemorrhage?"

#### 12. Invite observation

Shift the reader from passive to active. This works even in written form.

- "Let me put the thin sections next to the thick sections, and you tell me what the visual difference is."
- "Look at this image. What stands out?"

#### 13. Use demonstration language

Even in text without images, write as if you're showing something happening. This shifts the reader from passive to active.

- "Now watch as I widen the window..."
- "See what happens when we scroll inferiorly..."
- "Look at the relationship between these two structures..."
- "...as I demonstrate here."

This language works in articles with images, but also primes readers to visualize when images aren't present.

#### 14. Acknowledge when visuals are needed

Don't pretend prose can do everything. Say when a picture would help.

- "I would show a picture here."
- "This is easier to understand with a diagram."
- "See the accompanying image for the classic appearance."

---

### Voice and Stance

#### 15. State importance plainly

"This is important because it's a surgical emergency." That's it. No "miss this and you're calling the family" energy. No performed urgency.

| Performative | Plain |
|--------------|-------|
| "This is the finding that keeps me up at night." | "This is an important diagnosis because it's a surgical emergency." |
| "Miss this and you'll regret it." | "The Lisfranc joint is especially important for midfoot stability." |
| "Call the surgeon. Now." | "Your report needs to be unambiguous." |

#### 16. Be blunt when warranted

Some questions don't need elaboration. Don't perform fairness by giving a longer answer than the situation deserves.

> **Q:** Why do emergency radiologists get paid less than subspecialists when we read more studies and have worse hours?
>
> **A:** They don't. I'll just say that.

#### 17. Plant your flag

On uncertain topics, take a stance based on your best judgment. Readers can disagree, but they know where you stand.

> "I think in this setting you present the evidence and your best informed opinion. Plant your flag and take a stance on it."

> "I honestly feel that the 10 Hounsfield unit cut-off is too strict for the more nitpicky among us."

#### 18. Challenge orthodoxy if you believe it

Say the unfashionable thing if you think it's true. Not for controversy's sake, but because it serves the reader.

> "Even the best radiologists don't read CXRs very well. There are just so many different ways that the chest and mediastinum can appear."

> "We perform way too many unnecessary follow-up exams nowadays, and it clogs the system."

---

### Argumentation

#### 19. Flip the frame

Don't argue on critics' terms. Shift to the terms that actually matter.

| Critic says | Flip to |
|-------------|---------|
| "Radiologists are overpaid image describers." | "What would happen if we stopped?" |
| "AI will replace radiologists in two years." | "Who's legally liable? Who integrates it into workflow?" |
| "This guideline is too conservative." | "What's the actual harm of the current approach?" |

#### 20. Concede partial truth

Acknowledging where critics have a point makes your actual argument stronger. Don't get defensive.

> "You could partially get by. We see in many parts of the country that EDs interpret their own x-rays, and final reads don't come until maybe a day later. Surgeons interpret their own imaging."

> "I do agree with you on the importance of adding clinical value."

#### 21. Preempt counterarguments

Name objections before others raise them. This shows intellectual honesty and disarms bad-faith critics.

> "Haters will whip out every potential counterargument here and many definitely exist (diaphragm injury, anyone?), but we all know this is mostly true."

#### 22. Use rhetorical questions that work

Not empty rhetoricâ€”these should carry argumentative weight. They invite the reader to answer honestly, and the honest answer supports your point.

- "Does that really make you less certain that it's a benign adenoma?"
- "Do you really want to be responsible for the really complicated case?"
- "What if they are a cirrhotic, or they have heart failure, or they have CKD?"

---

### Practical Realism

#### 23. Describe how systems actually work

Not how they're supposed to work. Operational honesty helps learners navigate real situations.

> "Nowadays, the surgical services are so busy that unless the patient has active bleeding or obvious signs of injury, they will not take the patient to the OR unless the clinical exam dictates it to be so."

> "Companies really are not in the practice of selling a medical device that is legally liable for failure. They'd rather sell you a subscription triage device that removes the legal liability from themselves."

#### 24. Clarify role and responsibility

Help learners understand not just what to see, but what's theirs to decideâ€”and what isn't.

> "Remember that the decision to take a patient to the OR is entirely the surgeon's, not yours. You may make findings on an exam that necessitate going to the OR because the surgeon has performed a clinical exam and agrees. But if they disagree with you, they are not going to."

#### 25. Find the useful kernel

Extract what's actually valuable from hyped or flawed ideas. Don't dismiss wholesale; don't embrace wholesale.

> "What I do think is helpful are the algorithms that can tell us when a chest X-ray is normal, i.e. they have a high negative predictive value. I can see use in that."

---

### Humanity

#### 26. Appeal to shared experience

"We all know this is mostly true"â€”but only when you've earned it by showing you understand the nuance first.

> "Practically, you should be able to tell when there's a real bleed. If you're having to equivocate on a pixel, then perhaps it's not real enough to matter, if you know what I mean."

#### 27. Be a person

Dry humor, casual asides, internet-native references. You're not performing authority.

- "!RemindMe in two years."
- "Of course, we all remember the prediction by that famous AI scientist in 2016."
- "Anyway."

#### 28. Land on something actionable

Every section should end with what to actually do or look for. The reader should never finish a section wondering "so what do I do with this?"

- "Look for widening between the medial cuneiform and the second metatarsal base."
- "For most purposes, the thick sections are the ones you scroll on, and you can treat the thin sections as problem-solving."
- "Your report needs to be unambiguous. Then actually call."

---

## Part Two: Smart Brevity Structure

These are formatting tools, not templates. Use them to organize your human voice, not to replace it.

### The Core 4 Framework

Every piece of Level One content can use this architectureâ€”but hold it loosely.

| Component | Specification |
|-----------|---------------|
| **Headline** | â‰¤6 words. Strong, specific. |
| **Lede** | One or two sentences. Tell me something useful immediately. |
| **Why it matters** | Connect finding to clinical action or consequence. |
| **Go deeper** | Optional expansion. The reader's choice. |

**The 200-word test:** If a reader stops after 200 words, did they get the essential teaching point? Structure so the answer is yes.

### Axiom Labels

Use these as signposts when they helpâ€”not as mandatory headers.

| Label | Use when... |
|-------|-------------|
| **Why it matters** | Connecting imaging to clinical action |
| **What you're looking for** | Describing the actual findings |
| **The mechanism** | Explaining why something looks the way it does |
| **Where people miss it** | Teaching common errors |
| **The practical reality** | Describing how things actually work |
| **The bottom line** | Summarizing a takeaway |
| **Go deeper** | Linking to sources or related content |

These are tools. If a natural paragraph break works better than a labeled section, use the paragraph break.

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

Bold the phrases a skimmer needs to catch. Not every key termâ€”just the ones that orient the reader.

> **Two transition points, not one.** This is the key. Simple SBO has a single point where dilated meets decompressed. Closed-loop has two.

---

## Part Three: Content Types

### Collectors (Educational Articles)

These are the SEO workhorses. Written with search intent in mind.

**Voice:** Teaching attending. Ground the learner first. Framework before findings. Physical reality before pattern recognition. Explain what signs represent.

**Structure:**
- Opening that starts with shared experience or names the confusion
- Problem statement (what makes this hard?)
- Framework section (what is this thing, grounded in physics/anatomy/pathophys?)
- Findings section (what do I look for?)
- Practical section (what do I do with this?)
- Go deeper (references, related content)

**Length:** 1,500â€“3,000 words. Long enough to be comprehensive, tight enough to respect time.

### Attractors (Commentary)

These are LinkedIn fuel. Timely response to guidelines, papers, field trends.

**Voice:** Informed peer. Plant your flag. Flip the frame. Concede partial truth. Be blunt when warranted.

**Structure:**
- Headline that signals the take
- Lede that states your position
- 2-3 paragraphs of argument
- Actionable implication

**Length:** 600â€“1,200 words. Speed mattersâ€”respond within days, not weeks.

### Newsletter

**Format:**
```
LEVEL ONE WEEKLY

THE BIG THING
[Most important itemâ€”2-3 paragraphs max]

ALSO THIS WEEK
[1-2 shorter items]

QUICK PEARLS
â€¢ [Pearl 1]
â€¢ [Pearl 2]
â€¢ [Pearl 3]

ONE MORE THING
[Humanizing closerâ€”casual, personal, or funny]
```

**Voice:** Slightly more casual than articles. First person. Conversational transitions.

**Length:** 600â€“900 words total. Respect the inbox.

### Social (LinkedIn)

**Format:**
```
[One-line hookâ€”the take, not a teaser]

[2-3 sentences of context or argument]

[Link or call to action]
```

**Voice:** Direct. No preamble. Plant the flag immediately.

**Example:**
> New ACR guidelines: most adrenal incidentalomas don't need follow-up.
>
> I think it's a good move. We perform way too many unnecessary follow-up exams, and it clogs the system. The truly concerning ones are hyperdense, enhance, or exist in the presence of known cancer.
>
> [Link to full commentary]

---

## Part Four: Word Choice

### The Syllable Rule

One-syllable words beat two-syllable words beat three-syllable wordsâ€”when meaning is equivalent.

| Weak | Strong |
|------|--------|
| hemorrhage | bleed |
| visualized | seen |
| identified | found |
| utilize | use |

### Purge Radiology-Speak

These phrases add nothing. Delete them.

| Delete | Replace with |
|--------|--------------|
| "There is a finding of..." | [Just state the finding] |
| "Cannot be excluded" | Possible / Consider |
| "Correlate clinically" | [State what correlation you need] |
| "Suggestive of" | Suggests / Indicates / Consistent with |
| "Attention is directed to..." | [Just direct attention] |

### Active Voice

The finding did something. Say so.

| Passive | Active |
|---------|--------|
| "A laceration was identified extending to the hilum" | "The laceration extends to the hilum" |
| "Enhancement is noted within the lesion" | "The lesion enhances" |
| "The examination was performed" | [Deleteâ€”we know it was performed] |

---

## Part Five: Examples

### Educational Article Opening

**Before (textbook voice):**
> Closed-loop small bowel obstruction is a surgical emergency characterized by obstruction of both the afferent and efferent limbs of a bowel segment, resulting in a closed system that cannot decompress. This entity is associated with rapid progression to strangulation and requires prompt recognition. The following imaging findings should be sought...

**After (human voice):**
> This is an important diagnosis because it's a surgical emergency. A closed-loop obstruction means a segment of bowel where both the afferent and efferent ends are obstructedâ€”often at the same point, usually from an adhesive band. The bowel can't decompress in either direction, so it strangulates faster than a simple obstruction.
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
> Nowadays, the surgical services are so busy that unless the patient has active bleeding or obvious signs of injury, they will not take the patient to the OR unless the clinical exam dictates it to be so. And in the end, remember that the decision to take a patient to the OR is entirely the surgeon's, not yours.

---

## Quick Reference Checklist

Before publishing, verify:

- [ ] **Grounded opening:** Did I start with shared experience or name the learner's confusion?
- [ ] **Problem stated:** Did I frame the problem before solving it?
- [ ] **Physical reality:** Did I ground the concept in physics, anatomy, or pathophysiology?
- [ ] **Framework first:** Did I explain what the thing *is* before listing findings?
- [ ] **Signs explained:** Did I say what findings *represent*, not just what they look like?
- [ ] **Tradeoffs shown:** Did I demonstrate consequences, not just state them?
- [ ] **Concrete:** Did I use physical analogies and specific scenarios?
- [ ] **Technical terms second:** Did I build intuition before labeling?
- [ ] **Flag planted:** On opinion pieces, did I take a clear stance?
- [ ] **Operational honesty:** Did I describe how things actually work?
- [ ] **Actionable ending:** Does the reader know what to do?
- [ ] **200-word test:** Does the opening deliver value immediately?
- [ ] **No performed urgency:** Did I state importance plainly, without drama?
- [ ] **Human:** Does this sound like a person talking, not a textbook?

---

## Relationship to Design System

Writing style extends the design philosophy:

| Design Principle | Writing Application |
|------------------|---------------------|
| Tight, not cramped | Dense prose, no padding |
| Bespoke warmth | Confident but human voice |
| Signal colors are functional | Axiom labels signal meaning, used sparingly |
| Mobile-first density | Content delivers value on first scroll |

---

*Document created: December 2024*
*Last updated: January 2026*
*Based on Smart Brevity methodology (Axios) + original voice analysis*
