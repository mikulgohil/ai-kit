import path from 'path';
import { readJsonSafe } from '../utils.js';
import { detectNextjs } from './nextjs.js';
import { detectSitecore } from './sitecore.js';
import { detectStyling } from './styling.js';
import { detectTypescript } from './typescript.js';
import { detectMonorepo } from './monorepo.js';
import { detectPackageManager } from './package-manager.js';
import { detectFigma } from './figma.js';
import type { ProjectScan } from '../types.js';

export async function scanProject(projectPath: string): Promise<ProjectScan> {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = readJsonSafe<Record<string, unknown>>(pkgPath) || {};

  const scripts = (pkg.scripts as Record<string, string>) || {};
  const projectName =
    (pkg.name as string) || path.basename(projectPath);

  const nextjsResult = detectNextjs(projectPath, pkg);
  const sitecoreResult = detectSitecore(pkg);
  const stylingResult = detectStyling(projectPath, pkg);
  const tsResult = detectTypescript(projectPath);
  const monorepoResult = detectMonorepo(projectPath, pkg);
  const packageManager = detectPackageManager(projectPath);
  const figmaResult = detectFigma(projectPath, pkg);

  const figmaDetected =
    figmaResult.figmaMcp ||
    figmaResult.figmaCodeCli ||
    figmaResult.designTokens;

  return {
    ...nextjsResult,
    ...sitecoreResult,
    ...stylingResult,
    ...tsResult,
    ...monorepoResult,
    figma: {
      detected: figmaDetected,
      ...figmaResult,
    },
    packageManager,
    projectName,
    projectPath,
    scripts,
  };
}

export {
  detectNextjs,
  detectSitecore,
  detectStyling,
  detectTypescript,
  detectMonorepo,
  detectPackageManager,
  detectFigma,
};
