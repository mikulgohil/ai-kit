# Sitecore Debug

Debug Sitecore XM Cloud integration issues — layout service, placeholders, field mapping, and GraphQL.

## What This Command Does

Sitecore XM Cloud has unique debugging challenges. This command provides structured debugging workflows for the most common XM Cloud integration issues that waste hours of developer time.

## How to Use

```
/sitecore-debug — component not rendering in placeholder
```

```
/sitecore-debug src/components/HeroBanner.tsx — fields coming back empty
```

## Common Issues & Debugging Steps

### 1. Component Not Rendering

**Symptoms:** Placeholder shows nothing, component doesn't appear on page.

**Debugging checklist:**
```
□ Is the component registered in componentFactory?
  Check: src/temp/componentFactory.ts or component-builder output
  Fix: Run the component generation/registration script

□ Does the component name match the rendering name in Sitecore?
  Check: Component name in code vs rendering item name in Sitecore
  Common mistake: "HeroBanner" in code but "Hero Banner" in Sitecore (spaces!)

□ Is the component added to the placeholder in Sitecore?
  Check: Layout Service response for the page
  Debug: Visit /api/layout/render?item=/your-page&sc_apikey=YOUR_KEY

□ Is the placeholder name correct?
  Check: Placeholder key in your layout vs what Sitecore expects
  Common mistake: "main-content" vs "main_content" (dash vs underscore)

□ Is dynamic import working?
  Check: Browser console for chunk loading errors
  Fix: Verify the dynamic import path is correct
```

### 2. Fields Coming Back Empty/Undefined

**Symptoms:** Component renders but field values are missing.

**Debugging checklist:**
```
□ Check the Layout Service response directly:
  URL: {SITECORE_API_HOST}/sitecore/api/layout/render/jss
       ?item=/your-page&sc_apikey=YOUR_KEY&sc_lang=en

□ Are field names correct? (case-sensitive!)
  Sitecore field: "Hero Title"
  Code field name: "Hero Title" (must match exactly, including spaces)

□ Are you using the right field helper?
  Single-line text → <Text field={fields['Hero Title']} />
  Rich text        → <RichText field={fields['Hero Title']} />
  Image            → <Image field={fields['Hero Image']} />
  Link             → <Link field={fields['Hero Link']} />
  Date             → fields['Event Date']?.value

□ Is the rendering item configured with the right datasource template?
  Check: Sitecore > Rendering Item > Datasource Template field

□ Are you in connected mode?
  Check: .env has correct SITECORE_API_HOST and SITECORE_API_KEY
  Test: curl your layout service URL — does it return data?
```

**Example — Common field access pattern:**

```tsx
import { Text, RichText, Image, Link } from '@sitecore-jss/sitecore-jss-nextjs';

function HeroBanner({ fields }: HeroBannerProps) {
  return (
    <section>
      {/* Always use field helpers — they handle editing mode */}
      <Text tag="h1" field={fields['Hero Title']} />
      <RichText field={fields['Hero Description']} />
      <Image field={fields['Hero Image']} />
      <Link field={fields['CTA Link']}>
        <Text field={fields['CTA Text']} />
      </Link>
    </section>
  );
}
```

### 3. GraphQL Query Returns No Data

**Debugging steps:**

```
□ Test your query in GraphQL Playground first:
  URL: {SITECORE_API_HOST}/sitecore/api/graph/edge
  Headers: sc_apikey: YOUR_KEY

□ Check the query path — is the item path correct?
  path: "/sitecore/content/your-site/home" (full Sitecore path)

□ Check language — is sc_lang set correctly?
  Default is "en" — if your content is in another language, specify it

□ Are you querying the right database?
  Connected mode uses "web" (published)
  Disconnected uses mock data

□ Is the content published?
  Sitecore content must be published to "web" database to appear in API
```

### 4. Experience Editor / Pages Editor Not Working

**Common issues:**

```
□ Component renders in preview but not in editor:
  - Check if component uses 'use client' — editor needs server rendering
  - Verify field helpers are used (not raw field.value access)

□ Field editing doesn't work (can't click to edit):
  - Field helpers must render the field directly, not extract .value
  Bad:  <h1>{fields['Title'].value}</h1>
  Good: <Text tag="h1" field={fields['Title']} />

□ Component disappears in editor:
  - Check for hydration mismatches (SSR vs client render differences)
  - Check browser console for React hydration errors
```

### 5. Environment & Connection Issues

```
□ "Unauthorized" errors:
  - Check SITECORE_API_KEY is correct
  - Check the API key is published in Sitecore
  - Verify the API key has the correct CORS origins

□ CORS errors:
  - Add your dev URL (http://localhost:3000) to the API key's allowed origins
  - In Sitecore: /sitecore/system/Settings/Services/API Keys

□ "Network error" in development:
  - Is the Sitecore instance running?
  - Can you reach SITECORE_API_HOST from your machine?
  - Check VPN if the instance is behind a corporate network
```

## Quick Debug Command

When all else fails, dump the layout service response to see exactly what Sitecore is returning:

```typescript
// Temporary debug — add to your page component
console.log('Layout data:', JSON.stringify(layoutData, null, 2));
```

Check for: field names, placeholder names, component names, data structure.

Target: $ARGUMENTS
