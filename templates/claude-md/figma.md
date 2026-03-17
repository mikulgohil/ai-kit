# Figma-to-Code Workflow

## Before Writing Any Code from a Figma Design

1. **Extract design context** — Use Figma MCP `get_design_context` with the Figma node URL to get structured layout, colors, typography, and spacing
2. **Get a visual reference** — Use `get_screenshot` to see what you're building
3. **Identify reusable components** — Check `src/components/` for existing components that match parts of the design. Reuse, don't recreate.
4. **Map design tokens** — Match Figma colors, spacing, and typography to the project's Tailwind theme tokens. Never hardcode values.

## Design Token Rules

- **Colors**: Use semantic tokens (`bg-primary-500`, `text-neutral-800`) — never hardcode hex values (`#3b82f6`)
- **Spacing**: Use scale tokens (`p-4`, `gap-6`, `mt-12`) — never use arbitrary values (`mt-[47px]`)
- **Typography**: Use type scale tokens (`text-h1`, `text-b1`) — never set raw `font-size`
- **Border radius**: Use named tokens (`rounded-card`, `rounded-button`) — not arbitrary `rounded-[8px]`
- **Shadows/Effects**: Use predefined shadow tokens if available

If a Figma value doesn't match any existing token, use the **nearest** token — don't create arbitrary values. Flag to the developer that the design uses an off-scale value.

## Component Mapping

Before creating a new component:
1. Read existing components in `src/components/` to check for matches
2. Map Figma component variants to React props (e.g., Figma variant "Style=Primary" → `variant="primary"`)
3. Match Figma layer names to semantic HTML elements (`<nav>`, `<section>`, `<article>`, `<button>`)
4. Preserve Figma Auto Layout as flexbox/grid — do not use absolute positioning
5. Figma's "Spacing between items" = CSS `gap`, Figma's "Padding" = CSS `padding`

## Content Container Pattern

Full-width backgrounds with constrained content:
```tsx
<div className="w-full bg-neutral-100">
  <div className="max-w-[1320px] mx-auto w-full px-4 md:px-6 lg:px-0">
    {/* content */}
  </div>
</div>
```

## Responsive Implementation

- **Never assume** mobile is "desktop but smaller" — check every breakpoint in Figma separately
- Mobile may have completely different layouts (row → stack, hidden elements, different spacing)
- Implement mobile-first: base styles → `sm:` → `md:` → `lg:` → `xl:`
- Verify all breakpoints independently against Figma

## Visual Verification (Mandatory)

After generating a component from Figma:
1. Compare your output visually against the Figma design
2. Check: layout/spacing accuracy (95%+), color accuracy (98%+), typography (90%+)
3. Verify both desktop (1440px) and mobile (375px) if responsive

## Common Figma-to-Code Mistakes

- Don't hardcode colors — use design tokens
- Don't use arbitrary Tailwind values when a token exists
- Don't ignore Auto Layout — it maps directly to flex/grid
- Don't skip visual verification
- Don't create new components when existing ones can be reused
- Don't forget hover/focus/active states shown in Figma variants
- Don't ignore spacing between sections — Figma padding/gap = CSS padding/gap