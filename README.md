<p align="center">
  <strong style="font-size: 2em;">AI Kit</strong>
</p>

<h3 align="center">Make AI coding assistants actually useful.</h3>

<p align="center">
  One command. Project-aware AI from the first conversation.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mikulgohil/ai-kit"><img src="https://img.shields.io/npm/v/@mikulgohil/ai-kit.svg?style=flat-square&color=blue" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@mikulgohil/ai-kit"><img src="https://img.shields.io/npm/dm/@mikulgohil/ai-kit.svg?style=flat-square&color=green" alt="npm downloads" /></a>
  <a href="https://github.com/mikulgohil/ai-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@mikulgohil/ai-kit.svg?style=flat-square" alt="license" /></a>
  <a href="https://github.com/mikulgohil/ai-kit"><img src="https://img.shields.io/github/stars/mikulgohil/ai-kit?style=flat-square&color=yellow" alt="GitHub stars" /></a>
</p>

<p align="center">
  <a href="https://ai-kit.mikul.me">Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://ai-kit.mikul.me/getting-started">Getting Started</a> &nbsp;&middot;&nbsp;
  <a href="https://ai-kit.mikul.me/cli-reference">CLI Reference</a> &nbsp;&middot;&nbsp;
  <a href="https://ai-kit.mikul.me/slash-commands">Skills</a> &nbsp;&middot;&nbsp;
  <a href="https://ai-kit.mikul.me/agents">Agents</a> &nbsp;&middot;&nbsp;
  <a href="https://ai-kit.mikul.me/changelog">Changelog</a>
</p>

---

```bash
npx @mikulgohil/ai-kit init
```

> **48 pre-built skills** &nbsp;·&nbsp; **16 specialized agents** &nbsp;·&nbsp; **5+ AI tools supported** &nbsp;·&nbsp; **30-second setup**

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
| **48 Skills** | Auto-discovered workflows — `/review`, `/new-component`, `/security-check`, `/pre-pr`, and more |
| **16 Agents** | Specialized AI assistants — planner, reviewer, security, architect, build-resolver, and more |
| **3 Context Modes** | Switch between dev (build fast), review (check quality), and research (understand code) |
| **Automated Hooks** | Auto-format, TypeScript checks, console.log warnings, mistakes auto-capture, git safety |
| **6 Guides** | Developer playbooks for prompts, tokens, hooks, agents, Figma workflow |
| **Doc Scaffolds** | Mistakes log, decisions log, time log — structured knowledge tracking |
| **Component Docs** | Auto-generated `.ai.md` per component with health scores and Sitecore integration |

---

## Key Features

### Auto Stack Detection

Scans your `package.json`, config files, and directory structure to detect your exact stack:

| What It Detects | What the AI Learns |
|---|---|
| Next.js 15 with App Router | Server Components, Server Actions, `app/` routing patterns |
| Sitecore XM Cloud | `<Text>`, `<RichText>`, `<Image>` field helpers, placeholder patterns |
| Optimizely SaaS CMS | Visual Builder, Optimizely Graph, `@remkoj` SDK, component factory |
| Tailwind CSS v4 | `@theme` tokens, utility class patterns, responsive prefixes |
| TypeScript strict mode | No `any`, proper null checks, discriminated unions |
| Turborepo monorepo | Workspace conventions, cross-package imports |
| Figma + design tokens | Token mapping, design-to-code workflow |

<br />

### 48 Pre-Built Skills

Structured AI workflows applied automatically — the AI recognizes what you're doing and loads the right skill:

