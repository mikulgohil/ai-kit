# Harness Audit — AI Configuration Health Check

Audit the AI agent configuration for completeness and correctness.

## What to Check

### 1. CLAUDE.md
- [ ] File exists and has AI-KIT markers
- [ ] Tech stack section matches actual project dependencies
- [ ] Scripts section matches `package.json` scripts
- [ ] No stale or incorrect information
- [ ] No secrets or credentials

### 2. Hooks (`.claude/settings.local.json`)
- [ ] File exists
- [ ] Hooks are syntactically correct JSON
- [ ] Auto-format hook references an installed formatter (Prettier/Biome)
- [ ] TypeScript check hook runs only on .ts/.tsx files
- [ ] No hooks referencing missing tools or scripts

### 3. Agents (`.claude/agents/*.md`)
- [ ] Each agent has valid YAML frontmatter (name, description)
- [ ] Agent descriptions are specific enough for delegation
- [ ] No duplicate or conflicting agents
- [ ] Conditional agents match detected stack (e2e-runner only if Playwright installed)

### 4. Contexts (`.claude/contexts/*.md`)
- [ ] dev, review, research modes are present
- [ ] Context instructions are clear and actionable
- [ ] No contradictions between contexts

### 5. Skills (`.claude/skills/`)
- [ ] Each skill directory has a SKILL.md file
- [ ] Skills match available skills list
- [ ] No broken or empty skill files

### 6. MCP Servers
- [ ] Check `.claude/settings.json` for MCP server configuration
- [ ] Verify configured servers are relevant to the project
- [ ] No hardcoded credentials in MCP config

### 7. Config File (`ai-kit.config.json`)
- [ ] Version matches installed ai-kit version
- [ ] Scan result matches current project state
- [ ] All generated artifacts are listed

## Output Format

```markdown
## AI Harness Health Check

### Overall: [A/B/C/D/F] ([score]/100)

### CLAUDE.md: ✓ Healthy
- Tech stack matches project

### Hooks: ⚠ Warning
- Auto-format hook references prettier but biome is installed

### Agents: ✓ Healthy (7 agents)
- All frontmatter valid

### Contexts: ✓ Healthy (3 modes)

### Skills: ✓ Healthy (44 skills)

### MCP: ✓ Healthy (3 servers)

### Recommendations
1. Update auto-format hook to use biome
2. Add Context7 MCP for library documentation
3. Run `ai-kit update` to refresh stale config
```
