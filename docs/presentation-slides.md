# @horizontal/ai-kit — Presentation Slides

**Total slides: 22** | Estimated time: 18–22 minutes

---

## Theme & Design System (STRICT — follow exactly)

### Colors
- **Background**: `#FFFFFF` (pure white) — every slide
- **Primary text**: `#111111` (near-black) — headings, body
- **Secondary text**: `#666666` — speaker labels, subtle descriptions, "before" column
- **Accent blocks**: `#F5F5F5` (very light gray) — scenario cards, code blocks, table alternate rows
- **Accent border**: `#E0E0E0` — divider lines, card borders
- **Highlight**: `#000000` (pure black) — command text (`npx @horizontal/ai-kit init`), emphasis keywords
- **Do NOT use**: any brand colors, blues, gradients, shadows, or colored backgrounds

### Typography
- **Font family**: `Inter` (Google Fonts) — use for ALL text, no exceptions
- **Slide title**: `Inter Bold`, 40–48px, `#111111`, left-aligned (unless noted as centered)
- **Subtitle / tagline**: `Inter Regular`, 20–24px, `#666666`
- **Body text**: `Inter Regular`, 18–20px, `#111111`, line-height 1.6
- **Labels / captions**: `Inter Medium`, 14–16px, `#666666`
- **Code / commands**: `Inter` or `JetBrains Mono` (monospace fallback), 18–20px, `#111111`
- **Do NOT use**: font sizes below 14px on any slide

### Layout Rules
- **Slide dimensions**: 16:9 aspect ratio (1920×1080 or equivalent)
- **Margins**: 80px on all sides minimum — never let text touch the edges
- **Content max-width**: 1600px centered (leave breathing room on sides)
- **Vertical spacing**: 32px minimum between content blocks, 48px between sections
- **Alignment**: Left-aligned by default. Center only when explicitly noted (Slide 1, 5, 19)
- **Cards / blocks**: Use `#F5F5F5` background, 16px padding, 8px border-radius, no shadow
- **Dividers**: 1px `#E0E0E0` horizontal lines — use sparingly
- **Max content per slide**: If a slide has more than ~8 visual items (rows, cards, bullets), split it

### Visual Rules
- **No icons, illustrations, or images** unless explicitly noted
- **No decorative elements** — no dots, circles, patterns, watermarks
- **No shadows, no gradients, no rounded corners > 8px**
- **Whitespace is the design** — when in doubt, add more space, not more content
- **Hierarchy**: Title → one supporting line → content. Never stack two headlines.
- **Arrows/flow**: Use simple `→` text arrows or thin 1px lines. No fancy arrow graphics.

---

## Slide 1 — Title

**Layout:** Center everything vertically and horizontally. Generous whitespace above and below.

```
@horizontal/ai-kit

AI-Powered Developer Setup for Horizontal Digital

─────

One command. Tailored AI config. Every project.
```

- Title: `Inter Bold`, 56px, `#111111`
- Subtitle: `Inter Regular`, 24px, `#666666`
- Divider: thin line, 80px wide, centered, `#E0E0E0`
- Tagline: `Inter Regular`, 20px, `#666666`

**Speaker notes:** Quick intro — this is a CLI tool that solves how our 200 developers use AI coding tools.

---

## Slide 2 — The Problem

**Layout:** Left-aligned. Title at top, one intro line, then 5 rows below with consistent spacing.

```
The Problem

Most developers at Horizontal struggle with AI tools.
Not because the tools are bad — because the setup is missing.


→  No project context         AI doesn't know your stack or conventions
→  Vague prompts              "Fix this" → garbage output → wasted tokens
→  No guardrails              AI writes code that doesn't match standards
→  Inconsistent setups        Every developer configures differently
→  Token waste                Repeated context, long conversations
```

- Title: `Inter Bold`, 44px
- Intro: `Inter Regular`, 20px, `#666666`
- Each row: `→` in `#111111`, label in `Inter Medium` 18px, description in `Inter Regular` 18px `#666666`
- Row spacing: 28px between rows

**Speaker notes:** These are real issues we see. Developers either don't use AI or use it badly.

---

## Slide 3 — What Happens Today (1 of 2)

**Layout:** Title at top. Two scenario cards stacked vertically, each on a `#F5F5F5` block with 24px padding and 8px border-radius. 32px gap between cards.

