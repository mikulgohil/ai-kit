import path from 'path';
import { fileExists, readJsonSafe, readFileSafe } from '../utils.js';

export interface FigmaDetection {
  figmaMcp: boolean;
  figmaCodeCli: boolean;
  designTokens: boolean;
  tokenFormat: 'tailwind-v4' | 'tailwind-v3' | 'css-variables' | 'none';
  visualTests: boolean;
}

export function detectFigma(
  projectPath: string,
  pkg: Record<string, unknown>,
): FigmaDetection {
  return {
    figmaMcp: detectFigmaMcp(projectPath),
    figmaCodeCli: detectFigmaCodeCli(pkg),
    designTokens: detectDesignTokens(projectPath),
    tokenFormat: detectTokenFormat(projectPath),
    visualTests: detectVisualTests(projectPath, pkg),
  };
}

function detectFigmaMcp(projectPath: string): boolean {
  // Check .claude/settings.json or .claude/settings.local.json for Figma MCP
  const settingsPaths = [
    path.join(projectPath, '.claude', 'settings.json'),
    path.join(projectPath, '.claude', 'settings.local.json'),
    path.join(projectPath, '.mcp.json'),
  ];

  for (const settingsPath of settingsPaths) {
    const content = readFileSafe(settingsPath);
    if (content && content.toLowerCase().includes('figma')) {
      return true;
    }
  }

  return false;
}

function detectFigmaCodeCli(pkg: Record<string, unknown>): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  return Object.keys(deps).some(
    (dep) => dep.startsWith('@figma-code/') || dep === 'figma-code-cli',
  );
}

function detectDesignTokens(projectPath: string): boolean {
  const tokenPaths = [
    path.join(projectPath, 'tokens.json'),
    path.join(projectPath, 'tokens'),
    path.join(projectPath, 'design-tokens.json'),
    path.join(projectPath, 'src', 'tokens'),
  ];

  for (const tokenPath of tokenPaths) {
    if (fileExists(tokenPath)) return true;
  }

  // Check for @theme inline in globals.css
  const globalsCss = readFileSafe(
    path.join(projectPath, 'src', 'app', 'globals.css'),
  );
  if (globalsCss && globalsCss.includes('@theme')) return true;

  return false;
}

function detectTokenFormat(
  projectPath: string,
): FigmaDetection['tokenFormat'] {
  // Check for Tailwind v4 @theme inline
  const globalsCss = readFileSafe(
    path.join(projectPath, 'src', 'app', 'globals.css'),
  );
  if (globalsCss && globalsCss.includes('@theme')) return 'tailwind-v4';

  // Check for Tailwind v3 config with custom theme
  const twConfigPaths = [
    path.join(projectPath, 'tailwind.config.ts'),
    path.join(projectPath, 'tailwind.config.js'),
  ];

  for (const twPath of twConfigPaths) {
    const content = readFileSafe(twPath);
    if (content && content.includes('theme')) return 'tailwind-v3';
  }

  // Check for raw CSS variables
  if (globalsCss && globalsCss.includes('--')) return 'css-variables';

  return 'none';
}

function detectVisualTests(
  projectPath: string,
  pkg: Record<string, unknown>,
): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const hasPlaywright = '@playwright/test' in deps || 'playwright' in deps;
  const hasPlaywrightConfig =
    fileExists(path.join(projectPath, 'playwright.config.ts')) ||
    fileExists(path.join(projectPath, 'playwright.config.js'));

  return hasPlaywright || hasPlaywrightConfig;
}
