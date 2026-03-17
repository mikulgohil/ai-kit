# Next.js Pages Router Rules

- Use `getStaticProps` for static data, `getServerSideProps` for per-request data
- API routes in `pages/api/` with proper HTTP method checking
- Use `next/head` for page metadata, `next/link` for navigation
- Client-side data: use SWR or React Query, not raw `useEffect` + `fetch`
- Handle `fallback` in `getStaticPaths` for dynamic routes