```
What Actually Happens Today


┌─────────────────────────────────────────────────────────────────┐
│  Scenario 1 — The Vague Prompt                                  │
│                                                                 │
│  Developer types:    "Create a login page"                      │
│  AI generates:       Generic page, inline styles, no TypeScript │
│  Developer reacts:   "This is useless" → deletes → does manually│
│  Time wasted:        25 minutes + tokens burned                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Scenario 2 — The Copy-Paste Loop                               │
│                                                                 │
│  Developer types:    Pastes 400 lines + "fix the bug"           │
│  AI generates:       Refactors half the file, breaks two things │
│  Developer reacts:   Spends 40 min reverting + finding new bugs │
│  Time wasted:        1 hour + lost trust in the tool            │
└─────────────────────────────────────────────────────────────────┘
```

- Card title: `Inter Bold`, 20px
- Labels ("Developer types:"): `Inter Medium`, 16px, `#666666`
- Values: `Inter Regular`, 16px, `#111111`

**Speaker notes:** These aren't hypothetical. This is what happens daily when developers prompt without context.

---

## Slide 4 — What Happens Today (2 of 2)

**Layout:** Same card style as Slide 3. One card at top, then a takeaway line below with extra spacing.

```
What Actually Happens Today


┌─────────────────────────────────────────────────────────────────┐
│  Scenario 3 — The Dropout                                       │
│                                                                 │
│  Developer types:    "Add a Sitecore component for hero banner" │
│  AI generates:       Plain React component — no field helpers,  │
│                      no ComponentRendering types, no Experience  │
│                      Editor support                             │
│  Developer reacts:   "AI doesn't understand our stack"          │
│  Result:             Stops using AI entirely                    │
└─────────────────────────────────────────────────────────────────┘


The AI isn't bad — it just doesn't know what project it's working on.
```

- Takeaway line: `Inter Medium`, 22px, `#111111`, center-aligned, 64px below the card

**Speaker notes:** This is the worst outcome — losing developers completely because of one bad experience.

---

## Slide 5 — Why This Happens

**Layout:** Title at top. Three blocks stacked vertically with downward arrows between them. Each block on `#F5F5F5` background, 20px padding, 8px border-radius. Arrows are simple `↓` text, centered, 24px, `#666666`.

```
Why This Happens


  ┌──────────────────────────────────────────────────────┐
  │  Developer writes an incomplete prompt               │
  │  "make a component" / "fix this" / "add a page"     │
  └──────────────────────────────────────────────────────┘
                           ↓
  ┌──────────────────────────────────────────────────────┐
  │  AI has zero context about the project               │
  │  No idea about framework, router, CMS, or tokens    │
  └──────────────────────────────────────────────────────┘
                           ↓
  ┌──────────────────────────────────────────────────────┐
  │  Output doesn't match project standards              │
  │  Developer expects 100% from a one-line prompt       │
  └──────────────────────────────────────────────────────┘


The gap isn't the AI. It's the missing setup.
```

- Block text: `Inter Regular`, 18px
- Takeaway: `Inter Medium`, 22px, center-aligned

**Speaker notes:** Developers assume AI should just "know" their project. It can't — unless we tell it.

---

## Slide 6 — The Solution

**Layout:** Center everything vertically. Command in large monospace. Minimal content.

```
The Solution


npx @horizontal/ai-kit init


One command scans your project, detects your tech stack,
and generates tailored AI configuration — automatically.
```

- Title: `Inter Bold`, 44px, centered
- Command: `JetBrains Mono` or `Inter`, 36px, `#000000`, centered
- Description: `Inter Regular`, 22px, `#666666`, centered, max-width 700px

**Speaker notes:** No manual setup. No copy-pasting configs. Run the command and everything is ready.

---

## Slide 7 — What It Does

**Layout:** Title at top. Five rows below, each with a bold label and a description. 28px spacing between rows. Thin 1px `#E0E0E0` divider between each row.

```
What It Does

Scans           Reads package.json, file structure, and configs to
                detect framework, CMS, styling, TypeScript, monorepo

Generates       Creates CLAUDE.md and .cursorrules tailored to your
                exact stack — not generic templates

Standards       Embeds Horizontal coding standards so all AI output
                follows the same conventions across every project

Commands        10 pre-built slash commands including an interactive
                prompt builder that asks the right questions

Guides          Developer guides + doc scaffolds for tracking
                decisions and mistakes
```

- Labels: `Inter Bold`, 18px, `#111111`
- Descriptions: `Inter Regular`, 18px, `#666666`

---

## Slide 8 — How It Works

