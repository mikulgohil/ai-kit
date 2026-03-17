import path from 'path';
import { dirExists, readJsonSafe } from '../utils.js';

interface NextjsResult {
  framework: 'nextjs' | 'react' | 'unknown';
  nextjsVersion?: string;
  routerType?: 'app' | 'pages' | 'hybrid';
}

export function detectNextjs(
  projectPath: string,
  pkg: Record<string, unknown>,
): NextjsResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  if (!deps.next) {
    if (deps.react) return { framework: 'react' };
    return { framework: 'unknown' };
  }

  const nextjsVersion = deps.next.replace(/[\^~>=<]/g, '');

  const hasAppDir =
    dirExists(path.join(projectPath, 'app')) ||
    dirExists(path.join(projectPath, 'src', 'app'));

  const hasPagesDir =
    dirExists(path.join(projectPath, 'pages')) ||
    dirExists(path.join(projectPath, 'src', 'pages'));

  let routerType: 'app' | 'pages' | 'hybrid' | undefined;
  if (hasAppDir && hasPagesDir) routerType = 'hybrid';
  else if (hasAppDir) routerType = 'app';
  else if (hasPagesDir) routerType = 'pages';

  return { framework: 'nextjs', nextjsVersion, routerType };
}