| Category | Skills |
|---|---|
| **Getting Started** | `prompt-help`, `understand` |
| **Building** | `new-component`, `new-page`, `api-route`, `error-boundary`, `extract-hook`, `figma-to-code`, `design-tokens`, `schema-gen`, `storybook-gen`, `scaffold-spec` |
| **Quality & Review** | `review`, `pre-pr`, `test`, `accessibility-audit`, `security-check`, `responsive-check`, `type-fix`, `perf-audit`, `bundle-check`, `i18n-check`, `test-gaps` |
| **Maintenance** | `fix-bug`, `refactor`, `optimize`, `migrate`, `dep-check`, `sitecore-debug`, `upgrade` |
| **Workflow** | `document`, `commit-msg`, `env-setup`, `changelog`, `release`, `pr-description`, `standup`, `learn-from-pr`, `release-notes` |
| **Session** | `save-session`, `resume-session`, `checkpoint` |
| **Orchestration** | `orchestrate`, `quality-gate`, `harness-audit` |

<br />

### 16 Specialized Agents

| Agent | Purpose |
|---|---|
| `@planner` | Break features into implementation plans with dependencies and risk assessment |
| `@code-reviewer` | Deep quality review — patterns, performance, types, and conventions |
| `@security-reviewer` | OWASP Top 10, XSS, CSRF, secrets detection, and auth flow analysis |
| `@build-resolver` | Diagnose and fix build errors, type conflicts, and dependency issues |
| `@doc-updater` | Keep documentation in sync with code changes automatically |
| `@refactor-cleaner` | Find and remove dead code, unused imports, and unnecessary complexity |
| `@tdd-guide` | Test-driven development workflow — red, green, refactor with guidance |
| `@ci-debugger` | Analyze CI/CD failures, parse logs, and suggest targeted fixes |
| `@e2e-runner` | Playwright tests with Page Object Model and smart selectors |
| `@sitecore-specialist` | XM Cloud patterns, Content SDK v2, Experience Edge, and field helpers |
| `@architect` | SSR/SSG/ISR strategy, component hierarchy, data flow, and rendering patterns |
| `@data-scientist` | ML pipelines, model evaluation, data analysis, and experiment tracking |
| `@performance-profiler` | Core Web Vitals, bundle analysis, runtime profiling, and rendering optimization |
| `@migration-specialist` | Framework upgrades, breaking change detection, codemods, and incremental adoption |
| `@dependency-auditor` | Vulnerability scanning, outdated packages, license compliance, and bundle impact |
| `@api-designer` | REST/GraphQL API design, schema validation, versioning, and error handling |

<br />

### Automated Quality Hooks

| Hook | What It Does |
|---|---|
| **Session Init** | Echoes project stack, package manager, available scripts, and last scan date at every session start — the AI has full context from the first prompt |
| **Auto-format** | Formats files on edit via Prettier or Biome |
| **TypeScript check** | Catches type errors after every edit (standard + strict) |
| **Console.log warning** | Catches debug statements before commit (standard + strict) |
| **Mistakes auto-capture** | Logs build/lint failures to `docs/mistakes-log.md` automatically (standard + strict) |
| **Pre-commit review** | Checks for `any` types, console.logs, and TODOs without tickets in staged files (strict) |
| **Context re-echo** | After context compaction in long sessions, re-echoes tech stack (standard + strict) |

Three strictness profiles: **Minimal** (format + git safety), **Standard** (+ typecheck + warnings + mistakes), **Strict** (+ ESLint + pre-commit review).

<br />

### Multi-Tool Support

| Tool | Output |
|---|---|
| **Claude Code** | `CLAUDE.md` + skills + agents + contexts + hooks |
| **Cursor** | `.cursorrules` + `.cursor/rules/*.mdc` + skills |
| **Windsurf** | `.windsurfrules` (via `ai-kit export`) |
| **Aider** | `.aider.conf.yml` (via `ai-kit export`) |
| **Cline** | `.clinerules` (via `ai-kit export`) |

<br />

### Component Scanner & Docs

Discovers all React components and generates `.ai.md` documentation:
- Props table with types and required flags
- Health score (0-100) based on tests, stories, docs, Sitecore integration
- Sitecore details: datasource fields, rendering params, placeholders, GraphQL queries
- Smart merge — updates auto-generated sections while preserving manual edits

<br />

### Project Health Dashboard

```bash
npx @mikulgohil/ai-kit health
```

