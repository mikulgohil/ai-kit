import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { detectFigma } from '../../src/scanner/figma.js';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-kit-figma-'));
}

describe('detectFigma', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  describe('figmaMcp detection', () => {
    it('detects figma MCP from .claude/settings.json containing "figma"', () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'));
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.json'),
        JSON.stringify({ mcpServers: { figma: { command: 'figma-mcp' } } }),
      );
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(true);
    });

    it('detects figma MCP from .claude/settings.local.json containing "figma"', () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'));
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.local.json'),
        '{ "mcpServers": { "figma": {} } }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(true);
    });

    it('detects figma MCP from .mcp.json containing "figma"', () => {
      fs.writeFileSync(
        path.join(tmpDir, '.mcp.json'),
        JSON.stringify({ servers: { figma: {} } }),
      );
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(true);
    });

    it('is case-insensitive when checking for figma in settings', () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'));
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.json'),
        '{ "mcpServers": { "FIGMA": {} } }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(true);
    });

    it('returns figmaMcp false when no settings files reference figma', () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'));
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.json'),
        JSON.stringify({ mcpServers: { github: {} } }),
      );
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(false);
    });

    it('returns figmaMcp false when no settings files exist', () => {
      const result = detectFigma(tmpDir, {});
      expect(result.figmaMcp).toBe(false);
    });
  });

  describe('figmaCodeCli detection', () => {
    it('detects figma-code-cli when in dependencies', () => {
      const pkg = { dependencies: { 'figma-code-cli': '^1.0.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.figmaCodeCli).toBe(true);
    });

    it('detects @figma-code/ scoped package when in dependencies', () => {
      const pkg = { dependencies: { '@figma-code/connect': '^1.0.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.figmaCodeCli).toBe(true);
    });

    it('detects figma-code-cli from devDependencies', () => {
      const pkg = { devDependencies: { 'figma-code-cli': '1.0.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.figmaCodeCli).toBe(true);
    });

    it('returns figmaCodeCli false when no figma CLI deps present', () => {
      const pkg = { dependencies: { react: '18.0.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.figmaCodeCli).toBe(false);
    });
  });

  describe('designTokens detection', () => {
    it('detects design tokens from tokens.json at root', () => {
      fs.writeJsonSync(path.join(tmpDir, 'tokens.json'), {});
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(true);
    });

    it('detects design tokens from tokens/ directory at root', () => {
      fs.mkdirSync(path.join(tmpDir, 'tokens'));
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(true);
    });

    it('detects design tokens from design-tokens.json at root', () => {
      fs.writeJsonSync(path.join(tmpDir, 'design-tokens.json'), {});
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(true);
    });

    it('detects design tokens from src/tokens/ directory', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'tokens'), { recursive: true });
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(true);
    });

    it('detects design tokens when src/app/globals.css contains @theme', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'app', 'globals.css'),
        '@theme { --color-primary: #000; }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(true);
    });

    it('returns designTokens false when no token files exist and no @theme', () => {
      const result = detectFigma(tmpDir, {});
      expect(result.designTokens).toBe(false);
    });
  });

  describe('tokenFormat detection', () => {
    it('detects tailwind-v4 when globals.css contains @theme', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'app', 'globals.css'),
        '@theme { --color-brand: #3490dc; }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('tailwind-v4');
    });

    it('detects tailwind-v3 when tailwind.config.ts contains theme', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'tailwind.config.ts'),
        'export default { theme: { extend: {} } }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('tailwind-v3');
    });

    it('detects tailwind-v3 when tailwind.config.js contains theme', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'tailwind.config.js'),
        'module.exports = { theme: { extend: {} } }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('tailwind-v3');
    });

    it('detects css-variables when globals.css contains -- but no @theme', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'app', 'globals.css'),
        ':root { --color-primary: #000; }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('css-variables');
    });

    it('returns tokenFormat none when no token format signals found', () => {
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('none');
    });

    it('tailwind-v4 takes priority over css-variables when globals.css has both @theme and --', () => {
      fs.mkdirSync(path.join(tmpDir, 'src', 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, 'src', 'app', 'globals.css'),
        '@theme { --color-primary: #000; }',
      );
      const result = detectFigma(tmpDir, {});
      expect(result.tokenFormat).toBe('tailwind-v4');
    });
  });

  describe('visualTests detection', () => {
    it('detects visual tests when @playwright/test is in dependencies', () => {
      const pkg = { devDependencies: { '@playwright/test': '^1.40.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.visualTests).toBe(true);
    });

    it('detects visual tests when playwright is in dependencies', () => {
      const pkg = { dependencies: { playwright: '^1.40.0' } };
      const result = detectFigma(tmpDir, pkg);
      expect(result.visualTests).toBe(true);
    });

    it('detects visual tests from playwright.config.ts file', () => {
      fs.writeFileSync(path.join(tmpDir, 'playwright.config.ts'), 'export default {}');
      const result = detectFigma(tmpDir, {});
      expect(result.visualTests).toBe(true);
    });

    it('detects visual tests from playwright.config.js file', () => {
      fs.writeFileSync(path.join(tmpDir, 'playwright.config.js'), 'module.exports = {}');
      const result = detectFigma(tmpDir, {});
      expect(result.visualTests).toBe(true);
    });

    it('returns visualTests false when no playwright dep or config exists', () => {
      const result = detectFigma(tmpDir, {});
      expect(result.visualTests).toBe(false);
    });
  });

  describe('full result shape', () => {
    it('returns all expected fields with correct types', () => {
      const result = detectFigma(tmpDir, {});
      expect(result).toHaveProperty('figmaMcp');
      expect(result).toHaveProperty('figmaCodeCli');
      expect(result).toHaveProperty('designTokens');
      expect(result).toHaveProperty('tokenFormat');
      expect(result).toHaveProperty('visualTests');
    });
  });
});
