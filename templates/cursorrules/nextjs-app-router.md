# Next.js App Router Rules

- Default to Server Components — only use `'use client'` for interactivity
- Use `generateMetadata` for SEO, not hardcoded `<head>` tags
- Colocate `loading.tsx`, `error.tsx`, `not-found.tsx` with pages
- Data fetching: use `fetch()` in Server Components, Server Actions for mutations
- Use `<Link>` for navigation, `next/image` for images
- No `useEffect` for data fetching in Server Components
- Server Actions: validate with Zod, return `{ success, error }`, call `revalidatePath`/`revalidateTag` after mutations
- Streaming: wrap slow components in `<Suspense fallback={...}>` for progressive rendering
- ISR: use `fetch(url, { next: { revalidate: N } })` or `export const revalidate = N`
- Middleware: place `middleware.ts` at project root, use `matcher` config, Edge-compatible APIs only
- Route Groups: use `(groupName)/` for organization without affecting URL paths
- Turbopack (Next.js 16+): use `next dev --turbopack` for ~4x faster dev, Server Fast Refresh for instant HMR
- Caching (Next.js 16+): route stale time is decoupled from data — use `staleTimes` in `next.config.js` for control
- Don't use custom `webpack()` in Next.js 16+ without checking Turbopack compatibility