One-glance view across 5 sections: setup integrity, security, stack detection, tools/MCP, and documentation. Outputs an A-F grade with actionable recommendations.

<br />

### Token Tracking & Cost Estimates

```bash
npx @mikulgohil/ai-kit tokens
```

Period summaries, budget progress with alerts, per-project cost breakdown, week-over-week trends, model recommendations (Sonnet vs Opus), and ROI estimates.

---

## CLI Commands

| Command | Description |
|---|---|
| `ai-kit init [path]` | Scan project and generate all configs |
| `ai-kit update [path]` | Re-scan and update generated files (safe merge, auto-backup) |
| `ai-kit migrate [path]` | Adopt ai-kit in a project with existing CLAUDE.md — preserves custom rules |
| `ai-kit rollback [path]` | Restore configs from a previous backup created by `update` |
| `ai-kit reset [path]` | Remove all AI Kit generated files |
| `ai-kit health [path]` | One-glance A-F project health dashboard |
| `ai-kit audit [path]` | Security and configuration health audit |
| `ai-kit doctor [path]` | Diagnose setup issues and misconfigurations |
| `ai-kit diff [path]` | Preview what would change on update (dry run) |
| `ai-kit tokens` | Token usage summary and cost estimates |
| `ai-kit stats [path]` | Project complexity metrics and analysis |
| `ai-kit export [path]` | Export rules to Windsurf, Aider, Cline |
| `ai-kit patterns [path]` | Generate pattern library from recurring code patterns |
| `ai-kit dead-code [path]` | Find unused components and dead code |
| `ai-kit drift [path]` | Detect drift between code and .ai.md docs |
| `ai-kit component-registry [path]` | Generate component catalog for AI discovery |

---

## The Impact

| Metric | Before AI Kit | After AI Kit |
|---|---|---|
| Context setup per conversation | 5-10 min | **0 min** (auto-loaded) |
| Code review cycles per PR | 2-4 rounds | **1-2 rounds** |
| Component creation time | 30-60 min | **10-15 min** |
| New developer onboarding | 1-2 weeks | **2-3 days** |
| Security issues caught | At PR review or production | **At development time** |
| Knowledge retention | Lost when developers leave | **Logged in decisions & mistakes** |
| AI tool switching cost | Start over from scratch | **Zero — same rules, 5+ tools** |
| AI-generated code quality | Inconsistent, needs fixing | **Follows project standards** |

---

<details>
<summary><strong>20 Problems AI Kit Solves</strong> (click to expand)</summary>

<br />

Every team using AI coding assistants hits these problems. AI Kit solves each one.

