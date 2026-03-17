# TypeScript

## Conventions
- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes, `type` for unions and intersections
- Use `unknown` over `any` — narrow types with type guards
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining why

## Patterns
- Define prop types directly above or alongside the component
- Use `satisfies` for type-safe object literals when the type is known
- Use discriminated unions for state management (loading/success/error)
- Prefer `as const` for literal type inference

## Common Mistakes to Avoid
- Don't use `any` to bypass type errors — fix the underlying type issue
- Don't create unnecessary generic types — use them only when the type genuinely varies
- Don't duplicate types — import from a shared types file
- Don't use optional chaining as a substitute for proper null checking