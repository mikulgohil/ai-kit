<p align="center">
  <h1 align="center">AI Kit</h1>
  <p align="center">
    Make AI coding assistants actually useful.<br/>
    One command. Project-aware AI from the first conversation.
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@mikulgohil/ai-kit"><img src="https://img.shields.io/npm/v/@mikulgohil/ai-kit.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@mikulgohil/ai-kit"><img src="https://img.shields.io/npm/dm/@mikulgohil/ai-kit.svg" alt="npm downloads" /></a>
  <a href="https://github.com/mikulgohil/ai-kit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@mikulgohil/ai-kit.svg" alt="license" /></a>
  <a href="https://mikulgohil.github.io/ai-kit-docs"><img src="https://img.shields.io/badge/docs-ai--kit--docs-blue" alt="documentation" /></a>
</p>

---

## The Problem

AI coding tools are powerful, but they start every project from zero:

- **Wrong patterns** — The AI writes Pages Router code when you use App Router, CSS when you use Tailwind
- **No standards** — No docs, no tests, no JSDoc, no error boundaries unless you explicitly ask every time
- **Repeated context** — You explain the same conventions in every conversation, every day
- **Inconsistent output** — Developer A gets different AI behavior than Developer B on the same project
- **No quality gates** — AI-generated code goes straight to PR without validation
- **Same mistakes** — No system to track what went wrong, so the team keeps hitting the same issues

**The result:** Teams spend more time fixing AI output than they save generating it.

## The Solution

```bash
npx @mikulgohil/ai-kit init
```

One command. 30 seconds. Your AI assistant goes from generic to project-aware.

AI Kit scans your project, detects your tech stack, and generates tailored rules, skills, agents, hooks, and guides — so every AI interaction follows your standards, from the first conversation.

---

## What You Get

| Generated | What It Does |
|-----------|-------------|
| **CLAUDE.md** | Project-aware rules for Claude Code — your stack, conventions, and patterns |
| **.cursorrules** + `.cursor/rules/*.mdc` | Same rules formatted for Cursor AI with scoped file matching |
| **39 Skills** | Auto-discovered workflows — `/review`, `/new-component`, `/security-check`, `/pre-pr`, and 35 more |
| **8 Agents** | Specialized AI assistants for delegation — planner, reviewer, security, E2E, build-resolver, and more |
| **3 Context Modes** | Switch between dev (build fast), review (check quality), and research (understand code) |
| **Automated Hooks** | Auto-format, TypeScript checks, console.log warnings, mistakes auto-capture, git safety |
| **6 Guides** | Developer playbooks for prompts, tokens, hooks, agents, Figma workflow |
| **Doc Scaffolds** | Mistakes log, decisions log, time log — structured knowledge tracking |
| **Component Docs** | Auto-generated `.ai.md` files per component with health scores and Sitecore integration |

---

## Key Features

### Auto Stack Detection

Scans your `package.json`, config files, and directory structure to detect your exact stack — then generates rules tailored to it.

| What It Detects | What the AI Learns |
|---|---|
| Next.js 15 with App Router | Server Components, Server Actions, `app/` routing patterns |
| Sitecore XM Cloud | `<Text>`, `<RichText>`, `<Image>` field helpers, placeholder patterns |
| Tailwind CSS v4 | `@theme` tokens, utility class patterns, responsive prefixes |
| TypeScript strict mode | No `any`, proper null checks, discriminated unions |
| Turborepo monorepo | Workspace conventions, cross-package imports |
| Figma + design tokens | Token mapping, design-to-code workflow |

### 39 Pre-Built Skills

Skills are structured AI workflows that get applied automatically — you don't type a command, the AI recognizes what you're doing and loads the right skill.

| Category | Skills |
|---|---|
| **Getting Started** | `prompt-help`, `understand` |
| **Building** | `new-component`, `new-page`, `api-route`, `error-boundary`, `extract-hook`, `figma-to-code`, `design-tokens`, `schema-gen`, `storybook-gen` |
| **Quality & Review** | `review`, `pre-pr`, `test`, `accessibility-audit`, `security-check`, `responsive-check`, `type-fix`, `perf-audit`, `bundle-check`, `i18n-check` |
| **Maintenance** | `fix-bug`, `refactor`, `optimize`, `migrate`, `dep-check`, `sitecore-debug` |
| **Workflow** | `document`, `commit-msg`, `env-setup`, `changelog`, `release` |
| **Session** | `save-session`, `resume-session`, `checkpoint` |
| **Orchestration** | `orchestrate`, `quality-gate`, `harness-audit` |

### 8 Specialized Agents

Agents handle delegated tasks with focused expertise:

| Agent | Purpose | Conditional |
|---|---|---|
| `planner` | Break features into implementation plans | No |
| `code-reviewer` | Deep quality and security review | No |
| `security-reviewer` | OWASP Top 10, XSS, CSRF, secrets detection | No |
| `build-resolver` | Diagnose and fix build/type errors | No |
| `doc-updater` | Keep documentation in sync with code | No |
| `refactor-cleaner` | Find and remove dead code | No |
| `e2e-runner` | Playwright tests with Page Object Model | Yes — only if Playwright installed |
| `sitecore-specialist` | Sitecore XM Cloud patterns and debugging | Yes — only if Sitecore detected |

### Automated Quality Hooks

Hooks run automatically as you code. Choose a profile during init:

| Profile | What Runs |
|---|---|
| **Minimal** | Auto-format + git push safety |
| **Standard** | + TypeScript type-check + console.log warnings + mistakes auto-capture |
| **Strict** | + ESLint check + stop-time console.log audit |

