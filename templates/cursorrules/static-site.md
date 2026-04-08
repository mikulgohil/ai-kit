# Static Site / SSG Rules

## Output Mode
- This project uses static generation — pages are pre-rendered at build time
- Avoid server-only features that break static export: `cookies()`, `headers()`, dynamic `fetch()` without cache
- Use `generateStaticParams()` for dynamic routes so all pages are pre-rendered
- Prefer `next/image` with `sizes` and `priority` props for above-the-fold images

## Data Fetching
- All data must be available at build time — no runtime server calls
- Use `getStaticProps` (Pages Router) or async Server Components with static data (App Router)
- For ISR pages, set `revalidate` explicitly — never leave it undefined

## Performance
- Every page should target 95+ Lighthouse score
- Minimize client-side JavaScript — prefer Server Components
- Avoid `useEffect` for data that can be fetched at build time

## Component Patterns
- Default to Server Components — only add `'use client'` when interactivity is required
- Keep client bundles small — split interactive parts into separate client components
- Use `Suspense` boundaries around dynamic content sections