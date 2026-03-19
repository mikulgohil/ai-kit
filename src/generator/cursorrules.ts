import type { ProjectScan, StrictnessLevel } from '../types.js';
import { assembleTemplate } from './assembler.js';
import { selectFragments } from './claude-md.js';

export function generateCursorRules(
  scan: ProjectScan,
  options?: { strictness?: StrictnessLevel; customFragments?: string[] },
): string {
  const fragments = selectFragments(scan);
  const variables = buildCursorVariables(scan);
  return assembleTemplate('cursorrules', fragments, variables, {
    customFragments: options?.customFragments,
    strictness: options?.strictness,
  });
}

export function buildCursorVariables(scan: ProjectScan): Record<string, string> {
  const techStack: string[] = [];

  if (scan.framework === 'nextjs') {
    techStack.push(`Next.js ${scan.nextjsVersion || ''}`);
  }
  if (scan.cms !== 'none') {
    techStack.push(
      scan.cms === 'sitecore-xmc-v2' || scan.cms === 'sitecore-xmc'
        ? 'Sitecore XM Cloud'
        : 'Sitecore JSS',
    );
  }
  if (scan.typescript) techStack.push('TypeScript');
  if (scan.styling.includes('tailwind')) techStack.push('Tailwind CSS');
  if (scan.monorepo && scan.monorepoTool) techStack.push(scan.monorepoTool);

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
