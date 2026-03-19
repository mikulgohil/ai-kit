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
