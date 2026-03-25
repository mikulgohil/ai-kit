# AI Kit — Feature Overview & Business Benefits

## What Is AI Kit?

AI Kit is a CLI tool that automatically configures AI coding assistants for any project. It scans your codebase, detects the tech stack, and generates tailored configuration files — ensuring every developer gets consistent, project-aware AI assistance from day one.

---

## Problems & Solutions

| # | Problem | How AI Kit Solves It |
|---|---------|----------------------|
| 1 | **AI forgets everything each session** — Every new chat starts from zero. No memory of project rules, patterns, or past decisions. | Generates a persistent `CLAUDE.md` with project rules, conventions, and stack details. The AI knows your project from the first prompt, every time. |
| 2 | **Developers write bad prompts** — Vague or incorrect prompts lead to wrong code, wasted time, and rework. | Ships 39 pre-built slash commands so developers don't need to write prompts from scratch — just run `/review`, `/security`, `/refactor`, etc. |
| 3 | **Same mistakes happen repeatedly** — No system to track what went wrong, so the team keeps hitting the same issues. | Generates a **mistakes log** (`docs/mistakes-log.md`) that records every error and lesson learned — the AI references it to avoid repeating them. |
| 4 | **No decision trail** — Nobody remembers why a technical decision was made 3 months ago. | Auto-scaffolds a **decisions log** (`docs/decisions-log.md`) to capture what was decided, why, and by whom — fully searchable and traceable. |
| 5 | **Can't track what changed in a component** — When something breaks, there's no quick way to see what AI-assisted changes were made and when. | Encourages per-component documentation and change tracking through doc scaffolds and time logs — every change is logged with context. |
| 6 | **AI generates insecure code** — No guardrails for secrets exposure, XSS, SQL injection, or other vulnerabilities. | Built-in **security audit** scans for exposed secrets, OWASP risks, and misconfigurations. Security review agent catches issues before they reach production. |
| 7 | **Every developer configures AI differently** — No consistency in how the team uses AI tools, leading to inconsistent code quality. | One `ai-kit init` command generates the same rules for the entire team — everyone's AI follows identical project standards. |
| 8 | **No quality checks before merge** — AI-generated code goes straight to PR without validation. | Automated **hooks** run formatting, type-checking, linting, and git safety checks in real-time. **Quality gate** runs everything before merge. |
| 9 | **Onboarding takes too long** — New developers spend days understanding the project before they can contribute. | AI Kit generates developer guides and project-aware configurations — new team members get productive AI assistance from day one. |
| 10 | **Ticket context gets lost** — Developers solve issues but the reasoning and approach aren't captured anywhere. | Time logs and decision logs create a **backtracking trail** — any future developer can trace why something was done and how. |
| 11 | **AI doesn't improve over time** — The AI makes the same suggestions regardless of past feedback or team patterns. | The system **learns as you use it** — mistake logs, decision logs, and updated rules mean the AI gets smarter with every session. |
| 12 | **Complex tasks need multiple AI passes** — Developers manually coordinate review + test + docs updates. | **Multi-agent orchestration** runs multiple specialized agents in parallel — review, test, document, and refactor in one command. |
| 13 | **Switching AI tools means starting over** — Moving from Cursor to Claude Code (or vice versa) loses all configuration. | Generates configs for **5+ AI tools** (Claude Code, Cursor, Windsurf, Aider, Cline) — switch tools without losing project knowledge. |
| 14 | **No visibility into AI usage costs** — Management has no idea how many tokens the team is consuming. | Built-in **token tracking** provides usage summaries and cost estimates per project. |
| 15 | **Setup is manual and error-prone** — Configuring AI assistants requires deep knowledge of each tool's config format. | **Zero manual configuration** — one command auto-detects your stack and generates everything. Update with one command when the project evolves. |

---

## Key Features

### 1. Auto Stack Detection
Scans your project and automatically identifies frameworks, CMS, styling, testing tools, monorepo structure, and package managers.

### 2. AI Rules Generation
Generates project-aware rule files for multiple AI tools:
- **CLAUDE.md** — for Claude Code
- **.cursorrules** + `.cursor/rules/*.mdc` — for Cursor AI
- **Export** to Windsurf, Aider, Cline formats

