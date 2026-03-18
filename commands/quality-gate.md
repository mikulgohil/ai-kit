# Quality Gate — Comprehensive Quality Checks

Run all quality checks and present a pass/fail summary.

## Checks

### TypeScript Type Check
```bash
npx tsc --noEmit --pretty
```
**Pass criteria**: zero errors

### Lint (ESLint)
```bash
npx eslint . --max-warnings 0 --format compact
```
**Pass criteria**: zero errors, zero warnings

### Format (Prettier or Biome)
```bash
npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}"
# or
npx @biomejs/biome check .
```
**Pass criteria**: all files formatted

### Unit Tests
```bash
npm test -- --run --reporter=verbose
```
**Pass criteria**: all tests pass

### Build
```bash
npm run build
```
**Pass criteria**: build succeeds without errors

### Bundle Size (if @next/bundle-analyzer available)
Check for significant size increases compared to main branch.

### Accessibility (if axe-core available)
```bash
npx playwright test --grep @a11y
```
**Pass criteria**: no critical or serious violations

### Security
```bash
npm audit --production --audit-level=high
```
**Pass criteria**: no high or critical vulnerabilities

Check for common issues:
- `console.log` statements in production code
- Hardcoded secrets or API keys
- `any` types in TypeScript

## Output Format

```
┌─────────────┬────────┬─────────────────────────┐
│ Check       │ Status │ Details                 │
├─────────────┼────────┼─────────────────────────┤
│ TypeScript  │ ✓ PASS │ 0 errors                │
│ Lint        │ ✓ PASS │ 0 warnings              │
│ Format      │ ✓ PASS │ All files formatted     │
│ Tests       │ ✓ PASS │ 42/42 passed (87% cov)  │
│ Build       │ ✓ PASS │ 12.3s                   │
│ Bundle      │ ⚠ WARN │ +15KB from main         │
│ A11y        │ ✓ PASS │ 0 violations            │
│ Security    │ ✓ PASS │ 0 high/critical         │
│ Console.log │ ✗ FAIL │ 3 files have console.log│
└─────────────┴────────┴─────────────────────────┘

Result: 8/9 passed — fix console.log before merge
```

## Gate Policy
- **All PASS**: safe to merge
- **Any WARN**: merge with acknowledgment
- **Any FAIL**: fix before merge (no exceptions in strict mode)
