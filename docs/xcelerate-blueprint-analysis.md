# enterprise-xmc-starter — AI Readiness Analysis

> Prepared by: Mikul Gohil
> Date: 2026-03-10
> Purpose: Evaluate current AI tooling in an enterprise XM Cloud starter and demonstrate the value of @mikulgohil/ai-kit

---

## 1. Project Overview

**enterprise-xmc-starter** is an enterprise Sitecore XM Cloud starter template — a GitHub template repo used to bootstrap new client projects.

| Property | Value |
|----------|-------|
| Framework | Next.js 15.3.6 (App Router) |
| CMS | Sitecore XM Cloud (Content SDK 1.3.2) |
| Language | TypeScript 5.8.3, strict mode |
| Styling | Tailwind CSS 3.4.3 + TailwindVariants |
| Testing | Jest + React Testing Library + Storybook 8.4.7 |
| Package Manager | npm (headapps) + pnpm 9.11.0 (spa-starters) |
| Components | 68 Sitecore components |
| Tests | 119 passing |
| Team | ~5–7 active contributors |
| Monorepo | Yes (headapps/nextjs-starter + headapps/spa-starters) |

This is a **mature, well-maintained** codebase with strong engineering practices including pre-commit hooks (lint-staged + commitlint), comprehensive test coverage, Storybook documentation, and a 3,000+ line JSS-to-Content-SDK migration guide.

---

## 2. Current AI Setup — What They Have

### Cursor Rules (partial setup)

**File:** `.cursor/rules/xcelerator-rules.mdc` (73 lines)

They have a single Cursor rules file with:
- Role prompt ("You are a Senior Front-End Developer...")
- Component organization rules (where files go)
- Code implementation guidelines (Tailwind, accessibility, naming)
- Unit testing patterns (3-file structure, snapshot tests)
- References to tailwind.config.js and theme-config.ts

### Claude Code Settings (minimal)

**File:** `.claude/settings.local.json`

Read-only permissions only — restricted to `git log`, `git diff`, `gh pr view/list`, `gh repo view`. This means Claude Code is **intentionally locked down** to only read operations. No file creation, no editing, no running builds.

### What's Missing

| Feature | Status |
|---------|--------|
| CLAUDE.md | Does not exist |
| .cursorrules (root-level) | Does not exist |
| Slash commands (.claude/commands/) | Does not exist |
| Developer guides for AI usage | Does not exist |
| Claude Code file editing permissions | Intentionally disabled |
| Prompt templates or workflows | Does not exist |
| Shared coding standards in AI config | Only in Cursor rules, not Claude |
| Token-saving documentation | Does not exist |

---

## 3. Gap Analysis — What ai-kit Would Add

### Gap 1: No CLAUDE.md — Claude Code Has Zero Project Context

The `.claude/settings.local.json` allows read-only git commands, but there is **no CLAUDE.md** file. This means when any developer opens Claude Code in this project:

- Claude doesn't know this is a Sitecore XM Cloud project
- Claude doesn't know about the Content SDK (vs legacy JSS)
- Claude doesn't know about the 3-file Storybook pattern
- Claude doesn't know about TailwindVariants or Figma token integration
- Claude doesn't know about the SitecoreWrappers helper pattern
- Claude doesn't know which scripts to run

**With ai-kit:** A tailored CLAUDE.md would be generated with Next.js App Router rules, Sitecore XM Cloud field helper patterns, Tailwind CSS conventions, TypeScript strict mode guidelines, and all project scripts — automatically detected.

### Gap 2: Cursor Rules Are Good But Incomplete

The existing `.cursor/rules/xcelerator-rules.mdc` is solid — 73 lines of useful context. But it has gaps:

| What's Covered | What's Missing |
|----------------|----------------|
| Component organization | No npm scripts listed |
| Tailwind usage | No error handling patterns |
| Accessibility basics | No import order conventions |
| Testing patterns | No git commit conventions |
| Naming conventions | No security guidelines |
| | No Content SDK-specific patterns (only mentions "SitecoreJSS") |
| | No monorepo boundary rules |
| | No performance guidelines |

