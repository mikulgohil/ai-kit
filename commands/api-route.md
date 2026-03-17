# API Route Generator

Scaffold a Next.js API route or Server Action with proper validation, error handling, typing, and auth.

## What This Command Does

This command generates production-ready API endpoints that follow security and TypeScript best practices out of the box. Instead of writing boilerplate from scratch (and forgetting validation or error handling), this gives you a complete, safe starting point.

## How to Use

```
/api-route POST /api/orders — create a new order with items, shipping address, and payment method
```

Or for a server action:

```
/api-route server-action — submit contact form with name, email, and message
```

## Questions (ask all of these)

1. What HTTP method(s)? (GET, POST, PUT, DELETE, or multiple)
2. What does this endpoint do? (1-2 sentence description)
3. What data does it accept? (request body / query params)
4. What does it return? (response shape)
5. Does it need authentication? (public, logged-in user, admin only)
6. Is it a Server Action or API Route?
7. What external services does it call? (database, third-party API, etc.)

## What Gets Generated

### 1. Input Validation Schema (Zod)

Every API route starts with a schema that defines exactly what input is accepted.

**Example:**
```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1, 'Order must have at least one item'),
  shippingAddress: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2, 'Use ISO country code'),
  }),
  paymentMethod: z.enum(['credit_card', 'paypal', 'bank_transfer']),
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
```

**Why this matters:** Without validation, your API accepts anything — including malicious input. Zod validates AND gives you TypeScript types from the same source.

### 2. Route Handler with Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const input = CreateOrderSchema.parse(body);

    // 2. Check authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 3. Business logic
    const order = await createOrder(input, session.userId);

    // 4. Return typed response
    return NextResponse.json(
      { data: order },
      { status: 201 }
    );
  } catch (error) {
    // 5. Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // 6. Generic error (don't leak internals)
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Response Types

```typescript
// types/api.ts
interface ApiSuccess<T> {
  data: T;
}

interface ApiError {
  error: string;
  details?: unknown;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### 4. Server Action Alternative

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export async function submitContactForm(formData: FormData) {
  const input = ContactFormSchema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  await sendEmail(input);
  revalidatePath('/contact');
  return { success: true };
}
```

## Common Mistakes This Prevents

| Mistake | What happens | How this command prevents it |
|---------|-------------|----------------------------|
| No input validation | Attacker sends malicious data | Zod schema validates everything |
| `any` typed request body | No TypeScript protection | Types inferred from Zod schema |
| Generic `catch (e)` | Swallows real errors | Specific handlers for each error type |
| Stack traces in response | Leaks internal details | Generic message for 500 errors |
| Missing auth check | Unauthorized access | Auth check included by default |
| No error status codes | Client can't handle failures | Proper HTTP status codes |

Target: $ARGUMENTS
