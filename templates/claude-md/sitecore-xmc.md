# Sitecore XM Cloud (SitecoreAI)

## Architecture
- This is a headless CMS project using Sitecore XM Cloud (part of the SitecoreAI platform) with Next.js as the rendering host
- Components receive data through Sitecore Layout Service via `ComponentRendering` props
- Use `@sitecore-jss/sitecore-jss-nextjs` or `@sitecore-content-sdk/nextjs` for component bindings

## Component Patterns

### JSS-based (v21.x)
```typescript
import { Text, RichText, Image, Link } from '@sitecore-jss/sitecore-jss-nextjs';
import type { ComponentRendering, ComponentFields } from '@sitecore-jss/sitecore-jss-nextjs';

interface MyComponentFields extends ComponentFields {
  heading: Field<string>;
  body: Field<string>;
}

type MyComponentProps = {
  rendering: ComponentRendering;
  fields: MyComponentFields;
};

const MyComponent = ({ fields }: MyComponentProps): JSX.Element => (
  <div>
    <Text field={fields.heading} tag="h2" />
    <RichText field={fields.body} />
  </div>
);

export default MyComponent;
```

### Content SDK v2.x
```typescript
import { Text, RichText, Image, Link } from '@sitecore-content-sdk/nextjs';
import type { ComponentRendering, ComponentFields, Field } from '@sitecore-content-sdk/nextjs';

interface MyComponentFields extends ComponentFields {
  heading: Field<string>;
  body: Field<string>;
}

type MyComponentProps = {
  rendering: ComponentRendering;
  fields: MyComponentFields;
};

const MyComponent = ({ fields }: MyComponentProps): JSX.Element => (
  <div>
    <Text field={fields.heading} tag="h2" />
    <RichText field={fields.body} />
  </div>
);

export default MyComponent;
```

## Experience Edge GraphQL
- Use Experience Edge for cross-page queries: navigation, search indexes, content listings
- Endpoint: `https://edge.sitecorecloud.io/api/graphql/v1`
- Authenticate with `sc_apikey` header
- Paginate with `first` and `after` parameters
- Cache responses with appropriate TTL — Edge content is published/read-only

```graphql
query NavigationQuery($rootPath: String!, $language: String!) {
  search(
    where: {
      AND: [
        { name: "_path", value: $rootPath, operator: CONTAINS }
        { name: "_language", value: $language }
        { name: "_templatename", value: "Navigation Item" }
      ]
    }
    first: 50
  ) {
    results {
      name
      url { path }
      ... on NavigationItem {
        title { value }
        link { jsonValue }
      }
    }
  }
}
```

## Sitecore Image Optimization
- Use `next/image` with Sitecore image fields for responsive images
- Extract `src`, `alt`, `width`, `height` from the Sitecore `ImageField` value
- Configure Sitecore CDN domain in `next.config.js` `images.remotePatterns`

```typescript
import NextImage from 'next/image';
import type { ImageField } from '@sitecore-jss/sitecore-jss-nextjs';

function OptimizedImage({ field }: { field: ImageField }) {
  if (!field?.value?.src) return null;
  const { src, alt, width, height } = field.value;
  return (
    <NextImage
      src={src}
      alt={alt || ''}
      width={Number(width) || 800}
      height={Number(height) || 600}
    />
  );
}
```

## Personalization & Variants
- Sitecore delivers personalized component variants via Layout Service
- Personalized pages require SSR — they cannot be statically generated
- Component variants are transparent to the React component — same props, different data
- Test both default and personalized rendering in development

## Environment Setup
Required `.env.local` variables for XM Cloud:
```
SITECORE_API_KEY=your-api-key
SITECORE_API_HOST=https://your-instance.sitecorecloud.io
GRAPH_QL_ENDPOINT=https://edge.sitecorecloud.io/api/graphql/v1
SITECORE_SITE_NAME=your-site-name
```

## Rules
- Always use Sitecore field helpers (`<Text>`, `<RichText>`, `<Image>`, `<Link>`) — never render field values directly
- This enables Experience Editor / Pages inline editing
- Component names must match Sitecore rendering item names exactly
- Place components in `src/components/` following existing naming patterns
- Use `withDatasourceCheck` HOC for components that require a datasource
- GraphQL queries go in `.graphql` files alongside components

## Common Mistakes to Avoid
- Don't render `fields.heading.value` directly — use `<Text field={fields.heading} />`
- Don't hardcode content that should come from Sitecore fields
- Don't forget to register new components in the component factory
- Don't use `getStaticProps` directly — use Sitecore's built-in SSG/SSR integration
- Don't statically generate personalized pages — they need SSR
- Don't forget to configure Sitecore CDN domain in `next.config.js` for image optimization
