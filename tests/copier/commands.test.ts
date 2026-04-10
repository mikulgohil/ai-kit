import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { copyCommands, copySkills } from '../../src/copier/skills.js';
import { COMMANDS_DIR } from '../../src/constants.js';

/**
 * These tests use a real temp directory as the target and rely on the actual
 * source commands in the project's commands/ directory being present.
 */

const ALL_COMMANDS = [
  'kit-prompt-help',
  'kit-review',
  'kit-fix-bug',
  'kit-new-component',
  'kit-new-page',
  'kit-understand',
  'kit-test',
  'kit-optimize',
  'kit-figma-to-code',
  'kit-design-tokens',
  'kit-accessibility-audit',
  'kit-security-check',
  'kit-refactor',
  'kit-api-route',
  'kit-pre-pr',
  'kit-migrate',
  'kit-error-boundary',
  'kit-type-fix',
  'kit-extract-hook',
  'kit-dep-check',
  'kit-env-setup',
  'kit-commit-msg',
  'kit-sitecore-debug',
  'kit-responsive-check',
  'kit-document',
  'kit-token-tips',
  // v1.1.0
  'kit-perf-audit',
  'kit-bundle-check',
  'kit-i18n-check',
  'kit-schema-gen',
  'kit-changelog',
  'kit-release',
  'kit-storybook-gen',
  // v1.2.0
  'kit-search-first',
  'kit-quality-gate-check',
  'kit-server-action',
  'kit-middleware',
  'kit-save-session',
  'kit-resume-session',
  'kit-checkpoint',
  'kit-orchestrate',
  'kit-quality-gate',
  'kit-harness-audit',
  // v1.7.0
  'kit-deep-interview',
  'kit-clarify-requirements',
  // v1.10.0
  'kit-fetch-docs',
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
      const reviewDest = path.join(commandsDir, 'kit-review.md');
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

  describe('skill directories', () => {
    it('creates skill directories for Claude Code and Cursor', async () => {
      await copyCommands(tmpDir);
      // Check Claude Code skills
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'skills', 'kit-review', 'SKILL.md'))).toBe(true);
      // Check Cursor skills
      expect(fs.existsSync(path.join(tmpDir, '.cursor', 'skills', 'kit-review', 'SKILL.md'))).toBe(true);
      // Check legacy commands still exist
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'commands', 'kit-review.md'))).toBe(true);
    });

    it('creates a SKILL.md with the same content as the source command', async () => {
      await copySkills(tmpDir);
      const availableCommands = ALL_COMMANDS.filter((cmd) =>
        fs.existsSync(path.join(COMMANDS_DIR, `${cmd}.md`)),
      );

      for (const cmd of availableCommands) {
        const sourceContent = fs.readFileSync(path.join(COMMANDS_DIR, `${cmd}.md`), 'utf-8');
        const claudeSkillContent = fs.readFileSync(
          path.join(tmpDir, '.claude', 'skills', cmd, 'SKILL.md'),
          'utf-8',
        );
        const cursorSkillContent = fs.readFileSync(
          path.join(tmpDir, '.cursor', 'skills', cmd, 'SKILL.md'),
          'utf-8',
        );
        expect(claudeSkillContent).toBe(sourceContent);
        expect(cursorSkillContent).toBe(sourceContent);
      }
    });

    it('creates skill directories for all available commands', async () => {
      const copied = await copySkills(tmpDir);

      for (const skill of copied) {
        expect(fs.existsSync(path.join(tmpDir, '.claude', 'skills', skill, 'SKILL.md'))).toBe(true);
        expect(fs.existsSync(path.join(tmpDir, '.cursor', 'skills', skill, 'SKILL.md'))).toBe(true);
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
