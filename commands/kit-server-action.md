# Server Action

> **Role**: You are a Next.js App Router specialist. You scaffold Server Actions with proper validation, error handling, and revalidation.
> **Goal**: Create a type-safe Server Action following Next.js best practices.

## Mandatory Steps

1. **Determine Use Case** — Ask if not clear:
   - Form submission (use `<form action={...}>`)
   - Programmatic mutation (call from event handler or other Server Action)
   - Data revalidation only (on-demand ISR trigger)

2. **Detect Project Next.js Version** — Read `package.json` `dependencies.next`:
   - **Next.js 16+**: use the new revalidation APIs (`revalidateTag(tag, cacheLife)`, `updateTag()`, `refresh()`).
   - **Next.js 15.x**: use the legacy single-arg `revalidateTag(tag)` form.

3. **Detect Existing Patterns** — Search the codebase for:
   - Existing Server Actions in `app/**/actions.ts` files
   - Zod schemas in use for validation
   - Existing revalidation patterns

4. **Generate the Server Action** — Following this pattern (Next.js 16+):

```typescript
'use server';

import { revalidateTag, updateTag, refresh } from 'next/cache';
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

    // Choose ONE of the following based on UX requirements:

    // (a) Read-your-writes — user must see their change immediately
    updateTag('affected-tag');

    // (b) Stale-while-revalidate — eventual consistency is fine
    // revalidateTag('affected-tag', 'max');

    // (c) Refresh uncached data displayed elsewhere on the page
    // refresh();

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
```

For **Next.js 15.x** (legacy), replace the revalidation block with:

```typescript
import { revalidatePath, revalidateTag } from 'next/cache';
// ...
revalidatePath('/affected-route');
// or
revalidateTag('affected-tag');
```

5. **Generate the Form Component** (if form-based):

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

6. **Wire Up Revalidation (Next.js 16+)** — Choose the right strategy:

| API | When to use |
|---|---|
| `updateTag(tag)` | Server Actions only. User must see their write immediately (forms, settings, edits). |
| `revalidateTag(tag, 'max')` | Eventual consistency OK. Background SWR revalidation. Static-ish content. |
| `revalidateTag(tag, 'hours' \| 'days' \| { expire: N })` | Custom SWR profile. |
| `refresh()` | Server Actions only. Refresh uncached data (notification counts, live metrics) without touching cache. |
| `revalidatePath('/path')` | Force re-render of a route without targeting tags. Still available. |

For Next.js 15.x: only `revalidatePath` and single-arg `revalidateTag(tag)` are available.

## Rules

- Always use `'use server'` directive
- Always validate input with Zod — never trust form data
- Return structured results — never throw errors from Server Actions
- Keep Server Actions in dedicated `actions.ts` files, colocated with the route
- Use `useActionState` for form state, not manual useState + useEffect
- On Next.js 16+, `cookies()`/`headers()`/`draftMode()` are async — `await` them
- On Next.js 16+, do not use the single-argument `revalidateTag(tag)` form — it's deprecated
- Prefer `updateTag()` over `revalidateTag()+router.refresh()` patterns when you want read-your-writes

Target: $ARGUMENTS
