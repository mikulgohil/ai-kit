import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    // Allow Vitest to resolve .js imports to .ts source files when running
    // against TypeScript source directly (ESM NodeNext project).
    conditions: ['import', 'node', 'default'],
  },
});
