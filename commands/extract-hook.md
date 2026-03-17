# Extract Hook

Extract logic from a component into a reusable custom React hook.

## What This Command Does

When a component has too much logic mixed with UI, this command identifies what should be a custom hook, creates the hook file, moves the logic, and updates the component to use the hook — all while maintaining the same behavior.

## How to Use

```
/extract-hook src/components/ProductList.tsx — extract the filtering and pagination logic
```

Or let the AI identify what to extract:

```
/extract-hook src/components/Dashboard.tsx
```

## When to Extract a Hook

Extract when you see:
- **3+ `useState` calls** in one component
- **`useEffect` with complex logic** (data fetching, subscriptions, timers)
- **Same state pattern** in 2+ components (duplicate logic)
- **Component is hard to test** because logic and UI are tangled

## Example: Full Extraction

### Before — Everything in the component

```tsx
// ProductList.tsx — 150 lines, mixing logic and UI
'use client';

import { useState, useEffect, useMemo } from 'react';

export function ProductList({ categoryId }: { categoryId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/products?category=${categoryId}&page=${page}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryId, page]);

  const filtered = useMemo(() =>
    products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : a.price - b.price
      ),
    [products, search, sortBy]
  );

  // ... 80 lines of JSX rendering
}
```

### After — Logic extracted into a hook

```tsx
// hooks/useProducts.ts
'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseProductsOptions {
  categoryId: string;
}

interface UseProductsReturn {
  products: Product[];
  filtered: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  sortBy: 'name' | 'price';
  setSortBy: (value: 'name' | 'price') => void;
  page: number;
  setPage: (value: number) => void;
}

export function useProducts({ categoryId }: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/products?category=${categoryId}&page=${page}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [categoryId, page]);

  const filtered = useMemo(() =>
    products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : a.price - b.price
      ),
    [products, search, sortBy]
  );

  return { products, filtered, loading, error, search, setSearch, sortBy, setSortBy, page, setPage };
}
```

```tsx
// ProductList.tsx — Now just UI
'use client';

import { useProducts } from '@/hooks/useProducts';

export function ProductList({ categoryId }: { categoryId: string }) {
  const { filtered, loading, error, search, setSearch, sortBy, setSortBy, page, setPage } =
    useProducts({ categoryId });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} />
      <SortSelector value={sortBy} onChange={setSortBy} />
      <ProductGrid products={filtered} />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
}
```

## Output

1. New hook file with typed interface for parameters and return value
2. Updated component that imports and uses the hook
3. Test file for the hook (`useHookName.test.ts`)

## Rules

- Hook name starts with `use` (React convention)
- Hook returns a typed object (not an array — objects are easier to destructure selectively)
- Hook file goes in `hooks/` directory (or colocated if single-use)
- Component only handles rendering after extraction
- Behavior stays identical — extract, don't enhance

Target: $ARGUMENTS
