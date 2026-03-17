# Accessibility Audit

Scan a component or page for accessibility (a11y) violations and fix them.

## What This Command Does

This command checks your code against WCAG 2.1 AA standards — the legal minimum for most websites. It catches issues that screen readers, keyboard users, and people with visual impairments would encounter.

## How to Use

```
/accessibility-audit src/components/ProductCard.tsx
```

Or for an entire page:

```
/accessibility-audit src/app/checkout/page.tsx
```

## What Gets Checked

### 1. Semantic HTML
Look for these violations:
- `<div>` or `<span>` used as buttons → should be `<button>`
- `<div>` used for navigation → should be `<nav>`
- `<div>` used for lists → should be `<ul>` / `<ol>`
- Missing `<main>`, `<header>`, `<footer>` landmarks
- Headings that skip levels (e.g., `<h1>` then `<h3>` with no `<h2>`)

**Example — Bad:**
```tsx
<div onClick={handleClick} className="btn">Submit</div>
```

**Example — Good:**
```tsx
<button onClick={handleClick} className="btn">Submit</button>
```

### 2. ARIA Attributes
- Interactive elements without accessible names (`aria-label`, `aria-labelledby`)
- Icon-only buttons missing `aria-label`
- Custom dropdowns/modals missing `role`, `aria-expanded`, `aria-haspopup`
- Missing `aria-live` regions for dynamic content (toast notifications, loading states)

**Example — Bad:**
```tsx
<button onClick={toggleMenu}>
  <ChevronIcon />
</button>
```

**Example — Good:**
```tsx
<button onClick={toggleMenu} aria-label="Toggle navigation menu" aria-expanded={isOpen}>
  <ChevronIcon aria-hidden="true" />
</button>
```

### 3. Keyboard Navigation
- Click handlers without keyboard equivalents (`onKeyDown`)
- Custom components that can't be focused (`tabIndex` missing)
- Focus traps in modals (focus should stay inside when open)
- Missing visible focus indicators (`:focus-visible` styles)
- Tab order that doesn't match visual order

### 4. Images and Media
- `<img>` tags without `alt` text
- Decorative images that should have `alt=""`
- `next/image` components missing `alt`
- Videos without captions or transcripts
- SVG icons not properly hidden from screen readers

**Example — Bad:**
```tsx
<Image src="/hero.jpg" width={800} height={400} />
```

**Example — Good:**
```tsx
<Image src="/hero.jpg" width={800} height={400} alt="Shipping container being loaded onto a cargo vessel at Dubai port" />
```

### 5. Color and Contrast
- Text that doesn't meet 4.5:1 contrast ratio (normal text)
- Large text that doesn't meet 3:1 contrast ratio
- Information conveyed only through color (e.g., red = error, green = success without text/icon)
- Tailwind classes that might produce low contrast (`text-gray-400` on white background)

### 6. Forms
- `<input>` fields without associated `<label>` elements
- Error messages not linked to fields (`aria-describedby`)
- Required fields not marked (`aria-required="true"` or `required`)
- Form submission feedback not announced to screen readers

**Example — Bad:**
```tsx
<input type="email" placeholder="Enter your email" />
<span className="text-red-500">Invalid email</span>
```

**Example — Good:**
```tsx
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <span id="email-error" role="alert" className="text-red-500">Please enter a valid email address</span>}
```

## Output Format

For each issue found:
1. **What's wrong** — the specific violation
2. **Where** — file path and line number
3. **Why it matters** — who is affected and how
4. **Fix** — the exact code change needed
5. **WCAG reference** — which guideline it violates (e.g., WCAG 2.1 SC 1.1.1)

## Common Mistakes This Catches

| Mistake | How Often | Impact |
|---------|-----------|--------|
| Missing alt text on images | Very common | Screen readers say "image" with no context |
| Div used as button | Common | Keyboard users can't activate it |
| No focus management in modals | Common | Keyboard users get trapped or lost |
| Color-only error indication | Common | Colorblind users can't see errors |
| Missing form labels | Very common | Screen readers don't know what the field is for |

Target: $ARGUMENTS
