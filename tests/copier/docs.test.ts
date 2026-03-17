import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { scaffoldDocs } from '../../src/copier/docs.js';
import { DOCS_SCAFFOLDS_DIR } from '../../src/constants.js';

const SCAFFOLD_NAMES = ['mistakes-log', 'decisions-log', 'time-log'];

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-docs-'));
}

describe('scaffoldDocs', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('directory creation', () => {
    it('creates docs/ directory inside targetDir', async () => {
      await scaffoldDocs(tmpDir);
      const docsDir = path.join(tmpDir, 'docs');
      expect(fs.existsSync(docsDir)).toBe(true);
      expect(fs.statSync(docsDir).isDirectory()).toBe(true);
    });
  });

  describe('file scaffolding', () => {
    it('creates scaffold doc files in docs/', async () => {
      const created = await scaffoldDocs(tmpDir);
      const docsDir = path.join(tmpDir, 'docs');

      for (const doc of created) {
        const dest = path.join(docsDir, `${doc}.md`);
        expect(fs.existsSync(dest)).toBe(true);
      }
    });

    it('returns a list of created scaffold names', async () => {
      const created = await scaffoldDocs(tmpDir);
      expect(created.length).toBeGreaterThan(0);
    });

    it('returns doc names without the .md extension', async () => {
      const created = await scaffoldDocs(tmpDir);
      for (const doc of created) {
        expect(doc).not.toMatch(/\.md$/);
      }
    });

    it('creates all available scaffold docs on first run', async () => {
      const availableScaffolds = SCAFFOLD_NAMES.filter((doc) =>
        fs.existsSync(path.join(DOCS_SCAFFOLDS_DIR, `${doc}.md`)),
      );
      const created = await scaffoldDocs(tmpDir);
      expect(created).toEqual(expect.arrayContaining(availableScaffolds));
    });
  });

  describe('no-overwrite behaviour', () => {
    it('does NOT overwrite an existing doc file', async () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);

      // Pre-create the first scaffold with custom content
      const firstScaffold = SCAFFOLD_NAMES.find((doc) =>
        fs.existsSync(path.join(DOCS_SCAFFOLDS_DIR, `${doc}.md`)),
      );
      if (firstScaffold) {
        const existingPath = path.join(docsDir, `${firstScaffold}.md`);
        const customContent = '# My custom notes\n\nDo not overwrite me.';
        fs.writeFileSync(existingPath, customContent);

        await scaffoldDocs(tmpDir);

        const contentAfter = fs.readFileSync(existingPath, 'utf-8');
        expect(contentAfter).toBe(customContent);
      }
    });

    it('does not include already-existing docs in the returned created list', async () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);

      const firstScaffold = SCAFFOLD_NAMES.find((doc) =>
        fs.existsSync(path.join(DOCS_SCAFFOLDS_DIR, `${doc}.md`)),
      );
      if (firstScaffold) {
        fs.writeFileSync(path.join(docsDir, `${firstScaffold}.md`), '# Existing');

        const created = await scaffoldDocs(tmpDir);
        expect(created).not.toContain(firstScaffold);
      }
    });

    it('creates missing docs alongside already-existing ones', async () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);

      const availableScaffolds = SCAFFOLD_NAMES.filter((doc) =>
        fs.existsSync(path.join(DOCS_SCAFFOLDS_DIR, `${doc}.md`)),
      );

      if (availableScaffolds.length >= 2) {
        // Pre-create the first scaffold
        fs.writeFileSync(
          path.join(docsDir, `${availableScaffolds[0]}.md`),
          '# Existing',
        );

        const created = await scaffoldDocs(tmpDir);
        // The second scaffold (and beyond) should still be created
        expect(created).toContain(availableScaffolds[1]);
      }
    });

    it('returns empty array when all docs already exist', async () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);

      // Pre-create all scaffolds
      for (const doc of SCAFFOLD_NAMES) {
        fs.writeFileSync(path.join(docsDir, `${doc}.md`), `# ${doc}`);
      }

      const created = await scaffoldDocs(tmpDir);
      // None should be recreated
      const recreated = created.filter((c) => SCAFFOLD_NAMES.includes(c));
      expect(recreated).toHaveLength(0);
    });
  });

  describe('idempotency', () => {
    it('is safe to call twice — second call returns empty for already-created files', async () => {
      const first = await scaffoldDocs(tmpDir);
      const second = await scaffoldDocs(tmpDir);

      expect(first.length).toBeGreaterThan(0);
      // All files from first run already exist, so second run should create none of them
      expect(second.filter((s) => first.includes(s))).toHaveLength(0);
    });
  });
});
