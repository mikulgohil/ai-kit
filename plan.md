# Implementation Plan: Port ECC Content + Expand Next.js + Upgrade Sitecore XM Cloud

## Phase 1: Port Relevant ECC Agents (2 new agents)

### 1.1 — Add `kit-architect` agent
- **File**: `agents/kit-architect.md`
- **Purpose**: System design decisions — SSR vs SSG strategy, component architecture, data flow patterns
- **Format**: YAML frontmatter (name, description, tools) + mandatory steps + output format
- **Scope**: Next.js + Tailwind + Sitecore XM Cloud focused (no Python/Go/etc.)
- **Key sections**: Architecture decision records, component hierarchy, data fetching strategy, rendering strategy (SSR/SSG/ISR), state management approach

### 1.2 — Add `kit-tdd-guide` agent
- **File**: `agents/kit-tdd-guide.md`
- **Purpose**: Test-driven development workflow for Sitecore components and Next.js pages
- **Format**: Same agent format
- **Scope**: Red-green-refactor cycle, Sitecore component testing with mocked Layout Service, Next.js page testing
- **Key sections**: Test-first workflow, mock patterns for Sitecore fields, component rendering tests, integration test guidance

### 1.3 — Update copier to include new agents
- **File**: `src/copier/agents.ts`
- **Change**: Add `kit-architect` to UNIVERSAL_AGENTS, add `kit-tdd-guide` as conditional (if testing tools detected)

---

## Phase 2: Port Relevant ECC Skills (2 new skills)

### 2.1 — Add `kit-search-first` skill
- **File**: `commands/kit-search-first.md`
- **Purpose**: Research-before-coding pattern — read docs, understand APIs, check existing patterns before writing code
- **Tailored for**: Sitecore APIs (sparse docs), Next.js App Router patterns, Tailwind utility discovery

### 2.2 — Add `kit-quality-gate-check` skill
- **File**: `commands/kit-quality-gate-check.md`
- **Purpose**: Post-implementation quality verification — type safety, a11y, performance, Sitecore field helpers usage
- **Complements**: Existing `/kit-quality-gate` skill (which is orchestration-focused); this is a checklist skill

### 2.3 — Update skill registry
- **File**: `src/copier/skills.ts`
- **Change**: Add new skills to SKILL_DESCRIPTIONS and the skills list

---

## Phase 3: Expand Next.js Coverage (templates + skills)

### 3.1 — Enhance `nextjs-app-router` template with missing patterns
- **File**: `templates/claude-md/nextjs-app-router.md`
- **Add sections for**:
  - **Server Actions** — `"use server"`, form actions, `useActionState`, revalidation
  - **Streaming/Suspense** — `loading.tsx`, Suspense boundaries, streaming SSR
  - **Route Groups** — `(marketing)`, `(shop)` patterns, layout nesting
  - **Middleware** — `middleware.ts` patterns, redirects, rewrites, auth guards
  - **ISR** — `revalidate` option, on-demand revalidation via `revalidateTag`/`revalidatePath`

### 3.2 — Enhance cursorrules Next.js template
- **File**: `templates/cursorrules/nextjs-app-router.md`
- **Add**: Condensed versions of the same patterns (cursorrules are shorter)

### 3.3 — Add `/kit-server-action` skill
- **File**: `commands/kit-server-action.md`
- **Purpose**: Scaffold Server Actions with validation, error handling, revalidation
- **Steps**: Detect form vs programmatic use, create action file, add Zod validation, wire up revalidation

### 3.4 — Add `/kit-middleware` skill
- **File**: `commands/kit-middleware.md`
- **Purpose**: Create/modify Next.js middleware for auth, redirects, i18n, Sitecore preview mode
- **Steps**: Detect existing middleware, identify use case, generate matcher config, add middleware logic

---

## Phase 4: Upgrade Sitecore to XM Cloud Latest

### 4.1 — Update Sitecore scanner for Content SDK v2.x
- **File**: `src/scanner/sitecore.ts`
- **Changes**:
  - Detect `@sitecore-content-sdk/nextjs` (v2.x) separately from `@sitecore-jss/sitecore-jss-nextjs`
  - Extract Content SDK version
  - Return `cms: 'sitecore-xmc-v2'` for Content SDK projects vs `'sitecore-xmc'` for JSS-based XM Cloud

### 4.2 — Update types for new Sitecore detection
- **File**: `src/types.ts`
- **Change**: Add `'sitecore-xmc-v2'` to CMS union type, add `sitecoreContentSdkVersion` field

