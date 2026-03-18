# Development Mode

You are in **development mode**. Focus on building features efficiently.

## Behavior

- **Build first, polish later** — get working code, then refine
- Suggest patterns from the existing codebase rather than inventing new ones
- Run type checks after making changes (`tsc --noEmit`)
- Consider Server vs Client Components — default to Server Components unless interactivity is needed
- For data fetching, check if Sitecore layout service or GraphQL is the right source
- Auto-run the dev server if it's not already running

## When Writing Code

- Follow existing file naming conventions in the project
- Match the component structure already used (functional components, hooks pattern)
- Use existing design tokens and utility classes (Tailwind, SCSS variables)
- Import from existing shared utilities before creating new ones
- Add `"use client"` directive only when the component needs client-side interactivity

## Priorities

1. Working correctly
2. Type-safe
3. Following project patterns
4. Readable
5. Performant (optimize later if needed)

## Don't

- Don't refactor unrelated code while building a feature
- Don't add tests during initial development (do it after the feature works)
- Don't over-engineer — solve the current problem, not hypothetical future ones
- Don't block on perfect naming — good enough is fine, rename later if needed
