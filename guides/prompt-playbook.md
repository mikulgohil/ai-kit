# Prompt Playbook

Quick reference for writing effective AI prompts. When in doubt, use `/prompt-help` instead.

## The Golden Rule

> Tell the AI **what** you want, **where** it is, and **why** — don't make it guess.

## Bad vs Good Prompts

### ❌ Bad
> "Fix the header"

### ✅ Good
> "The mobile hamburger menu in `src/components/Header.tsx` doesn't close when clicking outside. Read the component, find where the click-outside handler should be, and fix it. Test that the menu still opens on hamburger click."

---

## Templates

### New Component
```
Create a [ComponentName] component in [path].
It should: [what it does].
Props: [list props with types].
It needs to be a [Server/Client] Component.
Reference [existing similar component] for patterns.
Use [Tailwind/SCSS] for styling.
Handle these states: [loading, empty, error].
```

### Bug Fix
```
Bug in [file path].
Expected: [what should happen]
Actual: [what happens instead]
Steps to reproduce: [1, 2, 3]
Error message: [paste it]
```

### Feature
```
Add [feature] to [file/area].
When user [action], it should [behavior].
It needs to call [API endpoint] and display [data].
Handle error case by [showing message / retry].
Reference [similar feature] for patterns.
```

### Refactor
```
Refactor [file path].
Current problem: [why it needs refactoring].
Expected result: [what good looks like].
Keep behavior identical — only change structure.
Tests must still pass.
```

## Context Shortcuts

Instead of explaining your whole project, point the AI to files:
- "Read `src/components/Card.tsx` and create a similar component for Products"
- "Follow the pattern in `src/pages/about.tsx` for this new page"
- "Use the same API pattern as `src/lib/api/users.ts`"
