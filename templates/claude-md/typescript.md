# TypeScript

## Conventions
- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes, `type` for unions and intersections
- Use `unknown` over `any` — narrow types with type guards
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining why

## Patterns
- Define prop types directly above or alongside the component
- Use `satisfies` for type-safe object literals when the type is known
- Use discriminated unions for state management (loading/success/error)
- Prefer `as const` for literal type inference
- Use branded types for domain identifiers: `type UserId = string & { readonly __brand: 'UserId' }`

## Sitecore Field Typing
```typescript
// Typed component props with Sitecore fields
import type { Field, ImageField, LinkField, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

interface HeroBannerFields {
  heading: Field<string>;
  body: Field<string>;
  image: ImageField;
  cta: LinkField;
}

type HeroBannerProps = {
  rendering: ComponentRendering;
  fields: HeroBannerFields;
};

// Type guard for checking if a field has a value
function hasFieldValue<T>(field: Field<T> | undefined): field is Field<T> & { value: T } {
  return field !== undefined && field.value !== undefined && field.value !== null;
}
```

## Next.js Typing
```typescript
// Page props (App Router)
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Layout props
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Server Action return type
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Metadata generation
import type { Metadata } from 'next';
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { ... }
```

## Tailwind Type Safety
```typescript
// Typed Tailwind config extensions
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { primary: '#...', secondary: '#...' } },
    },
  },
};
```

## Validation with Zod
```typescript
import { z } from 'zod';

// Define schema once — derive TypeScript type from it
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short'),
});

type ContactForm = z.infer<typeof ContactFormSchema>;
```

## Common Mistakes to Avoid
- Don't use `any` to bypass type errors — fix the underlying type issue
- Don't create unnecessary generic types — use them only when the type genuinely varies
- Don't duplicate types — import from a shared types file
- Don't use optional chaining as a substitute for proper null checking
- Don't use `as` type assertions when a type guard or `satisfies` would be safer
