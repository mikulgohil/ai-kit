# Middleware (alias — see notes below)

> **Role**: You are a Next.js network-boundary specialist. You create and modify the request-interception layer for auth, redirects, i18n, and Sitecore preview mode.
> **Goal**: Generate or update the correct file based on the project's Next.js version.

## Version Routing

1. **Read `package.json` `dependencies.next`** to determine the major version.

2. **If Next.js 16+ is detected**:
   - `middleware.ts` is **deprecated**. Use `proxy.ts` (Node runtime, default export named `proxy`).
   - Recommend running `/kit-proxy` for the canonical workflow.
   - If the project already has `middleware.ts`, offer to rename it to `proxy.ts` and update the exported function name (this skill or the Next.js codemod can perform the rename).
   - If the project must stay on Edge runtime (rare), `middleware.ts` still works in Next.js 16 but is deprecated.

3. **If Next.js 15.x or earlier is detected**:
   - Use the legacy `middleware.ts` workflow below.

## Legacy `middleware.ts` (Next.js 15.x)

Place `middleware.ts` at the project root (next to `app/`):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
```

### Rules (legacy)
- Runs on the **Edge runtime** — only Edge-compatible APIs (no Node `fs`, `path`, `Buffer`; use `crypto.subtle` instead of `crypto`)
- Keep middleware lightweight — it runs on every matched request
- Use `matcher` to narrow scope

## Common Mistakes
- On Next.js 16+, putting Node APIs in `middleware.ts` (Edge-only). Use `proxy.ts` (Node) instead.
- On Next.js 15.x, expecting `proxy.ts` to work — it doesn't exist before 16.

## See Also
- `/kit-proxy` — canonical Next.js 16+ workflow

Target: $ARGUMENTS
