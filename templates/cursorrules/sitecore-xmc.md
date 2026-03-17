# Sitecore XM Cloud Rules

- Use Sitecore field helpers (`<Text>`, `<RichText>`, `<Image>`, `<Link>`) — never render `.value` directly
- Component names must match Sitecore rendering items exactly
- Use `withDatasourceCheck` HOC for datasource-dependent components
- Register new components in the component factory
- GraphQL queries go in `.graphql` files alongside components
- Don't use `getStaticProps` directly — use Sitecore's SSG/SSR integration
- Don't hardcode content that should come from Sitecore fields