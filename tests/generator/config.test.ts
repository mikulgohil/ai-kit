import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateConfig } from '../../src/generator/config.js';
import { VERSION } from '../../src/constants.js';
import type { ProjectScan } from '../../src/types.js';

function minimalScan(overrides: Partial<ProjectScan> = {}): ProjectScan {
  return {
    framework: 'nextjs',
    nextjsVersion: '14.0.0',
    routerType: 'app',
    cms: 'none',
    styling: ['tailwind'],
    tailwindVersion: '3.4.0',
    typescript: true,
    typescriptStrict: true,
    monorepo: false,
    figma: {
      detected: false,
      figmaMcp: false,
      figmaCodeCli: false,
      designTokens: false,
      tokenFormat: 'none',
      visualTests: false,
    },
    tools: {
      playwright: false,
      storybook: false,
      eslint: false,
      prettier: false,
      biome: false,
      axeCore: false,
      snyk: false,
      knip: false,
      bundleAnalyzer: false,
    },
    mcpServers: {
      playwright: false,
      figma: false,
      github: false,
      context7: false,
      perplexity: false,
    },
    packageManager: 'pnpm',
    projectName: 'test-project',
    projectPath: '/tmp/test-project',
    scripts: { dev: 'next dev', build: 'next build' },
    ...overrides,
  };
}

describe('generateConfig', () => {
  describe('version field', () => {
    it('sets version to the current VERSION constant', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      expect(config.version).toBe(VERSION);
    });
  });

  describe('scanResult field', () => {
    it('stores the scan result as-is', () => {
      const scan = minimalScan({ projectName: 'my-project' });
      const config = generateConfig(scan, [], [], []);
      expect(config.scanResult).toBe(scan);
    });

    it('preserves all scan fields', () => {
      const scan = minimalScan();
      const config = generateConfig(scan, [], [], []);
      expect(config.scanResult.framework).toBe('nextjs');
      expect(config.scanResult.packageManager).toBe('pnpm');
      expect(config.scanResult.typescript).toBe(true);
    });
  });

  describe('generatedAt field', () => {
    it('returns a valid ISO 8601 timestamp string', () => {
      const before = new Date();
      const config = generateConfig(minimalScan(), [], [], []);
      const after = new Date();

      const generated = new Date(config.generatedAt);
      expect(generated.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(generated.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('generatedAt is a string', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      expect(typeof config.generatedAt).toBe('string');
    });
  });

  describe('templates field', () => {
    it('stores the provided templates array', () => {
      const templates = ['CLAUDE.md', '.cursorrules'];
      const config = generateConfig(minimalScan(), templates, [], []);
      expect(config.templates).toEqual(templates);
    });

    it('stores an empty array when no templates provided', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      expect(config.templates).toEqual([]);
    });
  });

  describe('commands field', () => {
    it('stores the provided commands array', () => {
      const commands = ['kit-review', 'kit-fix-bug', 'kit-test'];
      const config = generateConfig(minimalScan(), [], commands, []);
      expect(config.commands).toEqual(commands);
    });

    it('stores an empty array when no commands provided', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      expect(config.commands).toEqual([]);
    });
  });

  describe('guides field', () => {
    it('stores the provided guides array', () => {
      const guides = ['getting-started', 'prompt-playbook'];
      const config = generateConfig(minimalScan(), [], [], guides);
      expect(config.guides).toEqual(guides);
    });

    it('stores an empty array when no guides provided', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      expect(config.guides).toEqual([]);
    });
  });

  describe('full config shape', () => {
    it('returns an object with all expected keys', () => {
      const config = generateConfig(minimalScan(), ['CLAUDE.md'], ['kit-review'], ['getting-started']);
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('scanResult');
      expect(config).toHaveProperty('generatedAt');
      expect(config).toHaveProperty('templates');
      expect(config).toHaveProperty('commands');
      expect(config).toHaveProperty('guides');
    });

    it('does not include unexpected extra keys', () => {
      const config = generateConfig(minimalScan(), [], [], []);
      const keys = Object.keys(config).sort();
      expect(keys).toEqual([
        '$schema',
        'agents',
        'commands',
        'contexts',
        'customFragments',
        'generatedAt',
        'guides',
        'hookProfile',
        'hooks',
        'scanResult',
        'strictness',
        'templates',
        'tools',
        'version',
      ]);
    });
  });
});
