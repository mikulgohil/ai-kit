# Core Rules

## Workflow
1. **Read before writing** — always read existing files before modifying
2. **Understand → Plan → Code** — never jump straight to implementation
3. **Ask when unclear** — if the task is ambiguous, ask clarifying questions before proceeding
4. **Stay in scope** — only change what was requested, no unsolicited refactors

## Prompt Quality Guard

When a developer's request is vague or missing critical context, you MUST push back before proceeding. This prevents wasted time and bad output.

**If the request is missing a target file or scope**, ask:
> "Which file or component should I focus on?"

**If the request is ambiguous** (e.g., "fix this", "make it work", "improve this"), ask 1-2 targeted questions:
> "What specifically is broken — what's the expected vs actual behavior?"

**If the request could produce very different outputs** (e.g., "create a component"), ask for constraints:
> "Should this be a Server or Client Component? What props does it need?"

**Never guess when you can ask.** A 10-second clarification saves 10 minutes of wrong output.

### Self-Enforcement Rules
- When creating or modifying a component with >50 lines or >3 props, you MUST create/update its `.docs.md` file — do not skip this even if the developer doesn't ask for it
- When fixing a bug, you MUST add a test that reproduces the bug before fixing it
- When generating code, you MUST add JSDoc comments to all exported functions
- After completing a task that modifies a documented component, you MUST append an entry to the component's Change Log
- When you encounter a `// TODO` without a ticket number, flag it to the developer

## Coding Standards

These standards are enforced across all projects to ensure consistency.

### Naming Conventions
- **Components**: PascalCase (`ProductCard.tsx`, `HeroBanner.tsx`)
- **Utilities/Hooks**: camelCase (`useAuth.ts`, `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **CSS classes**: kebab-case for custom classes, Tailwind utilities where available
- **Files**: Match the default export name — one component per file

### Code Structure
- Keep components under 200 lines — split into sub-components if larger
- Colocate related files (component, types, tests, styles, docs) in the same directory
- Separate business logic from UI — use custom hooks for logic
- Props interface defined directly above or alongside the component

### Component Documentation
- **Doc file required for complex components** — components over 50 lines OR with more than 3 props must have a colocated `ComponentName.docs.md` or `docs/components/ComponentName.md`
- **Simple components** (≤50 lines AND ≤3 props) — a JSDoc comment above the component is sufficient; no separate doc file needed
- **Doc file reference in component** — when a doc file exists, add a comment at the top:
  ```
  // Docs: ./ComponentName.docs.md
  ```
- **Doc file contents** — include: purpose, props table, usage examples, edge cases, design decisions
- **Update log** — every modification to a documented component must be logged at the bottom of its doc file:
  ```
  ## Change Log
  - YYYY-MM-DD: [what changed] — [why]
  ```
- If a complex component lacks a doc file when you modify it, create one

### Code Comments
- Add a brief JSDoc comment above every exported function and component explaining its purpose
- Comment non-obvious logic — if you had to think about it, the next developer will too
- Use `// TODO(author):` with a name for anything intentionally deferred
- Do NOT add obvious comments like `// increment counter` — comment the *why*, not the *what*
- Add `@example` in JSDoc for utility functions showing input → output

### Import Order
1. External packages (`react`, `next/...`, third-party)
2. Internal shared utilities (`@/lib`, `@/utils`, `@/hooks`)
3. Local relative imports (`./`, `../`)
4. Type imports (use `import type` for type-only imports)

### Error Handling
- Always handle error states in components — never show blank screens
- Use error boundaries for unexpected failures
- Log errors with context (what failed, what input caused it)
- Show user-friendly messages, not raw error strings

### Accessibility
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`)
- Add `alt` text to all images
- Ensure keyboard navigation works for interactive elements
- Use ARIA labels when semantic HTML isn't sufficient
- Maintain color contrast ratio of at least 4.5:1

### Git Practices
- Write descriptive commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- One logical change per commit
- Never commit `.env`, secrets, or `node_modules`
- Pull and rebase before pushing

### Performance Awareness
- Avoid unnecessary re-renders — memoize expensive computations with `useMemo`, callbacks with `useCallback`
- Lazy load heavy components and below-the-fold content
- Prefer Server Components for data-heavy, non-interactive sections
- Watch for N+1 data fetching — batch where possible
- Images must use `next/image` or equivalent with proper width/height/loading attributes

### Dependency Discipline
- Do NOT add new packages without checking if an existing dependency already solves the problem
- Prefer native browser APIs over utility libraries when reasonable (e.g., `URLSearchParams` over `qs`)
- Pin dependency versions — avoid `^` or `~` for critical packages
- When adding a new dependency, note the reason in the component's doc file or PR description

## Code Quality
- Match existing patterns, naming conventions, and file structure
- Keep changes minimal — don't refactor surrounding code unless asked
- No placeholder or TODO comments — write complete, working code
- Handle edge cases at system boundaries (user input, API responses)
- No unnecessary abstractions — 3 similar lines > premature helper function

## Safety
- Never commit secrets, API keys, or credentials — use environment variables
- Never run destructive git commands without confirmation
- Check for XSS, injection, and OWASP Top 10 vulnerabilities in any code you write
- Validate all external input; trust internal function contracts

### Testing Expectations
- Every new component and utility should have a corresponding test file
- Test file colocated: `ComponentName.test.tsx` or `utilName.test.ts`
- Cover: happy path, error states, edge cases, accessibility (role queries)
- Use React Testing Library — test behavior, not implementation details
- Mock external dependencies, not internal functions

## File Conventions
- Prefer editing existing files over creating new ones
- Maximum 3–7 files changed per task unless explicitly approved
- Document significant changes in `docs/` if the directory exists
- When modifying a component, update its doc file's change log

## Commands
Available at: `.claude/commands/`

**Getting Started**
- `/prompt-help` — Interactive prompt builder (start here if unsure how to ask)
- `/understand` — Explain code in detail

**Building**
- `/new-component` — Scaffold a new component with proper structure
- `/new-page` — Scaffold a new page/route
- `/api-route` — Scaffold an API route with validation, error handling, and auth
- `/error-boundary` — Generate error boundaries, loading states, and fallback UI
- `/extract-hook` — Extract component logic into a reusable custom hook
- `/figma-to-code` — Structured Figma-to-code implementation workflow
- `/design-tokens` — Design token management and mapping

**Quality & Review**
- `/review` — Deep code review following team standards
- `/pre-pr` — Pre-PR checklist (type safety, console cleanup, a11y, security)
- `/test` — Generate tests for a file or function
- `/accessibility-audit` — WCAG 2.1 AA compliance check
- `/security-check` — XSS, injection, secrets, and OWASP Top 10 review
- `/responsive-check` — Responsive design audit (breakpoints, touch targets, overflow)
- `/type-fix` — Fix TypeScript issues (replace `any`, add null checks, generate types)

**Maintenance**
- `/fix-bug` — Guided bug fix workflow
- `/refactor` — Safe refactoring (split components, extract hooks, remove duplication)
- `/optimize` — Performance optimization review
- `/migrate` — Guided migration helper (Next.js, Tailwind, Sitecore upgrades)
- `/dep-check` — Dependency audit (unused, outdated, security, bundle size)
- `/sitecore-debug` — Sitecore XM Cloud debugging (placeholders, fields, GraphQL)

**Workflow**
- `/document` — Generate documentation for existing code
- `/commit-msg` — Generate conventional commit message from staged changes
- `/env-setup` — Generate .env.example and validate environment variables

## Scripts
{{scripts}}