**Layout:** Horizontal flow, 5 boxes connected by `→` arrows. Boxes on `#F5F5F5`, centered vertically. Below the flow, three output labels pointing up to the "Generate" box.

```
How It Works

 ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
 │  Scan   │ ──→ │ Detect  │ ──→ │   Ask    │ ──→ │ Generate │ ──→ │  Done    │
 │ Project │     │  Stack  │     │Questions │     │  Files   │     │          │
 └─────────┘     └─────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                              ┌──────────────────────────┤
                              ↓              ↓           ↓
                         CLAUDE.md    .cursorrules    /commands
```

- Boxes: `#F5F5F5` fill, 1px `#E0E0E0` border, 8px radius
- Box text: `Inter Medium`, 16px
- Arrow: `#666666`, 1px line
- Output labels: `Inter Medium`, 16px, `#111111`

**Speaker notes:** The tool runs 6 detectors in parallel, asks clarifying questions only when needed, generates everything in one pass.

---

## Slide 9 — Auto-Detection (1 of 2)

**Layout:** Title at top. Three detection rows, each with bold label and description. 32px between rows.

```
Auto-Detection — What We Scan


Framework       Next.js version, App Router vs Pages Router vs Hybrid
                Detected from dependencies + directory structure

CMS             Sitecore XM Cloud or Sitecore JSS
                Detected from @sitecore-jss/* or @sitecore-content-sdk/*

Styling         Tailwind CSS, SCSS, styled-components, CSS Modules
                Detected from dependencies + config files
```

- Labels: `Inter Bold`, 20px, `#111111`
- Line 1 (what): `Inter Regular`, 18px, `#111111`
- Line 2 (how): `Inter Regular`, 16px, `#666666`

---

## Slide 10 — Auto-Detection (2 of 2)

**Layout:** Same style as Slide 9. Three more detection rows.

```
Auto-Detection — What We Scan (continued)


TypeScript      Presence + strict mode
                Detected from tsconfig.json

Monorepo        Turborepo, Nx, Lerna, pnpm workspaces
                Detected from turbo.json, nx.json, workspace configs

Package Mgr     npm, pnpm, yarn, bun
                Detected from lock files + packageManager field
```

---

## Slide 11 — Shared Coding Standards (1 of 3)

**Layout:** Title and subtitle at top. Three standard categories below, each with a thin 2px black left border accent and 16px left padding.

```
One Standard. Every Project. Every Developer.

AI Kit embeds Horizontal's coding standards into every generated config.


│  Naming         Components: PascalCase · Hooks: camelCase
│                 Constants: UPPER_SNAKE_CASE · One component per file

│  Structure      Components under 200 lines — split if larger
│                 Colocate: component + types + tests + styles + docs
│                 Separate business logic from UI with custom hooks

│  Import Order   External packages → Internal shared →
│                 Local relative → Types
```

- Category label: `Inter Bold`, 18px
- Details: `Inter Regular`, 16px, `#666666`
- Left border: 2px solid `#111111`
- Spacing: 36px between categories

---

## Slide 12 — Shared Coding Standards (2 of 3)

**Layout:** Same left-border accent style. Three categories focused on documentation and code quality.

```
One Standard. Every Project. Every Developer.


│  Documentation     Every component has a colocated doc file
│                    Doc reference comment at top of every component
│                    Change log in doc file — every update is tracked

│  Code Comments     JSDoc on every exported function/component
│                    Comment the why, not the what
│                    @example in utility functions

│  Testing           Colocated test file for every component
│                    Happy path + error states + edge cases
│                    Test behavior, not implementation
```

- Category label: `Inter Bold`, 18px
- Details: `Inter Regular`, 16px, `#666666`
- Left border: 2px solid `#111111`
- Spacing: 36px between categories

**Speaker notes:** This is the traceability layer. Every component is documented, every change is logged, every function is commented. When a new developer joins, they can understand any component in minutes.

---

## Slide 13 — Shared Coding Standards (3 of 3)

**Layout:** Same left-border accent style. Three more categories, plus a takeaway line.

```
One Standard. Every Project. Every Developer.


│  Error Handling    Always handle error states — never blank screens
│                    User-friendly messages, not raw error strings

│  Accessibility     Semantic HTML, alt text, keyboard navigation
│                    ARIA labels, 4.5:1 color contrast ratio

│  Performance       Memoize expensive computations, lazy load heavy
│                    components, use next/image, avoid N+1 fetching


These standards are baked into every CLAUDE.md and .cursorrules file.
AI follows these rules automatically — no developer action needed.
```

