# Migration Helper

Guided migration assistant for framework upgrades and major refactors.

## What This Command Does

Migrations are the most error-prone tasks in frontend development — upgrading Next.js, moving from Pages Router to App Router, upgrading Tailwind, or switching Sitecore SDKs. This command provides a step-by-step checklist with automated code changes where possible.

## How to Use

```
/migrate nextjs 14 to 15
```

```
/migrate pages-router to app-router
```

```
/migrate tailwind v3 to v4
```

```
/migrate sitecore-jss to content-sdk
```

## Supported Migrations

### Next.js Version Upgrade

1. Read the official Next.js upgrade guide for the target version
2. Check for breaking changes in your dependencies
3. Update `next` package version
4. Run `npx @next/codemod@latest <migration-name>` if available
5. Fix TypeScript errors from new strict types
6. Test all routes and API endpoints
7. Verify build succeeds (`npm run build`)

**Common breaking changes to check:**
- New default behaviors (e.g., `fetch` caching changes in Next.js 15)
- Removed or renamed APIs
- Changed TypeScript requirements
- Updated minimum Node.js version

### Pages Router → App Router

**Step-by-step process:**

1. **Audit existing pages** — list all pages in `pages/` and their data fetching methods
2. **Create `app/` directory** — start with layout.tsx
3. **Migrate one route at a time** — start with the simplest page
4. **Convert data fetching:**

**Before (Pages Router):**
```tsx
// pages/products/[id].tsx
export async function getServerSideProps({ params }) {
  const product = await fetchProduct(params.id);
  return { props: { product } };
}

export default function ProductPage({ product }) {
  return <ProductDetail product={product} />;
}
```

**After (App Router):**
```tsx
// app/products/[id]/page.tsx
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  return <ProductDetail product={product} />;
}
export default ProductPage;
```

5. **Move client-side logic to Client Components** — add `'use client'` only where needed
6. **Update layouts** — move shared UI from `_app.tsx` to `layout.tsx`
7. **Migrate API routes** — `pages/api/` → `app/api/.../route.ts`
8. **Delete old pages** — once all routes are migrated and tested

### Tailwind v3 → v4

1. Update `tailwindcss` package to v4
2. Replace `tailwind.config.js` with CSS `@theme` directive in `globals.css`
3. Update PostCSS config if needed
4. Replace deprecated utilities
5. Test responsive breakpoints

**Before (v3 — tailwind.config.js):**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#444444',
      },
    },
  },
};
```

**After (v4 — globals.css):**
```css
@import "tailwindcss";

@theme {
  --color-primary: #0066cc;
  --color-secondary: #444444;
}
```

### Sitecore JSS → Content SDK

1. Replace `@sitecore-jss/sitecore-jss-nextjs` with `@sitecore-content-sdk/nextjs`
2. Update component imports
3. Update data fetching patterns
4. Verify GraphQL queries still work
5. Test all Sitecore components in connected mode

## Rules

- **One migration at a time** — don't combine framework upgrade with feature work
- **Create a migration branch** — never migrate on main
- **Run full test suite after each step** — catch regressions early
- **Keep both versions working during transition** — don't break the build mid-migration
- **Document what changed** — add entry to `docs/decisions-log.md`

Target: $ARGUMENTS
