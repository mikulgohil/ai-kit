# AI Kit — Release Checklist

**Current Version: v1.2.0**
**Created: 2026-03-10 · Updated: 2026-03-18**

---

## v1.0 Items — All Complete

### 1. Add Tests
- [x] Unit tests for each scanner (nextjs, sitecore, styling, typescript, monorepo, package-manager, figma)
- [x] Unit tests for `selectFragments`
- [x] Unit tests for `assembleTemplate`
- [x] Test `copyCommands`, `copyGuides`, `copyDocs`
- [x] Setup: Vitest, `test` and `test:run` scripts in package.json
- [x] **195 tests passing**

### 2. Real-World Validation
- [x] Run on a real Sitecore XM Cloud project
- [x] Run on pure Next.js project (no Sitecore)
- [x] Test `update` command
- [x] Test `reset` command

### 3. Dry-Run / Diff
- [x] `ai-kit diff` command — shows what would change without writing

### 4. README.md
- [x] Comprehensive README with installation, features, CLI commands, supported stacks

### 5. Fix GitHub Repository URL
- [x] Updated to `mikulgohil/ai-kit.git`

### 6. Cursor `.mdc` Format Support
- [x] Generates `.cursor/rules/*.mdc` files per fragment
- [x] Generates `.cursor/skills/` directories

### 7. Safe `update` Command (Merge Strategy)
- [x] AI-KIT:START / AI-KIT:END markers in generated files
- [x] `update` replaces only content between markers

### 8. Documentation Threshold
- [x] Adjusted in base templates

### 9. Generated Output Versioning
- [x] Version comment at top of generated files
- [x] Version stored in `ai-kit.config.json`
- [x] Version mismatch warning on `update`

---

## v1.1.0 Items — All Complete

- [x] 12 new skills (perf-audit, bundle-check, i18n-check, schema-gen, docker-debug, ci-fix, changelog, release, storybook-gen, visual-diff, db-migrate, dependency-graph)
- [x] 4 new CLI commands (tokens, doctor, diff, export)
- [x] Template improvements
- [x] Token tracking and cost estimates

---

## v1.2.0 Items — All Complete

### Hooks System
- [x] Auto-format hook (Prettier or Biome, auto-detected)
- [x] TypeScript type-check hook after .ts/.tsx edits
- [x] Console.log warning hook
- [x] Git push safety reminder hook
- [x] Three hook profiles: minimal, standard, strict
- [x] Generated in `.claude/settings.local.json`
- [x] Biome detection added to scanner

### Specialized Agents (8)
- [x] kit-planner, kit-code-reviewer, kit-security-reviewer, kit-build-resolver, kit-doc-updater, kit-refactor-cleaner
- [x] kit-e2e-runner (conditional: only if Playwright installed)
- [x] kit-sitecore-specialist (conditional: only if Sitecore detected)
- [x] Agent copier with scan-aware conditional logic

### Context Modes (3)
- [x] dev — building features
- [x] review — quality and security
- [x] research — exploration and analysis

### Session Management Skills (4)
- [x] /kit-save-session, /kit-resume-session, /kit-checkpoint, /kit-learn

### Orchestration Skills (3)
- [x] /kit-orchestrate, /kit-quality-gate, /kit-harness-audit

### Security Audit CLI
- [x] `ai-kit audit` command
- [x] Checks: secrets, hooks, agents, contexts, skills, MCP, .env gitignore
- [x] A-F health grade output

### Documentation
- [x] README.md — comprehensive rewrite
- [x] getting-started.md — updated with all new features
- [x] hooks-and-agents.md — new guide
- [x] v1.2-release-notes.md — full release notes
- [x] v1-release-checklist.md — updated with current status
- [x] Tests updated (195/195 passing)

---

## Future (v1.3+)

- [ ] Hook profile switching without re-init (`ai-kit hooks --profile strict`)
- [ ] Session list command (`ai-kit sessions`)
- [ ] Instinct evolution (promote learned patterns to rules automatically)
- [ ] Cost tracking hook for per-session token metrics
- [ ] Cursor hooks support (when Cursor adds hook support)
- [ ] CI/CD: GitHub Actions workflow (lint + test on PR, auto-publish on tag)
- [ ] Interactive `update` diff (accept/reject per file)
- [ ] Telemetry (opt-in, anonymous usage tracking)

---

## Score Breakdown (v1.2.0)

| Area | Score | Notes |
|------|-------|-------|
| Config generation | 9/10 | Strong — CLAUDE.md, .cursorrules, .mdc, hooks, agents, contexts |
| Skills/Commands | 9/10 | 44 skills across 7 categories |
| Agents | 9/10 | 8 specialized agents with conditional generation |
| Hooks | 9/10 | 3 profiles, auto-detected formatter |
| Testing | 8/10 | 195 tests passing |
| Documentation | 9/10 | README, 6 guides, release notes, checklist |
| Developer trust | 8/10 | diff, doctor, audit commands |
| Cursor support | 8/10 | .cursorrules + .mdc + skills |
| Security | 8/10 | audit command, secrets detection |
| CLI completeness | 9/10 | 9 commands covering full lifecycle |

**Overall: 8.6/10**
