import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { AI_KIT_CONFIG_FILE } from '../constants.js';
import { scanComponents } from '../scanner/components.js';
import {
  logSection,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  fileExists,
  readFileSafe,
} from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
interface DeadCodeEntry {
  name: string;
  filePath: string;
  importCount: number;
  testOnly: boolean;
  status: 'used' | 'unused' | 'test-only';
}

// ─── File Walker ────────────────────────────────────────────────────────
const IGNORE_DIRS = [
  'node_modules', '.next', '.git', 'dist', 'build', '.turbo',
  '.storybook', 'coverage', '.cache',
];

function collectAllFiles(dir: string, files: string[]): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.includes(entry.name)) continue;
        collectAllFiles(full, files);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(full);
      }
    }
  } catch {
    // Skip unreadable directories
  }
}

function isTestOrStoryFile(filePath: string): boolean {
  const name = path.basename(filePath).toLowerCase();
  return (
    name.includes('.test.') ||
    name.includes('.spec.') ||
    name.includes('.stories.') ||
    name.includes('__tests__') ||
    name.includes('__mocks__')
  );
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function deadCodeCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  console.log('');
  logSection('AI Kit — Dead Code Report');
  console.log(chalk.dim(`  ${projectDir}`));
  console.log('');

  // Pre-check: config must exist
  if (!fileExists(configPath)) {
    logWarning('ai-kit.config.json not found. Run `ai-kit init` first.');
    return;
  }

  // Scan components
  const spinner = ora('Scanning components...').start();
  const scanResult = scanComponents(projectDir);

  if (scanResult.components.length === 0) {
    spinner.fail('No components found.');
    return;
  }

  spinner.text = `Found ${scanResult.components.length} components. Checking imports...`;

  // Collect all project files for import search
  const allFiles: string[] = [];
  const srcDir = path.join(projectDir, 'src');
  if (fs.existsSync(srcDir)) {
    collectAllFiles(srcDir, allFiles);
  } else {
    collectAllFiles(projectDir, allFiles);
  }

  // Read all file contents once for efficiency
  const fileContents = new Map<string, string>();
  for (const file of allFiles) {
    const content = readFileSafe(file);
    if (content) {
      fileContents.set(file, content);
    }
  }

  spinner.text = 'Analyzing import references...';

  // For each component, search for imports across the project
  const entries: DeadCodeEntry[] = [];

  for (const component of scanResult.components) {
    const componentFile = component.filePath;
    let importCount = 0;
    let testOnlyImports = 0;
    let productionImports = 0;

    // Build regex patterns to find imports of this component
    // Match: import ... from '...ComponentName' or import ... from '...ComponentName/...'
    const namePattern = new RegExp(
      `(?:import|from)\\s+.*['"][^'"]*(?:/|\\b)${escapeRegex(component.name)}(?:[/'"]|\\b)`,
    );

    for (const [file, content] of fileContents) {
      // Skip the component's own file
      if (path.resolve(file) === path.resolve(componentFile)) continue;

      if (namePattern.test(content)) {
        importCount++;
        if (isTestOrStoryFile(file)) {
          testOnlyImports++;
        } else {
          productionImports++;
        }
      }
    }

    let status: DeadCodeEntry['status'];
    if (importCount === 0) {
      status = 'unused';
    } else if (productionImports === 0 && testOnlyImports > 0) {
      status = 'test-only';
    } else {
      status = 'used';
    }

    entries.push({
      name: component.name,
      filePath: component.relativePath,
      importCount,
      testOnly: status === 'test-only',
      status,
    });
  }

  spinner.succeed(`Analyzed ${scanResult.components.length} components across ${allFiles.length} files`);

  // Sort: unused first, then test-only, then used
  const statusOrder: Record<string, number> = { unused: 0, 'test-only': 1, used: 2 };
  entries.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  // Count summaries
  const unused = entries.filter((e) => e.status === 'unused');
  const testOnly = entries.filter((e) => e.status === 'test-only');
  const used = entries.filter((e) => e.status === 'used');

  // Display table
  console.log('');
  const nameWidth = 30;
  const pathWidth = 45;
  const countWidth = 8;
  const statusWidth = 12;

  // Header
  console.log(
    `  ${chalk.bold('Component'.padEnd(nameWidth))} ${chalk.bold('Path'.padEnd(pathWidth))} ${chalk.bold('Imports'.padStart(countWidth))} ${chalk.bold('Status'.padEnd(statusWidth))}`,
  );
  console.log(
    `  ${'─'.repeat(nameWidth)} ${'─'.repeat(pathWidth)} ${'─'.repeat(countWidth)} ${'─'.repeat(statusWidth)}`,
  );

  for (const entry of entries) {
    const name = entry.name.length > nameWidth - 1
      ? entry.name.substring(0, nameWidth - 3) + '...'
      : entry.name.padEnd(nameWidth);

    const filePath = entry.filePath.length > pathWidth - 1
      ? '...' + entry.filePath.substring(entry.filePath.length - pathWidth + 4)
      : entry.filePath.padEnd(pathWidth);

    const count = String(entry.importCount).padStart(countWidth);

    let statusLabel: string;
    switch (entry.status) {
      case 'unused':
        statusLabel = chalk.red('unused');
        break;
      case 'test-only':
        statusLabel = chalk.yellow('test-only');
        break;
      case 'used':
        statusLabel = chalk.green('used');
        break;
    }

    console.log(`  ${name} ${chalk.dim(filePath)} ${count} ${statusLabel}`);
  }

  // Summary
  console.log('');
  console.log(
    `  ${chalk.bold('Summary:')} ${chalk.red(String(unused.length))} unused · ${chalk.yellow(String(testOnly.length))} test-only · ${chalk.green(String(used.length))} actively used`,
  );

  if (unused.length > 0) {
    console.log('');
    logWarning('Unused components may be dead code. Consider removing them or verify they are entry points.');
  }

  if (testOnly.length > 0) {
    logInfo('Test-only components are only imported in test/story files.');
  }

  console.log('');
}

// ─── Helpers ────────────────────────────────────────────────────────────
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
