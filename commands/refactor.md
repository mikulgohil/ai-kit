# Refactor

Guided refactoring that improves code quality without changing behavior.

## What This Command Does

This command helps you safely restructure code — split large components, extract hooks, remove duplication, fix prop drilling, and improve readability. It ensures the refactored code does exactly the same thing as before, just better organized.

## How to Use

```
/refactor src/components/Checkout/CheckoutForm.tsx
```

With a specific goal:

```
/refactor src/components/Checkout/CheckoutForm.tsx — extract the validation logic into a custom hook
```

## Questions (answer before refactoring)

1. What file or module needs refactoring?
2. What's the main problem? (too large, duplicated logic, prop drilling, hard to test, etc.)
3. Are there tests for this code? (critical — tests verify the refactor didn't break anything)
4. Is this code actively being worked on by others? (avoid merge conflicts)

## Refactoring Patterns

### 1. Split Large Components (>200 lines)

**When to use:** A component does too many things — fetches data, handles state, renders complex UI.

**Before:**
```tsx
// CheckoutForm.tsx — 350 lines doing everything
export function CheckoutForm() {
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState({});
  const [payment, setPayment] = useState({});
  const [errors, setErrors] = useState({});

  // 50 lines of validation logic...
  // 30 lines of API calls...
  // 200 lines of JSX...
}
```

**After:**
```tsx
// CheckoutForm.tsx — orchestrator only
export function CheckoutForm() {
  const { items } = useCart();
  const { address, setAddress, errors } = useShippingForm();

  return (
    <div>
      <CartSummary items={items} />
      <ShippingForm address={address} onChange={setAddress} errors={errors} />
      <PaymentForm />
      <OrderButton />
    </div>
  );
}
```

### 2. Extract Custom Hooks

**When to use:** Component has complex state logic, effects, or repeated patterns.

**Before:**
```tsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?page=${page}`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [page]);

  // ... render logic
}
```

**After:**
```tsx
// useProducts.ts — reusable hook
function useProducts(page: number) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { /* same fetch logic */ }, [page]);

  return { products, loading, error };
}

// ProductList.tsx — clean component
function ProductList() {
  const [page, setPage] = useState(1);
  const { products, loading, error } = useProducts(page);
  // ... render logic only
}
```

### 3. Remove Prop Drilling

**When to use:** A prop is passed through 3+ levels of components without being used in the middle layers.

**Before:**
```tsx
<App user={user}>
  <Layout user={user}>          {/* doesn't use user, just passes it */}
    <Sidebar user={user}>       {/* doesn't use user, just passes it */}
      <UserAvatar user={user} /> {/* actually uses user */}
    </Sidebar>
  </Layout>
</App>
```

**After:** Use Context or move the component closer to where the data is used.

### 4. Consolidate Duplicate Logic

**When to use:** Same logic appears in 2+ places.

**Before:**
```tsx
// In ComponentA
const fullName = `${user.firstName} ${user.lastName}`.trim();

// In ComponentB (same logic repeated)
const displayName = `${user.firstName} ${user.lastName}`.trim();
```

**After:**
```tsx
// utils/user.ts
export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
```

### 5. Simplify Conditional Rendering

**When to use:** Nested ternaries or complex if/else in JSX.

**Before:**
```tsx
return (
  <div>
    {loading ? (
      <Spinner />
    ) : error ? (
      <ErrorMessage error={error} />
    ) : data.length === 0 ? (
      <EmptyState />
    ) : (
      <DataTable data={data} />
    )}
  </div>
);
```

**After:**
```tsx
if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (data.length === 0) return <EmptyState />;
return <DataTable data={data} />;
```

## Rules

- **Never change behavior** — refactoring only changes structure, not functionality
- **Run tests before AND after** — confirm nothing broke
- **One refactoring at a time** — don't combine "extract hook" with "add new feature"
- **Keep the diff reviewable** — if the refactor touches >7 files, break it into smaller PRs

Target: $ARGUMENTS
