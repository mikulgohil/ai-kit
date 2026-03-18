# Continuous Learning — Extract Patterns from Session

Review the current coding session and extract reusable patterns.

## Process

### 1. Review Session Activity
- What files were created, modified, or deleted?
- What approaches worked on the first try?
- What failed and required a different strategy?
- What patterns were repeated across multiple changes?

### 2. Extract Patterns
For each pattern identified, document:

```markdown
### Pattern: [Name]
- **Confidence**: high | medium | low
- **Context**: when this pattern applies
- **What**: the pattern itself
- **Why**: why it works or matters
- **Example**: specific code or approach reference
```

### 3. Categorize Findings
- **Code Patterns**: reusable approaches to common problems
- **Debugging Insights**: what error messages actually meant
- **Architecture Decisions**: structural choices that worked well
- **Anti-Patterns**: approaches that failed or caused issues
- **Tool Usage**: effective ways to use project tools

### 4. Save Learnings
Write findings to `ai-kit/learnings/[YYYY-MM-DD]-[topic].md` with:
- Date and session context
- Each pattern with confidence rating
- Suggestions for which patterns should become project rules

### 5. Suggest Rule Promotions
If a pattern has **high confidence** and applies broadly:
- Recommend adding it to CLAUDE.md or .cursorrules
- Draft the rule text for review
- Explain why it should be a permanent rule

## Tips
- Focus on patterns specific to THIS project, not general knowledge
- Include the "why" — a pattern without rationale will be forgotten
- Low-confidence patterns are still valuable — they seed future learning
- Compare against existing rules to avoid duplicates
