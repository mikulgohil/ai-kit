import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectNextjs } from '../../src/scanner/nextjs.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-nextjs-'));
}

describe('detectNextjs', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('framework detection', () => {
    it('returns framework nextjs when next is in dependencies', () => {
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('nextjs');
    });

    it('returns framework nextjs when next is in devDependencies', () => {
      const pkg = { devDependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('nextjs');
    });

    it('returns framework react when only react is in deps', () => {
      const pkg = { dependencies: { react: '^18.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('react');
    });

    it('returns framework unknown when neither next nor react is present', () => {
      const pkg = { dependencies: { lodash: '4.17.21' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('unknown');
    });

    it('returns framework unknown when pkg has no deps at all', () => {
      const pkg = {};
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('unknown');
    });
  });

  describe('version extraction', () => {
    it('strips caret from version', () => {
      const pkg = { dependencies: { next: '^14.1.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.nextjsVersion).toBe('14.1.0');
    });

    it('strips tilde from version', () => {
      const pkg = { dependencies: { next: '~13.5.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.nextjsVersion).toBe('13.5.0');
    });

    it('strips >= from version', () => {
      const pkg = { dependencies: { next: '>=14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.nextjsVersion).toBe('14.0.0');
    });

    it('preserves plain version as-is', () => {
      const pkg = { dependencies: { next: '14.2.3' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.nextjsVersion).toBe('14.2.3');
    });
  });

  describe('router detection', () => {
    it('detects app router when app/ directory exists at root', () => {
      fs.mkdirSync(path.join(tmpDir, 'app'));
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('app');
    });

    it('detects app router when src/app/ directory exists', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('app');
    });

    it('detects pages router when pages/ directory exists at root', () => {
      fs.mkdirSync(path.join(tmpDir, 'pages'));
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('pages');
    });

    it('detects pages router when src/pages/ directory exists', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'pages'), { recursive: true });
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('pages');
    });

    it('detects hybrid when both app/ and pages/ directories exist', () => {
      fs.mkdirSync(path.join(tmpDir, 'app'));
      fs.mkdirSync(path.join(tmpDir, 'pages'));
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('hybrid');
    });

    it('detects hybrid when src/app and src/pages both exist', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'src', 'pages'), { recursive: true });
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBe('hybrid');
    });

    it('returns undefined routerType when no app or pages dir exists', () => {
      const pkg = { dependencies: { next: '14.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBeUndefined();
    });

    it('does not set routerType for non-nextjs projects', () => {
      fs.mkdirSync(path.join(tmpDir, 'app'));
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.routerType).toBeUndefined();
    });
  });

  describe('result shape', () => {
    it('returns no nextjsVersion for non-nextjs projects', () => {
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.nextjsVersion).toBeUndefined();
    });

    it('merges dependencies and devDependencies', () => {
      const pkg = {
        dependencies: { react: '18.0.0' },
        devDependencies: { next: '^14.0.0' },
      };
      const result = detectNextjs(tmpDir, pkg);
      expect(result.framework).toBe('nextjs');
      expect(result.nextjsVersion).toBe('14.0.0');
    });
  });
});