### 3. Pre-Built Slash Commands
39 ready-to-use commands across 7 categories — no prompt writing needed. Includes session management, quality checks, orchestration, security, and more.

### 4. Specialized AI Agents
8 purpose-built agents that handle delegated tasks:
- **Planner** — Break features into implementation plans
- **Code Reviewer** — Deep quality and security review
- **Security Reviewer** — OWASP Top 10, XSS, CSRF, secrets detection
- **E2E Runner** — Playwright tests with Page Object Model
- **Build Resolver** — Diagnose and fix build/type errors
- **Doc Updater** — Keep documentation in sync with code
- **Refactor Cleaner** — Find and remove dead code
- **Sitecore Specialist** — Sitecore XM Cloud patterns and debugging

### 5. Context Modes
Three modes that change how the AI approaches work:
- **Dev** — Building features, implementation over perfection
- **Review** — Checking quality, security, accessibility, types, performance
- **Research** — Read-only exploration and analysis

### 6. Automated Quality Hooks
Runs automatically as developers code. Three strictness profiles:
- **Minimal** — Auto-format + git push safety
- **Standard** — + TypeScript type-check + console.log warnings
- **Strict** — + ESLint check + stop-time console.log audit

### 7. Security Audit
Scans for exposed secrets, MCP config security, .env gitignore status, hook validity, and agent configuration. Outputs an A-F health grade.

### 8. Documentation & Knowledge Tracking
- **Mistakes Log** — Records errors and lessons learned
- **Decisions Log** — Captures technical decisions with reasoning
- **Time Log** — Tracks AI-assisted work with timestamps
- **Developer Guides** — 6 auto-generated guides for the team

### 9. Multi-Agent Orchestration
Coordinate multiple agents on complex tasks — review, test, document, and refactor in parallel with a single command.

### 10. CLI Commands
| Command | Purpose |
|---------|---------|
| `ai-kit init` | Full project scan + generate everything |
| `ai-kit update` | Re-scan and refresh all configs |
| `ai-kit reset` | Remove all generated files cleanly |
| `ai-kit audit` | Security + config health check |
| `ai-kit doctor` | Diagnose setup issues |
| `ai-kit diff` | Dry-run preview of changes |
| `ai-kit tokens` | Token usage and cost estimates |
| `ai-kit stats` | Project complexity metrics |
| `ai-kit export` | Export rules to other AI tools |

---

## Business Impact

| Area | Before AI Kit | After AI Kit |
|------|--------------|--------------|
| **Onboarding** | Days to get productive | Productive from day one |
| **Code Quality** | Inconsistent, depends on developer | Standardized with automated checks |
| **Security** | Reactive — caught in review or production | Proactive — caught at development time |
| **Knowledge Retention** | Lost when developers leave | Logged in decisions, mistakes, and time logs |
| **AI Consistency** | Every developer gets different AI behavior | Entire team shares the same AI rules |
| **Debugging** | "What changed and why?" is unanswerable | Full change trail per component and decision |
| **Cost Visibility** | No tracking | Token usage and cost estimates available |
| **Tool Flexibility** | Locked to one AI tool | Works across 5+ tools with no reconfiguration |

---

## Supported Technology Stack

- **Frameworks** — Next.js (App Router, Pages Router, Hybrid), React
- **CMS** — Sitecore XM Cloud, Sitecore JSS
- **Styling** — Tailwind CSS, SCSS, CSS Modules, styled-components
- **Language** — TypeScript (with strict mode detection)
- **Formatters** — Prettier, Biome (auto-detected for hooks)
- **Monorepos** — Turborepo, Nx, Lerna, pnpm workspaces
- **Design** — Figma MCP, design tokens, visual tests
- **Testing** — Playwright, Storybook, axe-core
- **Package Managers** — npm, pnpm, yarn, bun

---

## How It Works

```
npx @mikulgohil/ai-kit init
```

1. Scans your project directory
2. Detects your tech stack automatically
3. Generates all configuration files
4. Team commits the generated files to the repo
5. Every developer gets project-aware AI assistance immediately

To update when the project evolves:
```
npx @mikulgohil/ai-kit update
```
