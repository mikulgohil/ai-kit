# Sitecore XM Cloud (SitecoreAI) Rules

- Use Sitecore field helpers (`<Text>`, `<RichText>`, `<Image>`, `<Link>`) — never render `.value` directly
- Component names must match Sitecore rendering items exactly
- Use `withDatasourceCheck` HOC for datasource-dependent components
- Register new components in the component factory
- GraphQL queries go in `.graphql` files alongside components
- Don't use `getStaticProps` directly — use Sitecore's SSG/SSR integration
- Don't hardcode content that should come from Sitecore fields
- Content SDK v2.x: import from `@sitecore-content-sdk/nextjs` instead of `@sitecore-jss/sitecore-jss-nextjs`
- Experience Edge: use `first`/`after` for pagination, cache responses appropriately
- Personalized pages require SSR — do not statically generate them
- Use `next/image` with Sitecore image fields — configure CDN domain in `next.config.js`
