# Evaluation: oh-my-claudecode (OMC) for ai-kit

**Repo:** https://github.com/Yeachan-Heo/oh-my-claudecode
**Evaluated on:** 2026-03-25
**Stars:** ~11,400 | **License:** MIT

---

## What is oh-my-claudecode?

A multi-agent orchestration framework for Claude Code that provides team-based agent coordination, parallel execution, and intelligent task routing. It turns Claude Code into a multi-agent system where specialized agents collaborate — spawning workers in tmux panes using Claude, OpenAI Codex CLI, and Google Gemini CLI.

### Key features of OMC

- **Team Mode** — Staged pipeline: plan -> PRD -> exec -> verify -> fix loop
- **32 Specialized Agents** — Architecture, research, design, testing, data science, etc.
- **Smart Model Routing** — Sends simple tasks to Haiku, complex reasoning to Opus (30-50% token savings)
- **6 Orchestration Modes** — Team, Autopilot, Ultrawork, Ralph, Pipeline, CCG (tri-model)
- **Custom Skills (YAML)** — Auto-inject when relevant triggers match; project + user scoped
- **Deep Interview** — Socratic questioning to clarify vague requirements before coding
- **HUD (Heads-Up Display)** — Real-time statusline showing orchestration metrics
- **Notifications** — Telegram, Discord, Slack, webhooks on session completion
- **Rate Limit Auto-Resume** — Daemon that detects rate limits and auto-resumes sessions
- **Multi-model** — Claude Code + Codex CLI + Gemini CLI coordination

---

## How ai-kit and OMC compare

| Aspect | ai-kit | oh-my-claudecode |
|---|---|---|
| **Core problem** | "What should the AI know about my project?" | "How should multiple AI agents work together?" |
| **Focus** | Project context & config generation | Runtime orchestration & coordination |
| **Skills** | 46 markdown-based skills | YAML skills with auto-trigger matching |
| **Agents** | 10 agent definitions | 32 agents with model routing |
| **Multi-tool support** | Claude Code, Cursor, Windsurf, Aider, Cline | Claude Code, Codex CLI, Gemini CLI |
| **Output** | Config files (CLAUDE.md, .cursorrules, hooks) | Runtime agent spawning & coordination |

**Verdict:** Complementary tools, not competitors. ai-kit generates project-aware configs; OMC orchestrates multi-agent execution at runtime.

---

## What is useful for ai-kit (things we can add)

### 1. YAML-based skills with auto-triggering

**Current state:** ai-kit skills are static markdown files copied into the project.
**What OMC does:** Skills are YAML files with `triggers` (file patterns, keywords) that auto-inject when relevant context matches.

**Action items:**
- [ ] Add optional `triggers` frontmatter to skill markdown files (file globs, keywords)
- [ ] Generate a skill-routing config in `.ai-kit/skill-triggers.json` so Claude Code can auto-select relevant skills
- [ ] Support both project-scoped (`.ai-kit/skills/`) and user-scoped (`~/.ai-kit/skills/`) custom skills

### 2. Smart model routing hints in generated configs

**Current state:** ai-kit does not include model routing guidance in generated configs.
**What OMC does:** Routes simple tasks to Haiku and complex reasoning to Opus for 30-50% cost savings.

**Action items:**
- [ ] Add model routing recommendations to generated `CLAUDE.md` (e.g., "Use Haiku for formatting/linting tasks, Opus for architecture decisions")
- [ ] Include cost-saving tips as comments in generated configs
- [ ] Add a `--cost-optimize` flag to `init` that generates leaner configs for budget-conscious teams

### 3. Additional agent definitions (borrow ideas from OMC's 32 agents)

**Current state:** ai-kit ships 10 agents.
**What OMC has that we lack:**
- Data science / ML agent
- Performance profiler agent
- Migration specialist agent
- Dependency auditor agent
- API designer agent

**Action items:**
- [ ] Add `data-scientist.md` agent — ML pipeline, model evaluation, data analysis patterns
- [ ] Add `performance-profiler.md` agent — Bundle analysis, runtime profiling, Core Web Vitals
- [ ] Add `migration-specialist.md` agent — Framework upgrades, breaking change detection
- [ ] Add `dependency-auditor.md` agent — Outdated deps, vulnerability checks, license compliance
- [ ] Add `api-designer.md` agent — REST/GraphQL API design, schema validation, versioning

