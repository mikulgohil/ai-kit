import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { copyGuides } from '../../src/copier/guides.js';
import { GUIDES_DIR } from '../../src/constants.js';

const ALL_GUIDES = [
  'getting-started',
  'prompt-playbook',
  'when-to-use-ai',
  'token-saving-tips',
  'figma-workflow',
];

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-guides-'));
}

describe('copyGuides', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('directory creation', () => {
    it('creates ai-kit/guides/ directory inside targetDir', async () => {
      await copyGuides(tmpDir);
      const guidesDir = path.join(tmpDir, 'ai-kit', 'guides');
      expect(fs.existsSync(guidesDir)).toBe(true);
      expect(fs.statSync(guidesDir).isDirectory()).toBe(true);
    });

    it('creates nested ai-kit/guides/ even when ai-kit does not yet exist', async () => {
      expect(fs.existsSync(path.join(tmpDir, 'ai-kit'))).toBe(false);
      await copyGuides(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, 'ai-kit', 'guides'))).toBe(true);
    });
  });

  describe('file copying', () => {
    it('copies all available guide files to ai-kit/guides/', async () => {
      const copied = await copyGuides(tmpDir);
      const guidesDir = path.join(tmpDir, 'ai-kit', 'guides');

      for (const guide of copied) {
        const dest = path.join(guidesDir, `${guide}.md`);
        expect(fs.existsSync(dest)).toBe(true);
      }
    });

    it('returns a non-empty list of copied guide names', async () => {
      const copied = await copyGuides(tmpDir);
      expect(copied.length).toBeGreaterThan(0);
    });

    it('returns guide names without the .md extension', async () => {
      const copied = await copyGuides(tmpDir);
      for (const guide of copied) {
        expect(guide).not.toMatch(/\.md$/);
      }
    });

    it('copies only guides whose source files exist in GUIDES_DIR', async () => {
      const copied = await copyGuides(tmpDir);
      for (const guide of copied) {
        const src = path.join(GUIDES_DIR, `${guide}.md`);
        expect(fs.existsSync(src)).toBe(true);
      }
    });

    it('returns all expected guides when the source directory is intact', async () => {
      const availableGuides = ALL_GUIDES.filter((guide) =>
        fs.existsSync(path.join(GUIDES_DIR, `${guide}.md`)),
      );
      const copied = await copyGuides(tmpDir);
      expect(copied).toEqual(expect.arrayContaining(availableGuides));
      expect(copied).toHaveLength(availableGuides.length);
    });

    it('overwrites an existing guide file on second run', async () => {
      const guidesDir = path.join(tmpDir, 'ai-kit', 'guides');

      await copyGuides(tmpDir);

      const gsDest = path.join(guidesDir, 'getting-started.md');
      if (fs.existsSync(gsDest)) {
        fs.writeFileSync(gsDest, 'stale guide content');
        expect(fs.readFileSync(gsDest, 'utf-8')).toBe('stale guide content');

        await copyGuides(tmpDir);
        const restored = fs.readFileSync(gsDest, 'utf-8');
        expect(restored).not.toBe('stale guide content');
      }
    });
  });

  describe('target isolation', () => {
    it('places files under ai-kit/guides inside the specified targetDir only', async () => {
      const anotherTmp = makeTempDir();
      try {
        await copyGuides(tmpDir);
        expect(fs.readdirSync(anotherTmp)).toHaveLength(0);
      } finally {
        fs.removeSync(anotherTmp);
      }
    });
  });
});
