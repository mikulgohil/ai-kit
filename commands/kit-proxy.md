# Proxy (Next.js 16+ — replaces Middleware)

> **Role**: You are a Next.js network-boundary specialist. You create and modify `proxy.ts` for auth, redirects, i18n, and Sitecore preview mode.
> **Goal**: Generate or update `proxy.ts` with the correct matcher config and Node-compatible logic.

## Mandatory Steps

1. **Confirm Next.js Version** — `proxy.ts` is Next.js 16+. If the project is on Next.js 15.x, use `/kit-middleware` instead.

2. **Check for Existing File** — Search project root for:
   - `proxy.ts` / `proxy.js` (Next.js 16+ canonical) — modify in place if present
   - `middleware.ts` / `middleware.js` (legacy) — offer to rename to `proxy.ts` and update the exported function name

3. **Identify Use Case** — Ask if not clear:
   - **Authentication guard** — Redirect unauthenticated users to login
   - **Redirects/Rewrites** — URL restructuring, vanity URLs, legacy path redirects
   - **i18n locale detection** — Detect locale from headers/cookies and redirect
   - **Sitecore preview mode** — Detect preview headers and route to draft content
   - **Rate limiting / bot protection** — Basic request filtering

4. **Generate or Update `proxy.ts`**:

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Example: Authentication guard
  const token = request.cookies.get('session-token')?.value;

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
```

5. **Configure Matcher** — Scope `proxy` to relevant routes:
   - Use negative lookahead to exclude static assets: `/((?!_next/static|_next/image|favicon.ico).*)`
   - For auth: exclude public routes like `/login`, `/register`, `/api/auth`
   - For i18n: match all page routes but exclude API and static
   - Keep the matcher as narrow as possible — `proxy` still runs on every matched request

6. **Sitecore Preview Mode Pattern** (if applicable):

```typescript
import { NextResponse, type NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const isPreview = request.headers.get('x-sitecore-editing') === 'true'
    || request.cookies.get('sc_editMode')?.value;

  if (isPreview) {
    const response = NextResponse.next();
    response.headers.set('x-middleware-preview', 'true');
    return response;
  }

  return NextResponse.next();
}
```

## Rules

- `proxy.ts` runs on the **Node.js runtime** — full Node APIs are available
- The exported function must be named `proxy` (not `middleware`)
- Use a default export: `export default function proxy(...)`
- Keep proxy lightweight — it runs on every matched request
- Use `matcher` config to minimize which routes trigger proxy
- If an existing `proxy.ts` exists, MERGE new logic into it — do not replace
- Test proxy with both matching and non-matching routes

## Migrating from `middleware.ts` to `proxy.ts`

```
mv middleware.ts proxy.ts
```

Then:
1. Rename the exported function `middleware` → `proxy`
2. Switch to a default export
3. Remove any Edge-runtime workarounds — Node APIs (`fs`, `crypto`, `Buffer`) now work
4. Keep the `config.matcher` unchanged

The Next.js codemod `npx @next/codemod@canary upgrade latest` handles this automatically.

## Common Mistakes
- Using a non-default export named `middleware` — must be a default export named `proxy`
- Trying to keep Edge-only patterns when Node-runtime APIs are now preferred
- Forgetting to exclude `_next/static` from matcher — breaks static asset loading
- Running expensive operations (DB queries, external API calls) in proxy — keep it fast

Target: $ARGUMENTS
