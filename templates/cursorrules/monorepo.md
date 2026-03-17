# Monorepo Rules

- Respect package boundaries — import through package names, not relative paths
- Changes to shared packages affect all consumers — be cautious
- Run commands from root: `{{packageManager}} run build --filter=<package>`
- Don't duplicate dependencies — hoist shared deps to root
- Check downstream impact before modifying shared packages