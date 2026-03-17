import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { copyCommands } from '../../src/copier/commands.js';
import { COMMANDS_DIR } from '../../src/constants.js';

/**
 * These tests use a real temp directory as the target and rely on the actual
 * source commands in the project's commands/ directory being present.
 */

const ALL_COMMANDS = [
  'prompt-help',
  'review',
  'fix-bug',
  'new-component',
  'new-page',
  'understand',
  'test',
  'optimize',
  'figma-to-code',
  'design-tokens',
  'accessibility-audit',
  'security-check',
  'refactor',
  'api-route',
  'pre-pr',
  'migrate',
  'error-boundary',
  'type-fix',
  'extract-hook',
  'dep-check',
  'env-setup',
  'commit-msg',
  'sitecore-debug',
  'responsive-check',
  'document',
  'token-tips',
];

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-commands-'));
}

describe('copyCommands', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('directory creation', () => {
    it('creates .claude/commands/ directory inside targetDir', async () => {
      await copyCommands(tmpDir);
      const commandsDir = path.join(tmpDir, '.claude', 'commands');
      expect(fs.existsSync(commandsDir)).toBe(true);
      expect(fs.statSync(commandsDir).isDirectory()).toBe(true);
    });

    it('creates nested directories even when .claude does not yet exist', async () => {
      expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(false);
      await copyCommands(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands'))).toBe(true);
    });
  });

  describe('file copying', () => {
    it('copies all available command files to .claude/commands/', async () => {
      const copied = await copyCommands(tmpDir);
      const commandsDir = path.join(tmpDir, '.claude', 'commands');

      for (const cmd of copied) {
        const dest = path.join(commandsDir, `${cmd}.md`);
        expect(fs.existsSync(dest)).toBe(true);
      }
    });

    it('returns a non-empty list of copied command names', async () => {
      const copied = await copyCommands(tmpDir);
      expect(copied.length).toBeGreaterThan(0);
    });

    it('returns command names without the .md extension', async () => {
      const copied = await copyCommands(tmpDir);
      for (const cmd of copied) {
        expect(cmd).not.toMatch(/\.md$/);
      }
    });

    it('copies only commands whose source files exist in COMMANDS_DIR', async () => {
      const copied = await copyCommands(tmpDir);
      // Every returned command must have a real source file
      for (const cmd of copied) {
        const src = path.join(COMMANDS_DIR, `${cmd}.md`);
        expect(fs.existsSync(src)).toBe(true);
      }
    });

    it('returns all expected commands when the source directory is intact', async () => {
      const availableCommands = ALL_COMMANDS.filter((cmd) =>
        fs.existsSync(path.join(COMMANDS_DIR, `${cmd}.md`)),
      );
      const copied = await copyCommands(tmpDir);
      expect(copied).toEqual(expect.arrayContaining(availableCommands));
      expect(copied).toHaveLength(availableCommands.length);
    });

    it('overwrites an existing command file on second run', async () => {
      const commandsDir = path.join(tmpDir, '.claude', 'commands');

      // First copy
      await copyCommands(tmpDir);

      // Mutate the destination file
      const reviewDest = path.join(commandsDir, 'review.md');
      if (fs.existsSync(reviewDest)) {
        fs.writeFileSync(reviewDest, 'stale content');
        expect(fs.readFileSync(reviewDest, 'utf-8')).toBe('stale content');

        // Second copy — should overwrite
        await copyCommands(tmpDir);
        const restored = fs.readFileSync(reviewDest, 'utf-8');
        expect(restored).not.toBe('stale content');
      }
    });
  });

  describe('target isolation', () => {
    it('places files under the specified targetDir, not elsewhere', async () => {
      const anotherTmp = makeTempDir();
      try {
        await copyCommands(tmpDir);
        // The other directory should remain empty
        expect(fs.readdirSync(anotherTmp)).toHaveLength(0);
      } finally {
        fs.removeSync(anotherTmp);
      }
    });
  });
});
