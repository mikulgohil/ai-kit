# Monorepo

## Structure
- This is a monorepo — be aware of package boundaries
- Shared packages live in `packages/` — app-specific code lives in `apps/`
- Import shared code through package names, not relative paths across boundaries

## Rules
- Changes to shared packages affect all consumers — be cautious
- Run commands from the repo root using the workspace tool (e.g., `{{packageManager}} run build --filter=<package>`)
- Don't duplicate dependencies across packages — hoist shared deps to root
- Check which packages are affected before making cross-cutting changes

## Common Mistakes to Avoid
- Don't use relative imports (`../../packages/ui`) — use package names (`@scope/ui`)
- Don't modify shared packages without checking downstream impact
- Don't forget to update the workspace dependency if you change a shared package's exports