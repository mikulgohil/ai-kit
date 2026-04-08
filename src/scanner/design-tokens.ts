import path from 'path';
import { readFileSafe } from '../utils.js';
import type { DesignTokensScan } from '../types.js';

export function detectDesignTokens(
  projectPath: string,
): DesignTokensScan {
  // Try Tailwind v4 @theme inline first
  const globalsCss = readFileSafe(
    path.join(projectPath, 'src', 'app', 'globals.css'),
  );

  if (globalsCss && globalsCss.includes('@theme')) {
    return parseThemeInline(globalsCss);
  }

  // Try Tailwind v3/v4 config files
  const twConfigPaths = [
    path.join(projectPath, 'tailwind.config.ts'),
    path.join(projectPath, 'tailwind.config.js'),
    path.join(projectPath, 'tailwind.config.mjs'),
  ];

  for (const twPath of twConfigPaths) {
    const content = readFileSafe(twPath);
    if (content) {
      return parseTailwindConfig(content);
    }
  }

  // Try CSS custom properties in globals
  if (globalsCss) {
    return parseCssVariables(globalsCss);
  }

  return {
    detected: false,
    colors: [],
    spacing: [],
    fonts: [],
    breakpoints: [],
    source: 'none',
  };
}

function parseThemeInline(css: string): DesignTokensScan {
  const colors: string[] = [];
  const spacing: string[] = [];
  const fonts: string[] = [];
  const breakpoints: string[] = [];

  // Extract @theme { ... } block
  const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\}/);
  if (!themeMatch) {
    return { detected: false, colors: [], spacing: [], fonts: [], breakpoints: [], source: 'none' };
  }

  const themeBody = themeMatch[1];
  const lines = themeBody.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*')) continue;

    // --color-* tokens
    const colorMatch = trimmed.match(/^--color-([^:]+):/);
    if (colorMatch) {
      colors.push(colorMatch[1].trim());
      continue;
    }

    // --spacing-* tokens
    const spacingMatch = trimmed.match(/^--spacing-([^:]+):/);
    if (spacingMatch) {
      spacing.push(spacingMatch[1].trim());
      continue;
    }

    // --font-* tokens
    const fontMatch = trimmed.match(/^--font-([^:]+):/);
    if (fontMatch) {
      fonts.push(fontMatch[1].trim());
      continue;
    }

    // --breakpoint-* tokens
    const bpMatch = trimmed.match(/^--breakpoint-([^:]+):/);
    if (bpMatch) {
      breakpoints.push(bpMatch[1].trim());
      continue;
    }
  }

  return {
    detected: colors.length > 0 || fonts.length > 0,
    colors,
    spacing,
    fonts,
    breakpoints,
    source: 'theme-inline',
  };
}

function parseTailwindConfig(content: string): DesignTokensScan {
  const colors: string[] = [];
  const spacing: string[] = [];
  const fonts: string[] = [];
  const breakpoints: string[] = [];

  // Extract color keys from theme.extend.colors or theme.colors
  // Pattern: colors: { primary: ..., secondary: ... }
  const colorBlock = content.match(/colors\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
  if (colorBlock) {
    const colorKeys = colorBlock[1].matchAll(/['"]?(\w[\w-]*)['"]?\s*:/g);
    for (const match of colorKeys) {
      if (!['DEFAULT', 'transparent', 'current', 'inherit'].includes(match[1])) {
        colors.push(match[1]);
      }
    }
  }

  // Extract font family keys
  const fontBlock = content.match(/fontFamily\s*:\s*\{([^}]*)\}/);
  if (fontBlock) {
    const fontKeys = fontBlock[1].matchAll(/['"]?(\w[\w-]*)['"]?\s*:/g);
    for (const match of fontKeys) {
      fonts.push(match[1]);
    }
  }

  // Extract spacing keys
  const spacingBlock = content.match(/spacing\s*:\s*\{([^}]*)\}/);
  if (spacingBlock) {
    const spacingKeys = spacingBlock[1].matchAll(/['"]?(\w[\w-]*)['"]?\s*:/g);
    for (const match of spacingKeys) {
      spacing.push(match[1]);
    }
  }

  // Extract breakpoint keys
  const screensBlock = content.match(/screens\s*:\s*\{([^}]*)\}/);
  if (screensBlock) {
    const bpKeys = screensBlock[1].matchAll(/['"]?(\w[\w-]*)['"]?\s*:/g);
    for (const match of bpKeys) {
      breakpoints.push(match[1]);
    }
  }

  return {
    detected: colors.length > 0 || fonts.length > 0,
    colors: [...new Set(colors)],
    spacing: [...new Set(spacing)],
    fonts: [...new Set(fonts)],
    breakpoints: [...new Set(breakpoints)],
    source: 'tailwind-config',
  };
}

function parseCssVariables(css: string): DesignTokensScan {
  const colors: string[] = [];
  const spacing: string[] = [];
  const fonts: string[] = [];

  const varMatches = css.matchAll(/--([^:]+)\s*:/g);

  for (const match of varMatches) {
    const name = match[1].trim();

    if (name.startsWith('color-') || name.includes('primary') || name.includes('secondary') ||
        name.includes('accent') || name.includes('background') || name.includes('foreground')) {
      colors.push(name);
    } else if (name.startsWith('spacing-') || name.startsWith('space-') || name.includes('gap')) {
      spacing.push(name);
    } else if (name.startsWith('font-') || name.includes('family') || name.includes('text-')) {
      fonts.push(name);
    }
  }

  return {
    detected: colors.length > 0,
    colors: [...new Set(colors)],
    spacing: [...new Set(spacing)],
    fonts: [...new Set(fonts)],
    breakpoints: [],
    source: colors.length > 0 ? 'css-variables' : 'none',
  };
}
