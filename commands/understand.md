# Code Explainer

Explain code in detail for learning purposes.

## Instructions
1. If no file specified, ask: "Which file or function do you want me to explain?"
2. Read the file completely
3. Provide explanation at two levels:

### High-Level Overview
- What this file/function does (1-2 sentences)
- Where it fits in the project architecture
- What depends on it and what it depends on

### Detailed Walkthrough
For each significant section:
- What it does
- Why it's done this way
- Any patterns or techniques used (name them)
- Potential gotchas or non-obvious behavior

### Visual
If helpful, include a simple flow diagram:
```
Input → Process A → Process B → Output
                 ↓
            Side Effect
```

## Rules
- Use plain language — explain like teaching a junior developer
- Don't just restate the code — explain the *why*
- Highlight any clever or unusual patterns
- Flag any potential issues or improvements (but don't change the code)

Target: $ARGUMENTS
