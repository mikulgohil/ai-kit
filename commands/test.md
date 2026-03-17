# Test Generator

Generate tests for the specified code.

## Questions (ask if not provided)
1. Which file(s) to test?
2. Unit, integration, or E2E?
3. What testing framework? (detect from project deps: Jest, Vitest, Playwright)

## Rules
- Read the source file first to understand all code paths
- Match the project's existing test patterns and file naming
- Test file goes next to source file or in `__tests__/` (match project)
- Import patterns from existing test files

## Coverage
Generate tests for:
1. **Happy path** — normal expected behavior
2. **Edge cases** — empty input, null, undefined, boundary values
3. **Error cases** — what should fail and how
4. **Async behavior** — if the code has promises/async operations
5. **User interactions** — clicks, inputs, form submissions (for components)

## Structure
```typescript
describe('ComponentOrFunction', () => {
  describe('happy path', () => {
    it('should ...', () => {});
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {});
  });

  describe('error handling', () => {
    it('should throw when ...', () => {});
  });
});
```

## Rules
- Mock external dependencies, not the unit under test
- Use meaningful test names that describe behavior
- Avoid testing implementation details — test outcomes
- One assertion per test when possible

Target: $ARGUMENTS
