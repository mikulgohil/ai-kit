# When to Use AI (and When Not To)

## Great for AI ✅

| Task | Why |
|------|-----|
| Scaffolding components/pages | Repetitive structure, follows patterns |
| Writing tests | Tedious, pattern-based |
| Bug investigation | AI can trace data flow faster than reading |
| Code review | Catches things humans miss |
| Refactoring | Structural changes with clear rules |
| Understanding unfamiliar code | AI explains faster than reading docs |
| Boilerplate (types, configs, API clients) | Pattern-heavy, low creativity needed |
| Documentation | Summarizing what code does |

## Not Great for AI ❌

| Task | Why |
|------|-----|
| Architecture decisions | Needs business context AI doesn't have |
| Complex state machines | Hard to describe in a prompt |
| Design/UX decisions | AI can implement designs, not create them |
| Security-critical auth flows | Too risky to trust AI alone |
| Performance tuning (without data) | Needs profiling, not guessing |
| Merge conflict resolution | AI doesn't know your intent |

## Decision Flow

```
Is this task...
├── Repetitive/Pattern-based? → Use AI
├── Creative/Design? → Do it yourself, use AI to implement
├── Security-critical? → Do it yourself, use AI to review
├── Investigation? → Use AI to explore, verify yourself
└── Architectural? → Discuss with team, use AI for implementation
```

## Cost-Effective Usage

1. **One focused task per conversation** — don't let conversations drift
2. **Point to files** — "read src/X.tsx" is cheaper than pasting code
3. **Use slash commands** — they include the right context automatically
4. **Don't iterate forever** — if AI can't get it in 2 tries, take over
5. **Review before accepting** — faster to fix during review than debug later
