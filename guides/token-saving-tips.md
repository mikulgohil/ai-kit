# Token-Saving Tips

Tokens = cost. Here's how to use fewer tokens while getting better results.

## Biggest Token Wasters

| Habit | Token Cost | Fix |
|-------|-----------|-----|
| Pasting entire files into chat | 🔴 Very High | Point AI to file paths instead |
| Long back-and-forth conversations | 🔴 Very High | Start new conversations per task |
| Vague prompts that need clarification | 🟡 Medium | Use `/prompt-help` to get it right first time |
| Asking AI to read the whole codebase | 🔴 Very High | Be specific about which files |
| Not using existing patterns | 🟡 Medium | Reference existing files: "follow the pattern in X" |

## Quick Wins

### 1. Reference Files, Don't Paste
```
❌ "Here's my component: [500 lines of code]"
✅ "Read src/components/Header.tsx and fix the mobile menu"
```

### 2. One Task Per Conversation
Each new message includes ALL previous context. A 20-message conversation sends everything 20 times. Start fresh for new tasks.

### 3. Be Specific Upfront
```
❌ "Make a form" → AI asks 5 questions → 10 messages → 5000 tokens wasted
✅ Use /prompt-help → 1 structured prompt → done in 2 messages
```

### 4. Use Slash Commands
Commands include pre-built context. `/new-component Button` is more efficient than typing all the instructions manually.

### 5. Point to Patterns
```
"Create ProductCard following the exact same pattern as src/components/UserCard.tsx"
```
The AI reads one file and replicates the pattern — much cheaper than you explaining the pattern.

## The 2-Try Rule

If the AI doesn't get it right in 2 attempts:
1. Something is wrong with the prompt (missing context)
2. The task might be too complex for a single prompt
3. Take over manually — you'll save tokens and time

## Know Your Context Limits

Claude Code now supports up to **1M tokens of context** (Opus 4.6) with **64K default output** (128K ceiling). This is massive — but context still costs money.

| Model | Context Window | Default Output | Max Output |
|-------|---------------|----------------|------------|
| Opus 4.6 | 1M tokens | 64K tokens | 128K tokens |
| Sonnet 4.6 | 200K tokens | 64K tokens | 128K tokens |

### Use `/effort` to Control Token Spend
Claude Code's `/effort` command lets you set reasoning effort levels. For simple tasks, lower effort saves tokens. For complex architecture decisions, higher effort produces better results.

### Context Compaction
When conversations get long, Claude Code automatically compacts earlier context. The **PostCompact hook** fires after this happens — your AI Kit hooks use it to ensure important context survives compaction.

## CLAUDE.md Is Free Context

Your `CLAUDE.md` file is loaded automatically — everything in it gives the AI context without using your conversation tokens. That's why `ai-kit` generates it: better output from fewer tokens.
