# Multi-Agent Orchestration

Coordinate multiple specialized agents to tackle complex tasks.

## When to Use
- Tasks spanning multiple concerns (feature + tests + docs + review)
- Large changes requiring parallel analysis
- Comprehensive audits across security, performance, and accessibility

## Process

### 1. Analyze the Task
- Break the task into independent subtasks
- Identify which agent handles each subtask
- Determine dependencies (what must complete before what)

### 2. Available Agents

| Agent | Best For |
|-------|----------|
| `kit-planner` | Breaking down requirements into implementation steps |
| `kit-code-reviewer` | Quality review of existing or new code |
| `kit-security-reviewer` | Security-focused audit |
| `kit-e2e-runner` | Generating and running Playwright tests |
| `kit-build-resolver` | Fixing build and type errors |
| `kit-doc-updater` | Updating documentation |
| `kit-refactor-cleaner` | Finding and removing dead code |
| `kit-sitecore-specialist` | Sitecore-specific patterns and issues |

### 3. Delegate
Launch agents in parallel where possible:
- Independent reviews (security + code quality) can run simultaneously
- Testing depends on code being written first
- Documentation depends on knowing what changed

### 4. Collect Results
Gather output from all agents and:
- Identify conflicts between recommendations
- Prioritize findings by severity
- Create a unified action plan

### 5. Report
Present a merged summary:

```markdown
## Orchestration Results

### Task: [description]

### Agent Results
- **kit-planner**: [key findings]
- **kit-code-reviewer**: [key findings]
- **kit-security-reviewer**: [key findings]

### Conflicts
- [Agent A recommends X, but Agent B recommends Y — resolution]

### Action Plan
1. [Highest priority action]
2. [Next action]
3. ...
```

## Tips
- Don't delegate trivial tasks — direct work is faster for simple changes
- Use orchestration for cross-cutting concerns that benefit from specialization
- Review agent outputs for contradictions before acting on them
