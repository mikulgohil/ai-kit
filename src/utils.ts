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

import { BACKUP_DIR } from './constants.js';

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

// --- Backup & Rollback ---

export async function backupFiles(
  projectDir: string,
  files: string[],
): Promise<string> {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  const backupDir = path.join(projectDir, BACKUP_DIR, timestamp);

  await fs.ensureDir(backupDir);

  let backedUp = 0;
  for (const file of files) {
    const fullPath = path.join(projectDir, file);
    if (await fs.pathExists(fullPath)) {
      const dest = path.join(backupDir, file);
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(fullPath, dest);
      backedUp++;
    }
  }

  if (backedUp === 0) {
    await fs.remove(backupDir);
    return '';
  }

  return backupDir;
}

export async function listBackups(
  projectDir: string,
): Promise<string[]> {
  const backupsRoot = path.join(projectDir, BACKUP_DIR);
  if (!(await fs.pathExists(backupsRoot))) return [];

  const entries = await fs.readdir(backupsRoot);
  return entries
    .filter((e) => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/.test(e))
    .sort()
    .reverse();
}

export async function restoreBackup(
  projectDir: string,
  backupName: string,
): Promise<string[]> {
  const backupDir = path.join(projectDir, BACKUP_DIR, backupName);
  if (!(await fs.pathExists(backupDir))) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  const restored: string[] = [];

  async function walk(dir: string, rel: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
      const srcPath = path.join(dir, entry.name);
      const destPath = path.join(projectDir, entryRel);

      if (entry.isDirectory()) {
        await walk(srcPath, entryRel);
      } else {
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath, { overwrite: true });
        restored.push(entryRel);
      }
    }
  }

  await walk(backupDir, '');
  return restored;
}

// --- Markdown section parsing ---

export interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
  raw: string;
}

export function parseSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split('\n');
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection | null = null;
  const contentLines: string[] = [];

  function flush(): void {
    if (current) {
      current.content = contentLines.join('\n').trim();
      current.raw =
        `${'#'.repeat(current.level)} ${current.heading}\n\n${current.content}`.trim();
      sections.push(current);
      contentLines.length = 0;
    }
  }

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      flush();
      current = {
        heading: match[2].trim(),
        level: match[1].length,
        content: '',
        raw: '',
      };
    } else if (current) {
      contentLines.push(line);
    }
  }
  flush();

  return sections;
}
