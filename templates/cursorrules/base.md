# Project Rules

You are working on **{{projectName}}** — a {{framework}} project.

## Prompt Quality Guard
- If the request is vague (e.g., "fix this", "make it work"), ask 1-2 clarifying questions before proceeding
- If no target file is specified, ask which file to focus on
- Never guess when you can ask — a quick clarification saves rework

## Self-Enforcement
- When creating/modifying complex components (>50 lines or >3 props), always create/update the `.docs.md` file
- When fixing bugs, add a regression test before fixing
- Always add JSDoc to exported functions in generated code
- After modifying a documented component, append to its Change Log
- Flag `// TODO` comments without ticket numbers

## Horizontal Coding Standards

These standards are enforced across ALL Horizontal Digital projects.

### Naming
- Components: PascalCase (`ProductCard.tsx`) | Utilities/Hooks: camelCase (`useAuth.ts`)
- Constants: UPPER_SNAKE_CASE | CSS: kebab-case for custom, Tailwind where available
- Files match default export name — one component per file

### Structure
- Components under 200 lines — split if larger
- Colocate related files (component, types, tests, styles, docs)
- Separate logic from UI — custom hooks for business logic
- Import order: external → internal shared → local relative → type imports

### Component Documentation
- **Complex components** (>50 lines OR >3 props) must have a colocated doc file (`ComponentName.docs.md`)
- **Simple components** (≤50 lines AND ≤3 props) — a JSDoc comment is sufficient; no separate doc file needed
- When a doc file exists, add reference comment at top: `// Docs: ./ComponentName.docs.md`
- Doc file includes: purpose, props, usage examples, edge cases, design decisions
- Every modification to a documented component must be logged in the doc file's Change Log section
- If a complex component lacks a doc file when modifying, create one

### Code Comments
- JSDoc comment above every exported function/component explaining purpose
- Comment the *why*, not the *what* — skip obvious comments
- Use `// TODO(author):` with a name for deferred items
- Add `@example` in JSDoc for utility functions

### Testing
- Every new component/utility needs a colocated test file
- Cover: happy path, error states, edge cases, accessibility
- React Testing Library — test behavior, not implementation
- Mock external deps, not internal functions

### Performance
- Memoize expensive computations (`useMemo`) and callbacks (`useCallback`)
- Lazy load heavy/below-fold components
- Use `next/image` with proper width/height/loading
- Watch for N+1 data fetching — batch where possible

### Dependencies
- Check if an existing dep solves the problem before adding new ones
- Prefer native browser APIs over utility libraries when reasonable
- Note the reason for new dependencies in the doc file or PR

### Quality
- Read existing code before modifying — match patterns, naming, and structure
- Keep changes minimal and scoped to the request
- No placeholder TODOs — write complete, working code
- Handle edge cases at boundaries (user input, APIs), trust internal code
- Maximum 3–7 files per change unless approved
- Always handle error states — never show blank screens
- Use semantic HTML, add alt text, ensure keyboard navigation
- When modifying a component, update its doc file's change log

### Safety
- Never commit secrets or credentials
- Check for XSS, injection, and OWASP Top 10 vulnerabilities
- Use environment variables for all config values

### Git
- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- One logical change per commit
- Never commit `.env`, secrets, or `node_modules`

## Scripts
{{scripts}}