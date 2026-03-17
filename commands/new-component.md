# New Component Generator

Create a new component following project conventions.

## Questions (ask all of these)
1. Component name?
2. What does it do? (1-2 sentence description)
3. Where should it go? (suggest based on project structure)
4. What props does it need?
5. Server or Client Component? (App Router projects)
6. Does it need data fetching?
7. Is it a Sitecore component? (if XM Cloud project — use field helpers)
8. Responsive requirements?
9. States to handle? (loading, error, empty)
10. Similar existing component to reference? (read it for patterns)

## Rules
- Match the existing component patterns in this project exactly
- Use project's styling approach (Tailwind classes, SCSS modules, etc.)
- Include TypeScript types for all props
- Add display name if project uses them
- Export correctly (default vs named — match project convention)
- If Sitecore: use `<Text>`, `<RichText>`, `<Image>`, `<Link>` field helpers

## Output
Generate:
1. Component file with full implementation
   - Add JSDoc comment above the component explaining its purpose
   - If the component is complex (>50 lines OR >3 props), add `// Docs: ./ComponentName.docs.md` at top
2. Types (inline or separate based on project pattern)
3. Documentation file (`ComponentName.docs.md`) — **only if the component is >50 lines OR has >3 props**:
   - Purpose and description
   - Props table with types and defaults
   - Usage example
   - Edge cases and design decisions
   - Change Log section with initial entry
   - For simple components (≤50 lines AND ≤3 props), the JSDoc comment is sufficient — skip the doc file
4. Test file with happy path, error states, and edge cases
5. Storybook story if project uses Storybook

Target: $ARGUMENTS
