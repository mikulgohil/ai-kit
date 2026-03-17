# Tailwind CSS

## Conventions
- Use Tailwind utility classes — avoid writing custom CSS unless absolutely necessary
- Follow mobile-first responsive design: `base` → `sm:` → `md:` → `lg:` → `xl:`
- Use the project's design tokens from `tailwind.config` (colors, spacing, fonts) — don't use arbitrary values like `text-[#ff0000]` when a token exists
- Group utility classes logically: layout → spacing → typography → colors → effects

## Patterns
- Use `cn()` or `clsx()` for conditional classes if available in the project
- Extract repeated class combinations into component props, not `@apply`
- Use `@apply` sparingly — only in global styles for base elements

## Common Mistakes to Avoid
- Don't use inline styles when a Tailwind class exists
- Don't use arbitrary values (`w-[347px]`) — use nearest standard value or define a token
- Don't forget dark mode variants if the project supports it
- Don't mix Tailwind with component-library CSS — pick one approach per component