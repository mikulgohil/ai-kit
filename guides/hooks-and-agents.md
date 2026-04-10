# Hooks, Agents & Context Modes

AI Kit v1.2.0 introduces automated hooks, specialized agents, and context modes to supercharge your AI-assisted development workflow.

## Hooks

Hooks are automated checks that run as you code — no manual invocation needed.

### How They Work

Hooks are configured in `.claude/settings.local.json` and fire on specific events:

| Event | When It Fires |
|-------|--------------|
| **PreToolUse** | Before a tool runs (e.g., before `git push`) |
| **PostToolUse** | After a file is edited or written |
| **Stop** | After each AI response completes |

### Hook Profiles

AI Kit generates hooks based on your selected profile:

| Profile | What Runs |
|---------|-----------|
| **Minimal** | Auto-format + git push safety warning |
| **Standard** | Minimal + TypeScript type-check + console.log warnings |
| **Strict** | Standard + ESLint check + stop-time console.log audit |

### Changing Your Profile

Re-run `ai-kit init` and select a different hook profile, or edit `.claude/settings.local.json` directly.

### Disabling a Hook

Remove or comment out the hook entry in `.claude/settings.local.json`. The file is gitignored by default, so your changes are local.

---

## Agents

Agents are specialized AI assistants that can be delegated to for specific tasks. They live in `.claude/agents/`.

### Available Agents

| Agent | What It Does |
|-------|-------------|
| **kit-planner** | Breaks down features into implementation plans |
| **kit-code-reviewer** | Deep code review for quality, patterns, and security |
| **kit-security-reviewer** | Focused security audit (XSS, CSRF, OWASP Top 10) |
| **kit-build-resolver** | Diagnoses and fixes build/type errors |
| **kit-e2e-runner** | Generates and runs Playwright E2E tests |
| **kit-doc-updater** | Syncs documentation with code changes |
| **kit-refactor-cleaner** | Finds and removes dead code |
| **kit-sitecore-specialist** | Sitecore XM Cloud patterns and debugging |

### How to Use Agents

In Claude Code, agents are automatically available for delegation. You can also invoke them directly:

```
@kit-planner Plan the implementation for adding dark mode support
@kit-code-reviewer Review the changes in src/components/Header.tsx
@kit-e2e-runner Write E2E tests for the checkout flow
```

### Conditional Agents

Some agents are only generated when their tools are detected:
- **kit-e2e-runner** — only if Playwright is installed
- **kit-sitecore-specialist** — only if Sitecore XM Cloud is detected

---

## Context Modes

Context modes change how the AI approaches your work. They live in `.claude/contexts/`.

### Available Modes

| Mode | Best For |
|------|----------|
| **dev** | Building features — focus on implementation |
| **review** | Reviewing code — focus on quality and security |
| **research** | Exploring code — focus on understanding and documentation |

### How to Use

Reference the context in your prompt:

```
Using review context, check the authentication flow in src/lib/auth.ts
```

---

## Session Management

New skills help you persist context across sessions:

| Skill | What It Does |
|-------|-------------|
| `/kit-save-session` | Save current session state and decisions |
| `/kit-resume-session` | Restore context from a previous session |
| `/kit-checkpoint` | Run all quality checks and record results |

### Quality & Orchestration

| Skill | What It Does |
|-------|-------------|
| `/kit-quality-gate` | Run all checks: types, lint, format, tests, a11y, security |
| `/kit-orchestrate` | Coordinate multiple agents for complex tasks |
| `/kit-harness-audit` | Check AI configuration health |

---

## Security Audit

Run `ai-kit audit` to check your AI agent setup for:

- Secrets accidentally committed in CLAUDE.md or settings
- Missing hooks or misconfigured agents
- .env files not gitignored
- MCP server security
- Overall configuration health score (A-F grade)
