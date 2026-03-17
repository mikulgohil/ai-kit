# Error Boundary Generator

Generate comprehensive error handling — error boundaries, loading states, fallback UI, and typed error handling.

## What This Command Does

This command ensures your app never shows a blank white screen to users. It generates error boundaries, loading states, and proper try-catch patterns so failures are handled gracefully everywhere.

## How to Use

```
/error-boundary src/components/ProductList.tsx
```

Or for a route:

```
/error-boundary src/app/checkout/
```

## What Gets Generated

### 1. Route-Level Error Boundary (App Router)

For any route, generate `error.tsx` and `loading.tsx`:

**error.tsx:**
```tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-600 max-w-md text-center">
        We encountered an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
```

**loading.tsx:**
```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]" role="status">
      <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary rounded-full" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

### 2. Component-Level Error Handling

For data-fetching components:

```tsx
interface Props {
  productId: string;
}

async function ProductDetail({ productId }: Props) {
  try {
    const product = await fetchProduct(productId);

    if (!product) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">Product not found</h3>
          <p className="text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      );
    }

    return <ProductCard product={product} />;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return (
      <div role="alert" className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-800">Unable to load product details. Please try refreshing the page.</p>
      </div>
    );
  }
}
```

### 3. Typed Error Handling for API Calls

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields: Record<string, string>,
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Usage in API calls
export async function fetchWithError<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) throw new NotFoundError(url);
    if (response.status === 400) {
      const body = await response.json();
      throw new ValidationError('Validation failed', body.errors);
    }
    throw new ApiError('Request failed', response.status, 'UNKNOWN');
  }

  return response.json() as Promise<T>;
}
```

### 4. Form Error States

```tsx
'use client';

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('loading');
    try {
      await submitContactForm(formData);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof ValidationError
          ? 'Please check the form fields and try again.'
          : 'Something went wrong. Please try again later.'
      );
    }
  }

  if (status === 'success') {
    return <p className="text-green-600">Thanks! We'll be in touch.</p>;
  }

  return (
    <form action={handleSubmit}>
      {status === 'error' && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}
      {/* form fields */}
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## The Rule: Every State Must Be Visible

| State | What the user sees | What to generate |
|-------|-------------------|-----------------|
| Loading | Spinner or skeleton | `loading.tsx` or inline skeleton |
| Success | Data or confirmation | Main component render |
| Empty | Helpful message | Empty state component |
| Error | Friendly error + retry | `error.tsx` or inline error |
| Not Found | 404 message | `not-found.tsx` or conditional |

**Never show a blank screen.** If something can fail, it must have a visible failure state.

Target: $ARGUMENTS
