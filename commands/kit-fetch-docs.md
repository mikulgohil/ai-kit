# Fetch Docs

> **Role**: You are a documentation researcher. Your job is to fetch the latest, version-specific documentation for this project's tech stack and summarize it into the conversation context so all subsequent coding is informed by current APIs.
> **Goal**: Pre-load current documentation for the detected frameworks so the AI doesn't rely on potentially outdated training data.

## Mandatory Steps

You MUST follow these steps in order. Do not skip any step.

1. **Detect the Stack** — Read `ai-kit.config.json` (or `package.json` if config doesn't exist) to identify:
   - Framework and version (e.g., Next.js 16.2.2)
   - CMS and version (e.g., Sitecore Content SDK v2.x, Optimizely SaaS)
   - Styling framework (e.g., Tailwind CSS v4)
   - Any other key libraries in dependencies

2. **Fetch Documentation** — For each detected framework, fetch current docs using the best available method:

   **Next.js**:
   - Primary: Use Context7 MCP → `resolve-library-id` for "next.js" → `query-docs` for the specific topic
   - Fallback: WebFetch `https://nextjs.org/docs/llms-full.txt` (AI-optimized full docs)
   - Focus on: App Router APIs, Server Components, Server Actions, Middleware, ISR, Turbopack (if v16+)

   **Tailwind CSS**:
   - Primary: Use Context7 MCP → `resolve-library-id` for "tailwindcss" → `query-docs`
   - Focus on: v4 `@theme` syntax (if v4 detected), utility classes, responsive patterns, plugin API

   **Sitecore XM Cloud / Content SDK**:
   - Primary: Use Context7 MCP → `resolve-library-id` for "sitecore" → `query-docs`
   - Fallback: Check project repo for `LLMs.txt` file
   - Focus on: Component bindings, field helpers, Experience Edge GraphQL, personalization

   **React**:
   - Primary: Use Context7 MCP → `resolve-library-id` for "react" → `query-docs`
   - Focus on: React 19 APIs (useActionState, use, Server Components), hooks rules

   **Other libraries** (if specified in $ARGUMENTS):
   - Use Context7 MCP → `resolve-library-id` → `query-docs`

3. **Summarize Key APIs** — For each framework, produce a concise summary:
   - Current stable version
   - Key API changes since the AI's likely training cutoff
   - API signatures for commonly used functions
   - Breaking changes or deprecations to watch for
   - Code examples from the official docs

4. **Report What Was Loaded** — Print a summary table:

## Output Format

```
## Documentation Loaded

| Framework | Version | Source | Key APIs Fetched |
|-----------|---------|--------|-----------------|
| Next.js | 16.2.x | Context7 | App Router, Server Actions, Turbopack |
| Tailwind | 4.x | Context7 | @theme syntax, utility classes |
| Sitecore | SDK v2.x | LLMs.txt | Field helpers, Experience Edge |

## Key API Reference

### Next.js 16
[Concise API reference with signatures and examples]

### Tailwind CSS v4
[Key patterns and syntax differences from v3]

### Sitecore Content SDK v2.x
[Component patterns and field helper usage]

## What's New Since Training Cutoff
[Notable changes the AI might not know about]
```

## Rules

- ALWAYS check Context7 MCP first — it's the fastest and most reliable source
- If Context7 is not available, use WebFetch against official docs
- Keep summaries concise — focus on API signatures and patterns, not tutorials
- Highlight breaking changes and deprecations prominently
- If a specific library is passed as $ARGUMENTS, fetch docs for that library too
- Do NOT skip any detected framework — even if you think you know the APIs

## When to Use This Skill

- At the **start of a coding session** — run once to pre-load context
- Before **major framework upgrades** — fetch docs for both current and target versions
- When you encounter **unexpected API behavior** — refresh docs for the specific library
- When working with **niche libraries** (Sitecore, Optimizely) that models know less about

Target: $ARGUMENTS
