# Implementation Plan: Port ECC Content + Expand Next.js + Upgrade Sitecore XM Cloud

## Phase 1: Port Relevant ECC Agents (2 new agents)

### 1.1 — Add `architect` agent
- **File**: `agents/architect.md`
- **Purpose**: System design decisions — SSR vs SSG strategy, component architecture, data flow patterns
- **Format**: YAML frontmatter (name, description, tools) + mandatory steps + output format
- **Scope**: Next.js + Tailwind + Sitecore XM Cloud focused (no Python/Go/etc.)
- **Key sections**: Architecture decision records, component hierarchy, data fetching strategy, rendering strategy (SSR/SSG/ISR), state management approach

### 1.2 — Add `tdd-guide` agent
- **File**: `agents/tdd-guide.md`
- **Purpose**: Test-driven development workflow for Sitecore components and Next.js pages
- **Format**: Same agent format
- **Scope**: Red-green-refactor cycle, Sitecore component testing with mocked Layout Service, Next.js page testing
- **Key sections**: Test-first workflow, mock patterns for Sitecore fields, component rendering tests, integration test guidance

### 1.3 — Update copier to include new agents
- **File**: `src/copier/agents.ts`
- **Change**: Add `architect` to UNIVERSAL_AGENTS, add `tdd-guide` as conditional (if testing tools detected)

---

## Phase 2: Port Relevant ECC Skills (2 new skills)

### 2.1 — Add `search-first` skill
- **File**: `commands/search-first.md`
- **Purpose**: Research-before-coding pattern — read docs, understand APIs, check existing patterns before writing code
- **Tailored for**: Sitecore APIs (sparse docs), Next.js App Router patterns, Tailwind utility discovery

### 2.2 — Add `quality-gate-check` skill
- **File**: `commands/quality-gate-check.md`
- **Purpose**: Post-implementation quality verification — type safety, a11y, performance, Sitecore field helpers usage
- **Complements**: Existing `/quality-gate` skill (which is orchestration-focused); this is a checklist skill

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

### 3.3 — Add `/server-action` skill
- **File**: `commands/server-action.md`
- **Purpose**: Scaffold Server Actions with validation, error handling, revalidation
- **Steps**: Detect form vs programmatic use, create action file, add Zod validation, wire up revalidation

### 3.4 — Add `/middleware` skill
- **File**: `commands/middleware.md`
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

### 4.5 — Enhance `sitecore-specialist` agent
- **File**: `agents/sitecore-specialist.md`
- **Add**:
  - Content SDK v2.x field type mapping (updated from JSS)
  - Experience Edge query patterns
  - `<NextImage>` + Sitecore image integration
  - Personalization variant handling

### 4.6 — Enhance `/sitecore-debug` skill
- **File**: `commands/sitecore-debug.md`
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
| `agents/architect.md` | **NEW** |
| `agents/tdd-guide.md` | **NEW** |
| `commands/search-first.md` | **NEW** |
| `commands/quality-gate-check.md` | **NEW** |
| `commands/server-action.md` | **NEW** |
| `commands/middleware.md` | **NEW** |
| `templates/claude-md/nextjs-app-router.md` | EDIT |
| `templates/cursorrules/nextjs-app-router.md` | EDIT |
| `templates/claude-md/sitecore-xmc.md` | EDIT |
| `templates/cursorrules/sitecore-xmc.md` | EDIT |
| `templates/claude-md/typescript.md` | EDIT |
| `templates/cursorrules/typescript.md` | EDIT |
| `agents/sitecore-specialist.md` | EDIT |
| `commands/sitecore-debug.md` | EDIT |
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

### 7.1 — Add `constitution` skill (Project Principles Generator)

- **File**: `commands/constitution.md`
- **Purpose**: Generate a `PROJECT_PRINCIPLES.md` governance document that defines coding standards, testing requirements, UX consistency rules, and performance budgets for the project
- **Why**: Spec Kit's `/speckit.constitution` is their most valuable concept — a single source of truth for project values that AI agents reference before making decisions. AI Kit currently generates *technical* rules but lacks a *principles* layer
- **How it works**:
  1. Asks 5-8 questions about project priorities (quality vs speed, testing philosophy, design system, accessibility targets, performance budgets)
  2. Reads existing CLAUDE.md and detected stack
  3. Generates `PROJECT_PRINCIPLES.md` with sections: Vision, Non-Negotiables, Quality Standards, Testing Requirements, Performance Budgets, Accessibility Targets
  4. Adds a reference to principles in generated CLAUDE.md so all AI agents load it automatically
- **Difference from Spec Kit**: AI Kit auto-detects what it can; the constitution captures *opinions* that can't be inferred from code

### 7.2 — Add `specify` skill (Spec-First Feature Workflow)

- **File**: `commands/specify.md`
- **Purpose**: Create a structured feature specification before writing any code — captures the **what** and **why** before the **how**
- **Why**: Spec Kit's core thesis is valid — specs produce better outcomes than jumping straight to code. AI Kit's existing `/new-component` asks questions but doesn't create a persistent spec document
- **How it works**:
  1. Developer describes the feature in plain language
  2. AI generates a structured spec in `specs/<feature-name>.md` with: User Stories, Acceptance Criteria, Edge Cases, Out of Scope, Dependencies, Open Questions
  3. Spec is reviewed/approved before implementation begins
  4. Existing `/planner` agent references the spec during implementation
  5. Spec is archived (not deleted) after feature ships
- **Output**: `specs/<feature-name>.md` — a living document referenced throughout the feature lifecycle

### 7.3 — Add Extension Catalog System

- **Files**:
  - `commands/extension.md` — skill for managing extensions
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
  | `startup` | Speed, iteration, minimal ceremony | planner + code-reviewer only | Minimal | No doc scaffolds, fast feedback loop |
  | `sitecore-xmc` | Sitecore XM Cloud best practices | All + sitecore-specialist priority | Standard | XM Cloud template fragments, Sitecore-specific skills |
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
| `commands/constitution.md` | **NEW** |
| `commands/specify.md` | **NEW** |
| `commands/extension.md` | **NEW** |
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
- **Files**: `agents/refactor-cleaner.md`, `agents/build-resolver.md`, `agents/e2e-runner.md`, `agents/migration-specialist.md`
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