- Takeaway: `Inter Medium`, 18px, `#111111`, 48px top margin

**Speaker notes:** This is the consistency layer. Right now every developer's AI writes different-quality code. With ai-kit, same naming, same structure, same quality across all projects.

---

## Slide 14 — Template Assembly

**Layout:** Title and one intro line. Then a list of fragments with checkmarks/question marks. Below that, two example lines.

```
Smart Template Assembly

Generated configs are assembled from modular fragments based on YOUR project.


  ✓  base                  Always included — standards, workflow, safety
  ?  nextjs-app-router     If App Router detected
  ?  nextjs-pages-router   If Pages Router detected
  ?  sitecore-xmc          If Sitecore XM Cloud detected
  ?  tailwind              If Tailwind CSS detected
  ?  typescript            If TypeScript detected
  ?  monorepo              If monorepo tooling detected
  ?  figma                 If Figma workflow detected


Example output for Next.js 14 + Tailwind + TypeScript:
base + nextjs-app-router + tailwind + typescript
```

- `✓` and `?`: `Inter Bold`, 18px
- Fragment name: `Inter Medium`, 18px, `#111111`
- Description: `Inter Regular`, 16px, `#666666`
- Example: `Inter Regular`, 16px, `#666666`, on `#F5F5F5` background block

---

## Slide 15 — Generated CLAUDE.md Sample

**Layout:** Single code-block card, `#F5F5F5` background, 24px padding, 8px radius. Monospace text inside.

```
What Gets Generated — CLAUDE.md (sample)

┌──────────────────────────────────────────────────────────┐
│                                                          │
│  # my-project — AI Assistant Rules                       │
│                                                          │
│  > Auto-generated by @horizontal/ai-kit                  │
│  > Tech Stack: Next.js 14 · Sitecore XM Cloud ·         │
│  > TypeScript · Tailwind CSS                             │
│                                                          │
│  ## Horizontal Coding Standards                          │
│  - PascalCase components, under 200 lines                │
│  - Separate logic from UI with custom hooks              │
│  - Always handle error states, semantic HTML             │
│                                                          │
│  ## Next.js App Router                                   │
│  - Server Components by default                          │
│  - Use generateMetadata for SEO                          │
│                                                          │
│  ## Sitecore XM Cloud                                    │
│  - Use <Text>, <RichText>, <Image> field helpers         │
│                                                          │
│  ## Tailwind CSS                                         │
│  - Mobile-first, use design tokens                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- All code text: monospace, 16px
- Card border: 1px `#E0E0E0`

**Speaker notes:** This is loaded automatically by Claude Code — free context. Every prompt gets project knowledge without the developer typing anything.

---

## Slide 16 — The Key Innovation

**Layout:** Centered. Large command. One supporting line. Minimal.

```
The Key Innovation


/prompt-help


An interactive prompt builder that asks ALL the right questions
so the developer never writes a vague prompt again.

Think of the developer as an intern — the tool extracts every detail.
```

- Title: `Inter Bold`, 44px, centered
- `/prompt-help`: `JetBrains Mono` or `Inter`, 48px, `#000000`, centered
- Description: `Inter Regular`, 22px, `#666666`, centered, max-width 650px
- Last line: `Inter Medium`, 18px, `#111111`, centered

**Speaker notes:** This is the single most important feature. Instead of expecting developers to know how to prompt, we ask them.

---

## Slide 17 — /prompt-help in Action

**Layout:** Simulated conversation. Left labels ("AI" / "Dev") in `#666666`, content in `#111111`. Each exchange separated by 20px. Whole conversation inside a `#F5F5F5` card, 24px padding.

```
/prompt-help in Action

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  AI    What do you need help with?                           │
│        1. New Component  2. New Page  3. Fix a Bug  ...      │
│                                                              │
│  Dev   1. New Component                                      │
│                                                              │
│  AI    Component name?                    Dev   ProductCard   │
│  AI    What does it do?                   Dev   Shows product │
│  AI    Server or Client Component?        Dev   Client        │
│  AI    Responsive behavior?               Dev   Stack mobile  │
│  AI    Similar component to reference?    Dev   UserCard.tsx  │
│                                                              │
│  → Generates a complete, structured prompt with all context  │
│  → Developer says "execute" — perfect output first try       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- "AI" label: `Inter Bold`, 16px, `#666666`
- "Dev" label: `Inter Bold`, 16px, `#111111`
- Content: `Inter Regular`, 16px
- Arrow lines: `Inter Medium`, 16px, `#111111`

