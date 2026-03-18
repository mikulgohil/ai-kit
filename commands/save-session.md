# Save Session — Persist Current Context

Save the current session state so it can be resumed later.

## What to Capture

### 1. Session Summary
- What was the goal of this session?
- What was accomplished?
- How far through the work are we?

### 2. Files Modified
List every file that was created, modified, or deleted:
```markdown
- `src/components/Header.tsx` — added mobile navigation
- `src/hooks/useAuth.ts` — created new auth hook
- `tests/header.spec.ts` — added E2E tests
```

### 3. Decisions Made
Document architectural and design decisions:
```markdown
- Chose Context API over Zustand for auth state (simpler, no extra dep)
- Used Server Component for header (no client interactivity needed)
- Deferred dark mode to follow-up PR
```

### 4. Pending Work
What remains to be done:
```markdown
- [ ] Add unit tests for useAuth hook
- [ ] Update Storybook stories for Header
- [ ] Fix mobile nav animation on iOS Safari
```

### 5. Current State
- Are there uncommitted changes?
- Is the build passing?
- Any known issues or blockers?

## Save Location
Write to `ai-kit/sessions/[YYYY-MM-DD]-[HH-MM]-[topic].md`

## Format
```markdown
# Session: [Topic]
**Date**: YYYY-MM-DD HH:MM
**Duration**: approximate
**Status**: in-progress | paused | completed

## Summary
[What was accomplished]

## Files Modified
[List with descriptions]

## Decisions
[Key choices and rationale]

## Pending
[Checklist of remaining work]

## Notes
[Anything else relevant for resumption]
```