**Also notable:** The Cursor rules are set to `alwaysApply: false` — meaning they only activate when manually referenced. Developers who don't know about the rules file will get zero benefit.

**With ai-kit:** A comprehensive `.cursorrules` would be generated at the root level (always active) with all detected stack rules, team coding standards, and project scripts baked in.

### Gap 3: Claude Code Is Locked to Read-Only

The settings only allow `git log`, `git diff`, and `gh pr` commands. Claude Code cannot:
- Read or write files
- Run builds or tests
- Create components
- Fix bugs

This suggests the team either doesn't trust AI output or hasn't configured it for productive use. Either way, Claude Code is essentially **disabled as a development tool**.

**With ai-kit:** The generated CLAUDE.md with team coding standards, Sitecore field helper rules, and testing patterns would give the team confidence to enable file editing. The coding standards ensure AI output matches project conventions, reducing the trust gap.

### Gap 4: No Slash Commands — No Guided Workflows

There are no `.claude/commands/` files. Every developer has to write prompts from scratch every time. For a project with 68 components following a strict 3-file pattern (component + stories + mock-data + test), this is a huge productivity gap.

**With ai-kit:** 8 pre-built slash commands including:
- `/kit-prompt-help` — asks all the right questions so developers don't write vague prompts
- `/kit-new-component` — would ask about Sitecore fields, TailwindVariants, SitecoreWrappers, and generate all 3 files following the project's exact pattern
- `/kit-review` — deep code review checking for missing field helpers, accessibility gaps, TailwindVariant misuse
- `/kit-test` — generate Jest snapshot tests + functional tests with the project's mock-data pattern

### Gap 5: No Shared Standards in AI Config

The Cursor rules define some conventions, but they're project-specific and not synced with Claude Code. If a developer uses Claude Code instead of Cursor, they get zero guidance.

**With ai-kit:** team coding standards (naming, structure, imports, error handling, accessibility, git) are embedded in BOTH CLAUDE.md and .cursorrules. Same standards, every tool, every developer.

### Gap 6: No Documentation for AI Usage

