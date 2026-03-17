# Design Token Reference

Read and display this project's design tokens so you know what's available before implementing any design.

## Instructions

1. Find the design token source:
   - Check `tailwind.config.ts` or `tailwind.config.js` for custom theme values
   - Check `src/app/globals.css` for `@theme` block (Tailwind v4)
   - Check `theme-config.ts` if it exists
   - Check `tokens.json` or `tokens/` directory (Tokens Studio)

2. Display tokens organized by category:

### Colors
List all custom color tokens (semantic names → values)

### Spacing
List custom spacing scale if defined, or confirm default Tailwind scale

### Typography
List custom font sizes, weights, line heights, font families

### Border Radius
List custom radius tokens

### Shadows
List custom shadow tokens

### Breakpoints
List responsive breakpoints (default or custom)

3. Show usage examples:
```
Color:     bg-primary-500, text-neutral-800, border-accent-300
Spacing:   p-4 (16px), gap-6 (24px), mt-12 (48px)
Type:      text-h1, text-b1, text-b2-bold
Radius:    rounded-card (8px), rounded-button (0px)
```

4. Flag any gaps: tokens that might be expected but aren't defined

Target: $ARGUMENTS
