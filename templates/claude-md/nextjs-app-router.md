# Next.js App Router

> Detected: Next.js {{nextjsVersion}} · Router: {{routerType}}
> Sections marked **Next.js 16+** apply when the project is on Next.js 16 or
> newer. Sections marked **Legacy (15.x)** apply when the project is still
> on Next.js 15. The assistant should detect the version from `package.json`
> and follow the matching section. When both `proxy.ts` and `middleware.ts`
> are present, treat `proxy.ts` as authoritative.

## Conventions

- Use Server Components by default — only add `'use client'` when needed (event handlers, hooks, browser APIs)
- Colocate `loading.tsx`, `error.tsx`, and `not-found.tsx` alongside `page.tsx`
- Use `generateMetadata` for SEO — never hardcode `<title>` or `<meta>` tags
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
  @slot/              ← Parallel routes — MUST include default.tsx
  api/                ← Route Handlers
```

## Async Dynamic APIs (Next.js 16+)

`params`, `searchParams`, `cookies()`, `headers()`, and `draftMode()` are
**asynchronous**. Always `await` them. Sync access throws at runtime.

```tsx
// app/[slug]/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const { q } = await searchParams;
  // ...
}
```

```tsx
import { cookies, headers, draftMode } from 'next/headers';

export default async function Layout() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const { isEnabled } = await draftMode();
  // ...
}
```

## Caching (Next.js 16+) — Cache Components

Next.js 16 introduces an **explicit, opt-in** caching model. Dynamic code
runs at request time by default. Opt into caching with the `"use cache"`
directive and `cacheComponents: true` in `next.config.ts`.

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,
};
export default nextConfig;
```

### `"use cache"` directive

Cache a page, layout, component, or function:

```tsx
// app/products/page.tsx
'use cache';

import { cacheLife, cacheTag } from 'next/cache';

export default async function ProductsPage() {
  cacheLife('hours');
  cacheTag('products');
  const products = await db.products.findMany();
  return <ProductList items={products} />;
}
```

### `revalidateTag(tag, cacheLife)` — two-argument form

Now requires a `cacheLife` profile (or `{ expire: number }`) as the second
argument to enable stale-while-revalidate behavior:

```ts
import { revalidateTag } from 'next/cache';

// ✅ Recommended — built-in profile (use 'max' for most cases)
revalidateTag('blog-posts', 'max');

// Other built-in profiles
revalidateTag('news-feed', 'hours');
revalidateTag('analytics', 'days');

// Custom inline profile
revalidateTag('products', { expire: 3600 });

// ❌ Deprecated — single-argument form, will be removed
revalidateTag('blog-posts');
```

### `updateTag()` — Server Actions only (read-your-writes)

Use in Server Actions when the user must see their change immediately:

```ts
'use server';
import { updateTag } from 'next/cache';

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile);
  updateTag(`user-${userId}`);
}
```

### `refresh()` — Server Actions only (uncached data only)

Refresh uncached data displayed elsewhere on the page without touching the
cache. Complementary to client-side `router.refresh()`.

```ts
'use server';
import { refresh } from 'next/cache';

export async function markNotificationAsRead(id: string) {
  await db.notifications.markAsRead(id);
  refresh(); // updates notification count in header
}
```

## Server Actions

- Use `'use server'` directive at the top of the file or inline in a function
- For form handling: pass Server Action directly to `<form action={myAction}>`
- Use `useActionState` (React 19) for form state with pending/error states
- Always validate input with Zod before processing
- For cache invalidation: prefer `updateTag()` for read-your-writes, `revalidateTag(tag, 'max')` for SWR, `refresh()` for uncached data
- Return structured results `{ success, error, data }` — do not throw

## Network Boundary — `proxy.ts` (Next.js 16+, replaces `middleware.ts`)

- Place `proxy.ts` in the project root (next to `app/`)
- `proxy.ts` runs on the **Node.js runtime** — full Node APIs are available
- Exported function is named `proxy` (not `middleware`)
- Use `matcher` config to scope to specific routes
- Common uses: authentication guards, redirects, i18n locale detection, Sitecore preview mode

