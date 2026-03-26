# AI Kit — Feature Overview & Business Benefits

## What Is AI Kit?

AI Kit is a CLI tool that automatically configures AI coding assistants for any project. It scans your codebase, detects the tech stack, and generates tailored configuration files — ensuring every developer gets consistent, project-aware AI assistance from day one.

---

## Problems & Solutions

| # | Problem | How AI Kit Solves It |
|---|---------|----------------------|
| 1 | **AI forgets everything each session** — Every new chat starts from zero. No memory of project rules, patterns, or past decisions. | Generates a persistent `CLAUDE.md` with project rules, conventions, and stack details. The AI knows your project from the first prompt, every time. |
| 2 | **Developers write bad prompts** — Vague or incorrect prompts lead to wrong code, wasted time, and rework. | Ships 46 pre-built slash commands so developers don't need to write prompts from scratch — just run `/review`, `/security`, `/refactor`, etc. |
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
48 ready-to-use commands across 8 categories — no prompt writing needed. Includes session management, quality checks, orchestration, security, requirements gathering, and more.

### 4. Specialized AI Agents
16 purpose-built agents that handle delegated tasks:
- **Planner** — Break features into implementation plans
- **Code Reviewer** — Deep quality and security review
- **Security Reviewer** — OWASP Top 10, XSS, CSRF, secrets detection
- **E2E Runner** — Playwright tests with Page Object Model
- **Build Resolver** — Diagnose and fix build/type errors
- **Doc Updater** — Keep documentation in sync with code
- **Refactor Cleaner** — Find and remove dead code
- **TDD Guide** — Test-driven development guidance and workflow
- **CI Debugger** — CI/CD failure analysis and resolution
- **Sitecore Specialist** — Sitecore XM Cloud patterns and debugging
- **Architect** — System design and architecture decisions
- **Data Scientist** — ML pipelines, model evaluation, data analysis patterns
- **Performance Profiler** — Bundle analysis, Core Web Vitals, runtime profiling
- **Migration Specialist** — Framework upgrades, breaking change detection, codemods
- **Dependency Auditor** — Outdated packages, vulnerability scanning, license compliance
- **API Designer** — REST/GraphQL API design, schema validation, versioning

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

---

## Upcoming Features (Roadmap)

Improvements inspired by the spec-driven development ecosystem, adapted to AI Kit's auto-detect philosophy.

### Project Constitution (`/constitution` skill)
Generate a `PROJECT_PRINCIPLES.md` governance document that captures team opinions AI can't infer from code — testing philosophy, performance budgets, accessibility targets, and coding standards. All AI agents reference it automatically.

**Business value**: Ensures AI-generated code aligns with team values, not just technical patterns. Reduces "technically correct but wrong for us" code.

### Spec-First Feature Workflow (`/specify` skill)
Create structured feature specifications (`specs/<feature>.md`) with user stories, acceptance criteria, and edge cases *before* implementation begins. The planner agent references specs throughout the build.

**Business value**: Reduces rework by 40-60% on complex features. Creates a persistent trail from requirement to implementation.

### Extension Catalog
Community-contributed agents, skills, and template fragments installable via `ai-kit extension install <name>`. Standard manifest format enables third-party contributions.

**Business value**: Teams can share custom agents/skills across projects. Domain-specific extensions (healthcare, fintech, e-commerce) become possible without forking AI Kit.

### Preset Bundles
Curated workflow bundles for common project types:
- **Enterprise** — strict compliance, security-first, full audit trail
- **Startup** — minimal ceremony, fast iteration, speed over perfection
- **Sitecore XM Cloud** — XM Cloud best practices, Content SDK patterns, Experience Edge
- **Full-stack** — complete Next.js development with all agents and skills

**Business value**: New projects get an opinionated, production-tested AI workflow in one command instead of manual configuration.

### How AI Kit Differs from Spec-Driven Tools

| Approach | AI Kit | Spec-Driven Tools |
|---|---|---|
| Setup philosophy | Auto-detect first, ask only when needed | Manual specification upfront |
| Stack awareness | Inferred from code and configs | User-described in spec documents |
| Learning over time | Mistakes log + decisions log build context | Specs are static documents |
| Quality enforcement | Built-in hooks + security audit | Extension-dependent |

AI Kit is adding spec-first capabilities as an **optional enhancement** — teams that want the benefits of specification-driven development can opt in without losing auto-detection.
