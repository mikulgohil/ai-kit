import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectMonorepo } from '../../src/scanner/monorepo.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-monorepo-'));
}

describe('detectMonorepo', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('turborepo detection', () => {
    it('detects turborepo when turbo.json exists', () => {
      fs.writeJsonSync(path.join(tmpDir, 'turbo.json'), { pipeline: {} });
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepo).toBe(true);
      expect(result.monorepoTool).toBe('turborepo');
    });
  });

  describe('nx detection', () => {
    it('detects nx when nx.json exists', () => {
      fs.writeJsonSync(path.join(tmpDir, 'nx.json'), { version: 2 });
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepo).toBe(true);
      expect(result.monorepoTool).toBe('nx');
    });
  });

  describe('lerna detection', () => {
    it('detects lerna when lerna.json exists', () => {
      fs.writeJsonSync(path.join(tmpDir, 'lerna.json'), { version: '0.0.0' });
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepo).toBe(true);
      expect(result.monorepoTool).toBe('lerna');
    });
  });

  describe('pnpm-workspaces detection', () => {
    it('detects pnpm-workspaces when pnpm-workspace.yaml exists', () => {
      fs.writeFileSync(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"');
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepo).toBe(true);
      expect(result.monorepoTool).toBe('pnpm-workspaces');
    });
  });

  describe('workspaces in package.json', () => {
    it('detects monorepo when pkg.workspaces is an array', () => {
      const pkg = { workspaces: ['packages/*'] };
      const result = detectMonorepo(tmpDir, pkg);
      expect(result.monorepo).toBe(true);
    });

    it('detects monorepo when pkg.workspaces is an object (yarn workspaces)', () => {
      const pkg = { workspaces: { packages: ['packages/*'] } };
      const result = detectMonorepo(tmpDir, pkg);
      expect(result.monorepo).toBe(true);
    });

    it('does not set monorepoTool when detected only via package.json workspaces', () => {
      const pkg = { workspaces: ['packages/*'] };
      const result = detectMonorepo(tmpDir, pkg);
      expect(result.monorepoTool).toBeUndefined();
    });
  });

  describe('no monorepo detected', () => {
    it('returns monorepo false when no indicator files exist and no workspaces', () => {
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepo).toBe(false);
    });

    it('returns monorepo false when pkg has no workspaces field', () => {
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectMonorepo(tmpDir, pkg);
      expect(result.monorepo).toBe(false);
    });

    it('does not set monorepoTool when monorepo is false', () => {
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepoTool).toBeUndefined();
    });
  });

  describe('priority ordering', () => {
    it('turbo.json takes priority over nx.json when both exist', () => {
      fs.writeJsonSync(path.join(tmpDir, 'turbo.json'), {});
      fs.writeJsonSync(path.join(tmpDir, 'nx.json'), {});
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepoTool).toBe('turborepo');
    });

    it('nx.json takes priority over lerna.json when turbo absent', () => {
      fs.writeJsonSync(path.join(tmpDir, 'nx.json'), {});
      fs.writeJsonSync(path.join(tmpDir, 'lerna.json'), {});
      const result = detectMonorepo(tmpDir, {});
      expect(result.monorepoTool).toBe('nx');
    });
  });
});
