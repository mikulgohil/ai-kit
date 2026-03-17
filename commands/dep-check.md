# Dependency Check

Audit project dependencies — find unused packages, duplicates, security issues, and bloat.

## What This Command Does

Over time, projects accumulate dependencies that are no longer used, have known vulnerabilities, or could be replaced with lighter alternatives. This command audits your `package.json` and suggests cleanup actions.

## How to Use

```
/dep-check
```

## What Gets Checked

### 1. Unused Dependencies

Scan for packages in `package.json` that are never imported in your source code.

**How to identify:**
- Search all `.ts`, `.tsx`, `.js`, `.jsx` files for imports from each dependency
- Check config files too (PostCSS, Tailwind, ESLint plugins are used indirectly)
- Flag any dependency with zero import references

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

### 2. Duplicate Functionality

Multiple packages doing the same thing:

| Duplication | Common Example | Recommendation |
|-------------|---------------|----------------|
| Date libraries | `moment` + `date-fns` | Pick one (prefer `date-fns` — tree-shakable) |
| HTTP clients | `axios` + `node-fetch` | Use native `fetch` (built into Node 18+) |
| Utility libraries | `lodash` + `underscore` | Pick one or use native methods |
| CSS solutions | `styled-components` + `tailwindcss` | Pick one per project |
| State management | `redux` + `zustand` + `jotai` | Pick one |

### 3. Security Vulnerabilities

```bash
npm audit
```

**What to do with findings:**
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

### 4. Outdated Dependencies

Check for packages that are significantly behind the latest version:

```bash
npm outdated
```

**Risk levels:**
- **Patch behind** (1.2.3 → 1.2.5): Safe to update, bug fixes only
- **Minor behind** (1.2.3 → 1.4.0): Usually safe, may have new features
- **Major behind** (1.2.3 → 3.0.0): Breaking changes — needs migration plan

### 5. Bundle Size Impact

Identify packages that are disproportionately large:

| Package | Typical Size | Lighter Alternative |
|---------|-------------|-------------------|
| `moment` | 290 KB | `date-fns` (tree-shakable, ~10 KB per function) |
| `lodash` | 530 KB | `lodash-es` (tree-shakable) or native methods |
| `axios` | 30 KB | Native `fetch` (0 KB) |
| `classnames` | 1 KB | Template literals or `clsx` (0.5 KB) |
| `uuid` | 12 KB | `crypto.randomUUID()` (0 KB, native) |

### 6. Dev Dependencies in Production

Check if any `devDependencies` are imported in source code (should be `dependencies`), or if production `dependencies` are only used in tests (should be `devDependencies`).

## Output Format

```
Dependency Audit Report
=======================

Unused (3):
  ✗ lodash — no imports found in src/
  ✗ moment — no imports found in src/
  ✗ classnames — no imports found (you use clsx instead)

Security (1):
  ⚠ nth-check@1.0.2 — High severity — fix: npm audit fix

Outdated (2):
  ℹ next 14.2.0 → 15.1.0 (major — migration needed)
  ℹ tailwindcss 3.4.0 → 4.0.0 (major — migration needed)

Bundle opportunities:
  ℹ moment (290 KB) → date-fns (~10 KB per function used)
  ℹ axios (30 KB) → native fetch (0 KB)

Estimated savings: ~320 KB bundle reduction
```

## When to Run

- Before major releases
- Monthly maintenance check
- When build times or bundle size increase unexpectedly
- Before upgrading Node.js or framework versions

Target: $ARGUMENTS
