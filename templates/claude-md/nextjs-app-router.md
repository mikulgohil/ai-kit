# Next.js App Router

## Conventions
- Use Server Components by default — only add `'use client'` when needed (event handlers, hooks, browser APIs)
- Colocate `loading.tsx`, `error.tsx`, and `not-found.tsx` alongside `page.tsx`
- Use `generateMetadata` for SEO — never hardcode `<title>` or `<meta>` tags
- Prefer `fetch()` with `next: { revalidate }` for data fetching in Server Components
- Use Route Handlers (`app/api/`) for API endpoints, not Pages Router API routes

## Data Fetching
- Server Components: fetch directly at the component level, no `useEffect`
- For mutations: use Server Actions (`'use server'`) or Route Handlers
- Always handle loading and error states with Suspense boundaries or file conventions

## File Structure
```
app/
  layout.tsx          ← Root layout (wrap with providers here)
  page.tsx            ← Home page
  (group)/            ← Route groups for organization
  [slug]/page.tsx     ← Dynamic routes
  api/                ← Route Handlers
```

## Common Mistakes to Avoid
- Don't use `useEffect` for data fetching in Server Components
- Don't import server-only code in Client Components
- Don't use `router.push` for simple navigation — use `<Link>`
- Don't forget to add `loading.tsx` for route transitions