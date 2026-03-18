# ai-kit

AI-assisted development setup kit. Auto-detects your tech stack and generates tailored CLAUDE.md, .cursorrules, hooks, agents, context modes, slash commands, and developer guides.

## Installation

```bash
npx @mikulgohil/ai-kit init
```

Requires Node >= 18.

## What Gets Generated

Running `init` scans your project and produces:

- **CLAUDE.md** — Project-aware rules and conventions for Claude Code
- **.cursorrules** — Equivalent rules for Cursor AI
- **.cursor/rules/*.mdc** — Modular rule files for Cursor
- **.claude/skills/** — 44 slash commands across 7 categories
- **.claude/agents/** — 8 specialized AI agents for delegation (planner, reviewer, security, E2E, build-resolver, doc-updater, refactor-cleaner, sitecore-specialist)
- **.claude/contexts/** — 3 context modes (dev, review, research)
- **.claude/settings.local.json** — Automated hooks (auto-format, typecheck, console.log warnings, git safety)
- **ai-kit/guides/** — 6 developer guides
- **docs/** — 3 doc scaffolds: mistakes-log, decisions-log, time-log

## CLI Commands

| Command | Description |
|---------|-------------|
| `ai-kit init [path]` | Scan project and generate all configs |
| `ai-kit update [path]` | Re-scan and update existing generated files |
| `ai-kit reset [path]` | Remove all AI Kit generated files |
| `ai-kit audit [path]` | Security and configuration health audit |
| `ai-kit doctor [path]` | Diagnose setup issues |
| `ai-kit diff [path]` | Preview what would change on update (dry run) |
| `ai-kit tokens` | Token usage summary and cost estimates |
| `ai-kit stats [path]` | Project complexity metrics |
| `ai-kit export [path]` | Export rules to Windsurf, Aider, Cline |

`path` defaults to the current directory if omitted.

## Features

### Hooks (Automated Quality Checks)

Hooks run automatically as you code — no manual invocation needed. Choose a profile during init:

| Profile | What Runs |
|---------|-----------|
| **Minimal** | Auto-format + git push safety |
| **Standard** | + TypeScript type-check + console.log warnings |
| **Strict** | + ESLint check + stop-time console.log audit |

Auto-detects your formatter (Prettier or Biome) and generates the right hook.

### Agents (Specialized AI Assistants)

Agents live in `.claude/agents/` and handle delegated tasks:

| Agent | Purpose |
|-------|---------|
| `planner` | Break features into implementation plans |
| `code-reviewer` | Deep quality and security review |
| `security-reviewer` | OWASP Top 10, XSS, CSRF, secrets detection |
| `e2e-runner` | Playwright tests with Page Object Model |
| `build-resolver` | Diagnose and fix build/type errors |
| `doc-updater` | Keep documentation in sync with code |
| `refactor-cleaner` | Find and remove dead code |
| `sitecore-specialist` | Sitecore XM Cloud patterns and debugging |

Conditional agents are only generated when their tools are detected (e.g., `e2e-runner` requires Playwright, `sitecore-specialist` requires Sitecore).

### Context Modes

Three modes change how the AI approaches work:

| Mode | Focus |
|------|-------|
| **dev** | Building features — implementation over perfection |
| **review** | Checking quality — security, a11y, types, performance |
| **research** | Understanding code — read-only exploration and analysis |

### Session Management

| Skill | Purpose |
|-------|---------|
| `/save-session` | Persist session context for later |
| `/resume-session` | Restore and continue previous work |
| `/checkpoint` | Snapshot all quality checks |
| `/learn` | Extract reusable patterns from session |

### Multi-Agent Orchestration

| Skill | Purpose |
|-------|---------|
| `/orchestrate` | Coordinate multiple agents on complex tasks |
| `/quality-gate` | Run all checks: types, lint, format, tests, a11y, security |
| `/harness-audit` | Check AI configuration health |

### Security Audit

```bash
npx @mikulgohil/ai-kit audit
```

Checks for secrets in CLAUDE.md, MCP config security, .env gitignore, hook validity, agent frontmatter, and more. Outputs an A-F health grade.

## Supported Stacks

**Frameworks** — Next.js (App Router, Pages Router, Hybrid), React

**CMS** — Sitecore XM Cloud, Sitecore JSS

**Styling** — Tailwind CSS, SCSS, CSS Modules, styled-components

**Language** — TypeScript (with strict mode detection)

**Formatters** — Prettier, Biome (auto-detected for hooks)

**Monorepos** — Turborepo, Nx, Lerna, pnpm workspaces

**Design** — Figma MCP, design tokens, visual tests

**Testing** — Playwright, Storybook, axe-core

**Package managers** — npm, pnpm, yarn, bun

## Updating

```bash
npx @mikulgohil/ai-kit update
```

Re-scans your project and refreshes all generated files — CLAUDE.md, skills, agents, contexts, and hooks.

## Further Reading

Detailed usage is covered in the generated guides under `ai-kit/guides/` after running `init`. Start with `getting-started.md`.

## Repository

[https://github.com/mikulgohil/ai-kit](https://github.com/mikulgohil/ai-kit)

## License

MIT
