# Tailwind CSS Rules

- Use utility classes — avoid custom CSS unless necessary
- Mobile-first responsive: `base` → `sm:` → `md:` → `lg:` → `xl:`
- Use design tokens from `tailwind.config` — avoid arbitrary values
- Group classes: layout → spacing → typography → colors → effects
- Use `cn()` or `clsx()` for conditional classes if available
- Use `@apply` sparingly — only in global base styles