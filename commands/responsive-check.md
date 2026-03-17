# Responsive Check

Audit a component or page for responsive design issues.

## What This Command Does

Checks your code for common responsive design problems — missing breakpoints, hardcoded widths, non-fluid layouts, and touch target sizes. Catches issues that typically only get found during QA on real devices.

## How to Use

```
/responsive-check src/components/ProductGrid.tsx
```

Or for a full page:

```
/responsive-check src/app/products/page.tsx
```

## What Gets Checked

### 1. Hardcoded Dimensions

**Problem:** Fixed pixel widths that break on smaller screens.

**Example — Bad:**
```tsx
<div className="w-[960px]">          {/* Fixed width — overflows on mobile */}
  <img style={{ width: '400px' }} /> {/* Fixed width image */}
</div>
```

**Example — Good:**
```tsx
<div className="w-full max-w-[960px] mx-auto">  {/* Fluid with max */}
  <Image className="w-full" />                     {/* Fluid image */}
</div>
```

### 2. Missing Breakpoint Coverage

**Problem:** Layout looks good on desktop but breaks on mobile/tablet.

**Check for:**
- Flex/grid layouts without responsive modifiers
- Text sizes that are too large on mobile
- Padding/margin that doesn't scale

**Example — Missing breakpoints:**
```tsx
<div className="grid grid-cols-4 gap-8"> {/* 4 columns on ALL screens */}
```

**Example — Proper responsive grid:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
```

### 3. Touch Target Sizes

**Problem:** Buttons and links too small to tap on mobile (minimum: 44x44px per WCAG).

**Example — Too small:**
```tsx
<button className="p-1 text-xs">×</button>  {/* ~20x20px — too small to tap */}
```

**Example — Accessible:**
```tsx
<button className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
  <span className="text-xs">×</span>
</button>
```

### 4. Overflow Issues

**Problem:** Content overflows its container on small screens.

**Common culprits:**
- Long text without `break-words` or `truncate`
- Tables without horizontal scroll wrapper
- Absolutely positioned elements that go off-screen
- Images without `max-width: 100%`

**Example — Fix for tables:**
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* table content */}
  </table>
</div>
```

### 5. Navigation Patterns

**Problem:** Desktop navigation that doesn't adapt to mobile.

**Check for:**
- Horizontal nav without mobile hamburger menu
- Dropdown menus that require hover (no hover on touch devices)
- Navigation links too close together on mobile

### 6. Typography Scaling

**Problem:** Text too large or too small at different breakpoints.

**Example — Responsive text:**
```tsx
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Page Title
</h1>
<p className="text-sm md:text-base">
  Body text that scales appropriately
</p>
```

### 7. Image Handling

**Check for:**
- Images without `sizes` prop in `next/image`
- Same image served for mobile and desktop (wasted bandwidth)
- Missing `loading="lazy"` for below-fold images

**Example — Proper responsive image:**
```tsx
<Image
  src="/hero.jpg"
  alt="Hero banner"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  priority  // only for above-fold images
/>
```

## Breakpoint Reference (Tailwind)

| Prefix | Min Width | Typical Device |
|--------|-----------|---------------|
| (none) | 0px | Mobile (default — design mobile-first) |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

## Output

For each issue found:
1. **What's wrong** — the specific problem
2. **Where** — file and line
3. **Affected screens** — which device sizes break
4. **Fix** — the Tailwind classes or code to add

Target: $ARGUMENTS
