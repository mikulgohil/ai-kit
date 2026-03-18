import { describe, it, expect } from 'vitest';
import { selectFragments, generateClaudeMd } from '../../src/generator/claude-md.js';
import type { ProjectScan } from '../../src/types.js';
import { VERSION } from '../../src/constants.js';

/** Minimal valid ProjectScan with no optional features active */
function minimalScan(overrides: Partial<ProjectScan> = {}): ProjectScan {
  return {
    framework: 'unknown',
    cms: 'none',
    styling: [],
    typescript: false,
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
    packageManager: 'npm',
    projectName: 'test-project',
    projectPath: '/tmp/test-project',
    scripts: {},
    ...overrides,
  };
}

describe('selectFragments', () => {
  it('always includes base fragment', () => {
    const result = selectFragments(minimalScan());
    expect(result).toContain('base');
  });

  it('returns only base for a fully minimal scan', () => {
    const result = selectFragments(minimalScan());
    expect(result).toEqual(['base']);
  });

  describe('nextjs router fragments', () => {
    it('adds nextjs-app-router when framework is nextjs and routerType is app', () => {
      const result = selectFragments(
        minimalScan({ framework: 'nextjs', routerType: 'app' }),
      );
      expect(result).toContain('nextjs-app-router');
      expect(result).not.toContain('nextjs-pages-router');
    });

    it('adds nextjs-pages-router when framework is nextjs and routerType is pages', () => {
      const result = selectFragments(
        minimalScan({ framework: 'nextjs', routerType: 'pages' }),
      );
      expect(result).toContain('nextjs-pages-router');
      expect(result).not.toContain('nextjs-app-router');
    });

    it('adds both router fragments when routerType is hybrid', () => {
      const result = selectFragments(
        minimalScan({ framework: 'nextjs', routerType: 'hybrid' }),
      );
      expect(result).toContain('nextjs-app-router');
      expect(result).toContain('nextjs-pages-router');
    });

    it('does not add any router fragment when framework is nextjs but routerType is undefined', () => {
      const result = selectFragments(
        minimalScan({ framework: 'nextjs', routerType: undefined }),
      );
      expect(result).not.toContain('nextjs-app-router');
      expect(result).not.toContain('nextjs-pages-router');
    });

    it('does not add nextjs fragments when framework is react', () => {
      const result = selectFragments(
        minimalScan({ framework: 'react' }),
      );
      expect(result).not.toContain('nextjs-app-router');
      expect(result).not.toContain('nextjs-pages-router');
    });
  });

  describe('sitecore fragment', () => {
    it('adds sitecore-xmc fragment when cms is sitecore-xmc', () => {
      const result = selectFragments(minimalScan({ cms: 'sitecore-xmc' }));
      expect(result).toContain('sitecore-xmc');
    });

    it('adds sitecore-xmc fragment when cms is sitecore-jss', () => {
      const result = selectFragments(minimalScan({ cms: 'sitecore-jss' }));
      expect(result).toContain('sitecore-xmc');
    });

    it('does not add sitecore-xmc fragment when cms is none', () => {
      const result = selectFragments(minimalScan({ cms: 'none' }));
      expect(result).not.toContain('sitecore-xmc');
    });
  });

  describe('tailwind fragment', () => {
    it('adds tailwind fragment when styling includes tailwind', () => {
      const result = selectFragments(minimalScan({ styling: ['tailwind'] }));
      expect(result).toContain('tailwind');
    });

    it('does not add tailwind fragment when styling is empty', () => {
      const result = selectFragments(minimalScan({ styling: [] }));
      expect(result).not.toContain('tailwind');
    });

    it('does not add tailwind fragment when styling only has scss', () => {
      const result = selectFragments(minimalScan({ styling: ['scss'] }));
      expect(result).not.toContain('tailwind');
    });
  });

  describe('typescript fragment', () => {
    it('adds typescript fragment when typescript is true', () => {
      const result = selectFragments(minimalScan({ typescript: true }));
      expect(result).toContain('typescript');
    });

    it('does not add typescript fragment when typescript is false', () => {
      const result = selectFragments(minimalScan({ typescript: false }));
      expect(result).not.toContain('typescript');
    });
  });

  describe('monorepo fragment', () => {
    it('adds monorepo fragment when monorepo is true', () => {
      const result = selectFragments(minimalScan({ monorepo: true }));
      expect(result).toContain('monorepo');
    });

    it('does not add monorepo fragment when monorepo is false', () => {
      const result = selectFragments(minimalScan({ monorepo: false }));
      expect(result).not.toContain('monorepo');
    });
  });

  describe('figma fragment', () => {
    it('adds figma fragment when figma.detected is true', () => {
      const result = selectFragments(
        minimalScan({
          figma: {
            detected: true,
            figmaMcp: true,
            figmaCodeCli: false,
            designTokens: false,
            tokenFormat: 'none',
            visualTests: false,
          },
        }),
      );
      expect(result).toContain('figma');
    });

    it('does not add figma fragment when figma.detected is false', () => {
      const result = selectFragments(minimalScan());
      expect(result).not.toContain('figma');
    });
  });

  describe('combined fragments', () => {
    it('builds the correct fragment list for a full nextjs + sitecore + tailwind + ts project', () => {
      const result = selectFragments(
        minimalScan({
          framework: 'nextjs',
          routerType: 'app',
          cms: 'sitecore-xmc',
          styling: ['tailwind'],
          typescript: true,
          monorepo: false,
          figma: {
            detected: false,
            figmaMcp: false,
            figmaCodeCli: false,
            designTokens: false,
            tokenFormat: 'none',
            visualTests: false,
          },
        }),
      );
      expect(result).toEqual([
        'base',
        'nextjs-app-router',
        'sitecore-xmc',
        'tailwind',
        'typescript',
      ]);
    });

    it('returns fragments in a stable order', () => {
      const scan = minimalScan({
        framework: 'nextjs',
        routerType: 'hybrid',
        cms: 'sitecore-xmc',
        styling: ['tailwind'],
        typescript: true,
        monorepo: true,
        figma: {
          detected: true,
          figmaMcp: true,
          figmaCodeCli: false,
          designTokens: false,
          tokenFormat: 'none',
          visualTests: false,
        },
      });
      expect(selectFragments(scan)).toEqual([
        'base',
        'nextjs-app-router',
        'nextjs-pages-router',
        'sitecore-xmc',
        'tailwind',
        'typescript',
        'monorepo',
        'figma',
      ]);
    });
  });
});

describe('generateClaudeMd', () => {
  it('returns a non-empty string', () => {
    const result = generateClaudeMd(minimalScan());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the version comment at the top', () => {
    const result = generateClaudeMd(minimalScan());
    expect(result).toContain(`ai-kit v${VERSION}`);
  });

  it('includes the project name from the scan', () => {
    const result = generateClaudeMd(minimalScan({ projectName: 'my-awesome-project' }));
    expect(result).toContain('my-awesome-project');
  });

  it('does not contain unresolved placeholders', () => {
    const result = generateClaudeMd(
      minimalScan({
        framework: 'nextjs',
        routerType: 'app',
        cms: 'sitecore-xmc',
        styling: ['tailwind'],
        typescript: true,
        projectName: 'acme-site',
        packageManager: 'pnpm',
        scripts: { dev: 'next dev', build: 'next build' },
      }),
    );
    expect(result).not.toMatch(/\{\{[^}]+\}\}/);
  });

  it('includes package manager in output', () => {
    const result = generateClaudeMd(minimalScan({ packageManager: 'pnpm' }));
    expect(result).toContain('pnpm');
  });
});
