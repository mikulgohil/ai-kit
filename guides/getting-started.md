# Getting Started with AI Kit

> **Upgrading from v1.x?** All skills and agents now use a `kit-` prefix (e.g., `/kit-review` instead of `/review`). Run `ai-kit update` to migrate automatically.

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
Run the `/kit-prompt-help` command. It's an interactive prompt builder that asks you all the right questions before generating a perfect prompt.

```
/kit-prompt-help
```

### If you use Cursor:
Open any file and use Cmd+K or the chat panel. The `.cursorrules` file is automatically loaded and gives Cursor context about your project.

## Available Skills (Claude Code)

### Getting Started
| Skill | What it does |
|-------|-------------|
| `/kit-prompt-help` | Interactive prompt builder — **start here** |
| `/kit-understand` | Explain code in detail |
| `/kit-token-tips` | Token usage optimization |

### Building
| Skill | What it does |
|-------|-------------|
| `/kit-new-component` | Scaffold a new component |
| `/kit-new-page` | Create a new page/route |
| `/kit-api-route` | Scaffold an API route |
| `/kit-figma-to-code` | Implement Figma designs |

### Quality & Review
| Skill | What it does |
|-------|-------------|
| `/kit-review` | Deep code review |
| `/kit-fix-bug` | Guided bug fix workflow |
| `/kit-test` | Generate tests |
| `/kit-quality-gate` | Run ALL quality checks at once |
| `/kit-security-check` | Security vulnerability scan |
| `/kit-accessibility-audit` | WCAG 2.1 AA audit |

### Session & Learning (NEW in v1.2.0)
| Skill | What it does |
|-------|-------------|
| `/kit-save-session` | Save current session for later resumption |
| `/kit-resume-session` | Pick up where you left off |
| `/kit-checkpoint` | Snapshot all quality check results |
| `/kit-orchestrate` | Coordinate multiple agents on complex tasks |
| `/kit-harness-audit` | Check AI configuration health |

## Hooks (Automated Checks)

Hooks run automatically as you code — no action needed. Based on your selected profile:

- **Session init**: echoes your tech stack, scripts, and last scan date at every session start — the AI has full context immediately
- **Auto-format**: files are formatted on save (Prettier or Biome)
- **Type-check**: TypeScript errors caught after every edit
- **Console.log warning**: catches debug statements before commit
- **Git push safety**: reminder to review before pushing
- **Context re-echo**: after context compaction in long sessions, re-echoes tech stack

See `ai-kit/guides/hooks-and-agents.md` for details on profiles and customization.

## Agents

Specialized AI assistants live in `.claude/agents/` and can be delegated to:

| Agent | Specialization |
|-------|---------------|
| `kit-planner` | Implementation planning |
| `kit-code-reviewer` | Quality review |
| `kit-security-reviewer` | Security audit |
| `kit-build-resolver` | Fix build errors |
| `kit-e2e-runner` | Playwright E2E tests |
| `kit-doc-updater` | Documentation sync |
| `kit-refactor-cleaner` | Dead code cleanup |
| `kit-sitecore-specialist` | Sitecore XM Cloud patterns |

## Tips

1. **Always start with `/kit-prompt-help`** if you're unsure how to ask for something
2. **Be specific about files** — mention paths like `src/components/Header.tsx`
3. **Don't start from scratch** — ask the AI to read existing code first
4. **One task per conversation** — keep conversations focused
5. **Review AI output** — always read what it generates before accepting
6. **Use `/kit-checkpoint`** before and after major changes to track quality
7. **Use `/kit-save-session`** before ending a long session

## CLI Commands

```bash
npx @mikulgohil/ai-kit update    # Re-scan and update configs (auto-backs up first)
npx @mikulgohil/ai-kit migrate   # Adopt ai-kit in a project with existing CLAUDE.md
npx @mikulgohil/ai-kit rollback  # Restore configs from a previous backup
npx @mikulgohil/ai-kit audit     # Security & config health check
npx @mikulgohil/ai-kit doctor    # Diagnose setup issues
npx @mikulgohil/ai-kit diff      # Preview what would change on update
npx @mikulgohil/ai-kit stats     # Project complexity metrics
npx @mikulgohil/ai-kit tokens    # Token usage and cost estimates
npx @mikulgohil/ai-kit export    # Export to Windsurf, Aider, Cline
npx @mikulgohil/ai-kit reset     # Remove all generated files
```

## Migrating an Existing Project

Already have a hand-written `CLAUDE.md` or `.cursorrules`? Use `migrate` instead of `init`:

```bash
npx @mikulgohil/ai-kit migrate           # Preserves your custom rules, adds ai-kit sections
npx @mikulgohil/ai-kit migrate --dry-run # Preview what would change without writing
```

Your custom sections stay at the top of the file. AI Kit's generated rules go below in `AI-KIT:START/END` markers. Future `ai-kit update` commands only touch the marked section.

## Rolling Back

Every `ai-kit update` automatically backs up your current configs before writing. If something goes wrong:

```bash
npx @mikulgohil/ai-kit rollback          # Pick from available backups
npx @mikulgohil/ai-kit rollback --latest # Restore most recent backup instantly
```
