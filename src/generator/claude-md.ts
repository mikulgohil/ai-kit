import type { ProjectScan, StrictnessLevel } from '../types.js';
import { assembleTemplate } from './assembler.js';

export function selectFragments(scan: ProjectScan): string[] {
  const fragments: string[] = ['base'];

  if (scan.framework === 'nextjs') {
    if (scan.routerType === 'app' || scan.routerType === 'hybrid') {
      fragments.push('nextjs-app-router');
    }
    if (scan.routerType === 'pages' || scan.routerType === 'hybrid') {
      fragments.push('nextjs-pages-router');
    }
  }

  if (scan.cms !== 'none') {
    fragments.push('sitecore-xmc');
  }

  if (scan.styling.includes('tailwind')) {
    fragments.push('tailwind');
  }

  if (scan.typescript) {
    fragments.push('typescript');
  }

  if (scan.monorepo) {
    fragments.push('monorepo');
  }

  if (scan.figma?.detected) {
    fragments.push('figma');
  }

  return fragments;
}

export function generateClaudeMd(
  scan: ProjectScan,
  options?: { strictness?: StrictnessLevel; customFragments?: string[] },
): string {
  const fragments = selectFragments(scan);
  const variables = buildVariables(scan);
  return assembleTemplate('claude-md', fragments, variables, {
    customFragments: options?.customFragments,
    strictness: options?.strictness,
  });
}

function buildVariables(scan: ProjectScan): Record<string, string> {
  const techStack: string[] = [];

  if (scan.framework === 'nextjs') {
    techStack.push(`Next.js ${scan.nextjsVersion || ''}`);
  }
  if (scan.cms !== 'none') {
    if (scan.cms === 'sitecore-xmc-v2') {
      techStack.push(
        `Sitecore XM Cloud${scan.sitecoreContentSdkVersion ? ` (Content SDK ${scan.sitecoreContentSdkVersion})` : ' (Content SDK v2)'}`,
      );
    } else if (scan.cms === 'sitecore-xmc') {
      techStack.push(
        `Sitecore XM Cloud${scan.sitecorejssVersion ? ` (JSS ${scan.sitecorejssVersion})` : ''}`,
      );
    } else {
      techStack.push('Sitecore JSS');
    }
  }
  if (scan.typescript) techStack.push('TypeScript');
  if (scan.styling.includes('tailwind'))
    techStack.push(`Tailwind CSS ${scan.tailwindVersion || ''}`);
  if (scan.styling.includes('scss')) techStack.push('SCSS');
  if (scan.styling.includes('styled-components'))
    techStack.push('styled-components');
  if (scan.monorepo && scan.monorepoTool)
    techStack.push(scan.monorepoTool);

  const scripts = Object.entries(scan.scripts)
    .filter(([key]) =>
      ['dev', 'build', 'start', 'lint', 'test', 'type-check', 'typecheck'].includes(key),
    )
    .map(([key, value]) => `- \`${scan.packageManager} run ${key}\` → \`${value}\``)
    .join('\n');

  return {
    projectName: scan.projectName,
    techStack: techStack.join(' · '),
    packageManager: scan.packageManager,
    routerType: scan.routerType || 'unknown',
    scripts: scripts || '- No scripts detected',
    framework: scan.framework,
  };
}
