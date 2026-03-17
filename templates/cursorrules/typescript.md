# TypeScript Rules

- Explicit types for function parameters and return values
- `interface` for objects, `type` for unions/intersections
- Use `unknown` over `any` — narrow with type guards
- No `@ts-ignore` without explanation comments
- Use `satisfies` for type-safe literals, `as const` for inference
- Import types from shared files — don't duplicate