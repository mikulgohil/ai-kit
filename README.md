# AI Kit

**Make AI coding assistants actually useful.**
One command. Project-aware AI from the first conversation.

[![npm version](https://img.shields.io/npm/v/@mikulgohil/ai-kit.svg)](https://www.npmjs.com/package/@mikulgohil/ai-kit)
[![npm downloads](https://img.shields.io/npm/dm/@mikulgohil/ai-kit.svg)](https://www.npmjs.com/package/@mikulgohil/ai-kit)
[![license](https://img.shields.io/npm/l/@mikulgohil/ai-kit.svg)](https://github.com/mikulgohil/ai-kit/blob/main/LICENSE)

> **[Read the full documentation](https://ai-kit-docs-beta.vercel.app/docs)** | [Getting Started](https://ai-kit-docs-beta.vercel.app/docs/getting-started) | [CLI Reference](https://ai-kit-docs-beta.vercel.app/docs/cli-reference) | [Skills & Commands](https://ai-kit-docs-beta.vercel.app/docs/slash-commands) | [Hooks](https://ai-kit-docs-beta.vercel.app/docs/hooks) | [Agents](https://ai-kit-docs-beta.vercel.app/docs/agents) | [Changelog](https://ai-kit-docs-beta.vercel.app/docs/changelog)

```bash
npx @mikulgohil/ai-kit init
```

---

## Problems AI Kit Solves

Every team using AI coding assistants hits these problems. AI Kit solves each one.

| # | Problem | How AI Kit Solves It |
|---|---------|---------------------|
| 1 | **AI forgets everything each session** — Every new chat starts from zero. No memory of project rules, patterns, or past decisions. | Generates a persistent `CLAUDE.md` with project rules, conventions, and stack details. The AI knows your project from the first prompt, every time. |
| 2 | **AI generates wrong framework patterns** — Writes Pages Router code when you use App Router. Uses CSS when you use Tailwind. Creates default exports when your project uses named exports. | Auto-detects your exact stack (framework, router, CMS, styling, TypeScript config) and generates rules specific to your setup. The AI can't use the wrong patterns. |
| 3 | **Developers write bad prompts** — Vague or incorrect prompts lead to wrong code, wasted time, and rework. Junior developers waste the most time. | Ships **46 pre-built skills** so developers don't write prompts from scratch — just run `/review`, `/security-check`, `/new-component`, `/refactor`, etc. |
| 4 | **Same mistakes happen repeatedly** — No system to track what went wrong, so the team keeps hitting the same build failures and lint errors. | Generates a **mistakes log** (`docs/mistakes-log.md`) with **auto-capture hook** that logs every build/lint failure automatically. The AI references it to avoid repeating them. |
| 5 | **Every developer gets different AI behavior** — No consistency in how the team uses AI tools, leading to inconsistent code quality and style. | One `ai-kit init` command generates the same rules for the entire team — everyone's AI follows identical project standards. Commit the generated files to the repo. |
| 6 | **No quality checks on AI-generated code** — AI output goes straight to PR without type checking, linting, or security review. | Automated **hooks** run formatting, type-checking, linting, and git safety checks in real-time as the AI writes code. **Quality gate** runs everything before merge. |
| 7 | **AI generates insecure code** — No guardrails for secrets exposure, XSS, SQL injection, or other vulnerabilities. AI doesn't scan its own output. | Built-in **security audit** scans for exposed secrets, OWASP risks, and misconfigurations. **Security review agent** catches issues at development time, not production. |
| 8 | **AI can't handle multi-file reasoning** — Changes to one component break related files. AI loses context across linked models and shared types. | **10 specialized agents** with focused expertise — planner, code-reviewer, build-resolver, doc-updater, refactor-cleaner — each maintains context for their domain. |
| 9 | **No decision trail** — Nobody remembers why a technical decision was made 3 months ago. Knowledge walks out the door when developers leave. | Auto-scaffolds a **decisions log** (`docs/decisions-log.md`) to capture what was decided, why, and by whom — fully searchable and traceable. |
| 10 | **Onboarding takes too long** — New developers spend days understanding the project and its AI setup before they can contribute. | AI Kit generates developer guides and project-aware configurations — new team members get productive AI assistance from day one with zero manual setup. |
| 11 | **Context gets repeated every conversation** — You explain the same conventions in every session: import order, naming, component structure, testing patterns. | All conventions are encoded in the generated rules file. The AI reads them automatically at session start. You explain once, it remembers forever. |
| 12 | **AI doesn't improve over time** — The AI makes the same wrong suggestions regardless of past feedback, team patterns, or previous failures. | The system **learns as you use it** — mistakes log, decisions log, and updated rules mean the AI gets smarter with every session. Mistakes auto-capture builds the log organically. |
| 13 | **Complex tasks need multiple manual AI passes** — Developers manually coordinate review + test + docs updates across separate conversations. | **Multi-agent orchestration** runs multiple specialized agents in parallel — review, test, document, and refactor in one command with `/orchestrate`. |
| 14 | **Switching AI tools means starting over** — Moving from Cursor to Claude Code (or vice versa) loses all configuration and project context. | Generates configs for **5+ AI tools** (Claude Code, Cursor, Windsurf, Aider, Cline) from a single source — switch tools without losing project knowledge. |
| 15 | **AI creates components without tests, docs, or types** — Every AI-generated file needs manual follow-up to add what was missed. | Skills like `/new-component` enforce a structured workflow: asks 10 questions, reads existing patterns, generates component + types + tests + docs together. |
| 16 | **No visibility into AI usage costs** — Management has no idea how many tokens the team is consuming or which projects cost the most. | Built-in **token tracking** provides daily/weekly/monthly usage summaries, per-project cost breakdown, budget alerts, and ROI estimates. |
| 17 | **Cursor copies entire modules instead of targeted edits** — AI bloats the repo with unnecessary file duplication, especially in CMS and monorepo setups. | Generated rules include explicit instructions for editing patterns — update in place, respect package boundaries, follow existing structure. Rules prevent over-generation. |
| 18 | **No component-level AI awareness** — AI doesn't know which components have tests, stories, Sitecore integration, or documentation gaps. | **Component scanner** discovers all React components and generates `.ai.md` docs with health scores, props tables, Sitecore field mappings, and dependency trees. |
| 19 | **Setup is manual and error-prone** — Configuring AI assistants requires deep knowledge of each tool's config format. Most teams skip it entirely. | **Zero manual configuration** — one command auto-detects your stack and generates everything. Update with one command when the project evolves. |
| 20 | **AI hallucinates framework-specific APIs** — Generates incorrect hook usage, wrong data fetching patterns, or non-existent component APIs for your framework version. | Stack-specific template fragments include exact API patterns for your detected framework version (e.g., Next.js 15 App Router patterns, Sitecore Content SDK v2 patterns). |

---

## Quick Start

```bash
# Install and configure in any project (30 seconds)
npx @mikulgohil/ai-kit init

# Check your project health
npx @mikulgohil/ai-kit health

# Open in Claude Code or Cursor — AI now knows your project
```

---

## What You Get

| Generated | What It Does |
|---|---|
| `CLAUDE.md` | Project-aware rules for Claude Code — your stack, conventions, and patterns |
| `.cursorrules` + `.cursor/rules/*.mdc` | Same rules formatted for Cursor AI with scoped file matching |
| 46 Skills | Auto-discovered workflows — `/review`, `/new-component`, `/security-check`, `/pre-pr`, and 42 more |
| 10 Agents | Specialized AI assistants — planner, reviewer, security, E2E, build-resolver, ci-debugger, and more |
| 3 Context Modes | Switch between dev (build fast), review (check quality), and research (understand code) |
| Automated Hooks | Auto-format, TypeScript checks, console.log warnings, mistakes auto-capture, git safety |
| 6 Guides | Developer playbooks for prompts, tokens, hooks, agents, Figma workflow |
| Doc Scaffolds | Mistakes log, decisions log, time log — structured knowledge tracking |
| Component Docs | Auto-generated `.ai.md` per component with health scores and Sitecore integration |

---

## Key Features

### Auto Stack Detection

Scans your `package.json`, config files, and directory structure to detect your exact stack:

| What It Detects | What the AI Learns |
|---|---|
| Next.js 15 with App Router | Server Components, Server Actions, `app/` routing patterns |
| Sitecore XM Cloud | `<Text>`, `<RichText>`, `<Image>` field helpers, placeholder patterns |
| Tailwind CSS v4 | `@theme` tokens, utility class patterns, responsive prefixes |
| TypeScript strict mode | No `any`, proper null checks, discriminated unions |
| Turborepo monorepo | Workspace conventions, cross-package imports |
| Figma + design tokens | Token mapping, design-to-code workflow |

### 46 Pre-Built Skills

Structured AI workflows applied automatically — the AI recognizes what you're doing and loads the right skill:

| Category | Skills |
|---|---|
| Getting Started | `prompt-help`, `understand` |
| Building | `new-component`, `new-page`, `api-route`, `error-boundary`, `extract-hook`, `figma-to-code`, `design-tokens`, `schema-gen`, `storybook-gen`, `scaffold-spec` |
| Quality & Review | `review`, `pre-pr`, `test`, `accessibility-audit`, `security-check`, `responsive-check`, `type-fix`, `perf-audit`, `bundle-check`, `i18n-check`, `test-gaps` |
| Maintenance | `fix-bug`, `refactor`, `optimize`, `migrate`, `dep-check`, `sitecore-debug`, `upgrade` |
| Workflow | `document`, `commit-msg`, `env-setup`, `changelog`, `release`, `pr-description`, `standup`, `learn-from-pr`, `release-notes` |
| Session | `save-session`, `resume-session`, `checkpoint` |
| Orchestration | `orchestrate`, `quality-gate`, `harness-audit` |

### 10 Specialized Agents

| Agent | Purpose | Conditional |
|---|---|---|
| `planner` | Break features into implementation plans | No |
| `code-reviewer` | Deep quality and security review | No |
| `security-reviewer` | OWASP Top 10, XSS, CSRF, secrets detection | No |
| `build-resolver` | Diagnose and fix build/type errors | No |
| `doc-updater` | Keep documentation in sync with code | No |
| `refactor-cleaner` | Find and remove dead code | No |
| `tdd-guide` | Test-driven development guidance and workflow | No |
| `ci-debugger` | CI/CD failure debugger — analyzes logs and suggests fixes | No |
| `e2e-runner` | Playwright tests with Page Object Model | Yes — Playwright only |
| `sitecore-specialist` | Sitecore XM Cloud patterns and debugging | Yes — Sitecore only |

### Automated Quality Hooks

| Profile | What Runs Automatically |
|---|---|
| Minimal | Auto-format + git push safety |
| Standard | + TypeScript type-check + console.log warnings + mistakes auto-capture + bundle impact warning |
| Strict | + ESLint check + stop-time console.log audit + pre-commit AI review + bundle impact warning |

**Mistakes auto-capture** — When a build/lint command fails, the hook logs the error to `docs/mistakes-log.md` with timestamp and error preview. The mistakes log builds itself over time.

### Component Scanner & Docs

Discovers all React components and generates `.ai.md` documentation:
- Props table with types and required flags
- Health score (0-100) based on tests, stories, docs, Sitecore integration
- Sitecore details: datasource fields, rendering params, placeholders, GraphQL queries
- Smart merge — updates auto-generated sections while preserving manual edits

### Project Health Dashboard

```bash
npx @mikulgohil/ai-kit health
```

One-glance view across 5 sections: setup integrity, security, stack detection, tools/MCP, and documentation. Outputs an A-F grade with actionable recommendations.

### Token Tracking & Cost Estimates

```bash
npx @mikulgohil/ai-kit tokens
```

Period summaries, budget progress with alerts, per-project cost breakdown, week-over-week trends, model recommendations (Sonnet vs Opus), and ROI estimates.

### Multi-Tool Support

| Tool | Output |
|---|---|
| Claude Code | `CLAUDE.md` + skills + agents + contexts + hooks |
| Cursor | `.cursorrules` + `.cursor/rules/*.mdc` + skills |
| Windsurf | `.windsurfrules` (via `ai-kit export`) |
| Aider | `.aider.conf.yml` (via `ai-kit export`) |
| Cline | `.clinerules` (via `ai-kit export`) |

---

## CLI Commands

| Command | Description |
|---|---|
| `ai-kit init [path]` | Scan project and generate all configs |
| `ai-kit update [path]` | Re-scan and update generated files (safe merge) |
| `ai-kit reset [path]` | Remove all AI Kit generated files |
| `ai-kit health [path]` | One-glance project health dashboard |
| `ai-kit audit [path]` | Security and configuration health audit |
| `ai-kit doctor [path]` | Diagnose setup issues |
| `ai-kit diff [path]` | Preview what would change on update (dry run) |
| `ai-kit tokens` | Token usage summary and cost estimates |
| `ai-kit stats [path]` | Project complexity metrics |
| `ai-kit export [path]` | Export rules to Windsurf, Aider, Cline |
| `ai-kit patterns [path]` | Generate pattern library from recurring code patterns |
| `ai-kit dead-code [path]` | Find unused components and dead code |
| `ai-kit drift [path]` | Detect drift between code and .ai.md docs |

---

## Supported Tech Stacks

| Category | Technologies |
|---|---|
| Frameworks | Next.js (App Router, Pages Router, Hybrid), React |
| CMS | Sitecore XM Cloud (Content SDK v2), Sitecore JSS |
| Styling | Tailwind CSS (v3 + v4), SCSS, CSS Modules, styled-components |
| Language | TypeScript (with strict mode detection) |
| Formatters | Prettier, Biome (auto-detected for hooks) |
| Monorepos | Turborepo, Nx, Lerna, pnpm workspaces |
| Design | Figma MCP, Figma Code CLI, design tokens, visual tests |
| Testing | Playwright, Storybook, axe-core |
| Quality | ESLint, Snyk, Knip, @next/bundle-analyzer |
| Package Managers | npm, pnpm, yarn, bun |

---

## The Impact

| Metric | Before AI Kit | After AI Kit |
|---|---|---|
| Context setup per conversation | 5-10 min | 0 min (auto-loaded) |
| Code review cycles per PR | 2-4 rounds | 1-2 rounds |
| Component creation time | 30-60 min | 10-15 min |
| New developer onboarding | 1-2 weeks | 2-3 days |
| Security issues caught | At PR review or production | At development time |
| Knowledge retention | Lost when developers leave | Logged in decisions and mistakes |
| AI tool switching cost | Start over from scratch | Zero — same rules across 5+ tools |
| AI-generated code quality | Inconsistent, needs manual fixing | Follows project standards automatically |

---

## Who Is This For?

**Individual developers** — Stop re-explaining context. The AI knows your project from the first conversation.

**Tech leads** — Enforce coding standards through AI tools instead of code review comments.

**Teams** — Same AI experience across every developer. New hires get the same AI context as senior engineers.

**Enterprise** — Consistent AI governance across projects. Security audit, token tracking, and quality hooks provide visibility and control.

---

## Updating

When your project evolves:

```bash
npx @mikulgohil/ai-kit update
```

Only content between `AI-KIT:START/END` markers is refreshed. Your custom rules and manual edits are preserved.

---

## Documentation

**[ai-kit-docs-beta.vercel.app/docs](https://ai-kit-docs-beta.vercel.app/docs)**

| Page | What You'll Learn |
|---|---|
| [Getting Started](https://ai-kit-docs-beta.vercel.app/docs/getting-started) | Step-by-step setup walkthrough |
| [CLI Reference](https://ai-kit-docs-beta.vercel.app/docs/cli-reference) | All 13 commands with examples |
| [Skills & Commands](https://ai-kit-docs-beta.vercel.app/docs/slash-commands) | All 46 skills with usage guides |
| [What Gets Generated](https://ai-kit-docs-beta.vercel.app/docs/what-gets-generated) | Detailed breakdown of every generated file |
| [Hooks](https://ai-kit-docs-beta.vercel.app/docs/hooks) | Hook profiles, mistakes auto-capture |
| [Agents](https://ai-kit-docs-beta.vercel.app/docs/agents) | 10 specialized agents |
| [Changelog](https://ai-kit-docs-beta.vercel.app/docs/changelog) | Version history and release notes |

---

## Roadmap

Features planned for upcoming releases, inspired by best practices from the spec-driven development ecosystem.

| Feature | Description | Status |
|---|---|---|
| **Project Constitution** | `/constitution` skill — generate a `PROJECT_PRINCIPLES.md` governance doc that defines coding standards, testing philosophy, performance budgets, and accessibility targets. AI agents reference it before every decision. | Planned |
| **Spec-First Workflow** | `/specify` skill — create structured feature specs (`specs/<feature>.md`) with user stories, acceptance criteria, and edge cases *before* writing code. Planner agent references specs during implementation. | Planned |
| **Extension Catalog** | Community-contributed agents, skills, and template fragments. Install with `ai-kit extension install <name>`. Standard manifest format for third-party contributions. | Planned |
| **Preset Bundles** | Curated workflow bundles for common project types: `enterprise` (strict compliance), `startup` (fast iteration), `sitecore-xmc` (XM Cloud best practices), `fullstack` (full-stack Next.js). Apply with `ai-kit preset apply <name>`. | Planned |
| **Setup Comparison** | `ai-kit compare` — gap analysis comparing your AI Kit setup against other spec-driven tools. Shows what's covered and what's missing. | Planned |

See [plan.md](./plan.md) for detailed implementation plans.

---

## How AI Kit Compares

| Capability | AI Kit | Spec-Driven Tools (e.g., Spec Kit) |
|---|---|---|
| **Setup** | Auto-detect — zero manual config | Manual spec writing required |
| **Stack awareness** | Scans package.json, configs, directory structure | User describes stack in specs |
| **Rules generation** | Auto-generated from detected stack | User-written specifications |
| **Multi-tool support** | 5+ tools from single source | Varies by tool |
| **Quality hooks** | Built-in (minimal/standard/strict profiles) | Extension-dependent |
| **Security audit** | Built-in CLI command | Extension-dependent |
| **Token tracking** | Built-in with cost estimates | Not available |
| **Component awareness** | Auto-scanned with health scores | Not available |
| **Extension ecosystem** | Coming soon | Community catalog available |
| **Project principles** | Coming soon (`/constitution`) | Available (`/speckit.constitution`) |
| **Spec-first workflow** | Coming soon (`/specify`) | Core feature |

**AI Kit's philosophy**: Auto-detect everything possible, only ask for what can't be inferred. Spec-driven tools require manual specification upfront. Both approaches have merit — AI Kit is adding spec-first capabilities as an *optional* layer on top of auto-detection.

---

## Requirements

- Node.js 18+
- A project with `package.json`
- Claude Code or Cursor (at least one AI tool)

## License

MIT — [github.com/mikulgohil/ai-kit](https://github.com/mikulgohil/ai-kit)
