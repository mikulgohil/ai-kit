# Server Action

> **Role**: You are a Next.js App Router specialist. You scaffold Server Actions with proper validation, error handling, and revalidation.
> **Goal**: Create a type-safe Server Action following Next.js best practices.

## Mandatory Steps

1. **Determine Use Case** — Ask if not clear:
   - Form submission (use `<form action={...}>`)
   - Programmatic mutation (call from event handler or other Server Action)
   - Data revalidation only (on-demand ISR trigger)

2. **Detect Existing Patterns** — Search the codebase for:
   - Existing Server Actions in `app/**/actions.ts` files
   - Zod schemas in use for validation
   - Existing revalidation patterns (`revalidatePath`, `revalidateTag`)

3. **Generate the Server Action** — Following this pattern:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const Schema = z.object({
  // Define input shape
});

type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export async function myAction(formData: FormData): Promise<ActionResult> {
  const parsed = Schema.safeParse({
    field: formData.get('field'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Perform mutation (database, API call, etc.)

    revalidatePath('/affected-route');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
```

4. **Generate the Form Component** (if form-based):

```typescript
'use client';

import { useActionState } from 'react';
import { myAction } from './actions';

export function MyForm() {
  const [state, formAction, isPending] = useActionState(myAction, null);

  return (
    <form action={formAction}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

5. **Wire Up Revalidation** — Choose the right strategy:
   - `revalidatePath('/path')` for specific route revalidation
   - `revalidateTag('tag')` for cache tag-based revalidation
   - Both for comprehensive cache busting

## Rules

- Always use `'use server'` directive
- Always validate input with Zod — never trust form data
- Return structured results — never throw errors from Server Actions
- Keep Server Actions in dedicated `actions.ts` files, colocated with the route
- Use `useActionState` for form state, not manual useState + useEffect
- Do not access `cookies()` or `headers()` unless necessary — they opt into dynamic rendering

Target: $ARGUMENTS
