# Getting Started with AI Kit

## What Just Happened?

`ai-kit init` scanned your project and generated AI configuration files tailored to your tech stack. Here's what was created:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Rules for Claude Code — tells the AI about your project |
| `.cursorrules` | Rules for Cursor — same purpose, Cursor format |
| `.claude/commands/` | Slash commands — pre-built workflows for common tasks |
| `ai-kit/guides/` | Guides — tips and playbooks for using AI effectively |
| `docs/` | Doc templates — for tracking decisions and mistakes |
| `ai-kit.config.json` | Config — what AI Kit detected and generated |

## First Thing to Do

### If you use Claude Code:
Run the `/prompt-help` command. It's an interactive prompt builder that asks you all the right questions before generating a perfect prompt. No more "fix this" and getting garbage output.

```
/prompt-help
```

### If you use Cursor:
Open any file and use Cmd+K or the chat panel. The `.cursorrules` file is automatically loaded and gives Cursor context about your project.

## Available Slash Commands (Claude Code)

| Command | What it does |
|---------|-------------|
| `/prompt-help` | Interactive prompt builder — **start here** |
| `/review` | Deep code review as a Senior Engineer |
| `/fix-bug` | Guided bug fix workflow |
| `/new-component` | Scaffold a new component |
| `/new-page` | Create a new page/route |
| `/understand` | Explain code in detail |
| `/test` | Generate tests |
| `/optimize` | Performance optimization |

## Tips

1. **Always start with `/prompt-help`** if you're unsure how to ask for something
2. **Be specific about files** — mention paths like `src/components/Header.tsx`
3. **Don't start from scratch** — ask the AI to read existing code first
4. **One task per conversation** — keep conversations focused
5. **Review AI output** — always read what it generates before accepting

## Updating

When you add new packages or change your project structure:
```bash
npx @mikulgohil/ai-kit update
```

## Removing

To remove all AI Kit generated files:
```bash
npx @mikulgohil/ai-kit reset
```
