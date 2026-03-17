# Sitecore XM Cloud

## Architecture
- This is a headless CMS project using Sitecore XM Cloud with Next.js as the rendering host
- Components receive data through Sitecore Layout Service via `ComponentRendering` props
- Use `@sitecore-jss/sitecore-jss-nextjs` or `@sitecore-content-sdk/nextjs` for component bindings

## Component Patterns
```typescript
// Standard Sitecore component pattern
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