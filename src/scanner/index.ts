import path from 'path';
import { readJsonSafe } from '../utils.js';
import { detectNextjs } from './nextjs.js';
import { detectSitecore } from './sitecore.js';
import { detectOptimizely } from './optimizely.js';
import { detectStyling } from './styling.js';
import { detectTypescript } from './typescript.js';
import { detectMonorepo } from './monorepo.js';
import { detectPackageManager } from './package-manager.js';
import { detectFigma } from './figma.js';
import { detectTools } from './tools.js';
import { detectMcpServers } from './mcp.js';
import { detectDesignTokens } from './design-tokens.js';
import { detectStaticSite } from './static-site.js';
import { loadAiIgnorePatterns } from './aiignore.js';
import type { ProjectScan } from '../types.js';

export async function scanProject(projectPath: string): Promise<ProjectScan> {
  const pkgPath = path.join(projectPath, 'package.json');
  const pkg = readJsonSafe<Record<string, unknown>>(pkgPath) || {};

  const scripts = (pkg.scripts as Record<string, string>) || {};
  const projectName =
    (pkg.name as string) || path.basename(projectPath);

  const nextjsResult = detectNextjs(projectPath, pkg);
  const sitecoreResult = detectSitecore(pkg);
  const optimizelyResult = detectOptimizely(pkg);
  const stylingResult = detectStyling(projectPath, pkg);
  const tsResult = detectTypescript(projectPath);
  const monorepoResult = detectMonorepo(projectPath, pkg);
  const packageManager = detectPackageManager(projectPath);
  const figmaResult = detectFigma(projectPath, pkg);
  const toolsResult = detectTools(projectPath, pkg);
  const mcpResult = detectMcpServers(projectPath);
  const designTokensResult = detectDesignTokens(projectPath);
  const staticSiteResult = detectStaticSite(projectPath, pkg);
  const aiIgnorePatterns = loadAiIgnorePatterns(projectPath);

  const figmaDetected =
    figmaResult.figmaMcp ||
    figmaResult.figmaCodeCli ||
    figmaResult.designTokens;

  // CMS detection: Sitecore takes priority, then Optimizely
  const cmsResult = sitecoreResult.cms !== 'none'
    ? sitecoreResult
    : optimizelyResult.optimizelySaas
      ? {
          cms: 'optimizely-saas' as const,
          optimizelyVersion: optimizelyResult.optimizelyVersion,
          optimizelyPackages: optimizelyResult.optimizelyPackages,
        }
      : sitecoreResult; // falls back to { cms: 'none' }

  return {
    ...nextjsResult,
    ...cmsResult,
    ...stylingResult,
    ...tsResult,
    ...monorepoResult,
    figma: {
      detected: figmaDetected,
      ...figmaResult,
    },
    designTokens: designTokensResult,
    staticSite: staticSiteResult,
    aiIgnorePatterns,
    tools: toolsResult,
    mcpServers: mcpResult,
    packageManager,
    projectName,
    projectPath,
    scripts,
  };
}

export {
  detectNextjs,
  detectSitecore,
  detectOptimizely,
  detectStyling,
  detectTypescript,
  detectMonorepo,
  detectPackageManager,
  detectFigma,
  detectTools,
  detectMcpServers,
  detectDesignTokens,
  detectStaticSite,
  loadAiIgnorePatterns,
};
