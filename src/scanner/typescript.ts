import path from 'path';
import { fileExists, readJsonSafe } from '../utils.js';

interface TypescriptResult {
  typescript: boolean;
  typescriptStrict?: boolean;
}

export function detectTypescript(projectPath: string): TypescriptResult {
  const tsconfigPath = path.join(projectPath, 'tsconfig.json');

  if (!fileExists(tsconfigPath)) {
    return { typescript: false };
  }

  const tsconfig = readJsonSafe<{
    compilerOptions?: { strict?: boolean };
  }>(tsconfigPath);

  return {
    typescript: true,
    typescriptStrict: tsconfig?.compilerOptions?.strict ?? false,
  };
}
