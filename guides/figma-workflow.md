# Figma-to-Code Workflow Guide

How to convert Figma designs to production code using AI — the right way.

## The Wrong Way (What Most Developers Do)

```
Developer:  "Build this component" + [pastes Figma screenshot]
AI:         Generates code with hardcoded #hex colors, arbitrary spacing,
            no design tokens, doesn't reuse existing components
Developer:  Spends 2 hours manually fixing tokens and spacing
```

## The Right Way (With ai-kit)

```
Developer:  /kit-figma-to-code
AI:         Asks targeted questions → extracts Figma context via MCP →
            maps to project tokens → reuses existing components →
            generates clean code → verifies visually
Developer:  Reviews one clean output, ships it
```

---

## Setup: Figma MCP (2 Minutes)

Figma MCP lets Claude Code and Cursor read your Figma files directly — extracting colors, spacing, typography, and layout without you pasting anything.

### Option 1: Remote (Recommended)
Add to your project's `.mcp.json`:
```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "https://mcp.figma.com/mcp"
    }
  }
}
```
First use will prompt for OAuth login.

### Option 2: Local (Figma Desktop)
Requires Figma desktop app with Dev Mode enabled:
```json
{
  "servers": {
    "figma": {
      "type": "http",
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

---

## The Workflow

### Step 1: Get the Figma Link

Copy the link to the specific frame you want to implement. Right-click the frame in Figma → "Copy link to selection".

A good link looks like:
```
https://www.figma.com/design/ABC123/MyProject?node-id=1234-5678
```

### Step 2: Use /kit-figma-to-code

Run the slash command. It will:
1. Ask what you're building (component, page, update)
2. Extract design context from Figma via MCP
3. Map values to your project's design tokens
4. Check for existing components to reuse
5. Generate code following project patterns
6. Verify visually

### Step 3: Review and Ship

The output should use correct design tokens, reuse existing components, and follow your project's code patterns. Review once, make minor adjustments if needed, ship it.

---

## Quick Reference: Token Mapping

| Figma | Code (Tailwind) |
|-------|-----------------|
| Fill color #3b82f6 | `bg-primary-500` (use token, not hex) |
| Padding 16px | `p-4` (use scale, not arbitrary) |
| Font size 32px Bold | `text-h1` (use type scale) |
| Border radius 8px | `rounded-card` (use named token) |
| Gap 24px | `gap-6` (use scale) |
| Auto Layout horizontal | `flex flex-row` |
| Auto Layout vertical | `flex flex-col` |

---

## When to Use AI vs figma-code-cli

| Scenario | Tool |
|----------|------|
| Single component from Figma | `/kit-figma-to-code` in Claude Code |
| Quick design token extraction | `/kit-design-tokens` in Claude Code |
| Full page with 5+ components | `figma-code-cli` pipeline |
| Sitecore component + YML items | `figma-code-cli` (4-gate pipeline) |
| Brand implementation from scratch | `figma-code-cli` + reference ssd-figma-code |
| Quick visual tweak or spacing fix | Direct AI prompt is fine |

---

## Common Mistakes

1. **Pasting screenshots instead of using MCP** — MCP gives structured data (colors, spacing, layout). Screenshots give the AI only visual info, leading to guessed values.

2. **Not checking existing components** — Before building from scratch, search your `src/components/` for reusable pieces.

3. **Accepting hardcoded values** — If the AI output has `text-[#333333]` or `mt-[47px]`, reject it. Ask it to use design tokens.

4. **Skipping mobile verification** — Never assume mobile is just "desktop but smaller". Check mobile designs in Figma separately.

5. **Not reading design tokens first** — Run `/kit-design-tokens` before starting Figma work. Know what tokens are available.

---

## Tips for Better Figma Files

If you work with designers, share these tips to improve AI output:

1. **Name layers semantically** — "HeroBanner" not "Frame 47"
2. **Use Auto Layout everywhere** — it maps directly to flexbox
3. **Define variables for colors/spacing** — AI can extract them
4. **Create variants for states** — hover, active, disabled, empty
5. **Keep layer order = reading order** — top to bottom = left to right