### 4.3 — Update Sitecore XM Cloud template
- **File**: `templates/claude-md/sitecore-xmc.md`
- **Add**:
  - **Content SDK v2.x patterns** — new component props, field rendering, `useSitecoreContext`
  - **Experience Edge** — GraphQL queries against Edge, pagination, caching headers
  - **Sitecore image optimization** — `<NextImage>` wrapper for Sitecore `ImageField`, responsive images
  - **Personalization** — component variants, rule-based personalization
  - **Environment setup** — `.env.local` variables for XM Cloud endpoints

### 4.4 — Update cursorrules Sitecore template
- **File**: `templates/cursorrules/sitecore-xmc.md`
- **Add**: Condensed Content SDK v2.x + Experience Edge rules

### 4.5 — Enhance `kit-sitecore-specialist` agent
- **File**: `agents/kit-sitecore-specialist.md`
- **Add**:
  - Content SDK v2.x field type mapping (updated from JSS)
  - Experience Edge query patterns
  - `<NextImage>` + Sitecore image integration
  - Personalization variant handling

### 4.6 — Enhance `/kit-sitecore-debug` skill
- **File**: `commands/kit-sitecore-debug.md`
- **Add**:
  - Content SDK v2.x specific debugging (new hook patterns, context changes)
  - Experience Edge connectivity issues
  - Image optimization troubleshooting

---

## Phase 5: TypeScript Rules Enhancement

### 5.1 — Add TypeScript rules template fragment
- **File**: `templates/claude-md/typescript.md`
- **Enhance with**:
  - Strict type patterns (no `any`, discriminated unions, branded types)
  - Sitecore field typing patterns (typed component props, field type guards)
  - Next.js typing patterns (`PageProps`, `LayoutProps`, `Metadata`, Server Action return types)
  - Tailwind type safety (config types, plugin types)

### 5.2 — Update cursorrules TypeScript template
- **File**: `templates/cursorrules/typescript.md`
- **Add**: Condensed versions of same patterns

---

## Phase 6: Wire Everything Together

### 6.1 — Update fragment selection logic
- **File**: `src/generator/claude-md.ts`
- **Change**: Handle `sitecore-xmc-v2` in `selectFragments()` — use same template but with v2 content

### 6.2 — Update constants
- **File**: `src/constants.ts`
- **Change**: Update VERSION to reflect new release, ensure TEMPLATE_FRAGMENTS list is current

### 6.3 — Update copier for new agents/skills
- Already covered in 1.3 and 2.3

---

## Files Changed Summary

| File | Action |
|---|---|
| `agents/kit-architect.md` | **NEW** |
| `agents/kit-tdd-guide.md` | **NEW** |
| `commands/kit-search-first.md` | **NEW** |
| `commands/kit-quality-gate-check.md` | **NEW** |
| `commands/kit-server-action.md` | **NEW** |
| `commands/kit-middleware.md` | **NEW** |
| `templates/claude-md/nextjs-app-router.md` | EDIT |
| `templates/cursorrules/nextjs-app-router.md` | EDIT |
| `templates/claude-md/sitecore-xmc.md` | EDIT |
| `templates/cursorrules/sitecore-xmc.md` | EDIT |
| `templates/claude-md/typescript.md` | EDIT |
| `templates/cursorrules/typescript.md` | EDIT |
| `agents/kit-sitecore-specialist.md` | EDIT |
| `commands/kit-sitecore-debug.md` | EDIT |
| `src/scanner/sitecore.ts` | EDIT |
| `src/types.ts` | EDIT |
| `src/copier/agents.ts` | EDIT |
| `src/copier/skills.ts` | EDIT |
| `src/generator/claude-md.ts` | EDIT |
| `src/constants.ts` | EDIT |

**Total: 6 new files, 14 edited files**

---

## Phase 7: Spec Kit-Inspired Improvements (New Capabilities)

