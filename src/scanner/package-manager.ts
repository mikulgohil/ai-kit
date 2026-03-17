import path from 'path';
import { fileExists, readJsonSafe } from '../utils.js';

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export function detectPackageManager(projectPath: string): PackageManager {
  const pkg = readJsonSafe<{ packageManager?: string }>(
    path.join(projectPath, 'package.json'),
  );

  if (pkg?.packageManager) {
    if (pkg.packageManager.startsWith('pnpm')) return 'pnpm';
    if (pkg.packageManager.startsWith('yarn')) return 'yarn';
    if (pkg.packageManager.startsWith('bun')) return 'bun';
    return 'npm';
  }

  if (fileExists(path.join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fileExists(path.join(projectPath, 'yarn.lock'))) return 'yarn';
  if (fileExists(path.join(projectPath, 'bun.lockb'))) return 'bun';
  if (fileExists(path.join(projectPath, 'bun.lock'))) return 'bun';

  return 'npm';
}
