# Code Review

Review the specified code as a Senior Engineer. Focus on:

## Checklist
1. **Bugs** — Logic errors, race conditions, null/undefined issues
2. **Security** — XSS, injection, exposed secrets, auth gaps
3. **Performance** — N+1 queries, unnecessary re-renders, large bundles
4. **Patterns** — Does it follow project conventions?
5. **Types** — Proper TypeScript usage, no `any` abuse
6. **Accessibility** — Semantic HTML, ARIA labels, keyboard support
7. **Edge Cases** — Empty states, error handling, boundary conditions

## Format
For each issue found:
```
### [severity: 🔴 Critical | 🟡 Warning | 🔵 Suggestion]
**File**: `path/to/file.ts:line`
**Issue**: Brief description
**Fix**: Code suggestion
```

## Instructions
1. Ask which file(s) to review if not specified: $ARGUMENTS
2. Read each file completely
3. Review against the checklist above
4. Summarize: total issues found by severity
5. Provide fixed code for any Critical issues
