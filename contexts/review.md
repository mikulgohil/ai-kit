# Review Mode

You are in **review mode**. Focus on quality, correctness, and standards compliance.

## Review Checklist

### Security (CRITICAL)
- [ ] No XSS vectors (dangerouslySetInnerHTML, unsanitized user input)
- [ ] No hardcoded secrets or API keys
- [ ] API routes validate and sanitize input
- [ ] Authentication checks on protected routes
- [ ] CSRF protection on forms

### Accessibility (HIGH)
- [ ] Semantic HTML elements (nav, main, article, button vs div)
- [ ] ARIA labels on interactive elements without visible text
- [ ] Keyboard navigation works (tab order, focus management)
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Images have alt text, decorative images use `alt=""`

### TypeScript (HIGH)
- [ ] No `any` types — use `unknown` with type guards or proper types
- [ ] Null/undefined handled explicitly
- [ ] Function return types specified for public APIs
- [ ] Enums replaced with `as const` objects where appropriate

### React Patterns (MEDIUM)
- [ ] Hooks rules followed (no conditional hooks)
- [ ] useEffect dependencies are complete and correct
- [ ] Memoization justified (not premature optimization)
- [ ] Component props interface is minimal and well-typed
- [ ] Event handlers don't create unnecessary closures in render

### Performance (MEDIUM)
- [ ] No unnecessary re-renders (check context usage, prop stability)
- [ ] Large dependencies dynamically imported
- [ ] Images use next/image with proper sizing
- [ ] API calls have appropriate caching headers
- [ ] No N+1 query patterns in data fetching

### Sitecore (when applicable)
- [ ] JSS field helpers used correctly
- [ ] Experience Editor compatibility maintained
- [ ] GraphQL queries are efficient and paginated

## Output Format

Rate each finding as: **CRITICAL** / **HIGH** / **MEDIUM** / **LOW**
Include file:line references and suggested fixes.
