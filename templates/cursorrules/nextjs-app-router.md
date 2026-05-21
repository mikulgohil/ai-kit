# Next.js App Router Rules

> Detected: Next.js {{nextjsVersion}}. Sections labeled **Next.js 16+** apply
> when the project is on Next.js 16 or newer. Sections labeled **15.x**
> apply to legacy projects. Check `package.json` and use the matching rules.

## Always
- Default to Server Components — only use `'use client'` for interactivity
- Use `generateMetadata` for SEO, not hardcoded `<head>` tags
- Colocate `loading.tsx`, `error.tsx`, `not-found.tsx` with pages
- Data fetching: `fetch()` in Server Components, Server Actions for mutations
- Use `<Link>` for navigation, `next/image` for images
- No `useEffect` for data fetching in Server Components
- Streaming: wrap slow components in `<Suspense fallback={...}>`
- Route Groups: use `(groupName)/` for organization without affecting URL paths

## Next.js 16+ — Async Dynamic APIs
- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **async**
- Always `await` them — sync access throws at runtime
- Page props type as `{ params: Promise<{ slug: string }> }`

## Next.js 16+ — Caching (Cache Components)
- Set `cacheComponents: true` in `next.config.ts` to enable
- Opt into caching with the `"use cache"` directive at top of page/component/function
- Use `cacheLife()` and `cacheTag()` from `next/cache` inside cached scopes
- Dynamic-by-default — caching is explicit, not implicit

## Next.js 16+ — Revalidation APIs
- `revalidateTag(tag, 'max')` — two-argument form (single-arg is deprecated)
- `updateTag(tag)` — Server Actions only, read-your-writes semantics
- `refresh()` — Server Actions only, refreshes uncached data without touching cache
- Built-in profiles: `'max'`, `'hours'`, `'days'`, or custom `{ expire: number }`

## Next.js 16+ — Network Boundary (`proxy.ts`)
- Use `proxy.ts` (Node runtime) instead of `middleware.ts` (Edge, deprecated)
- Export function named `proxy`, not `middleware`
- Full Node.js APIs available — no Edge runtime restrictions
- Keep matcher narrow to minimize per-request cost

## Next.js 16+ — Parallel Routes
- `@slot/` directories require an explicit `default.tsx` (or .ts/.jsx/.js)
- Builds fail without it — return `null` or call `notFound()` for previous behavior

## Next.js 16+ — Turbopack
- Default bundler — no `--turbopack` flag needed
- `turbopack` config moved to **top-level** in `next.config.ts` (not under `experimental`)
- Optional FS cache: `experimental.turbopackFileSystemCacheForDev: true`
- Opt out with `next dev --webpack` only if legacy webpack config is required

## Next.js 16+ — React 19.2 features
- `<ViewTransition>` for animating navigations and Transition updates
- `useEffectEvent` for non-reactive logic in Effects
- `<Activity>` for background activity that preserves state
- React Compiler is stable — opt in with `reactCompiler: true` in `next.config.ts`

## Next.js 16+ — Images
- Use `images.remotePatterns` — `images.domains` is deprecated
- `images.dangerouslyAllowLocalIP` defaults to false; opt in only for private networks
- `images.maximumRedirects` defaults to 3

## Next.js 16+ — Removed APIs (don't use)
- `next lint` command — use Biome or ESLint directly
- `experimental.ppr`, `experimental.dynamicIO` — replaced by `cacheComponents`
- `experimental.turbopack` location — moved to top-level
- `serverRuntimeConfig` / `publicRuntimeConfig` — use env vars
- AMP support — fully removed
- `next/legacy/image` — deprecated

## Next.js 16+ — Version Requirements
- Node.js 20.9+, TypeScript 5.1+
- Don't ship code that requires older Node or TS versions in this project

## Legacy (Next.js 15.x)
- Sync `params`/`searchParams`/`cookies`/`headers`/`draftMode`
- `middleware.ts` (Edge runtime) — no `proxy.ts`
- `revalidateTag(tag)` single-argument form
- `next lint` still works
- Implicit caching with `experimental.ppr` and `experimental.dynamicIO`

## Common Mistakes (Next.js 16+)
- Don't access `params` synchronously — always `await params`
- Don't use single-argument `revalidateTag(tag)`
- Don't use `images.domains` — switch to `remotePatterns`
- Don't put Node-only code in `middleware.ts` — use `proxy.ts`
- Don't forget `default.tsx` in `@slot/` parallel route directories
- Don't use custom `webpack()` in `next.config.ts` without checking Turbopack compatibility