---

## Slide 18 — Different Questions per Task

**Layout:** Three columns, equal width. Each column has a bold header and a list below. Thin 1px `#E0E0E0` vertical dividers between columns.

```
Every Task Gets Different Questions

  New Component            Fix a Bug                Write Tests

  Component name?          Which files?             Which files to test?
  What does it do?         Expected behavior?       Unit or E2E?
  Where does it go?        Actual behavior?         Testing framework?
  What props?              Steps to reproduce?      Key scenarios?
  Server or Client?        Error messages?          Edge cases?
  Data fetching?           When did it start?       What to mock?
  Responsive needs?        What have you tried?     Coverage target?
  Similar component?


  10 task types × 6–12 questions each
```

- Column headers: `Inter Bold`, 20px, `#111111`
- Questions: `Inter Regular`, 16px, `#666666`
- Bottom line: `Inter Medium`, 18px, `#111111`, centered, 40px top margin

---

## Slide 19 — All Slash Commands

**Layout:** Title at top. Table with alternating row backgrounds (white / `#F9F9F9`). Two columns: command and description. 24px row height.

```
Pre-Built Slash Commands

  /prompt-help       Interactive prompt builder — start here
  /review            Deep code review as a Senior Engineer
  /fix-bug           Guided bug fix with root cause analysis
  /new-component     Scaffold a component matching project patterns
  /new-page          Create a page/route with data fetching + SEO
  /understand        Explain code for learning
  /test              Generate tests with edge case coverage
  /optimize          Performance audit with impact ranking
  /figma-to-code     Guided Figma design to code workflow
  /design-tokens     Read and display project design tokens

Copied to .claude/commands/ — available instantly in Claude Code
```

- Command: `JetBrains Mono` or `Inter`, 16px, `#111111`
- Description: `Inter Regular`, 16px, `#666666`
- Footer note: `Inter Regular`, 14px, `#666666`, 32px top margin

---

## Slide 20 — Three Commands

**Layout:** Three horizontal blocks stacked vertically. Each has a command on `#F5F5F5` background (monospace, 20px) and one description line below (16px, `#666666`). 32px gap between blocks.

```
Simple CLI — Three Commands


  $ npx @horizontal/ai-kit init

  First-time setup. Scans, asks questions, generates everything.


  $ npx @horizontal/ai-kit update

  Re-scans and refreshes configs after project changes.


  $ npx @horizontal/ai-kit reset

  Removes all generated files. Clean slate.


No config files to write. No docs to read. Just run it.
```

- Commands: monospace, 20px, `#000000`, inside `#F5F5F5` block, 16px padding
- Descriptions: `Inter Regular`, 16px, `#666666`
- Bottom line: `Inter Medium`, 18px, `#111111`, centered

---

## Slide 21 — Before vs After

**Layout:** Two columns with a thin 1px `#E0E0E0` vertical center divider. Left column header "Before AI Kit" in `#666666`, right column header "After AI Kit" in `#111111`. Three comparison rows separated by horizontal dividers. Keep each row to 2–3 short lines max.

```
Before AI Kit                          After AI Kit


"Create a hero component"              /prompt-help → answers 10 questions
Expects 100% from one line             → structured prompt → correct output


AI has no context about the project    CLAUDE.md loaded automatically
Guesses framework, CMS, patterns       Knows stack, router, tokens, scripts


Output breaks project standards        Follows Horizontal standards
Different code style per developer     Same conventions, every project
```

- Left text: `Inter Regular`, 18px, `#666666`
- Right text: `Inter Regular`, 18px, `#111111`
- Column headers: `Inter Bold`, 24px
- Row divider: 1px `#E0E0E0`, 32px vertical padding between rows

---

## Slide 22 — Get Started

**Layout:** Center everything vertically. Large command. Minimal.

```
Get Started Today


npx @horizontal/ai-kit init


Works with any Horizontal project.
Next.js · Sitecore XM Cloud · Tailwind · TypeScript · Monorepos

Same coding standards. Every project. Every developer.
```

- Title: `Inter Bold`, 44px, centered
- Command: `JetBrains Mono` or `Inter`, 36px, `#000000`, centered
- Description: `Inter Regular`, 20px, `#666666`, centered
- Last line: `Inter Medium`, 22px, `#111111`, centered

**Speaker notes:** Available now. Takes 30 seconds. Works with Claude Code and Cursor. Any questions?
