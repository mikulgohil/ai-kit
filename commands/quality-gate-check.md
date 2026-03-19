# Quality Gate Check

> **Role**: You are a senior quality engineer performing a post-implementation checklist review.
> **Goal**: Verify that the implementation meets all quality standards before it can be considered complete.

## Mandatory Steps

You MUST check EVERY item in the relevant sections. Do not skip any check.

1. **Identify Changed Files** — List all files that were created or modified.

2. **Run Through Checklists** — Apply every applicable checklist below.

3. **Report Results** — Output pass/fail for each item with specific details.

## Checklists

### Type Safety
```
[ ] No `any` types — all types are explicit or properly inferred
[ ] Function parameters and return values have explicit types
[ ] No `@ts-ignore` or `@ts-expect-error` without justification
[ ] Discriminated unions used for complex state (not boolean flags)
[ ] Zod schemas used for external data validation (API responses, form data)
```

### React & Next.js Patterns
```
[ ] Server Components used by default — 'use client' only where needed
[ ] No useEffect for data fetching in Server Components
[ ] Loading and error states handled (loading.tsx, error.tsx, or Suspense)
[ ] Images use next/image with width, height, and alt
[ ] Links use next/link, not <a> tags for internal navigation
[ ] Metadata uses generateMetadata, not hardcoded <head> tags
```

### Sitecore Integration (if applicable)
```
[ ] Field helpers used — <Text>, <RichText>, <Image>, <Link>
[ ] No direct .value access in JSX (breaks Experience Editor)
[ ] Component registered in component factory
[ ] Component name matches Sitecore rendering item exactly
[ ] withDatasourceCheck used for datasource-dependent components
[ ] GraphQL queries scoped to needed fields only
```

### Tailwind CSS
```
[ ] Utility classes used — no unnecessary custom CSS
[ ] Mobile-first responsive: base → sm → md → lg → xl
[ ] Design tokens from tailwind.config used — no arbitrary values like text-[#ff0000]
[ ] Conditional classes use cn() or clsx(), not string concatenation
```

### Accessibility
```
[ ] Semantic HTML elements used (button, nav, main, section, article)
[ ] Interactive elements have accessible names (aria-label or visible text)
[ ] Images have meaningful alt text (or alt="" for decorative)
[ ] Form inputs have associated labels
[ ] Focus management works for keyboard navigation
[ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
```

### Security
```
[ ] No hardcoded secrets, API keys, or credentials
[ ] User input validated before use
[ ] No dangerouslySetInnerHTML without sanitization
[ ] API routes check authentication and authorization
[ ] Environment variables used for configuration — no inline secrets
```

### Performance
```
[ ] No unnecessary re-renders (proper memoization where needed)
[ ] Heavy/below-fold components lazy loaded
[ ] No N+1 data fetching patterns
[ ] Bundle imports are specific — not importing entire libraries
```

## Output Format

```
## Quality Gate Report

### Summary
✅ Passed: X checks
⚠️ Warnings: X checks
❌ Failed: X checks

### Results by Category
[Each category with pass/fail per item]

### Required Fixes
[Specific code changes needed to pass, with file paths and line numbers]

### Recommendations
[Optional improvements that are not blockers]
```

## Rules

- Check EVERY item — do not skip items that seem obvious
- If you cannot verify an item, mark it "UNABLE TO CHECK" with explanation
- Failed items must include the specific file, line, and fix needed
- Do not pass items that partially fail — strict pass/fail only

Target: $ARGUMENTS
