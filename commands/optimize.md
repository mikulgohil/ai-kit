# Performance Optimizer

Analyze and optimize code for performance.

## Questions (ask if not specified)
1. Which file(s) or page(s) to optimize?
2. What's the main concern? (load time, rendering, bundle size, API calls)

## Analysis Checklist
1. **Bundle Size** — Large imports, missing tree-shaking, dynamic imports needed
2. **Rendering** — Unnecessary re-renders, missing `memo`/`useMemo`/`useCallback`
3. **Data Fetching** — Waterfalls, missing caching, over-fetching
4. **Images** — Missing `next/image`, unoptimized formats, no lazy loading
5. **Core Web Vitals** — LCP, CLS, INP issues
6. **Code Splitting** — Large pages that should use `dynamic()` or `lazy()`

## Output Format
For each optimization:
```
### [Impact: 🔴 High | 🟡 Medium | 🔵 Low]
**Issue**: What's slow
**Why**: Root cause
**Fix**: Code change with before/after
**Impact**: Expected improvement
```

## Rules
- Prioritize by impact — fix high-impact issues first
- Don't micro-optimize — focus on measurable improvements
- Suggest measurements to verify improvements
- Don't add complexity for marginal gains

Target: $ARGUMENTS
