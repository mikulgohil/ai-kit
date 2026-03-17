import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectStyling } from '../../src/scanner/styling.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-styling-'));
}

describe('detectStyling', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('tailwind detection', () => {
    it('detects tailwind when tailwindcss is in dependencies', () => {
      const pkg = { dependencies: { tailwindcss: '^3.4.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('detects tailwind when @tailwindcss/postcss is in dependencies', () => {
      const pkg = { dependencies: { '@tailwindcss/postcss': '^4.0.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('detects tailwind when tailwindcss is in devDependencies', () => {
      const pkg = { devDependencies: { tailwindcss: '3.4.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('detects tailwind from tailwind.config.js when not in deps', () => {
      fs.writeFileSync(path.join(tmpDir, 'tailwind.config.js'), 'module.exports = {}');
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('detects tailwind from tailwind.config.ts when not in deps', () => {
      fs.writeFileSync(path.join(tmpDir, 'tailwind.config.ts'), 'export default {}');
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('detects tailwind from tailwind.config.mjs when not in deps', () => {
      fs.writeFileSync(path.join(tmpDir, 'tailwind.config.mjs'), 'export default {}');
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
    });

    it('does not add tailwind twice when both dep and config file exist', () => {
      fs.writeFileSync(path.join(tmpDir, 'tailwind.config.js'), 'module.exports = {}');
      const pkg = { dependencies: { tailwindcss: '^3.4.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling.filter((s) => s === 'tailwind')).toHaveLength(1);
    });
  });

  describe('tailwind version extraction', () => {
    it('strips caret from tailwindcss version', () => {
      const pkg = { dependencies: { tailwindcss: '^3.4.1' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.tailwindVersion).toBe('3.4.1');
    });

    it('uses @tailwindcss/postcss version when tailwindcss absent', () => {
      const pkg = { dependencies: { '@tailwindcss/postcss': '^4.0.2' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.tailwindVersion).toBe('4.0.2');
    });

    it('returns undefined tailwindVersion when tailwind detected only via config file', () => {
      fs.writeFileSync(path.join(tmpDir, 'tailwind.config.js'), 'module.exports = {}');
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.tailwindVersion).toBeUndefined();
    });
  });

  describe('scss detection', () => {
    it('detects scss when sass is in dependencies', () => {
      const pkg = { dependencies: { sass: '^1.70.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('scss');
    });

    it('detects scss when node-sass is in dependencies', () => {
      const pkg = { dependencies: { 'node-sass': '^9.0.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('scss');
    });

    it('detects scss from devDependencies', () => {
      const pkg = { devDependencies: { sass: '1.70.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('scss');
    });
  });

  describe('styled-components detection', () => {
    it('detects styled-components when in dependencies', () => {
      const pkg = { dependencies: { 'styled-components': '^6.0.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('styled-components');
    });

    it('detects styled-components from devDependencies', () => {
      const pkg = { devDependencies: { 'styled-components': '6.0.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('styled-components');
    });
  });

  describe('multiple styling tools', () => {
    it('detects multiple tools at once', () => {
      const pkg = {
        dependencies: {
          tailwindcss: '^3.4.0',
          sass: '^1.70.0',
          'styled-components': '^6.0.0',
        },
      };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toContain('tailwind');
      expect(result.styling).toContain('scss');
      expect(result.styling).toContain('styled-components');
    });
  });

  describe('empty result', () => {
    it('returns empty styling array when no styling tools are found', () => {
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toEqual([]);
    });

    it('returns undefined tailwindVersion when nothing found', () => {
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.tailwindVersion).toBeUndefined();
    });

    it('returns empty styling array when pkg has no deps', () => {
      const pkg = {};
      const result = detectStyling(tmpDir, pkg);
      expect(result.styling).toEqual([]);
    });
  });
});
