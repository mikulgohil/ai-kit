import path from 'path';
import { fileExists, dirExists } from '../utils.js';

export interface ToolsDetection {
  playwright: boolean;
  storybook: boolean;
  eslint: boolean;
  prettier: boolean;
  biome: boolean;
  axeCore: boolean;
  snyk: boolean;
  knip: boolean;
  bundleAnalyzer: boolean;
}

export function detectTools(
  projectPath: string,
  pkg: Record<string, unknown>,
): ToolsDetection {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  return {
    playwright: detectPlaywright(projectPath, deps),
    storybook: detectStorybook(projectPath, deps),
    eslint: detectEslint(projectPath, deps),
    prettier: detectPrettier(projectPath, deps),
    biome: detectBiome(projectPath, deps),
    axeCore: detectAxeCore(deps),
    snyk: detectSnyk(projectPath, deps),
    knip: detectKnip(projectPath, deps),
    bundleAnalyzer: detectBundleAnalyzer(deps),
  };
}

function detectPlaywright(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('@playwright/test' in deps) return true;
  if (fileExists(path.join(projectPath, 'playwright.config.ts'))) return true;
  if (fileExists(path.join(projectPath, 'playwright.config.js'))) return true;
  return false;
}

function detectStorybook(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('@storybook/react' in deps) return true;
  if (dirExists(path.join(projectPath, '.storybook'))) return true;
  return false;
}

function detectEslint(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('eslint' in deps) return true;
  const eslintConfigs = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
  ];
  for (const config of eslintConfigs) {
    if (fileExists(path.join(projectPath, config))) return true;
  }
  return false;
}

function detectPrettier(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('prettier' in deps) return true;
  const prettierConfigs = [
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.json',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.toml',
    'prettier.config.js',
    'prettier.config.cjs',
    'prettier.config.ts',
  ];
  for (const config of prettierConfigs) {
    if (fileExists(path.join(projectPath, config))) return true;
  }
  return false;
}

function detectBiome(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('@biomejs/biome' in deps) return true;
  if (fileExists(path.join(projectPath, 'biome.json'))) return true;
  if (fileExists(path.join(projectPath, 'biome.jsonc'))) return true;
  return false;
}

function detectAxeCore(deps: Record<string, string>): boolean {
  return '@axe-core/playwright' in deps || 'axe-core' in deps;
}

function detectSnyk(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('snyk' in deps) return true;
  if (fileExists(path.join(projectPath, '.snyk'))) return true;
  return false;
}

function detectKnip(
  projectPath: string,
  deps: Record<string, string>,
): boolean {
  if ('knip' in deps) return true;
  if (fileExists(path.join(projectPath, 'knip.json'))) return true;
  if (fileExists(path.join(projectPath, 'knip.config.ts'))) return true;
  return false;
}

function detectBundleAnalyzer(deps: Record<string, string>): boolean {
  return '@next/bundle-analyzer' in deps;
}
