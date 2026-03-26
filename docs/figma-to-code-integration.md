# Figma-to-Code Integration in @mikulgohil/ai-kit

> Date: 2026-03-10
> Purpose: How ai-kit should integrate with an enterprise Figma-to-code ecosystem to standardize the design-to-code workflow across development teams.

---

## 1. What Already Exists in the Ecosystem

You've already built a significant Figma-to-code ecosystem:

| Project | Type | Maturity | Purpose |
|---------|------|----------|---------|
| **Figma-code** | General toolkit (pnpm monorepo) | Production | Token extraction, component gen, Sitecore YML |
| **figma-code-cli** | Gated pipeline + dashboard (Turborepo) | Production (220+ tests) | 4-gate human review: spec → code → visual → sitecore |
| **ssd-figma-code** | Brand implementation | Reference | Pixel-perfect Next.js from Figma using Claude Code + Figma MCP |
| **figma-code-v2** | Next-gen toolkit | In development | Evolution of Figma-code |
| **ssd-figma-code-sitecore** | XM Cloud integration | Production | Full Sitecore Content SDK + Figma pipeline |

### The Problem

These tools exist, but:

1. **Most developers don't know about them** — there's no discoverability. A developer opening Claude Code or Cursor in a project has zero awareness that figma-code-cli exists or how to use it.

2. **No standardized Figma-to-code workflow in AI configs** — when a developer gets a Figma link and opens their AI tool, there are no rules telling the AI how to extract tokens, map to existing components, use Figma MCP, or verify visually.

3. **Each project reinvents the workflow** — ssd-figma-code has a detailed CLAUDE.md for Figma work, but those rules don't transfer to other projects. Every new project starts from zero.

4. **Developers prompt badly for Figma work** — they paste a Figma link and say "build this". The AI generates a component with hardcoded hex colors, wrong spacing, no design tokens, no existing component reuse, and no visual verification.

5. **No connection between ai-kit and figma-code-cli** — the pipeline tool and the AI config tool are separate worlds. They should reinforce each other.

---

## 2. What ai-kit Should Add

### 2a. New Template Fragment: `figma`

A new template fragment that gets included when the scanner detects Figma-related configuration in the project.

**Detection triggers:**
- Figma MCP config in `.claude/settings.json` or `.mcp.json`
- `figma-code-cli` or `@figma-code/*` packages in dependencies
- `tailwind.config` with design token patterns (custom theme tokens)
- Figma file references in project docs
- `tokens.json` or `tokens/` directory (Tokens Studio output)

**What the fragment teaches the AI:**

```
## Figma-to-Code Workflow

### Before Writing Any Code
1. Extract design context using Figma MCP (`get_design_context` with the node URL)
2. Get a screenshot for visual reference (`get_screenshot`)
3. Identify which existing project components can be reused
4. Map Figma colors/spacing/typography to project design tokens
5. Never hardcode hex colors or pixel values — always use token classes

### Design Token Rules
- Use project's Tailwind theme tokens, not arbitrary values
- Colors: use semantic tokens (bg-primary-500, text-neutral-800)
- Spacing: use scale tokens (p-4, gap-6, mt-12) not arbitrary (mt-[47px])
- Typography: use type scale tokens (text-h1, text-b1) not raw font-size
- Border radius: use named tokens (rounded-card, rounded-button)

### Component Mapping
- Before creating a new component, check if one already exists in src/components/
- Map Figma component variants to React props
- Match Figma layer names to semantic HTML elements
- Preserve Figma Auto Layout as flexbox/grid (don't use absolute positioning)

### Content Container Pattern
- Full-width background wrapper + constrained content inner div
- Max content width: match project's container (typically 1320px on 1440px viewport)
- Horizontal padding derived from: (viewport - container) / 2

### Visual Verification (Mandatory)
- After building, take a screenshot and compare against Figma
- Desktop (1440×900) and Mobile (375×812) must both be verified
- Target: layout/spacing 95%+, colors 98%+, typography 90%+

### Responsive Rules
- Never assume mobile is "desktop but smaller"
- Check every breakpoint in Figma separately
- Mobile may have completely different layout (stack vs row, hidden elements)
- Verify: desktop → tablet → mobile independently

### Common Mistakes to Avoid
- Don't hardcode colors (#3b82f6) — use design tokens (bg-primary-500)
- Don't use arbitrary Tailwind values (w-[347px]) — find nearest token
- Don't ignore Figma Auto Layout — it maps directly to flex/grid
- Don't skip visual verification — what looks right in code often isn't
- Don't create new components when existing ones can be reused
- Don't forget dark mode tokens if the design system supports themes
```

