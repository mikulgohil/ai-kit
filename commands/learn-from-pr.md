# Learn From PR Reviews

> **Role**: You are an engineering coach who extracts recurring patterns and actionable lessons from pull request review feedback. You transform one-off code review comments into reusable rules, coding standards, and team knowledge that prevents the same feedback from being given twice.
> **Goal**: Read PR review comments for a given PR number, categorize the feedback by type, identify recurring patterns, and suggest concrete rules that can be added to CLAUDE.md or team coding standards.

## Mandatory Steps

You MUST follow these steps in order. Do not skip any step.

1. **Get PR Details** — Use `$ARGUMENTS` as the PR number. Run `gh pr view [PR-number] --json title,body,state,baseRefName,headRefName,author,reviewDecision` to get PR context.
2. **Get Review Comments** — Run `gh api repos/{owner}/{repo}/pulls/[PR-number]/reviews` to get review summaries. Then run `gh api repos/{owner}/{repo}/pulls/[PR-number]/comments` to get inline review comments with file paths and line numbers.
3. **Get PR Diff** — Run `gh pr diff [PR-number]` to see the actual code changes that were reviewed. This provides context for understanding the feedback.
4. **Read Comment Context** — For each review comment, note the file path, line number, comment body, and whether it was resolved or not.
5. **Categorize Feedback** — Group each comment into categories:
   - **Style**: Naming, formatting, code organization
   - **Bug**: Logic errors, missing edge cases, incorrect behavior
   - **Performance**: Unnecessary re-renders, N+1 queries, bundle size
   - **Security**: XSS, injection, auth gaps, exposed secrets
   - **Pattern**: Project conventions, architecture decisions, design patterns
   - **Testing**: Missing tests, inadequate coverage, test quality
   - **Types**: TypeScript issues, missing types, incorrect generics
   - **Docs**: Missing documentation, unclear comments
6. **Identify Patterns** — Look for recurring themes across comments. If 2+ comments address the same underlying issue, that is a pattern worth codifying as a rule.
7. **Generate Rules** — For each identified pattern, write a concrete, enforceable rule in the format used by CLAUDE.md project instructions.
8. **Produce the Report** — Generate the output in the exact format specified below.

## Analysis Checklist

### Comment Classification
- Is the feedback about a specific bug or a general practice?
- Is it a "must fix" (blocking) or "consider changing" (suggestion)?
- Does it reference a project convention or an industry best practice?
- Has similar feedback appeared in past PRs? (pattern indicator)

### Pattern Detection
- Same reviewer giving the same type of feedback across multiple files
- Multiple reviewers pointing out the same category of issue
- Feedback that references "we always do X" or "our convention is Y"
- Comments that suggest adding a lint rule or automated check

### Rule Quality
- Is the rule specific enough to be actionable? (not "write better code")
- Can the rule be checked mechanically? (lint rule, pre-commit hook)
- Does the rule have a clear "do this / don't do this" example?
- Would the rule prevent the same feedback in future PRs?

## Output Format

You MUST structure your response exactly as follows:

```
## PR Review Analysis

**PR**: #[number] — [title]
**Author**: [author]
**Reviewers**: [list of reviewers]
**Decision**: [approved | changes_requested | commented]
**Total Comments**: X review comments

---

## Review Feedback Summary

### By Category
| Category | Count | Severity Breakdown |
|----------|-------|--------------------|
| Pattern | 5 | 3 must-fix, 2 suggestions |
| Bug | 2 | 2 must-fix |
| Style | 3 | 3 suggestions |
| Types | 1 | 1 must-fix |

### Individual Comments

#### [Must Fix] Pattern: Use Server Components for data fetching
**File**: `src/app/orders/page.tsx:15`
**Reviewer**: @senior-dev
**Comment**: "This should be a Server Component — we don't fetch data in Client Components unless there's a user interaction trigger."
**Resolution**: [Resolved | Unresolved]

#### [Suggestion] Style: Prefer named exports over default exports
**File**: `src/components/OrderCard.tsx:1`
**Reviewer**: @tech-lead
**Comment**: "Our convention is named exports for components. Default exports make refactoring harder."
**Resolution**: [Resolved | Unresolved]

[Continue for all comments...]

---

## Patterns Identified

### Pattern 1: Server Components for Data Fetching
**Frequency**: 3 comments across 2 files
**Rule**: Components that fetch data on mount should be Server Components. Only use Client Components for data fetching when triggered by user interaction (search, pagination, form submission).
**Evidence**:
- Comment on `page.tsx:15`: "This should be a Server Component"
- Comment on `OrderList.tsx:8`: "Move this fetch to a Server Component parent"
- Comment on `UserProfile.tsx:22`: "Same pattern — fetch in server, pass as props"

### Pattern 2: Missing Error Boundaries
**Frequency**: 2 comments across 2 files
**Rule**: Every page-level component must have an `error.tsx` boundary. Components that fetch data must handle loading and error states explicitly.
**Evidence**:
- Comment on `page.tsx:30`: "What happens if this API call fails?"
- Comment on `OrderList.tsx:45`: "Add an error boundary here"

---

## Suggested Rules (for CLAUDE.md)

Add these to your project's CLAUDE.md or coding standards:

### Rule 1: Server vs Client Data Fetching
```markdown
## Data Fetching Convention
- Fetch data in Server Components by default
- Only use Client Component data fetching for user-triggered actions (search, filters, pagination)
- Never use `useEffect` for initial data loading — use Server Components or route handlers
```

### Rule 2: Error Boundary Coverage
```markdown
## Error Handling Convention
- Every route segment must have an `error.tsx` boundary
- Components that display async data must handle: loading, error, empty, and success states
- Use `<Suspense>` with meaningful fallbacks, not blank screens
```

### Rule 3: Export Convention
```markdown
## Export Convention
- Use named exports for all components and utilities: `export function Button()` not `export default function Button()`
- Exception: Next.js page/layout files that require default exports
```

---

## Action Items

### Immediate (apply to current codebase)
- [ ] Add `error.tsx` boundaries to [specific routes found missing]
- [ ] Refactor [specific components] from Client to Server Components
- [ ] Convert default exports to named exports in [specific files]

### Process Improvements
- [ ] Add ESLint rule: [specific rule if available, e.g., `no-default-export`]
- [ ] Update CLAUDE.md with the [X] rules identified above
- [ ] Add pre-commit check for [specific pattern]

### Knowledge Sharing
- [ ] Document the Server/Client Component decision tree for the team
- [ ] Add examples of proper error boundary usage to component templates
```

## Self-Check

Before responding, verify:
- [ ] You read ALL review comments, not just the first few
- [ ] You categorized every comment (none left unclassified)
- [ ] You identified patterns (repeated feedback themes), not just listed individual comments
- [ ] Suggested rules are specific and actionable, not generic advice
- [ ] Rules include concrete "do this / don't do this" examples
- [ ] Action items reference specific files or components in the project

## Constraints

- Do NOT fabricate review comments — only report what actually exists on the PR.
- Do NOT generate rules from a single comment unless it addresses a critical issue (security, data loss).
- Do NOT suggest overly broad rules (e.g., "write clean code") — every rule must be specific enough to check.
- Do NOT ignore unresolved comments — flag them as requiring follow-up.
- If the PR has no review comments, report that clearly and suggest requesting a review.
- Use the GitHub CLI (`gh`) for all GitHub API interactions, not raw curl commands.

Target: $ARGUMENTS
