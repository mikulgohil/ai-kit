# Pre-PR Checklist

Run a comprehensive pre-pull-request check that catches issues before reviewers see them.

## What This Command Does

This command acts as your first code reviewer. It checks everything that a senior developer would flag in a PR review — so you can fix issues before pushing, not after getting feedback.

## How to Use

```
/pre-pr
```

Or for specific files:

```
/pre-pr src/components/Checkout/
```

## The Checklist

### 1. Type Safety

- [ ] No `any` types — find and replace with proper types
- [ ] No `@ts-ignore` or `@ts-expect-error` without explanation
- [ ] All function parameters and return types are typed
- [ ] API response types match actual responses
- [ ] No type assertions (`as`) that could hide errors

**Example — Flag this:**
```typescript
const data = response.json() as any; // What shape is this?
```

**Example — This is fine:**
```typescript
const data: OrderResponse = await response.json();
```

### 2. Console & Debug Cleanup

- [ ] No `console.log` statements left in code (use proper logging or remove)
- [ ] No `debugger` statements
- [ ] No commented-out code blocks (delete it — git has history)
- [ ] No `// TODO` without a ticket number (e.g., `// TODO(JIRA-123): ...`)

### 3. Error Handling

- [ ] API calls have try-catch or error boundaries
- [ ] Error states are rendered (not blank screens)
- [ ] Loading states exist for async operations
- [ ] Form submissions handle failure gracefully

### 4. Code Quality

- [ ] No files over 200 lines (components) or 300 lines (utilities)
- [ ] No functions over 50 lines
- [ ] No deeply nested code (max 3 levels of nesting)
- [ ] Import order follows convention: external → internal → local → types
- [ ] No unused imports or variables
- [ ] No duplicate logic that should be extracted

### 5. Security

- [ ] No hardcoded secrets, API keys, or credentials
- [ ] User input is validated before use
- [ ] No `dangerouslySetInnerHTML` with unsanitized content
- [ ] API routes check authentication

### 6. Accessibility

- [ ] Images have `alt` text
- [ ] Interactive elements are keyboard accessible
- [ ] Form fields have labels
- [ ] Color is not the only way to convey information

### 7. Testing

- [ ] New components have test files
- [ ] Tests cover happy path, error states, and edge cases
- [ ] Tests pass (`npm run test:run`)

### 8. Documentation

- [ ] Complex components (>50 lines or >3 props) have `.docs.md` files
- [ ] JSDoc comments on exported functions
- [ ] Change log updated for modified documented components

### 9. Performance

- [ ] No unnecessary re-renders (check `useCallback`, `useMemo` usage)
- [ ] Images use `next/image` with proper dimensions
- [ ] No data fetching in components that should use Server Components
- [ ] No large bundles imported on client side

### 10. Git Hygiene

- [ ] Commit messages follow convention (`feat:`, `fix:`, `refactor:`, etc.)
- [ ] No `.env` files or secrets in staged changes
- [ ] Changes are scoped — not mixing features, bug fixes, and refactors
- [ ] PR diff is under 500 lines (if larger, consider splitting)

## Output Format

```
Pre-PR Check Results
====================

✓ Type Safety .................. 0 issues
✗ Console & Debug .............. 2 issues
  - src/components/Cart.tsx:45 — console.log left in code
  - src/lib/api.ts:12 — commented-out code block (lines 12-28)
✓ Error Handling ............... 0 issues
✗ Code Quality ................. 1 issue
  - src/components/Checkout/CheckoutForm.tsx — 287 lines (max 200)
✓ Security ..................... 0 issues
✗ Accessibility ................ 1 issue
  - src/components/ProductCard.tsx:23 — <img> missing alt text
✓ Testing ...................... 0 issues
✓ Documentation ................ 0 issues
✓ Performance .................. 0 issues
✓ Git Hygiene .................. 0 issues

Summary: 4 issues found. Fix before creating PR.
```

## Why This Matters

Most PR review comments are about the same issues: leftover console.logs, missing types, no error handling, accessibility gaps. Running `/pre-pr` before pushing means:
- **Faster reviews** — reviewers focus on logic, not lint
- **Fewer review cycles** — fix everything in one pass
- **Better code quality** — catches issues you'd miss in self-review

Target: $ARGUMENTS
