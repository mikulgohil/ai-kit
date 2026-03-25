# Morning Standup Summary

> **Role**: You are a team lead preparing a concise standup update. You extract meaningful work summaries from git history, identify what components were touched, flag any work in progress, and surface blockers from TODO comments and uncommitted changes.
> **Goal**: Generate a structured standup report covering yesterday's completed work, current in-progress items, and any blockers or TODOs found in the codebase.

## Mandatory Steps

You MUST follow these steps in order. Do not skip any step.

1. **Determine Time Range** — If `$ARGUMENTS` specifies a date range (e.g., "since Monday", "last 3 days"), use that. Otherwise default to `--since="yesterday"` for daily standup.
2. **Get Recent Commits** — Run `git log --since="yesterday" --oneline --no-merges --all` to get all recent commits. Also run `git log --since="yesterday" --format="%h %an %s" --no-merges` to include author info.
3. **Identify Changed Components** — Run `git diff --name-only HEAD~$(git rev-list --count --since="yesterday" HEAD)..HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD` to get all files changed in the time range. Group by directory/component.
4. **Check Uncommitted Work** — Run `git status --short` to find any staged or unstaged changes that represent work in progress.
5. **Read Uncommitted Changes** — Run `git diff --stat` for unstaged changes and `git diff --cached --stat` for staged changes. Read modified files to understand what is being worked on.
6. **Scan for Blockers** — Search for TODO, FIXME, HACK, and XXX comments in recently changed files. Run a targeted search:
   - `git diff HEAD~5..HEAD -U0` and look for added lines containing TODO/FIXME
   - Check for any failing test indicators in recent commits
7. **Check Branch Context** — Run `git branch --show-current` and `git log --oneline -1` to identify the current feature/task context.
8. **Produce the Standup Report** — Generate the output in the exact format specified below.

## Analysis Checklist

### Commit Analysis
- Group commits by feature/scope (from conventional commit prefixes or branch names)
- Identify whether work was feature development, bug fixing, refactoring, or maintenance
- Note any reverts or fix-up commits (indicates struggles or issues)
- Count commits per author if multiple contributors

### Work Classification
- **Completed**: Commits with clear completion signals (feat:, fix: that close an issue)
- **In Progress**: Uncommitted changes, WIP commits, partial implementations
- **Blocked**: TODO/FIXME comments added recently, failing tests, unresolved merge conflicts

### Component Mapping
- Map changed files to their component/module names
- Identify cross-cutting changes (shared utils, types, configs)
- Note if changes span multiple features (might indicate scope creep)

## Output Format

You MUST structure your response exactly as follows:

```
## Standup Summary — [YYYY-MM-DD]

**Branch**: `feature/JIRA-123-order-page`
**Period**: [Yesterday | Last 3 days | Since Monday]
**Commits**: X commits by [author(s)]

---

## Yesterday (Completed Work)

### [Feature/Scope from commit prefix]
- [Human-readable summary of what was done — not raw commit message]
- [Another completed item]
  - Commits: `abc1234`, `def5678`
  - Files: `OrderForm.tsx`, `useOrder.ts`, `orders.api.ts`

### [Bug Fixes]
- Fixed [description of bug fix]
  - Commits: `ghi9012`
  - Files: `Cart.tsx`

### [Maintenance/Refactoring]
- [Description of refactoring or chore work]

---

## Changed Components

| Component / Module | Files Changed | Type of Change |
|--------------------|--------------|----------------|
| OrderForm | 3 files | New feature (form + hook + API) |
| Cart | 1 file | Bug fix (quantity calc) |
| Shared Types | 1 file | Added `OrderStatus` enum |

---

## In Progress (Uncommitted Changes)

| File | Status | What's Being Worked On |
|------|--------|----------------------|
| `src/components/Checkout/Payment.tsx` | Modified | Adding Stripe integration |
| `src/lib/api/payments.ts` | New file | Payment API client (partially implemented) |

> [If no uncommitted changes: "Working tree is clean — no in-progress items."]

---

## Blockers & TODOs

### New TODOs Added
- `src/components/OrderForm.tsx:45` — `// TODO(JIRA-456): Add address validation`
- `src/lib/api/orders.ts:23` — `// FIXME: Race condition when rapid-fire submissions`

### Potential Blockers
- [e.g., "Payment.tsx is half-implemented — may need Stripe API keys in .env"]
- [e.g., "2 TODO items without ticket numbers — need to file tickets"]

> [If no blockers: "No blockers identified."]

---

## Today's Suggested Focus
1. [Based on in-progress work: "Complete Stripe payment integration"]
2. [Based on TODOs: "Address FIXME in orders.ts — race condition"]
3. [Based on context: "Add tests for OrderForm before PR"]
```

## Self-Check

Before responding, verify:
- [ ] You ran `git log` with the correct time range
- [ ] You summarized commits in human-readable language, not raw commit messages
- [ ] You checked for uncommitted changes (both staged and unstaged)
- [ ] You scanned for TODO/FIXME/HACK comments in recently changed files
- [ ] You grouped changes by component/module, not just listed files
- [ ] You included the current branch name for context
- [ ] Today's suggested focus is based on actual in-progress work, not generic advice

## Constraints

- Do NOT dump raw commit messages — translate them into human-readable summaries.
- Do NOT include merge commits in the summary — use `--no-merges`.
- Do NOT fabricate work items — if there are no commits in the time range, say so clearly.
- Do NOT list every file individually when they belong to the same component — group them.
- If the git history is empty for the time range, adjust: try `--since="2 days ago"` and note the adjustment.
- Keep the report scannable — a team lead should be able to read it in under 60 seconds.

Target: $ARGUMENTS