### 2b. New Slash Command: `/figma-to-code`

The most important addition. A guided workflow that takes a developer from Figma link to production code.

**The command should:**

1. Ask what they're building (new component, new page, update existing)
2. Ask for the Figma link or node URL
3. Ask which part of the design to implement (if it's a full page)
4. Check if Figma MCP is configured — if not, guide setup
5. Extract design context via MCP
6. Identify existing project components that can be reused
7. Map design tokens to project's Tailwind classes
8. Generate code using project patterns
9. Remind about visual verification

### 2c. New Slash Command: `/design-tokens`

A quick-reference command that reads the project's `tailwind.config` or `globals.css` and lists all available design tokens, so the AI (and developer) know what's available before writing code.

### 2d. New Guide: `figma-workflow.md`

A developer guide explaining:
- How to set up Figma MCP (2-minute setup)
- The correct workflow: extract → map → generate → verify
- How to use /figma-to-code command
- Common mistakes and how to avoid them
- When to use figma-code-cli pipeline vs direct AI generation
- How to prepare Figma files for better AI output

### 2e. Scanner Enhancement: Figma Detection

Add a new scanner detector (`src/scanner/figma.ts`) that checks for:

```typescript
interface FigmaDetection {
  hasFigmaMcp: boolean;           // MCP config found
  hasFigmaCodeCli: boolean;       // figma-code-cli in deps
  hasDesignTokens: boolean;       // tokens.json or @theme inline
  tokenFormat: 'tailwind-v3' | 'tailwind-v4' | 'css-variables' | 'none';
  hasVisualTests: boolean;        // Playwright for visual comparison
}
```

---

## 3. How It Connects to Existing Tools

### ai-kit + figma-code-cli

```
Developer gets Figma design
         │
         ├── Small task (1-2 components)?
         │   └── Use AI directly with /figma-to-code
         │       └── ai-kit's CLAUDE.md ensures correct tokens,
         │           patterns, and visual verification
         │
         └── Large task (full page/section)?
             └── Use figma-code-cli pipeline
                 └── 4-gate workflow: spec → code → visual → sitecore
                 └── ai-kit's standards still apply within each gate
```

**The key insight:** ai-kit and figma-code-cli serve different scales of work but should share the same coding standards and design token rules.

### ai-kit + Figma MCP

```
ai-kit init
  └── Detects Figma MCP config
  └── Adds figma fragment to CLAUDE.md
  └── Copies /figma-to-code command
  └── CLAUDE.md now includes:
      - Token mapping rules
      - Visual verification workflow
      - Component reuse patterns
      - Responsive check requirements
```

### ai-kit + ssd-figma-code patterns

The ssd-figma-code project has a battle-tested CLAUDE.md with Figma-specific rules. ai-kit should extract the proven patterns:

- Task checklist workflow (create checklist → approve → work → validate)
- Content container pattern (full-width bg + constrained content)
- Design token registration via `@theme inline`
- Mandatory desktop + mobile screenshot verification
- Mistake logging in `docs/mistakes/log.md`

---

## 4. Impact on Developer Workflow

### Today (Without ai-kit Figma Integration)

```
1. Developer gets Figma link
2. Opens Claude Code or Cursor
3. Types: "Build this component from Figma [link]"
4. AI has no context about design tokens, project patterns, or verification
5. Output has hardcoded colors, wrong spacing, no token usage
6. Developer manually fixes tokens, spacing, responsive behavior
7. No visual verification — ships and hopes for the best
8. QA catches pixel differences 2 days later
9. Developer spends another 2 hours fixing

Total: ~4 hours per component (including QA cycles)
```

### After (With ai-kit Figma Integration)

```
1. Developer gets Figma link
2. Opens Claude Code
3. Types: /figma-to-code
4. Command asks: What are you building? Figma link? Which section?
5. AI extracts design context via Figma MCP
6. AI maps to project's existing tokens and components
7. AI generates code using correct patterns (from CLAUDE.md)
8. AI takes screenshot and compares to Figma
9. Developer reviews one clean output
10. Ships with confidence

Total: ~45 minutes per component (including verification)
```

### Savings at Scale

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time per component | ~4 hours | ~45 min | 5x faster |
| QA rejection rate | High (pixel diffs) | Low (pre-verified) | Fewer cycles |
| Token usage per component | Wrong → fix → redo | Right first time | 3x fewer tokens |
| Design token compliance | Manual enforcement | Automatic via CLAUDE.md | 100% consistent |
| Developer frustration | "AI can't do Figma work" | "AI handles 80% of it" | Higher adoption |

---

## 5. Implementation Plan

### What to Add to ai-kit

| Item | Type | Priority | Effort |
|------|------|----------|--------|
| `src/scanner/figma.ts` | Scanner detector | High | 1 hour |
| `templates/claude-md/figma.md` | Template fragment | High | 2 hours |
| `templates/cursorrules/figma.md` | Cursor fragment | High | 1 hour |
| `commands/figma-to-code.md` | Slash command | High | 2 hours |
| `commands/design-tokens.md` | Slash command | Medium | 1 hour |
| `guides/figma-workflow.md` | Developer guide | High | 1.5 hours |
| Update `selectFragments()` | Generator logic | High | 30 min |
| Update `AVAILABLE_COMMANDS` | Copier list | High | 5 min |
| Update `AVAILABLE_GUIDES` | Copier list | Medium | 5 min |

**Total estimated effort: ~9 hours**

### Detection Logic for Scanner

```
Has Figma MCP in settings?     → hasFigmaMcp = true
Has @figma-code/* in deps?     → hasFigmaCodeCli = true
Has tokens.json / @theme?      → hasDesignTokens = true
Has Playwright for visuals?    → hasVisualTests = true
```

If ANY of these are true → include `figma` fragment in generated configs.

### Fragment Selection Update

```typescript
// In selectFragments():
if (scan.figma?.hasFigmaMcp || scan.figma?.hasDesignTokens) {
  fragments.push('figma');
}
```

---

## 6. What This Means for the Presentation

### New Slide: "Figma-to-Code — The Biggest Gap"

```
Every developer converts Figma designs to code daily.
Without AI context, this is what happens:

  Developer:  "Build this from Figma [link]"
  AI output:  Hardcoded colors, wrong spacing, no design tokens,
              doesn't reuse existing components, breaks on mobile

With ai-kit's Figma integration:

  Developer:  /figma-to-code
  AI:         Extracts design context via Figma MCP
              Maps to project's Tailwind tokens
              Reuses existing components
              Generates code following project patterns
              Verifies visually against Figma

Same developer. Same AI tool. Different output.
The difference is the setup.
```

### New Slide: "Connects Your Existing Figma Pipeline"

```
ai-kit doesn't replace your Figma-to-code tools — it connects them.

  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Figma MCP  │     │  ai-kit      │     │ figma-code-  │
  │  (extract)  │ ──→ │  (standards) │ ──→ │ cli (pipeline│
  └─────────────┘     └──────────────┘     └──────────────┘

Small tasks: /figma-to-code → AI generates directly
Large tasks: figma-code-cli → 4-gate pipeline with human review
Both follow: Same design token rules, same coding standards
```

---

## 7. Summary

ai-kit's Figma integration is not about building another Figma-to-code tool — teams already have those. It's about:

1. **Making the tools discoverable** — developers learn about /figma-to-code on day one
2. **Embedding the rules** — design token mapping, visual verification, component reuse are baked into every AI config
3. **Standardizing the workflow** — every developer follows the same extract → map → generate → verify flow
4. **Connecting the ecosystem** — ai-kit for quick tasks, figma-code-cli for complex pipelines, same standards everywhere
5. **Preventing the common mistakes** — hardcoded colors, missing tokens, no responsive checks, no verification

The Figma-to-code workflow is where developers spend the most time and waste the most tokens. Fixing this in ai-kit has the highest ROI of any feature.
