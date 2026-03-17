# Commit Message Generator

Generate a conventional commit message from your staged changes.

## What This Command Does

Analyzes your staged git changes (`git diff --cached`) and writes a properly formatted commit message following the Conventional Commits standard. No more staring at the blank commit message prompt.

## How to Use

Stage your changes first, then run:

```
/commit-msg
```

## Commit Message Format

```
<type>(<scope>): <short description>

<body — what and why, not how>

<footer — breaking changes, ticket references>
```

### Types

| Type | When to Use | Example |
|------|------------|---------|
| `feat` | New feature or capability | `feat(cart): add quantity selector to cart items` |
| `fix` | Bug fix | `fix(auth): prevent session timeout on active users` |
| `refactor` | Code restructuring without behavior change | `refactor(api): extract validation into shared middleware` |
| `docs` | Documentation changes only | `docs(readme): add deployment instructions` |
| `test` | Adding or fixing tests | `test(checkout): add payment form validation tests` |
| `style` | Formatting, whitespace (no logic changes) | `style: fix import order across components` |
| `chore` | Build, tooling, dependency updates | `chore(deps): upgrade next.js to 15.1.0` |
| `perf` | Performance improvement | `perf(images): lazy load below-fold product images` |

### Examples

**Small change — one line:**
```
fix(header): correct mobile nav z-index overlapping content
```

**Medium change — with body:**
```
feat(search): add debounced search with typeahead suggestions

- Debounce search input by 300ms to reduce API calls
- Show top 5 matching suggestions in dropdown
- Keyboard navigation (arrow keys + enter) for suggestions
- Clear suggestions when input is empty
```

**Breaking change:**
```
feat(api)!: change order response format to include pagination

The /api/orders endpoint now returns:
{ data: Order[], meta: { page, total, perPage } }

Previously returned a flat array. All consumers must update.

BREAKING CHANGE: Order API response shape changed
Refs: JIRA-456
```

## Rules

1. **Subject line under 72 characters** — so it reads well in git log
2. **Imperative mood** — "add feature" not "added feature" or "adds feature"
3. **No period at the end** of the subject line
4. **Body explains why**, not what — the diff shows what changed
5. **One logical change per commit** — don't mix a bug fix with a new feature
6. **Reference tickets** when applicable — `Refs: JIRA-123`

## Common Mistakes This Prevents

| Bad Message | Problem | Better Message |
|-------------|---------|---------------|
| `fix stuff` | No context | `fix(cart): prevent negative quantities on update` |
| `WIP` | Not a real commit | Don't commit WIP — stash instead |
| `updated files` | No information | `refactor(auth): move session logic to useAuth hook` |
| `bug fix` | Which bug? | `fix(checkout): handle expired payment token gracefully` |
| `asdf` | Meaningless | Stage only what's ready, write a real message |

Target: $ARGUMENTS
