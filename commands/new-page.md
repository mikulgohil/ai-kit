# New Page / Route Generator

Create a new page following project conventions.

## Questions (ask all of these)
1. What URL/route? (e.g., `/about`, `/products/[slug]`)
2. Page purpose? (brief description)
3. Data fetching needed? (static, SSR, API calls)
4. Which components should it include?
5. SEO metadata needed? (title, description)
6. Authentication required?
7. Dynamic segments? (`[slug]`, `[...catchAll]`)
8. Similar existing page to reference? (read it for patterns)

## Rules
- Match the routing pattern (App Router `page.tsx` or Pages Router convention)
- Include `loading.tsx` and `error.tsx` for App Router pages
- Use `generateMetadata` (App Router) or `next/head` (Pages Router) for SEO
- Match the data fetching pattern used in existing pages
- Include proper TypeScript types for page props

## Output
Generate:
1. Page file (`page.tsx` or `[name].tsx`)
2. Loading state if App Router
3. Error boundary if App Router
4. Data fetching logic (API route, server action, or getServerSideProps)
5. SEO metadata

Target: $ARGUMENTS
