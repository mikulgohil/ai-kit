import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectTypescript } from '../../src/scanner/typescript.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-typescript-'));
}

describe('detectTypescript', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('tsconfig.json absence', () => {
    it('returns typescript false when tsconfig.json does not exist', () => {
      const result = detectTypescript(tmpDir);
      expect(result.typescript).toBe(false);
    });

    it('does not set typescriptStrict when tsconfig.json is absent', () => {
      const result = detectTypescript(tmpDir);
      expect(result.typescriptStrict).toBeUndefined();
    });
  });

  describe('tsconfig.json presence', () => {
    it('returns typescript true when tsconfig.json exists', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: {},
      });
      const result = detectTypescript(tmpDir);
      expect(result.typescript).toBe(true);
    });

    it('detects strict mode when compilerOptions.strict is true', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { strict: true },
      });
      const result = detectTypescript(tmpDir);
      expect(result.typescript).toBe(true);
      expect(result.typescriptStrict).toBe(true);
    });

    it('returns typescriptStrict false when strict is explicitly false', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { strict: false },
      });
      const result = detectTypescript(tmpDir);
      expect(result.typescriptStrict).toBe(false);
    });

    it('returns typescriptStrict false when compilerOptions exists without strict', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { target: 'ES2022' },
      });
      const result = detectTypescript(tmpDir);
      expect(result.typescriptStrict).toBe(false);
    });

    it('returns typescriptStrict false when compilerOptions is absent', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {
        include: ['src'],
      });
      const result = detectTypescript(tmpDir);
      expect(result.typescriptStrict).toBe(false);
    });

    it('returns typescriptStrict false when tsconfig.json is empty object', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tsconfig.json'), {});
      const result = detectTypescript(tmpDir);
      expect(result.typescriptStrict).toBe(false);
    });

    it('handles malformed tsconfig.json gracefully by returning typescript true', () => {
      // readJsonSafe returns null on parse error; the function must still return typescript:true
      // because fileExists passes — but readJsonSafe returns null so strict falls back to ?? false
      fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), '{ invalid json }');
      const result = detectTypescript(tmpDir);
      expect(result.typescript).toBe(true);
      expect(result.typescriptStrict).toBe(false);
    });
  });
});