Inspired by [github/spec-kit](https://github.com/github/spec-kit) — borrowing the best ideas while staying true to AI Kit's auto-detect philosophy.

### 7.1 — Add `kit-constitution` skill (Project Principles Generator)

- **File**: `commands/kit-constitution.md`
- **Purpose**: Generate a `PROJECT_PRINCIPLES.md` governance document that defines coding standards, testing requirements, UX consistency rules, and performance budgets for the project
- **Why**: Spec Kit's `/speckit.constitution` is their most valuable concept — a single source of truth for project values that AI agents reference before making decisions. AI Kit currently generates *technical* rules but lacks a *principles* layer
- **How it works**:
  1. Asks 5-8 questions about project priorities (quality vs speed, testing philosophy, design system, accessibility targets, performance budgets)
  2. Reads existing CLAUDE.md and detected stack
  3. Generates `PROJECT_PRINCIPLES.md` with sections: Vision, Non-Negotiables, Quality Standards, Testing Requirements, Performance Budgets, Accessibility Targets
  4. Adds a reference to principles in generated CLAUDE.md so all AI agents load it automatically
- **Difference from Spec Kit**: AI Kit auto-detects what it can; the constitution captures *opinions* that can't be inferred from code

### 7.2 — Add `kit-specify` skill (Spec-First Feature Workflow)

- **File**: `commands/kit-specify.md`
- **Purpose**: Create a structured feature specification before writing any code — captures the **what** and **why** before the **how**
- **Why**: Spec Kit's core thesis is valid — specs produce better outcomes than jumping straight to code. AI Kit's existing `/kit-new-component` asks questions but doesn't create a persistent spec document
- **How it works**:
  1. Developer describes the feature in plain language
  2. AI generates a structured spec in `specs/<feature-name>.md` with: User Stories, Acceptance Criteria, Edge Cases, Out of Scope, Dependencies, Open Questions
  3. Spec is reviewed/approved before implementation begins
  4. Existing `/kit-planner` agent references the spec during implementation
  5. Spec is archived (not deleted) after feature ships
- **Output**: `specs/<feature-name>.md` — a living document referenced throughout the feature lifecycle

### 7.3 — Add Extension Catalog System

- **Files**:
  - `commands/kit-extension.md` — skill for managing extensions
  - `src/commands/extension.ts` — CLI command implementation
  - `extensions/catalog.json` — built-in extension registry
- **Purpose**: Allow community-contributed agents, skills, and template fragments to be installed and managed
- **Why**: Spec Kit's `catalog.community.json` with categorized extensions (docs, code, process, integration, visibility) is their strongest ecosystem play. AI Kit currently bundles everything — no way to add third-party agents or skills
- **How it works**:
  - `ai-kit extension list` — browse available extensions
  - `ai-kit extension install <name>` — install an extension (agent, skill, or template fragment)
  - `ai-kit extension remove <name>` — uninstall an extension
  - Extensions are Git repos with a standard structure (`agent.md`, `skill.md`, or `fragment.md` + `manifest.json`)
  - Catalog supports categories: `agent`, `skill`, `template`, `hook`, `integration`
- **Catalog schema**:
  ```json
  {
    "name": "sitecore-perf-audit",
    "category": "skill",
    "description": "Sitecore XM Cloud performance audit with Experience Edge caching analysis",
    "repo": "github.com/author/ai-kit-sitecore-perf",
    "compatibility": ">=1.5.0"
  }
  ```

### 7.4 — Add Preset Bundles

- **Files**:
  - `presets/enterprise.json` — enterprise-focused preset
  - `presets/startup.json` — lean/fast preset
  - `presets/sitecore-xmc.json` — Sitecore XM Cloud preset
  - `src/commands/preset.ts` — CLI command
- **Purpose**: Curated bundles of agents, skills, hooks, and settings for common project types
- **Why**: Spec Kit offers presets as a way to get opinionated setups without manual configuration. AI Kit auto-detects the stack but doesn't offer opinionated *workflow* bundles
- **How it works**:
  - `ai-kit preset list` — see available presets
  - `ai-kit preset apply <name>` — apply a preset (installs extensions + configures hooks)
  - Presets are JSON files that define: which agents to enable, which skills to include, hook profile, quality thresholds
- **Built-in presets**:
  | Preset | Focus | Agents | Hook Profile | Extras |
  |---|---|---|---|---|
  | `enterprise` | Compliance, security, audit trail | All 10 + security-reviewer priority | Strict | Decisions log required, security audit on every PR |
  | `startup` | Speed, iteration, minimal ceremony | kit-planner + kit-code-reviewer only | Minimal | No doc scaffolds, fast feedback loop |
  | `sitecore-xmc` | Sitecore XM Cloud best practices | All + kit-sitecore-specialist priority | Standard | XM Cloud template fragments, Sitecore-specific skills |
  | `fullstack` | Full-stack Next.js development | All universal agents | Standard | All Next.js skills, component scanner enabled |

### 7.5 — Add `ai-kit compare` CLI command

- **File**: `src/commands/compare.ts`
- **Purpose**: Compare your AI Kit setup against other spec-driven tools (Spec Kit, etc.) and show gaps/advantages
- **Why**: Helps teams evaluate whether they need additional tooling or if AI Kit covers their needs
- **Output**: Gap analysis report showing what AI Kit covers, what's missing, and recommendations

---

## Phase 7 Files Changed Summary

| File | Action |
|---|---|
| `commands/kit-constitution.md` | **NEW** |
| `commands/kit-specify.md` | **NEW** |
| `commands/kit-extension.md` | **NEW** |
| `src/commands/extension.ts` | **NEW** |
| `src/commands/preset.ts` | **NEW** |
| `src/commands/compare.ts` | **NEW** |
| `extensions/catalog.json` | **NEW** |
| `presets/enterprise.json` | **NEW** |
| `presets/startup.json` | **NEW** |
| `presets/sitecore-xmc.json` | **NEW** |
| `presets/fullstack.json` | **NEW** |
| `src/constants.ts` | EDIT — add extension/preset paths |
| `src/copier/skills.ts` | EDIT — add constitution + specify skills |
| `src/index.ts` | EDIT — register extension, preset, compare commands |
| `README.md` | EDIT — document new capabilities |

**Phase 7 Total: 11 new files, 4 edited files**

---

## Updated Grand Total

| Phase | New Files | Edited Files |
|---|---|---|
| Phase 1-6 (existing) | 6 | 14 |
| Phase 7 (Spec Kit-inspired) | 11 | 4 |
| Phase 8 (Research-driven) | 0 | 14 |
| **Grand Total** | **17** | **32** |

---

## Phase 8: Research-Driven Improvements (v1.10.0)

Based on comprehensive research of Claude Code v2.1.92, Next.js 16, MCP ecosystem, and Cursor IDE changes (April 2026).

### 8.1 — Agent Worktree Isolation & InitialPrompt (DONE)
- **Files**: `agents/kit-refactor-cleaner.md`, `agents/kit-build-resolver.md`, `agents/kit-e2e-runner.md`, `agents/kit-migration-specialist.md`
- **Change**: Added `isolation: worktree` and `initialPrompt` frontmatter fields to code-modifying agents
- **Why**: Claude Code v2.1.x supports worktree isolation — agents run in temporary git worktrees, preventing working directory conflicts during parallel agent execution

### 8.2 — Next.js 16 Detection & Turbopack Rules (DONE)
- **Files**: `src/scanner/nextjs.ts`, `src/types.ts`, `templates/claude-md/nextjs-app-router.md`, `templates/cursorrules/nextjs-app-router.md`
- **Change**: Scanner extracts `nextjsMajorVersion`, templates include Turbopack (stable in Next.js 16), Server Fast Refresh, new caching model
- **Why**: Next.js 16.2.2 is current LTS (April 2026) — Turbopack is production-ready with ~4x faster dev startup

### 8.3 — PostCompact Hook (DONE)
- **Files**: `src/types.ts`, `src/generator/hooks.ts`
- **Change**: Added `PostCompact` hook event to standard and strict profiles — re-echoes tech stack context after Claude Code compacts conversation history
- **Why**: Claude Code v2.1.x added PostCompact hook event — critical for long conversations to preserve project context

### 8.4 — .cursor/index.mdc Generation (DONE)
- **Files**: `src/generator/cursor-mdc.ts`
- **Change**: Generates `index.mdc` as repo-wide Cursor rules entry point with tech stack summary and links to fragment-specific rules
- **Why**: Cursor IDE's `.cursor/rules/index.mdc` with `alwaysApply: true` is the recommended entry point for project-wide conventions

### 8.5 — SitecoreAI Branding (DONE)
- **Files**: `templates/claude-md/sitecore-xmc.md`, `templates/cursorrules/sitecore-xmc.md`
- **Change**: Added SitecoreAI branding alongside XM Cloud (rebranded November 2025)

### 8.6 — Token Guide & Context Limits Update (DONE)
- **Files**: `guides/token-saving-tips.md`
- **Change**: Updated with 1M context window (Opus 4.6), 64K/128K output limits, `/effort` command, context compaction guidance

### 8.7 — Node.js Engine Bump (DONE)
- **File**: `package.json`
- **Change**: `engines.node` bumped from `>=18` to `>=20` (Node 18 EOL April 2025, Next.js 16 requires 20+)

---

## Phase 9: Future Roadmap (Planned, Not Implemented)

### 9.1 — MCP Server for AI Kit
- **Purpose**: Expose project scan results, health checks, and component registries via MCP protocol
- **Why**: MCP ecosystem has exploded (20,000+ servers, 500+ public). An ai-kit MCP server makes scan results accessible to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, Augment) without generating static config files
- **Scope**: New `src/mcp/` module, MCP tools for `scan`, `health`, `component-registry`, `config`
- **Priority**: HIGH — promotes from previous P3 given MCP ecosystem growth

