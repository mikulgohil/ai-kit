import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectPackageManager } from '../../src/scanner/package-manager.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-pkgmgr-'));
}

describe('detectPackageManager', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('packageManager field in package.json', () => {
    it('detects pnpm from packageManager field', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        packageManager: 'pnpm@8.6.0',
      });
      expect(detectPackageManager(tmpDir)).toBe('pnpm');
    });

    it('detects yarn from packageManager field', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        packageManager: 'yarn@4.1.0',
      });
      expect(detectPackageManager(tmpDir)).toBe('yarn');
    });

    it('detects bun from packageManager field', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        packageManager: 'bun@1.0.0',
      });
      expect(detectPackageManager(tmpDir)).toBe('bun');
    });

    it('defaults to npm when packageManager field does not match known tools', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        packageManager: 'npm@10.0.0',
      });
      expect(detectPackageManager(tmpDir)).toBe('npm');
    });

    it('packageManager field takes priority over lock files', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        packageManager: 'yarn@4.1.0',
      });
      // Also write a pnpm lock file — packageManager field should win
      fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(tmpDir)).toBe('yarn');
    });
  });

  describe('lock file detection', () => {
    it('detects pnpm from pnpm-lock.yaml', () => {
      fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(tmpDir)).toBe('pnpm');
    });

    it('detects yarn from yarn.lock', () => {
      fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
      expect(detectPackageManager(tmpDir)).toBe('yarn');
    });

    it('detects bun from bun.lockb', () => {
      fs.writeFileSync(path.join(tmpDir, 'bun.lockb'), '');
      expect(detectPackageManager(tmpDir)).toBe('bun');
    });

    it('detects bun from bun.lock', () => {
      fs.writeFileSync(path.join(tmpDir, 'bun.lock'), '');
      expect(detectPackageManager(tmpDir)).toBe('bun');
    });

    it('pnpm-lock.yaml takes priority over yarn.lock', () => {
      fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
      expect(detectPackageManager(tmpDir)).toBe('pnpm');
    });

    it('yarn.lock takes priority over bun.lockb', () => {
      fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '');
      fs.writeFileSync(path.join(tmpDir, 'bun.lockb'), '');
      expect(detectPackageManager(tmpDir)).toBe('yarn');
    });
  });

  describe('default fallback', () => {
    it('defaults to npm when no lock file and no package.json', () => {
      expect(detectPackageManager(tmpDir)).toBe('npm');
    });

    it('defaults to npm when package.json has no packageManager field', () => {
      fs.writeJsonSync(path.join(tmpDir, 'package.json'), {
        name: 'my-project',
      });
      expect(detectPackageManager(tmpDir)).toBe('npm');
    });
  });
});
