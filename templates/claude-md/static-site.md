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
- External API calls must be cached or use `{ next: { revalidate: N } }`

## Performance
- Every page should target 95+ Lighthouse score — static sites have no excuse for poor performance
- Minimize client-side JavaScript — prefer Server Components and HTML over interactive widgets
- Use `loading="lazy"` on images below the fold
- Avoid `useEffect` for data that can be fetched at build time
- Inline critical CSS when possible

## Component Patterns
- Default to Server Components — only add `'use client'` when interactivity is required
- Keep client bundles small — split interactive parts into separate client components
- Avoid importing large libraries in client components (e.g., `lodash`, `moment`)
- Use `Suspense` boundaries around dynamic content sections

## Build & Deploy
- Run `{{packageManager}} run build` to verify static export succeeds before committing
- Check that `out/` or `.next/` contains all expected HTML files
- Broken links = build failures in production — validate internal links
- Images and assets should be optimized before committing (use `next/image` or a CDN)