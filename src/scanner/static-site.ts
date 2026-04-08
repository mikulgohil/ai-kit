import path from 'path';
import fs from 'fs-extra';
import { readFileSafe, dirExists } from '../utils.js';
import type { StaticSiteScan } from '../types.js';

export function detectStaticSite(
  projectPath: string,
  pkg: Record<string, unknown>,
): StaticSiteScan {
  const hasStaticExport = checkStaticExport(projectPath);
  const hasGenerateStaticParams = checkGenerateStaticParams(projectPath);
  const hasRevalidate = checkRevalidatePatterns(projectPath);
  const hasServerActions = checkServerActions(projectPath);
  const hasApiRoutes = checkApiRoutes(projectPath);

  // Determine output mode
  let outputMode: StaticSiteScan['outputMode'];

  if (hasStaticExport) {
    outputMode = 'export';
  } else if (hasGenerateStaticParams && !hasServerActions && !hasApiRoutes) {
    outputMode = hasRevalidate ? 'isr' : 'export';
  } else if (hasServerActions || hasApiRoutes) {
    outputMode = hasGenerateStaticParams ? 'hybrid' : 'ssr';
  } else {
    outputMode = 'ssr';
  }

  const isStatic = outputMode === 'export' || outputMode === 'isr';

  return {
    isStatic,
    outputMode,
    hasGenerateStaticParams,
    hasRevalidate,
    hasStaticExport,
  };
}

function checkStaticExport(projectPath: string): boolean {
  // Check next.config.js/ts/mjs for output: 'export'
  const configPaths = [
    path.join(projectPath, 'next.config.js'),
    path.join(projectPath, 'next.config.ts'),
    path.join(projectPath, 'next.config.mjs'),
  ];

  for (const configPath of configPaths) {
    const content = readFileSafe(configPath);
    if (content && /output\s*:\s*['"]export['"]/.test(content)) {
      return true;
    }
  }

  return false;
}

function checkGenerateStaticParams(projectPath: string): boolean {
  // Check for generateStaticParams in app/ directory
  const appDirs = [
    path.join(projectPath, 'app'),
    path.join(projectPath, 'src', 'app'),
  ];

  for (const appDir of appDirs) {
    if (dirExists(appDir) && hasPatternInDir(appDir, /generateStaticParams/)) {
      return true;
    }
  }

  // Check for getStaticPaths in pages/ directory
  const pagesDirs = [
    path.join(projectPath, 'pages'),
    path.join(projectPath, 'src', 'pages'),
  ];

  for (const pagesDir of pagesDirs) {
    if (dirExists(pagesDir) && hasPatternInDir(pagesDir, /getStaticPaths/)) {
      return true;
    }
  }

  return false;
}

function checkRevalidatePatterns(projectPath: string): boolean {
  const appDirs = [
    path.join(projectPath, 'app'),
    path.join(projectPath, 'src', 'app'),
  ];

  for (const appDir of appDirs) {
    if (dirExists(appDir) && hasPatternInDir(appDir, /revalidate\s*[:=]/)) {
      return true;
    }
  }

  return false;
}

function checkServerActions(projectPath: string): boolean {
  const srcDirs = [
    path.join(projectPath, 'app'),
    path.join(projectPath, 'src'),
  ];

  for (const srcDir of srcDirs) {
    if (dirExists(srcDir) && hasPatternInDir(srcDir, /['"]use server['"]/)) {
      return true;
    }
  }

  return false;
}

function checkApiRoutes(projectPath: string): boolean {
  // App Router API routes
  const appApiDirs = [
    path.join(projectPath, 'app', 'api'),
    path.join(projectPath, 'src', 'app', 'api'),
  ];

  for (const apiDir of appApiDirs) {
    if (dirExists(apiDir)) return true;
  }

  // Pages Router API routes
  const pagesApiDirs = [
    path.join(projectPath, 'pages', 'api'),
    path.join(projectPath, 'src', 'pages', 'api'),
  ];

  for (const apiDir of pagesApiDirs) {
    if (dirExists(apiDir)) return true;
  }

  return false;
}

const SCAN_IGNORE = ['node_modules', '.next', '.git', 'dist', 'build', '.turbo'];

function hasPatternInDir(dir: string, pattern: RegExp, depth: number = 0): boolean {
  if (depth > 5) return false;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (SCAN_IGNORE.includes(entry.name)) continue;

      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (hasPatternInDir(full, pattern, depth + 1)) return true;
      } else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
        const content = readFileSafe(full);
        if (content && pattern.test(content)) return true;
      }
    }
  } catch {
    // Skip unreadable directories
  }

  return false;
}
