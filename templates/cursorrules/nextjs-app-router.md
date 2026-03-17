# Next.js App Router Rules

- Default to Server Components — only use `'use client'` for interactivity
- Use `generateMetadata` for SEO, not hardcoded `<head>` tags
- Colocate `loading.tsx`, `error.tsx`, `not-found.tsx` with pages
- Data fetching: use `fetch()` in Server Components, Server Actions for mutations
- Use `<Link>` for navigation, `next/image` for images
- No `useEffect` for data fetching in Server Components