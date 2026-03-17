import path from 'path';
import { fileExists } from '../utils.js';

type StylingTool = 'tailwind' | 'css-modules' | 'styled-components' | 'scss';

interface StylingResult {
  styling: StylingTool[];
  tailwindVersion?: string;
}

export function detectStyling(
  projectPath: string,
  pkg: Record<string, unknown>,
): StylingResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  const styling: StylingTool[] = [];
  let tailwindVersion: string | undefined;

  if (deps.tailwindcss || deps['@tailwindcss/postcss']) {
    styling.push('tailwind');
    tailwindVersion = (deps.tailwindcss || deps['@tailwindcss/postcss'] || '')
      .replace(/[\^~>=<]/g, '');
  }

  const hasTailwindConfig =
    fileExists(path.join(projectPath, 'tailwind.config.js')) ||
    fileExists(path.join(projectPath, 'tailwind.config.ts')) ||
    fileExists(path.join(projectPath, 'tailwind.config.mjs'));

  if (hasTailwindConfig && !styling.includes('tailwind')) {
    styling.push('tailwind');
  }

  if (deps['styled-components']) styling.push('styled-components');
  if (deps.sass || deps['node-sass']) styling.push('scss');

  return {
    styling,
    tailwindVersion: tailwindVersion || undefined,
  };
}
