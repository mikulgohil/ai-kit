# Type Fix

Fix TypeScript issues — replace `any`, add missing types, generate interfaces from data, and improve type safety.

## What This Command Does

This command hunts down type safety problems and fixes them. The `any` type is TypeScript's escape hatch — every `any` is a place where bugs can hide. This command systematically eliminates them.

## How to Use

```
/type-fix src/lib/api.ts
```

Or scan a whole directory:

```
/type-fix src/components/
```

## What Gets Fixed

### 1. Replace `any` with Proper Types

**Before:**
```typescript
function processData(data: any) {
  return data.items.map((item: any) => item.name);
}
```

**After:**
```typescript
interface DataResponse {
  items: Array<{ name: string; id: string }>;
}

function processData(data: DataResponse): string[] {
  return data.items.map((item) => item.name);
}
```

### 2. Generate Types from API Responses

If you have an API call with an untyped response, this command reads the endpoint (or example response) and generates a TypeScript interface.

**Before:**
```typescript
const response = await fetch('/api/products');
const data = await response.json(); // type: any
```

**After:**
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
}

const response = await fetch('/api/products');
const data: ProductsResponse = await response.json();
```

### 3. Fix Missing Null/Undefined Checks

**Before:**
```typescript
function getUserEmail(user: User) {
  return user.profile.email.toLowerCase(); // Crashes if profile or email is null
}
```

**After:**
```typescript
function getUserEmail(user: User): string | null {
  return user.profile?.email?.toLowerCase() ?? null;
}
```

### 4. Add Return Types to Functions

**Before:**
```typescript
function calculateTotal(items: CartItem[]) { // return type not specified
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**After:**
```typescript
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### 5. Fix Type Assertions

**Before:**
```typescript
const element = document.getElementById('root') as HTMLDivElement; // might be null!
element.style.display = 'none'; // potential runtime crash
```

**After:**
```typescript
const element = document.getElementById('root');
if (element instanceof HTMLDivElement) {
  element.style.display = 'none';
}
```

### 6. Use Discriminated Unions for State

**Before:**
```typescript
interface State {
  loading: boolean;
  error: string | null;
  data: Product[] | null;
}
// Problem: loading=false, error=null, data=null is a valid state — what does it mean?
```

**After:**
```typescript
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: Product[] };

// Now TypeScript enforces valid combinations only
```

### 7. Use `import type` for Type-Only Imports

**Before:**
```typescript
import { User, fetchUser } from './user'; // User is only used as a type
```

**After:**
```typescript
import type { User } from './user';
import { fetchUser } from './user';
```

## Common `any` Hiding Spots

| Location | Example | Fix |
|----------|---------|-----|
| Event handlers | `(e: any) => ...` | `(e: React.ChangeEvent<HTMLInputElement>) => ...` |
| API responses | `fetch().then((data: any) => ...)` | Create response interface |
| Third-party libs | `const result: any = lib.doThing()` | Check `@types/` package or write declaration |
| Dynamic objects | `Record<string, any>` | `Record<string, unknown>` then narrow |
| Error catches | `catch (error: any)` | `catch (error: unknown)` then check type |

## Output

For each fix:
1. **Where** — file and line number
2. **Current type** — what it is now
3. **Recommended type** — what it should be
4. **Code change** — the exact diff

Target: $ARGUMENTS
