# TypeScript Rules

- Explicit types for function parameters and return values
- `interface` for objects, `type` for unions/intersections
- Use `unknown` over `any` — narrow with type guards
- No `@ts-ignore` without explanation comments
- Use `satisfies` for type-safe literals, `as const` for inference
- Import types from shared files — don't duplicate
- Sitecore: type component fields with `Field<string>`, `ImageField`, `LinkField`
- Next.js: use `Promise<{ slug: string }>` for `params` in App Router page props
- Server Actions: return `{ success: true; data: T } | { success: false; error: string }`
- Validation: define Zod schemas, derive TS types with `z.infer<typeof Schema>`
- Prefer type guards and `satisfies` over `as` type assertions
