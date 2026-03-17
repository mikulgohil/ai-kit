import path from 'path';
import { fileExists } from '../utils.js';

type MonorepoTool = 'turborepo' | 'nx' | 'lerna' | 'pnpm-workspaces';

interface MonorepoResult {
  monorepo: boolean;
  monorepoTool?: MonorepoTool;
}

export function detectMonorepo(
  projectPath: string,
  pkg: Record<string, unknown>,
): MonorepoResult {
  if (fileExists(path.join(projectPath, 'turbo.json'))) {
    return { monorepo: true, monorepoTool: 'turborepo' };
  }

  if (fileExists(path.join(projectPath, 'nx.json'))) {
    return { monorepo: true, monorepoTool: 'nx' };
  }

  if (fileExists(path.join(projectPath, 'lerna.json'))) {
    return { monorepo: true, monorepoTool: 'lerna' };
  }

  if (fileExists(path.join(projectPath, 'pnpm-workspace.yaml'))) {
    return { monorepo: true, monorepoTool: 'pnpm-workspaces' };
  }

  if (pkg.workspaces) {
    return { monorepo: true };
  }

  return { monorepo: false };
}
