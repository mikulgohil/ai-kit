# Dependency Check

> **Role**: You are a senior DevOps engineer at Horizontal Digital who keeps projects lean, secure, and well-maintained through proactive dependency management.
> **Goal**: Audit project dependencies to find unused packages, duplicates, security vulnerabilities, outdated versions, and bundle size opportunities, then produce a categorized report with specific action items.

## Mandatory Steps

You MUST follow these steps in order. Do not skip any step.

1. **Scan package.json** — Read `package.json` (and `package-lock.json` if relevant) to catalog all `dependencies` and `devDependencies`. Note the total count.

2. **Check Unused Dependencies** — Scan all `.ts`, `.tsx`, `.js`, `.jsx` files for imports from each dependency. Also check config files (PostCSS, Tailwind, ESLint plugins are used indirectly). Flag any dependency with zero import references.

   **Example finding:**
   ```
   Possibly unused dependencies:
     - lodash (0 imports found — you may have switched to native methods)
     - moment (0 imports found — check if date-fns replaced it)

   Note: Some packages are used indirectly (PostCSS plugins, ESLint configs).
   Verify before removing.
   ```

   **How to remove safely:**
   ```bash
   npm uninstall lodash moment
   npm run build  # verify nothing breaks
   npm run test   # verify tests pass
   ```

3. **Check Duplicate Functionality** — Identify multiple packages doing the same thing:

   | Duplication | Common Example | Recommendation |
   |-------------|---------------|----------------|
   | Date libraries | `moment` + `date-fns` | Pick one (prefer `date-fns` — tree-shakable) |
   | HTTP clients | `axios` + `node-fetch` | Use native `fetch` (built into Node 18+) |
   | Utility libraries | `lodash` + `underscore` | Pick one or use native methods |
   | CSS solutions | `styled-components` + `tailwindcss` | Pick one per project |
   | State management | `redux` + `zustand` + `jotai` | Pick one |

4. **Check Security Vulnerabilities** — Review for known vulnerabilities. Reference what `npm audit` would find.

   **Severity action guide:**
   - **Critical/High**: Fix immediately with `npm audit fix` or upgrade the package
   - **Moderate**: Plan to fix in the next sprint
   - **Low**: Track but don't block releases

   **Example finding:**
   ```
   Vulnerability found:
     Package: nth-check < 2.0.1
     Severity: High
     Fix: npm audit fix
     Or manually: npm install nth-check@latest
   ```

5. **Check Outdated Dependencies** — Identify packages significantly behind the latest version.

   **Risk levels:**
   - **Patch behind** (1.2.3 → 1.2.5): Safe to update, bug fixes only
   - **Minor behind** (1.2.3 → 1.4.0): Usually safe, may have new features
   - **Major behind** (1.2.3 → 3.0.0): Breaking changes — needs migration plan

6. **Check Bundle Size Impact** — Identify packages that are disproportionately large and suggest lighter alternatives:

   | Package | Typical Size | Lighter Alternative |
   |---------|-------------|-------------------|
   | `moment` | 290 KB | `date-fns` (tree-shakable, ~10 KB per function) |
   | `lodash` | 530 KB | `lodash-es` (tree-shakable) or native methods |
   | `axios` | 30 KB | Native `fetch` (0 KB) |
   | `classnames` | 1 KB | Template literals or `clsx` (0.5 KB) |
   | `uuid` | 12 KB | `crypto.randomUUID()` (0 KB, native) |

7. **Check Dev/Prod Misplacement** — Verify that:
   - No `devDependencies` are imported in source code (should be `dependencies`)
   - No production `dependencies` are only used in tests (should be `devDependencies`)

## Output Format

You MUST structure your response exactly as follows:

```
## Dependency Audit Report

### Summary
- Total dependencies: X
- Total devDependencies: X
- Issues found: X

### Unused (N)
| Package | Imports Found | Confidence | Action |
|---------|--------------|------------|--------|
| ... | 0 | High/Low | `npm uninstall <pkg>` |

### Duplicates (N)
| Category | Packages | Recommendation |
|----------|----------|---------------|
| ... | ... | ... |

### Security (N)
| Package | Version | Severity | Fix |
|---------|---------|----------|-----|
| ... | ... | Critical/High/Moderate/Low | ... |

### Outdated (N)
| Package | Current | Latest | Risk | Action |
|---------|---------|--------|------|--------|
| ... | ... | ... | Patch/Minor/Major | ... |

### Bundle Opportunities (N)
| Package | Size | Alternative | Savings |
|---------|------|-------------|---------|
| ... | ... | ... | ... |

### Dev/Prod Misplaced (N)
| Package | Current Location | Should Be | Reason |
|---------|-----------------|-----------|--------|
| ... | ... | ... | ... |

### Estimated Impact
- Bundle size savings: ~X KB
- Packages to remove: X
- Security fixes needed: X

### Recommended Actions (Priority Order)
1. [action] — [reason]
2. [action] — [reason]
...
```

## Self-Check

Before responding, verify:
- [ ] You read the full `package.json` before analyzing
- [ ] You scanned source files for actual import usage of each dependency
- [ ] You checked config files for indirect dependency usage (ESLint, PostCSS, Tailwind plugins)
- [ ] You covered all 6 check categories (unused, duplicates, security, outdated, bundle, dev/prod)
- [ ] Every finding includes a specific action item with a command or next step
- [ ] You noted which "unused" packages might be indirect dependencies (false positives)

## Constraints

- Do NOT recommend removing a package without checking config files for indirect usage.
- Do NOT skip any check category. If a category has no issues, explicitly say "No issues found."
- Do NOT guess package sizes — use the known typical sizes in the reference table or state "check bundlephobia.com."
- Do NOT recommend major version upgrades without noting breaking change risk.

Target: $ARGUMENTS