| # | Problem | How AI Kit Solves It |
|---|---------|---------------------|
| 1 | **AI forgets everything each session** — Every new chat starts from zero. | Generates a persistent `CLAUDE.md` with project rules, conventions, and stack details. The AI knows your project from the first prompt, every time. |
| 2 | **AI generates wrong framework patterns** — Writes Pages Router code when you use App Router. | Auto-detects your exact stack and generates rules specific to your setup. The AI can't use the wrong patterns. |
| 3 | **Developers write bad prompts** — Vague prompts lead to wrong code and rework. | Ships **48 pre-built skills** — just run `/review`, `/security-check`, `/new-component`, etc. |
| 4 | **Same mistakes happen repeatedly** — No system to track what went wrong. | Generates a **mistakes log** with **auto-capture hook** that logs every build/lint failure automatically. |
| 5 | **Every developer gets different AI behavior** — No consistency across the team. | One `ai-kit init` generates the same rules for everyone. Commit the files to the repo. |
| 6 | **No quality checks on AI-generated code** — AI output goes straight to PR. | Automated **hooks** run formatting, type-checking, linting, and git safety checks in real-time. |
| 7 | **AI generates insecure code** — No guardrails for secrets, XSS, SQL injection. | Built-in **security audit** + **security review agent** catches issues at development time. |
| 8 | **AI can't handle multi-file reasoning** — Changes to one component break others. | **16 specialized agents** with focused expertise, each maintaining context for their domain. |
| 9 | **No decision trail** — Nobody remembers why decisions were made 3 months ago. | Auto-scaffolds a **decisions log** to capture what was decided, why, and by whom. |
| 10 | **Onboarding takes too long** — New developers spend days understanding the project. | New team members get productive AI assistance from day one with zero manual setup. |
| 11 | **Context gets repeated every conversation** — Same conventions explained every session. | All conventions encoded in generated rules. The AI reads them automatically at session start. |
| 12 | **AI doesn't improve over time** — Same wrong suggestions regardless of past feedback. | Mistakes log, decisions log, and updated rules mean the AI gets smarter every session. |
| 13 | **Complex tasks need multiple manual AI passes** — Manual coordination across conversations. | **Multi-agent orchestration** runs specialists in parallel with `/orchestrate`. |
| 14 | **Switching AI tools means starting over** — Moving tools loses all configuration. | Generates configs for **5+ tools** from a single source — switch without losing context. |
| 15 | **AI creates components without tests, docs, or types** — Every file needs follow-up. | Skills like `/new-component` enforce structured workflows: component + types + tests + docs together. |
| 16 | **No visibility into AI usage costs** — No idea how many tokens the team consumes. | Built-in **token tracking** with daily/weekly/monthly summaries and cost breakdown. |
| 17 | **Cursor copies entire modules instead of targeted edits** — AI bloats the repo. | Generated rules include explicit instructions for editing patterns — update in place. |
| 18 | **No component-level AI awareness** — AI doesn't know which components have gaps. | **Component scanner** discovers all components and generates `.ai.md` docs with health scores. |
| 19 | **Setup is manual and error-prone** — Configuring AI assistants requires deep knowledge. | **Zero manual configuration** — one command auto-detects and generates everything. |
| 20 | **AI hallucinates framework-specific APIs** — Generates incorrect patterns for your version. | Stack-specific templates include exact API patterns for your detected framework version. |

</details>

---

## Supported Tech Stacks

| Category | Technologies |
|---|---|
| **Frameworks** | Next.js (App Router, Pages Router, Hybrid), React |
| **CMS** | Sitecore XM Cloud (Content SDK v2), Sitecore JSS |
| **Styling** | Tailwind CSS (v3 + v4), SCSS, CSS Modules, styled-components |
| **Language** | TypeScript (with strict mode detection) |
| **Formatters** | Prettier, Biome (auto-detected for hooks) |
| **Monorepos** | Turborepo, Nx, Lerna, pnpm workspaces |
| **Design** | Figma MCP, Figma Code CLI, design tokens, visual tests |
| **Testing** | Playwright, Storybook, axe-core |
| **Quality** | ESLint, Snyk, Knip, @next/bundle-analyzer |
| **Package Managers** | npm, pnpm, yarn, bun |

---

## Who Is This For?

**Individual developers** — Stop re-explaining context. The AI knows your project from the first conversation.

**Tech leads** — Enforce coding standards through AI tools instead of code review comments.

**Teams** — Same AI experience across every developer. New hires get the same AI context as senior engineers.

**Enterprise** — Consistent AI governance across projects. Security audit, token tracking, and quality hooks provide visibility and control.

---

## How AI Kit Compares

| Capability | AI Kit | Spec-Driven Tools |
|---|---|---|
| **Setup** | Auto-detect — zero config | Manual spec writing |
| **Stack awareness** | Scans package.json, configs, dirs | User describes stack |
| **Rules generation** | Auto-generated from stack | User-written specs |
| **Multi-tool support** | 5+ tools, single source | Varies |
| **Quality hooks** | Built-in (3 profiles) | Extension-dependent |
| **Security audit** | Built-in CLI command | Extension-dependent |
| **Token tracking** | Built-in with cost estimates | Not available |
| **Component awareness** | Auto-scanned with health scores | Not available |