**Mistakes auto-capture** — When a build or lint command fails, the hook automatically logs the error to `docs/mistakes-log.md` with a timestamp and error preview. Your mistakes log builds itself over time.

### Component Scanner & Docs

Discovers all React components and generates `.ai.md` documentation files with:

- Props table with types and required flags
- Health score (0-100) based on tests, stories, docs, and Sitecore integration
- Sitecore integration details (datasource fields, rendering params, placeholders, GraphQL queries)
- Smart merge — updates auto-generated sections while preserving manual edits

### Project Health Dashboard

```bash
npx @mikulgohil/ai-kit health
```

One-glance view of your project's AI setup health across 5 sections: setup integrity, security, stack detection, tools/MCP status, and documentation. Outputs an A-F grade with actionable recommendations.

### Security Audit

```bash
npx @mikulgohil/ai-kit audit
```

Scans for secrets in CLAUDE.md, MCP config security, .env gitignore status, hook validity, agent configuration, and more. Outputs an A-F health grade.

### Token Tracking & Cost Estimates

```bash
npx @mikulgohil/ai-kit tokens
```

- Period summaries (today, this week, this month)
- Budget progress with alerts at 50%, 75%, 90%
- Per-project cost breakdown
- Week-over-week trends
- Model recommendations (Sonnet vs Opus optimization)
- ROI estimate (time saved vs cost)

### Multi-Tool Support

Generate configs once, use across 5+ AI tools:

| Tool | Output |
|---|---|
| **Claude Code** | `CLAUDE.md` + skills + agents + contexts + hooks |
| **Cursor** | `.cursorrules` + `.cursor/rules/*.mdc` + skills |
| **Windsurf** | `.windsurfrules` (via `ai-kit export`) |
| **Aider** | `.aider.conf.yml` (via `ai-kit export`) |
| **Cline** | `.clinerules` (via `ai-kit export`) |

---

## CLI Commands

| Command | Description |
|---|---|
| `ai-kit init [path]` | Scan project and generate all configs |
| `ai-kit update [path]` | Re-scan and update existing generated files |
| `ai-kit reset [path]` | Remove all AI Kit generated files |
| `ai-kit health [path]` | One-glance project health dashboard |
| `ai-kit audit [path]` | Security and configuration health audit |
| `ai-kit doctor [path]` | Diagnose setup issues |
| `ai-kit diff [path]` | Preview what would change on update (dry run) |
| `ai-kit tokens` | Token usage summary and cost estimates |
| `ai-kit stats [path]` | Project complexity metrics |
| `ai-kit export [path]` | Export rules to Windsurf, Aider, Cline |

`path` defaults to the current directory if omitted.

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

## Quick Start

```bash
# 1. Run in any project directory
npx @mikulgohil/ai-kit init

# 2. Follow the interactive prompts (30 seconds)

# 3. Check your project health
npx @mikulgohil/ai-kit health

# 4. Open in Claude Code or Cursor — AI now knows your project
```

### Updating

When your project evolves (new dependencies, framework upgrades):

```bash
npx @mikulgohil/ai-kit update
```

Only content between `AI-KIT:START/END` markers is refreshed. Your custom rules and manual edits are preserved.

---

## Who Is This For?

**Individual developers** — Stop re-explaining context. Let AI Kit teach the AI your project once. Every conversation starts informed.

**Tech leads** — Enforce coding standards through AI tools instead of code review comments. Standards are followed automatically, not policed manually.

**Teams** — Same AI experience across every developer and every project. New hires get the same AI context as senior engineers.

**Enterprise** — Consistent AI governance across projects. Security audit, token tracking, and quality hooks provide visibility and control.

---

## The Impact

| Metric | Before AI Kit | After AI Kit |
|---|---|---|
| Context setup per conversation | 5-10 min | 0 min (auto-loaded) |
| Code review cycles per PR | 2-4 rounds | 1-2 rounds |
| Component creation time | 30-60 min | 10-15 min |
| New developer onboarding | 1-2 weeks | 2-3 days |
| Security issues caught | At PR review or production | At development time |
| Knowledge retention | Lost when developers leave | Logged in decisions, mistakes, and time logs |
| AI tool switching cost | Start over from scratch | Zero — same rules across 5+ tools |

---

## Documentation

Full documentation is available at **[mikulgohil.github.io/ai-kit-docs](https://mikulgohil.github.io/ai-kit-docs)**

| Page | What You'll Learn |
|---|---|
| [Getting Started](https://mikulgohil.github.io/ai-kit-docs/getting-started) | Step-by-step setup walkthrough |
| [CLI Reference](https://mikulgohil.github.io/ai-kit-docs/cli-reference) | All 10 commands with examples |
| [Skills & Commands](https://mikulgohil.github.io/ai-kit-docs/slash-commands) | All 39 skills with usage guides |
| [Hooks](https://mikulgohil.github.io/ai-kit-docs/hooks) | Hook profiles and configuration |
| [Agents](https://mikulgohil.github.io/ai-kit-docs/agents) | 8 specialized agents |
| [What Gets Generated](https://mikulgohil.github.io/ai-kit-docs/what-gets-generated) | Detailed breakdown of every generated file |
| [Changelog](https://mikulgohil.github.io/ai-kit-docs/changelog) | Version history and release notes |

---

## Requirements

- **Node.js 18+**
- **A project with `package.json`**
- **Claude Code or Cursor** (at least one AI tool installed)

## Repository

[github.com/mikulgohil/ai-kit](https://github.com/mikulgohil/ai-kit)

## License

MIT
