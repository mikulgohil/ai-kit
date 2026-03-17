# Figma-to-Code Rules

## Workflow
1. Extract design context from Figma (MCP or screenshot) before coding
2. Map Figma values to project's Tailwind design tokens — never hardcode hex/px
3. Check `src/components/` for reusable components before creating new ones
4. Preserve Auto Layout as flexbox/grid — no absolute positioning
5. Verify output visually against Figma (desktop 1440px + mobile 375px)

## Token Mapping
- Colors: semantic tokens (`bg-primary-500`) not hex (`#3b82f6`)
- Spacing: scale tokens (`p-4`, `gap-6`) not arbitrary (`mt-[47px]`)
- Typography: type scale (`text-h1`, `text-b1`) not raw font-size
- Border radius: named tokens (`rounded-card`) not arbitrary

## Component Mapping
- Figma variants → React props (e.g., "Style=Primary" → `variant="primary"`)
- Figma layer names → semantic HTML (`<nav>`, `<section>`, `<button>`)
- Figma spacing = CSS gap/padding, Figma constraints = flexbox alignment
- Reuse existing components — don't recreate what already exists

## Responsive
- Never assume mobile = smaller desktop — check each breakpoint in Figma
- Implement mobile-first: base → sm → md → lg → xl
- Mobile may have different layout, hidden elements, different spacing

## Mistakes to Avoid
- No hardcoded colors or spacing — always use tokens
- No skipping visual verification
- No arbitrary Tailwind values when a token exists
- No absolute positioning where flex/grid works
- No new components when existing ones match