```ts
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

`middleware.ts` is **deprecated** but still works on the Edge runtime for
projects that need Edge specifically. It will be removed in a future
major version.

## Parallel Routes & `default.js` (Next.js 16+)

All `@slot/` parallel route directories now **require an explicit
`default.tsx`** (or `.ts` / `.jsx` / `.js`) sibling. Builds fail without it.
Return `null` or call `notFound()` to mirror the previous implicit behavior.

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

## React 19.2 features (available in App Router on Next.js 16+)

- **View Transitions** (`<ViewTransition>`) — animate elements that update inside a Transition or navigation
- **`useEffectEvent`** — extract non-reactive logic from Effects without dependency-array gymnastics
- **`<Activity>`** — render background activity while hiding UI (preserves state, cleans up Effects)

## Turbopack (Next.js 16+)

- Turbopack is now the **default bundler** for `next dev` and `next build`
- Opt out with `next dev --webpack` / `next build --webpack`
- Optional FS cache for dev: set `experimental.turbopackFileSystemCacheForDev: true`
- `turbopack` config moved to **top-level** (no longer under `experimental`)

## React Compiler (stable in Next.js 16+)

```ts
// next.config.ts
const nextConfig = {
  reactCompiler: true, // opt-in; not default
};
```

Adds automatic memoization. Compile times go up; runtime renders go down.

## Image Configuration (Next.js 16+)

- Use `images.remotePatterns` — `images.domains` is **deprecated**
- `images.dangerouslyAllowLocalIP` defaults to `false` (security); set `true` only on private networks
- `images.maximumRedirects` defaults to `3`
- Local `src` with query strings now requires `images.localPatterns`

## ISR (legacy form, still supported)

- `fetch(url, { next: { revalidate: 60 } })` for time-based ISR
- `export const revalidate = 60` at the page/layout level
- Tag fetches with `{ next: { tags: ['posts'] } }` for targeted revalidation
- In Next.js 16+, prefer the Cache Components model (`"use cache"`) for new code

## Streaming & Suspense

- Use `loading.tsx` for route-level loading states (automatic Suspense boundary)
- Wrap slow data-fetching components in `<Suspense fallback={...}>` for granular streaming
- Nested Suspense boundaries enable progressive page rendering

## Route Groups & Layouts

- Use `(groupName)/` directories to organize routes without affecting URL structure
- Route groups can have their own `layout.tsx` for section-specific layouts
- Example: `(marketing)/about/page.tsx` → URL is `/about`, not `/(marketing)/about`

## Legacy (15.x and earlier)

If this project is still on Next.js 15:
- `params`/`searchParams` are sync
- `cookies()`/`headers()`/`draftMode()` are sync
- `middleware.ts` runs on Edge runtime (no `proxy.ts`)
- `revalidateTag(tag)` is single-argument
- `next lint` still exists
- `experimental.ppr`, `experimental.dynamicIO`, `experimental.turbopack` are valid
- Parallel routes don't require explicit `default.js`

## Removed in Next.js 16

- `next lint` command (use Biome or ESLint directly)
- AMP support
- `experimental.ppr` flag (replaced by `cacheComponents`)
- `experimental.dynamicIO` flag (replaced by `cacheComponents`)
- `experimental.turbopack` location (moved to top-level `turbopack`)
- `serverRuntimeConfig` / `publicRuntimeConfig` (use env vars)
- Sync `params`/`searchParams`/`cookies`/`headers`/`draftMode`
- `images.domains` (use `images.remotePatterns`)
- `next/legacy/image` (deprecated, use `next/image`)

## Version Requirements (Next.js 16+)

- Node.js **20.9+** (Node 18 not supported)
- TypeScript **5.1+**
- Browsers: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+

## Common Mistakes to Avoid

- Don't use `useEffect` for data fetching in Server Components
- Don't import server-only code in Client Components
- Don't use `router.push` for simple navigation — use `<Link>`
- Don't throw errors from Server Actions — return error objects instead
- Don't access `params`/`searchParams`/`cookies()`/`headers()` synchronously on Next.js 16+
- Don't use the old single-argument `revalidateTag(tag)` form on Next.js 16+
- Don't use `images.domains` on Next.js 16+ — use `images.remotePatterns`
- Don't put Node-only code in `middleware.ts` (Edge runtime); use `proxy.ts` (Node) for that
- Don't forget `default.tsx` in parallel route slots on Next.js 16+
