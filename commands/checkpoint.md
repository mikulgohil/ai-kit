# Checkpoint — Verification Snapshot

Run all quality checks and record the results as a checkpoint.

## Checks to Run

### 1. TypeScript
```bash
npx tsc --noEmit
```
Record: pass/fail + error count

### 2. Lint
```bash
npx eslint . --max-warnings 0
```
Record: pass/fail + warning/error count

### 3. Format Check
```bash
npx prettier --check .
# or
npx @biomejs/biome check .
```
Record: pass/fail + files needing format

### 4. Tests
```bash
npm test -- --run
```
Record: pass/fail + test count + coverage %

### 5. Build
```bash
npm run build
```
Record: pass/fail + build time

### 6. Bundle Size (if analyzer available)
Record: total bundle size, largest chunks

### 7. Security
```bash
npm audit --production
```
Record: vulnerability count by severity

## Save Checkpoint
Write results to `ai-kit/checkpoints/[YYYY-MM-DD]-[HH-MM].md`:

```markdown
# Checkpoint: YYYY-MM-DD HH:MM

| Check | Status | Details |
|-------|--------|---------|
| TypeScript | PASS | 0 errors |
| Lint | PASS | 0 warnings |
| Format | PASS | All files formatted |
| Tests | PASS | 42 passed, 0 failed, 87% coverage |
| Build | PASS | 12.3s |
| Security | WARN | 2 low vulnerabilities |

## Git Status
- Branch: feature/xyz
- Uncommitted changes: 3 files
- Last commit: abc1234

## Compared to Previous Checkpoint
- [+] Test coverage increased from 84% to 87%
- [-] Build time increased by 1.2s
- [=] No new lint warnings
```

## Compare Against Previous
If a previous checkpoint exists:
- Flag any regressions (things that got worse)
- Highlight improvements
- Note unchanged metrics