### 9.2 — CI/CD GitHub Action
- **Purpose**: Run `ai-kit health` in CI/CD pipelines and comment on PRs
- **Format**: GitHub Action that runs health checks and posts results as PR comments
- **Scope**: `.github/actions/ai-kit-health/` with action.yml
- **Priority**: MEDIUM

### 9.3 — Sparse Worktree Support for Monorepos
- **Purpose**: Generate `worktree.sparsePaths` config for monorepo projects so agents only checkout relevant packages
- **Why**: Claude Code v2.1.x supports sparse worktrees — large monorepos benefit from faster agent startup
- **Scope**: Update `src/generator/hooks.ts` to include `worktree.sparsePaths` in settings when monorepo detected

### 9.4 — Cursor RULE.md Folder Format
- **Purpose**: Generate `.cursor/rules/rule-name/RULE.md` folder format alongside `.mdc` files
- **Why**: Cursor is migrating from `.mdc` to folder-based rules — currently buggy but expected to stabilize
- **Status**: WAITING — Cursor team needs to fix folder detection bugs first (tracked in Cursor forum)

---

## Phase 10: PM-Kit-Inspired Enhancements (Engagement & Lifecycle)

Inspired by [kv0906/pm-kit](https://github.com/kv0906/pm-kit) — an AI-augmented PM workspace with 86 stars that turns Claude Code into a daily PM tool. These enhancements focus on making ai-kit a **living part of the dev workflow** rather than a one-time setup tool.

**Guiding principle**: ai-kit users run `init` once and forget. PM-Kit users return daily. These tasks close that engagement gap without changing ai-kit's core identity as a config generator.

### 10.1 — Session Init Hook (Context Persistence)

- **Files**: `src/generator/hooks.ts`, `templates/hooks/session-init.sh`
- **Purpose**: Generate a `SessionStart` hook that echoes project context (tech stack, router type, CMS, active scripts) into every new Claude Code session
- **Why**: PM-Kit's `session-init.sh` sets `$TODAY`, `$ACTIVE_PROJECTS`, `$DAILY_NOTE` — developers lose context every session restart. A 5-line echo ensures Claude always knows the stack without re-scanning
- **How it works**:
  1. During `ai-kit init`, generate `.claude/hooks/session-init.sh` from scan results
  2. Hook echoes: `Tech: Next.js 16 (App Router) | CMS: Sitecore XM Cloud v2 | Styling: Tailwind 4 | PM: pnpm`
  3. Include detected scripts: `dev, build, test, lint`
  4. Include ai-kit version + last scan date
  5. Register in `.claude/settings.json` under `hooks.SessionStart`
- **Risk**: None — additive hook, no existing hooks modified
- **Priority**: HIGH — minimal effort, daily value

### 10.2 — Backup & Rollback on Update

- **Files**: `src/commands/update.ts` (edit), `src/commands/rollback.ts` (new), `src/cli/register-commands.ts` (edit)
- **Purpose**: Before `ai-kit update` overwrites any file, snapshot the current state to `.ai-kit/backups/YYYY-MM-DD-HHMMSS/`. Add `ai-kit rollback` to restore previous state.
- **Why**: PM-Kit backs up to `_archive/_updates/` before every update — users trust the update command because it's reversible. ai-kit's `update` currently overwrites without backup, which makes users hesitant to run it.
- **How it works**:
  1. `ai-kit update` copies all AI-KIT-managed files to `.ai-kit/backups/{timestamp}/`
  2. Runs normal update
  3. Shows diff summary: `Updated 3 files, backed up to .ai-kit/backups/2026-04-08-143000/`
  4. `ai-kit rollback` lists available backups and restores selected one
  5. `ai-kit rollback --latest` restores most recent backup
  6. Add `.ai-kit/backups/` to generated `.gitignore` entry
- **Risk**: Low — backup before write is purely additive
- **Priority**: HIGH — trust-building for update adoption

### 10.3 — Single Source of Truth + Symlinks for Multi-Tool

- **Files**: `src/generator/symlinks.ts` (new), `src/commands/init.ts` (edit)
- **Purpose**: Instead of generating separate `CLAUDE.md` and `.cursorrules` with duplicated content, generate one canonical `CLAUDE.md` and create symlinks for other tools
- **Why**: PM-Kit maintains ALL compatibility files (`.cursorrules`, `.windsurfrules`, `.clinerules`, `AGENTS.md`) as symlinks to `CLAUDE.md`. This eliminates drift between tools — one edit updates all. Currently, ai-kit generates separate files that can drift apart.
- **How it works**:
  1. Generate canonical `CLAUDE.md` (full content)
  2. For each selected tool, create symlink:
     - `.cursorrules → CLAUDE.md`
     - `.windsurfrules → CLAUDE.md`
     - `.clinerules → CLAUDE.md`
     - `AGENTS.md → CLAUDE.md`
  3. If symlinks aren't supported (Windows), fall back to copy with a comment header: `<!-- Auto-generated by ai-kit. Source: CLAUDE.md —>`
  4. Add `--no-symlinks` flag for users who prefer separate files
  5. `ai-kit health` checks symlink integrity
- **Risk**: Medium — Cursor/Windsurf/Cline may not support full CLAUDE.md format. Need to verify each tool's rule parsing. May need a condensed symlink target instead.
- **Mitigation**: Test with each tool before release. Keep `--no-symlinks` as escape hatch. If tools need different formats, generate a shared `_core-rules.md` that both CLAUDE.md and .cursorrules include.
- **Priority**: MEDIUM — reduces maintenance burden, prevents drift

### 10.4 — Post-Init Guided Walkthrough

- **Files**: `commands/kit-walkthrough.md` (new skill), `src/copier/skills.ts` (edit)
- **Purpose**: After `ai-kit init` completes, suggest running `/kit-walkthrough` — a guided tour of what was generated and how to use it
- **Why**: PM-Kit's `/onboard` walks users through setup interactively. ai-kit dumps 50+ files and shows a summary table, but users don't know where to start. A 2-minute walkthrough converts setup into understanding.
- **How it works**:
  1. Reads `ai-kit.config.json` to know what was generated
  2. Walks through 5 steps:
     - **Step 1**: "Your CLAUDE.md was generated with these rules: [list]. Open it and skim the first section."
     - **Step 2**: "You have 16 agents available. The most useful for your stack: `/kit-architect`, `/kit-code-reviewer`, `/kit-sitecore-specialist`. Try: `/kit-review` on a recent file."
     - **Step 3**: "Your hooks are set to [profile]. They will [explain what each hook does]."
     - **Step 4**: "Quick test — ask Claude to create a component. It should follow the conventions in CLAUDE.md."
     - **Step 5**: "Run `ai-kit health` periodically to check your setup integrity."
  3. After init, print: `Run /kit-walkthrough to learn how to use your new AI setup`
- **Risk**: None — new skill, no existing files modified
- **Priority**: MEDIUM — improves adoption, especially for junior devs

### 10.5 — Config Changelog (Audit Trail)

- **Files**: `src/utils/changelog.ts` (new), `src/commands/init.ts` (edit), `src/commands/update.ts` (edit), `src/commands/reset.ts` (edit)
- **Purpose**: Maintain `.ai-kit/changelog.md` — an append-only log of every ai-kit operation (init, update, reset, health) with timestamp, version, and what changed
- **Why**: PM-Kit's vault-log tracks every operation. When a team shares ai-kit configs, there's currently no way to know *when* configs were generated, *what version* generated them, or *what changed* between updates. This is critical for enterprise adoption.
- **How it works**:
  1. Every ai-kit command appends an entry:
     ```
     ## 2026-04-08 14:30:00 — ai-kit update (v2.0.0)
     - Updated: CLAUDE.md (Next.js fragment refreshed)
     - Updated: 3 agents (new isolation: worktree fields)
     - Skipped: .cursorrules (no changes)
     - Scan: Next.js 16.2 | Sitecore XMC v2 | Tailwind 4.1 | pnpm
     ```
  2. `ai-kit health` shows last changelog entry date
  3. `ai-kit diff` references changelog for change context
  4. Committed to git so team can see config history
- **Risk**: None — additive file, never modifies existing outputs
- **Priority**: MEDIUM — high value for teams, low effort

### 10.6 — Periodic Health Nudge (PostCompact Reminder)

- **Files**: `src/generator/hooks.ts` (edit)
- **Purpose**: Enhance the existing `PostCompact` hook to include a gentle health check reminder when ai-kit config is older than 30 days
- **Why**: PM-Kit's `/health` is part of the daily workflow. ai-kit users forget `health` exists. A non-intrusive nudge after context compaction (long sessions) reminds devs to keep configs fresh.
- **How it works**:
  1. PostCompact hook reads `ai-kit.config.json` `generatedAt` timestamp
  2. If > 30 days old, append to hook output: `ℹ ai-kit config is X days old. Run \`ai-kit health\` or \`ai-kit update\` to refresh.`
  3. Configurable via `ai-kit.config.json`: `"healthNudgeDays": 30` (set to 0 to disable)
- **Risk**: Low — enhancement to existing hook, opt-out available
- **Priority**: LOW — nice-to-have, keeps configs fresh

### 10.7 — `ai-kit doctor` with Auto-Fix

- **Files**: `src/commands/doctor.ts` (edit)
- **Purpose**: Upgrade `doctor` command from diagnostic-only to diagnostic + auto-fix. When issues are found, offer to fix them automatically.
- **Why**: PM-Kit's `/health` + maintainer agent combo detects AND fixes issues (stale links, missing indexes, orphan files). ai-kit's `doctor` reports problems but the user has to manually fix them.
- **How it works**:
  1. Run existing diagnostics
  2. For each fixable issue, prompt: `Found: CLAUDE.md references 3 skills that don't exist. Fix? (y/n)`
  3. Fixable issues:
     - Missing skills/agents → re-copy from ai-kit source
     - Broken hook references → regenerate hooks
     - Stale ai-kit.config.json → re-scan and update
     - Missing .cursorrules when Cursor is detected → generate
  4. Non-fixable issues still reported as-is
  5. `ai-kit doctor --fix` auto-fixes all without prompting
- **Risk**: Low — each fix is a targeted file write, same as running init/update. Prompt before each fix adds safety.
- **Priority**: LOW — convenience improvement

### 10.8 — `ai-kit status` Quick Summary

- **Files**: `src/commands/status.ts` (new), `src/cli/register-commands.ts` (edit)
- **Purpose**: One-line status of your ai-kit setup — version, last scan, stack, health grade, stale warnings
- **Why**: PM-Kit's `pm-kit status` shows CLI version, vault version, active projects. Developers need a quick "am I set up correctly?" check without the full health dashboard.
- **Output**:
  ```
  ai-kit v2.0.0 | Last scan: 2026-04-01 | Stack: Next.js 16 + Sitecore XMC v2 + Tailwind 4
  Health: A (98%) | Skills: 56 | Agents: 16 | Hooks: standard
  ⚠ Config is 7 days old — run `ai-kit update` to refresh
  ```
- **Risk**: None — new read-only command
- **Priority**: LOW — quality of life

### 10.9 — Skill Tiering (Progressive Disclosure)

- **Files**: `src/copier/skills.ts` (edit), `commands/*.md` (edit frontmatter)
- **Purpose**: Add a `tier` field to skills: `essential` (5-7 core skills), `recommended` (10-15), `advanced` (remaining). Show tiers in `/walkthrough` and `health` output.
- **Why**: PM-Kit's learning curve is smooth — `/daily` takes 10 seconds, `/today` is a full workflow, advanced skills like `/ask` with QMD are opt-in. ai-kit dumps 56 skills at once, which overwhelms new users.
- **How it works**:
  1. Add `tier: essential | recommended | advanced` to each skill's YAML frontmatter
  2. Essential: `kit-review`, `kit-fix-bug`, `kit-new-component`, `kit-test`, `kit-refactor`, `kit-commit-msg`, `kit-understand`
  3. Recommended: `kit-optimize`, `kit-security-check`, `kit-pre-pr`, `kit-accessibility-audit`, `kit-standup`, `kit-search-first`
  4. Advanced: everything else
  5. `/walkthrough` only introduces essential skills
  6. `ai-kit health` shows: "Using 5/56 skills? Explore recommended skills: /kit-optimize, /kit-security-check"
  7. `ai-kit init --tier essential` only copies essential skills (lighter install)
- **Risk**: Low — additive metadata, no existing behavior changes unless `--tier` flag used
- **Priority**: MEDIUM — improves onboarding significantly

### 10.10 — `ai-kit migrate` (Cross-Tool Config Migration)

- **Files**: `src/commands/migrate.ts` (new), `src/cli/register-commands.ts` (edit)
- **Purpose**: Migrate existing hand-written CLAUDE.md/.cursorrules into ai-kit-managed format. Detect existing rules, preserve custom content, wrap in AI-KIT markers.
- **Why**: PM-Kit has `pm-kit migrate` for converting template-cloned vaults to CLI-managed. ai-kit's biggest adoption blocker is projects that already have custom CLAUDE.md files — they don't want to lose their rules.
- **How it works**:
  1. `ai-kit migrate [path]` scans for existing CLAUDE.md, .cursorrules
  2. Identifies which sections overlap with ai-kit templates (fuzzy match)
  3. Preserves custom sections outside AI-KIT markers
  4. Generates ai-kit.config.json from detected stack
  5. Shows diff before applying: "Will preserve 3 custom sections, replace 5 with ai-kit templates"
  6. `--dry-run` flag to preview without writing
- **Risk**: Medium — file modification on existing configs. Mitigated by dry-run default and backup before write.
- **Priority**: HIGH — removes biggest adoption barrier for existing projects

---

## Phase 10 Files Changed Summary

| File | Action | Phase |
|---|---|---|
| `src/generator/hooks.ts` | EDIT — add SessionStart hook, enhance PostCompact | 10.1, 10.6 |
| `templates/hooks/session-init.sh` | **NEW** — session init hook template | 10.1 |
| `src/commands/update.ts` | EDIT — add backup before update | 10.2 |
| `src/commands/rollback.ts` | **NEW** — rollback command | 10.2 |
| `src/generator/symlinks.ts` | **NEW** — symlink generation for multi-tool | 10.3 |
| `src/commands/init.ts` | EDIT — symlink option, changelog, walkthrough prompt | 10.3, 10.5, 10.4 |
| `commands/kit-walkthrough.md` | **NEW** — guided post-init walkthrough skill | 10.4 |
| `src/utils/changelog.ts` | **NEW** — changelog utility | 10.5 |
| `src/commands/doctor.ts` | EDIT — add auto-fix capability | 10.7 |
| `src/commands/status.ts` | **NEW** — quick status command | 10.8 |
| `src/copier/skills.ts` | EDIT — add skill tiering, walkthrough skill | 10.9, 10.4 |
| `src/commands/migrate.ts` | **NEW** — migrate existing configs | 10.10 |
| `src/cli/register-commands.ts` | EDIT — register rollback, status, migrate commands | 10.2, 10.8, 10.10 |

**Phase 10 Total: 6 new files, 7 edited files**

---

## Phase 10 Implementation Priority

| # | Task | Priority | Effort | Impact | Dependencies |
|---|---|---|---|---|---|
| 10.1 | Session Init Hook | HIGH | Small (1-2h) | Daily value — context preserved every session | None |
| 10.2 | Backup & Rollback | HIGH | Medium (3-4h) | Trust-building — users run update confidently | None |
| 10.10 | Migrate Command | HIGH | Large (6-8h) | Adoption — existing projects can onboard | None |
| 10.9 | Skill Tiering | MEDIUM | Medium (3-4h) | Onboarding — 56 skills stop being overwhelming | None |
| 10.4 | Post-Init Walkthrough | MEDIUM | Small (1-2h) | Onboarding — users understand what was generated | 10.9 (tiers) |
| 10.5 | Config Changelog | MEDIUM | Small (2-3h) | Teams — audit trail for config changes | None |
| 10.3 | Symlink Multi-Tool | MEDIUM | Medium (4-5h) | Maintenance — one source of truth | None |
| 10.6 | Health Nudge | LOW | Small (1h) | Freshness — configs don't go stale | None |
| 10.7 | Doctor Auto-Fix | LOW | Medium (3-4h) | Convenience — problems fix themselves | None |
| 10.8 | Quick Status | LOW | Small (1h) | QoL — "am I set up right?" in 1 second | None |

**Recommended order**: 10.1 → 10.2 → 10.10 → 10.9 → 10.4 → 10.5 → 10.3 → 10.8 → 10.6 → 10.7

---

## Updated Grand Total (All Phases)

| Phase | New Files | Edited Files | Status |
|---|---|---|---|
| Phase 1-6 (Port & Expand) | 6 | 14 | DONE |
| Phase 7 (Spec Kit-inspired) | 11 | 4 | PLANNED |
| Phase 8 (Research-driven) | 0 | 14 | DONE |
| Phase 9 (Future roadmap) | 0 | 0 | PLANNED |
| Phase 10 (PM-Kit-inspired) | 6 | 7 | PLANNED |
| **Grand Total** | **23** | **39** | |
