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

## Server Actions
- Use `'use server'` directive at the top of the file or inline in a function
- For form handling: pass Server Action directly to `<form action={myAction}>`
- Use `useActionState` (React 19) for form state management with pending/error states
- Always validate input with Zod before processing
- Call `revalidatePath()` or `revalidateTag()` after mutations to update cached data
- Return structured results `{ success, error, data }` — do not throw from Server Actions

## Streaming & Suspense
- Use `loading.tsx` for route-level loading states (automatic Suspense boundary)
- Wrap slow data-fetching components in `<Suspense fallback={...}>` for granular streaming
- Nested Suspense boundaries enable progressive page rendering
- `loading.tsx` applies to the entire route segment; `<Suspense>` is per-component

## Route Groups & Layouts
- Use `(groupName)/` directories to organize routes without affecting URL structure
- Route groups can have their own `layout.tsx` for section-specific layouts
- Example: `(marketing)/about/page.tsx` → URL is `/about`, not `/(marketing)/about`
- Use parallel routes (`@slot/`) for independent loading states within a layout

## Middleware
- Place `middleware.ts` in the project root (next to `app/`)
- Use `matcher` config to scope middleware to specific routes
- Common uses: authentication guards, redirects, i18n locale detection, Sitecore preview mode
- Middleware runs on the Edge — use only Edge-compatible APIs (no Node.js fs, path, etc.)

## ISR (Incremental Static Regeneration)
- Set `revalidate` in `fetch()` options: `fetch(url, { next: { revalidate: 60 } })`
- Use `export const revalidate = 60` at the page/layout level for time-based ISR
- Use `revalidateTag(tag)` or `revalidatePath(path)` in Server Actions for on-demand ISR
- Tag fetches with `fetch(url, { next: { tags: ['posts'] } })` for targeted revalidation

## Turbopack (Next.js 16+)
- Turbopack is stable and production-ready — use `next dev --turbopack` for ~4x faster dev startup
- Server Fast Refresh: instant HMR for server-side changes (no full reload)
- Supports SRI (Subresource Integrity) for security
- Tree shakes dynamic imports automatically
- If using custom webpack config, migrate to Turbopack-compatible patterns:
  - Replace `webpack()` in `next.config.js` with Turbopack-native configuration
  - Most loaders have Turbopack equivalents — check the Next.js docs
- Web Workers: use `new Worker(new URL('./worker.ts', import.meta.url))` for proper bundling

## Caching (Next.js 16+)
- Route stale time is decoupled from segment-level data — configure independently
- Browser cache no longer serves stale RSC (React Server Component) responses
- Use `staleTimes` in `next.config.js` for fine-grained stale time control
- Prefer `fetch()` cache options over route-level `revalidate` for granular control

## Common Mistakes to Avoid
- Don't use `useEffect` for data fetching in Server Components
- Don't import server-only code in Client Components
- Don't use `router.push` for simple navigation — use `<Link>`
- Don't forget to add `loading.tsx` for route transitions
- Don't throw errors from Server Actions — return error objects instead
- Don't use Node.js APIs in Middleware — it runs on the Edge runtime
- Don't use custom `webpack()` config in Next.js 16+ without checking Turbopack compatibility