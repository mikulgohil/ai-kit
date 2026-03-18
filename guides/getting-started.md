# Getting Started with AI Kit

## What Just Happened?

`ai-kit init` scanned your project and generated AI configuration files tailored to your tech stack. Here's what was created:

| File / Directory | Purpose |
|-----------------|---------|
| `CLAUDE.md` | Rules for Claude Code — tells the AI about your project |
| `.cursorrules` | Rules for Cursor — same purpose, Cursor format |
| `.claude/skills/` | Skills — pre-built workflows for common tasks |
| `.claude/agents/` | Agents — specialized AI assistants for delegation |
| `.claude/contexts/` | Context modes — dev, review, and research modes |
| `.claude/settings.local.json` | Hooks — automated checks that run as you code |
| `ai-kit/guides/` | Guides — tips and playbooks for using AI effectively |
| `docs/` | Doc templates — for tracking decisions and mistakes |
| `ai-kit.config.json` | Config — what AI Kit detected and generated |

## First Thing to Do

### If you use Claude Code:
Run the `/prompt-help` command. It's an interactive prompt builder that asks you all the right questions before generating a perfect prompt.

```
/prompt-help
```

### If you use Cursor:
Open any file and use Cmd+K or the chat panel. The `.cursorrules` file is automatically loaded and gives Cursor context about your project.

## Available Skills (Claude Code)

### Getting Started
| Skill | What it does |
|-------|-------------|
| `/prompt-help` | Interactive prompt builder — **start here** |
| `/understand` | Explain code in detail |
| `/token-tips` | Token usage optimization |

### Building
| Skill | What it does |
|-------|-------------|
| `/new-component` | Scaffold a new component |
| `/new-page` | Create a new page/route |
| `/api-route` | Scaffold an API route |
| `/figma-to-code` | Implement Figma designs |

### Quality & Review
| Skill | What it does |
|-------|-------------|
| `/review` | Deep code review |
| `/fix-bug` | Guided bug fix workflow |
| `/test` | Generate tests |
| `/quality-gate` | Run ALL quality checks at once |
| `/security-check` | Security vulnerability scan |
| `/accessibility-audit` | WCAG 2.1 AA audit |

### Session & Learning (NEW in v1.2.0)
| Skill | What it does |
|-------|-------------|
| `/save-session` | Save current session for later resumption |
| `/resume-session` | Pick up where you left off |
| `/checkpoint` | Snapshot all quality check results |
| `/orchestrate` | Coordinate multiple agents on complex tasks |
| `/harness-audit` | Check AI configuration health |

## Hooks (Automated Checks)

Hooks run automatically as you code — no action needed. Based on your selected profile:

- **Auto-format**: files are formatted on save (Prettier or Biome)
- **Type-check**: TypeScript errors caught after every edit
- **Console.log warning**: catches debug statements before commit
- **Git push safety**: reminder to review before pushing

See `ai-kit/guides/hooks-and-agents.md` for details on profiles and customization.

## Agents

Specialized AI assistants live in `.claude/agents/` and can be delegated to:

| Agent | Specialization |
|-------|---------------|
| `planner` | Implementation planning |
| `code-reviewer` | Quality review |
| `security-reviewer` | Security audit |
| `build-resolver` | Fix build errors |
| `e2e-runner` | Playwright E2E tests |
| `doc-updater` | Documentation sync |
| `refactor-cleaner` | Dead code cleanup |
| `sitecore-specialist` | Sitecore XM Cloud patterns |

## Tips

1. **Always start with `/prompt-help`** if you're unsure how to ask for something
2. **Be specific about files** — mention paths like `src/components/Header.tsx`
3. **Don't start from scratch** — ask the AI to read existing code first
4. **One task per conversation** — keep conversations focused
5. **Review AI output** — always read what it generates before accepting
6. **Use `/checkpoint`** before and after major changes to track quality
7. **Use `/save-session`** before ending a long session

## CLI Commands

```bash
npx @mikulgohil/ai-kit update    # Re-scan and update configs
npx @mikulgohil/ai-kit audit     # Security & config health check
npx @mikulgohil/ai-kit doctor    # Diagnose setup issues
npx @mikulgohil/ai-kit diff      # Preview what would change on update
npx @mikulgohil/ai-kit stats     # Project complexity metrics
npx @mikulgohil/ai-kit tokens    # Token usage and cost estimates
npx @mikulgohil/ai-kit export    # Export to Windsurf, Aider, Cline
npx @mikulgohil/ai-kit reset     # Remove all generated files
```