### 4. OMC as an export target

**Current state:** ai-kit exports to Windsurf, Aider, Cline via `ai-kit export`.
**What OMC needs:** Project context files that feed into its orchestration pipeline.

**Action items:**
- [ ] Add `--format omc` to `ai-kit export` command
- [ ] Generate OMC-compatible skill YAML files from ai-kit's markdown skills
- [ ] Generate OMC team-plan templates pre-filled with detected stack info
- [ ] Map ai-kit agents to OMC agent format

### 5. Deep interview / requirements clarification prompt

**Current state:** ai-kit does not include prompts for requirements gathering.
**What OMC does:** "Deep Interview" — Socratic questioning to clarify vague requirements before coding begins.

**Action items:**
- [ ] Add `deep-interview.md` skill — A guided requirements-gathering prompt
- [ ] Add `clarify-requirements.md` skill — Shorter version for quick task clarification
- [ ] Include interview output template in `docs-scaffolds/`

### 6. Notification / webhook integration config

**Current state:** ai-kit generates hooks for formatting/linting but not notifications.
**What OMC does:** Telegram, Discord, Slack, webhook callbacks on session completion.

**Action items:**
- [ ] Add optional notification config section to `ai-kit.json`
- [ ] Generate webhook hook templates in `.ai-kit/hooks/` for session-complete notifications
- [ ] Support Slack/Discord/Telegram config via `ai-kit init --notifications`

### 7. Rate limit awareness in generated configs

**Current state:** ai-kit tracks token usage but doesn't address rate limits.
**What OMC does:** Auto-resume daemon that detects rate limits and resumes when they reset.

**Action items:**
- [ ] Add rate-limit tips to generated `CLAUDE.md` (e.g., batch operations, chunk large files)
- [ ] Include rate-limit recovery patterns in the `token-saving-tips.md` guide
- [ ] Add a rate-limit section to the `tokens` command output

### 8. Multi-model orchestration awareness

**Current state:** ai-kit supports multiple AI tools but treats them independently.
**What OMC does:** Coordinates Claude + Codex + Gemini in a unified pipeline.

**Action items:**
- [ ] When multiple AI tools are detected (e.g., Claude Code + Cursor), generate a `multi-tool-workflow.md` guide
- [ ] Add cross-tool context sharing recommendations to `CLAUDE.md`
- [ ] Generate `.ai-kit/multi-tool.json` config mapping which tool to use for which task type

---

## What is NOT useful (skip these)

| OMC Feature | Why skip |
|---|---|
| **tmux-based agent spawning** | Runtime orchestration; outside ai-kit's config-generation scope |
| **Autopilot / Ralph / Ultrawork modes** | Execution modes, not configuration |
| **HUD (statusline)** | Runtime UI; ai-kit is a one-shot CLI |
| **OpenClaw bridge** | Third-party integration specific to OMC's ecosystem |
| **Multi-model runtime coordination** | Requires running multiple CLIs simultaneously; not a config concern |
| **Rate limit auto-resume daemon** | Long-running process; ai-kit generates configs, doesn't run daemons |

---

## Priority order for implementation

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| P1 | Additional agent definitions (5 new agents) | Low | High |
| P1 | Deep interview / requirements clarification skills | Low | Medium |
| P2 | YAML-based skills with auto-triggering | Medium | High |
| P2 | OMC as an export target | Medium | Medium |
| P2 | Smart model routing hints | Low | Medium |
| P3 | Notification / webhook config | Medium | Low |
| P3 | Rate limit awareness | Low | Low |
| P3 | Multi-model orchestration awareness | Medium | Low |

---

## Summary

OMC is a valuable source of **inspiration and feature ideas** for ai-kit. The two tools are complementary — ai-kit provides the project context that tools like OMC need to orchestrate effectively. The highest-value additions are:

1. **5 new agents** borrowed from OMC's broader agent catalog (low effort, high impact)
2. **Smart skill triggering** via YAML frontmatter (medium effort, high impact)
3. **OMC export format** to bridge the two tools (medium effort, medium impact)
4. **Requirements clarification prompts** inspired by OMC's Deep Interview (low effort, useful)
