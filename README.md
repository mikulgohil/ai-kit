# @horizontal/ai-kit

AI-assisted development setup kit for Horizontal Digital projects. Auto-detects your tech stack and generates tailored CLAUDE.md, .cursorrules, slash commands, and developer guides.

## Installation

```bash
npx @horizontal/ai-kit init
```

Requires Node >= 18.

## What Gets Generated

Running `init` scans your project and produces:

- **CLAUDE.md** — Project-aware rules and conventions for Claude Code
- **.cursorrules** — Equivalent rules for Cursor AI
- **.claude/commands/** — 10 slash commands: `prompt-help`, `review`, `fix-bug`, `new-component`, `new-page`, `understand`, `test`, `optimize`, `figma-to-code`, `design-tokens`
- **ai-kit/guides/** — 5 developer guides: getting-started, prompt-playbook, when-to-use-ai, token-saving-tips, figma-workflow
- **docs/** — 3 doc scaffolds: mistakes-log, decisions-log, time-log

## Commands

| Command | Description |
|---------|-------------|
| `ai-kit init [path]` | Scan project and generate all configs |
| `ai-kit update [path]` | Re-scan and update existing generated files |
| `ai-kit reset [path]` | Remove all AI Kit generated files |

`path` defaults to the current directory if omitted.

## Supported Stacks

**Frameworks** — Next.js (App Router, Pages Router, Hybrid), React

**CMS** — Sitecore XM Cloud, Sitecore JSS

**Styling** — Tailwind CSS, SCSS, CSS Modules, styled-components

**Language** — TypeScript (with strict mode detection)

**Monorepos** — Turborepo, Nx, Lerna, pnpm workspaces

**Design** — Figma MCP, design tokens, visual tests

**Package managers** — npm, pnpm, yarn, bun

## Updating and Resetting

To pick up new dependencies or config changes after your stack evolves:

```bash
npx @horizontal/ai-kit update
```

To remove all generated files and start clean:

```bash
npx @horizontal/ai-kit reset
```

## Further Reading

Detailed usage is covered in the generated guides under `ai-kit/guides/` after running `init`. Start with `getting-started.md`.

## Repository

[https://github.com/mikulgohil/ai-kit](https://github.com/mikulgohil/ai-kit)

## License

MIT