There are no guides helping developers use AI effectively. No prompt playbooks, no token-saving tips, no "when to use AI" decision framework. Each developer figures it out (or doesn't) on their own.

**With ai-kit:** 4 guides shipped automatically:
- Getting started with AI in this project
- Prompt templates for common tasks
- When to use AI vs do it manually
- How to save tokens and money

---

## 4. Specific Value for This Project

### 4a. The 3-File Component Problem

Every new component in this project requires 3–4 files:

```
src/components/authorable/General/MyComponent.tsx        ← Component
src/stories/components/authorable/General/
  ├── MyComponent.stories.tsx                             ← Storybook
  ├── MyComponent.mock-data.ts                            ← Mock data
  └── MyComponent.test.tsx                                ← Tests
```

Each file has specific patterns:
- Component uses `ComponentProps`, SitecoreWrappers, TailwindVariants
- Stories use `Meta<typeof Component>`, `StoryObj`, specific argTypes
- Mock-data uses `flattenObj()` / `expandObj()` patterns
- Tests use `data-component` queries, snapshot tests, Jest mocks

**Without ai-kit:** Developer manually creates 4 files, copies patterns from existing component, adapts. ~30–45 minutes of boilerplate per component.

**With ai-kit + /kit-new-component:** The command asks 10 targeted questions (component name, Sitecore fields, TailwindVariants, responsive behavior, etc.) and generates all 4 files following the exact project pattern. ~5 minutes.

**For 68 components:** That's potentially 28–45 hours of boilerplate time that could be reduced to ~5.5 hours. For new projects bootstrapped from this template, the savings multiply.

### 4b. Content SDK Patterns Are Non-Obvious

This project recently migrated from JSS to Content SDK (3,000+ line migration guide). The new patterns are:

```typescript
// OLD (JSS) — developers might still write this
import { Text, RichText } from '@sitecore-jss/sitecore-jss-nextjs';

// NEW (Content SDK) — what they should write
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
```

Without CLAUDE.md, Claude Code will suggest the OLD JSS patterns because that's more common in its training data. With a CLAUDE.md that explicitly mentions Content SDK, the AI would use the correct imports.

### 4c. TailwindVariants Is Uncommon

TailwindVariants is not a mainstream library. Without explicit rules, AI tools default to plain Tailwind or even inline CSS. The Cursor rules mention it, but Claude Code has no guidance.

**With ai-kit:** The Tailwind fragment would include TailwindVariants usage patterns specific to this project.

---

## 5. Side-by-Side Comparison

| Capability | Current Setup | With @mikulgohil/ai-kit |
|------------|--------------|------------------------|
| **Claude Code context** | None (no CLAUDE.md) | Full project-aware CLAUDE.md |
| **Cursor context** | Partial (73 lines, not always-on) | Comprehensive .cursorrules (always active) |
| **Claude Code permissions** | Read-only git commands | Configurable with confidence (standards enforced) |
| **Slash commands** | None | 8 pre-built (/kit-prompt-help, /kit-review, /kit-new-component, etc.) |
| **Coding standards in AI** | Only in Cursor rules | Both CLAUDE.md and .cursorrules |
| **Developer onboarding for AI** | None | 4 guides (getting started, prompts, token tips) |
| **Component scaffolding** | Manual 4-file creation | /kit-new-component generates all files |
| **Code review** | Manual | /kit-review with checklist |
| **Test generation** | Manual (copy from existing) | /kit-test with project's Jest/Storybook patterns |
| **Prompt quality** | Depends on developer skill | /kit-prompt-help asks all questions dynamically |
| **Sitecore-specific rules** | Mentioned in Cursor rules | Full Content SDK patterns, field helpers, wrappers |
| **Cross-tool consistency** | Cursor only | Claude Code + Cursor, same standards |
| **Maintenance** | Manual rule updates | `ai-kit update` re-scans and regenerates |

---

## 6. Impact Projection

### For This Project (enterprise-xmc-starter)

- **68 existing components** — /kit-review and /kit-test commands can audit and improve coverage
- **New components** — from ~40 min/component to ~5 min with /kit-new-component
- **5–7 developers** — all get the same AI context and standards automatically
- **Content SDK migration patterns** — baked into CLAUDE.md so AI uses correct imports
- **Storybook 3-file pattern** — auto-generated instead of manually copied

### For All Projects Bootstrapped from This Template

Since enterprise-xmc-starter is a **GitHub template**, every new project created from it would inherit the ai-kit setup. This means:

- Every new client project starts with AI tooling on day one
- Every developer on every project follows the same team standards
- No per-project manual setup — it's already there

### For the organization (200 developers)

- Consistent AI output quality across all projects
- Lower token costs (developers prompted effectively, not trial-and-error)
- Faster onboarding (new developers have guides + /prompt-help from day one)
- Higher AI adoption (developers who gave up get a second chance with proper tooling)

---

## 7. Implementation Effort

| Step | Effort | Impact |
|------|--------|--------|
| Run `npx @mikulgohil/ai-kit init` | 30 seconds | CLAUDE.md + .cursorrules + commands + guides |
| Review and customize generated CLAUDE.md | 15 minutes | Add Content SDK specifics, TailwindVariants |
| Enable Claude Code file permissions | 5 minutes | Unlock full AI development capabilities |
| Commit to the template repo | 2 minutes | Every future project inherits the setup |
| **Total** | **~25 minutes** | **Permanent, cross-project impact** |

---

## 8. Recommendation

**enterprise-xmc-starter is the perfect candidate for ai-kit.** Here's why:

1. **It's a template repo** — adding ai-kit once means every new project gets it free
2. **Strong existing patterns** — the 3-file component structure, TailwindVariants, Content SDK patterns are exactly what AI needs to be told about
3. **Partial AI setup exists** — team already invested in Cursor rules, showing they value AI tooling but haven't completed the setup
4. **Claude Code is underutilized** — locked to read-only with no CLAUDE.md means the team is missing out on Claude Code's full capabilities
5. **High-boilerplate project** — 4 files per component is exactly where AI scaffolding saves the most time

The gap between their current setup and full AI productivity is significant, and ai-kit closes it in 25 minutes.
