import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export function readJsonSafe<T = Record<string, unknown>>(
  filePath: string,
): T | null {
  try {
    return fs.readJsonSync(filePath) as T;
  } catch {
    return null;
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function dirExists(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export function log(message: string): void {
  console.log(message);
}

export function logSuccess(message: string): void {
  console.log(chalk.green('✓') + ' ' + message);
}

export function logWarning(message: string): void {
  console.log(chalk.yellow('⚠') + ' ' + message);
}

export function logError(message: string): void {
  console.log(chalk.red('✗') + ' ' + message);
}

export function logInfo(message: string): void {
  console.log(chalk.blue('ℹ') + ' ' + message);
}

export function logSection(title: string): void {
  console.log('\n' + chalk.bold.underline(title));
}

export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

const AI_KIT_START = '<!-- AI-KIT:START -->';
const AI_KIT_END = '<!-- AI-KIT:END -->';

export function mergeWithMarkers(
  existingContent: string,
  newGenerated: string,
): string {
  const startIdx = existingContent.indexOf(AI_KIT_START);
  const endIdx = existingContent.indexOf(AI_KIT_END);

  if (startIdx === -1 || endIdx === -1) {
    // No markers found — file was generated before markers existed.
    // Replace entirely with new content (which includes markers).
    return newGenerated;
  }

  const before = existingContent.substring(0, startIdx);
  const after = existingContent.substring(endIdx + AI_KIT_END.length);

  return `${before}${newGenerated}${after}`;
}