> **AI Kit's philosophy**: Auto-detect everything possible, only ask for what can't be inferred.

---

## Updating

When your project evolves:

```bash
npx @mikulgohil/ai-kit update
```

Every update **automatically backs up** your current configs to `.ai-kit/backups/` before writing. Only content between `AI-KIT:START/END` markers is refreshed — your custom rules and manual edits are preserved.

If something goes wrong, roll back instantly:

```bash
npx @mikulgohil/ai-kit rollback          # Pick from available backups
npx @mikulgohil/ai-kit rollback --latest  # Restore most recent backup
```

### Migrating an Existing Project

Already have a hand-written `CLAUDE.md`? Migrate without losing your custom rules:

```bash
npx @mikulgohil/ai-kit migrate              # Interactive — shows preview, asks confirmation
npx @mikulgohil/ai-kit migrate --dry-run    # Preview changes without writing
```

Your custom sections are placed at the top of the file. AI Kit's generated rules go inside `AI-KIT:START/END` markers below. Future `ai-kit update` only touches the marked section — your rules are preserved forever.

---

## Roadmap

| Feature | Description | Status |
|---|---|---|
| **Project Constitution** | `/constitution` — governance doc with coding standards, testing philosophy, performance budgets | Planned |
| **Spec-First Workflow** | `/specify` — structured feature specs with user stories and acceptance criteria before code | Planned |
| **Extension Catalog** | Community-contributed agents, skills, and templates. Install with `ai-kit extension install` | Planned |
| **Preset Bundles** | Curated bundles: `enterprise`, `startup`, `sitecore-xmc`, `fullstack`. Apply with `ai-kit preset apply` | Planned |
| **Setup Comparison** | `ai-kit compare` — gap analysis comparing your setup against other spec-driven tools | Planned |

---

## Requirements

- Node.js 20+
- A project with `package.json`
- Claude Code or Cursor (at least one AI tool)

---

## Documentation

Full documentation at **[ai-kit.mikul.me](https://ai-kit.mikul.me)**

| Page | What You'll Learn |
|---|---|
| [Getting Started](https://ai-kit.mikul.me/getting-started) | Step-by-step setup walkthrough |
| [CLI Reference](https://ai-kit.mikul.me/cli-reference) | All 16 commands with examples |
| [Skills & Commands](https://ai-kit.mikul.me/slash-commands) | All 48 skills with usage guides |
| [What Gets Generated](https://ai-kit.mikul.me/what-gets-generated) | Detailed breakdown of every generated file |
| [Hooks](https://ai-kit.mikul.me/hooks) | Hook profiles, mistakes auto-capture |
| [Agents](https://ai-kit.mikul.me/agents) | 16 specialized agents |
| [Changelog](https://ai-kit.mikul.me/changelog) | Version history and release notes |

---

## Need Expert Help?

Whether you're rolling out AI-assisted development across your organization or need a tailored setup for a complex project — I can help.

| Service | Description |
|---|---|
| **Project Setup** | Custom AI Kit configuration tailored to your stack, conventions, and workflow |
| **Team Rollout** | Deploy AI Kit across your team with shared presets, skills, and agents |
| **Training & Workshops** | Help your developers get the most out of AI-assisted development |
| **Custom Extensions** | Build custom skills, agents, and hooks specific to your organization |

---

## Author

**Mikul Gohil** — Senior developer and tech lead specializing in Sitecore, Next.js, and AI-assisted development workflows. Building tools that make development teams more productive.

<p>
  <a href="https://www.mikul.me">mikul.me</a> &nbsp;&middot;&nbsp;
  <a href="https://github.com/mikulgohil">GitHub</a> &nbsp;&middot;&nbsp;
  <a href="https://www.linkedin.com/in/mikulgohil">LinkedIn</a> &nbsp;&middot;&nbsp;
  <a href="https://x.com/mikulgohil">Twitter / X</a>
</p>

---

## License

MIT — [github.com/mikulgohil/ai-kit](https://github.com/mikulgohil/ai-kit)
