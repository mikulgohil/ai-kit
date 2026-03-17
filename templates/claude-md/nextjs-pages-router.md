# Next.js Pages Router

## Conventions
- Use `getStaticProps` for static data, `getServerSideProps` for per-request data
- Keep API routes in `pages/api/` — use proper HTTP method checking
- Use `next/head` for page-level `<title>` and `<meta>` tags
- Use `next/link` and `next/image` for navigation and images

## Data Fetching
- `getStaticProps` → build-time data (use `revalidate` for ISR)
- `getServerSideProps` → per-request server-side data
- `getStaticPaths` → pre-render dynamic routes
- Client-side: use SWR or React Query, not raw `useEffect` + `fetch`

## File Structure
```
pages/
  _app.tsx            ← App wrapper (providers, global styles)
  _document.tsx       ← Custom HTML document
  index.tsx           ← Home page
  [slug].tsx          ← Dynamic routes
  api/                ← API routes
```

## Common Mistakes to Avoid
- Don't mix App Router and Pages Router patterns unless this is a hybrid project
- Don't return large payloads from `getServerSideProps` — serialize only what the page needs
- Don't forget to handle the `fallback` prop in `getStaticPaths`