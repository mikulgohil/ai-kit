import type { ProjectScan, StrictnessLevel } from '../types.js';
import { assembleTemplate } from './assembler.js';

export function selectFragments(scan: ProjectScan): string[] {
  const fragments: string[] = ['base', 'behavioral'];

  if (scan.framework === 'nextjs') {
    if (scan.routerType === 'app' || scan.routerType === 'hybrid') {
      fragments.push('nextjs-app-router');
    }
    if (scan.routerType === 'pages' || scan.routerType === 'hybrid') {
      fragments.push('nextjs-pages-router');
    }
  }

  if (scan.cms === 'optimizely-saas') {
    fragments.push('optimizely-saas');
  } else if (scan.cms !== 'none') {
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

  if (scan.staticSite?.isStatic) {
    fragments.push('static-site');
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
    if (scan.cms === 'optimizely-saas') {
      techStack.push(
        `Optimizely SaaS CMS${scan.optimizelyVersion ? ` (SDK ${scan.optimizelyVersion})` : ''}`,
      );
    } else if (scan.cms === 'sitecore-xmc-v2') {
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

  // Design token summary for templates
  let designTokenSummary = '';
  if (scan.designTokens?.detected) {
    const parts: string[] = [];
    if (scan.designTokens.colors.length > 0) {
      parts.push(`Colors: ${scan.designTokens.colors.slice(0, 15).join(', ')}${scan.designTokens.colors.length > 15 ? ` (+${scan.designTokens.colors.length - 15} more)` : ''}`);
    }
    if (scan.designTokens.fonts.length > 0) {
      parts.push(`Fonts: ${scan.designTokens.fonts.join(', ')}`);
    }
    if (scan.designTokens.spacing.length > 0) {
      parts.push(`Spacing: ${scan.designTokens.spacing.slice(0, 10).join(', ')}${scan.designTokens.spacing.length > 10 ? ` (+${scan.designTokens.spacing.length - 10} more)` : ''}`);
    }
    if (scan.designTokens.breakpoints.length > 0) {
      parts.push(`Breakpoints: ${scan.designTokens.breakpoints.join(', ')}`);
    }
    designTokenSummary = parts.map((p) => `- ${p}`).join('\n');
  }

  // .aiignore summary
  const aiIgnoreSummary = scan.aiIgnorePatterns.length > 0
    ? scan.aiIgnorePatterns.map((p) => `- \`${p}\``).join('\n')
    : '';

  return {
    projectName: scan.projectName,
    techStack: techStack.join(' · '),
    packageManager: scan.packageManager,
    routerType: scan.routerType || 'unknown',
    scripts: scripts || '- No scripts detected',
    framework: scan.framework,
    designTokens: designTokenSummary || '- No design tokens detected',
    aiIgnorePatterns: aiIgnoreSummary || '- No .aiignore file',
    outputMode: scan.staticSite?.outputMode || 'ssr',
  };
}
