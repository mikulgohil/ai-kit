import path from 'path';
import { readFileSafe } from '../utils.js';

/**
 * Parse .aiignore file (gitignore-like syntax) and return patterns.
 * These patterns tell AI agents and scanners to skip certain files/directories.
 */
export function loadAiIgnorePatterns(projectPath: string): string[] {
  const content = readFileSafe(path.join(projectPath, '.aiignore'));
  if (!content) return [];

  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/**
 * Check if a file path should be ignored based on .aiignore patterns.
 * Supports simple glob-like matching:
 * - `*.generated.ts` — matches any file ending with .generated.ts
 * - `legacy/` — matches any path containing /legacy/
 * - `src/generated` — matches exact directory prefix
 */
export function shouldIgnore(
  filePath: string,
  patterns: string[],
): boolean {
  if (patterns.length === 0) return false;

  const normalized = filePath.replace(/\\/g, '/');

  for (const pattern of patterns) {
    // Directory pattern (ends with /)
    if (pattern.endsWith('/')) {
      const dir = pattern.slice(0, -1);
      if (normalized.includes(`/${dir}/`) || normalized.startsWith(`${dir}/`)) {
        return true;
      }
      continue;
    }

    // Wildcard pattern (starts with *)
    if (pattern.startsWith('*')) {
      const suffix = pattern.slice(1);
      if (normalized.endsWith(suffix)) {
        return true;
      }
      continue;
    }

    // Wildcard pattern (contains *)
    if (pattern.includes('*')) {
      const parts = pattern.split('*');
      let remaining = normalized;
      let allMatched = true;

      for (const part of parts) {
        if (part === '') continue;
        const idx = remaining.indexOf(part);
        if (idx === -1) {
          allMatched = false;
          break;
        }
        remaining = remaining.slice(idx + part.length);
      }

      if (allMatched) return true;
      continue;
    }

    // Exact or prefix match
    if (normalized === pattern || normalized.includes(`/${pattern}`) || normalized.startsWith(pattern)) {
      return true;
    }
  }

  return false;
}
