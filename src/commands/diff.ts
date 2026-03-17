import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { scanProject } from '../scanner/index.js';
import { generateClaudeMd, selectFragments } from '../generator/claude-md.js';
import { generateCursorRules } from '../generator/cursorrules.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES, VERSION } from '../constants.js';
import {
  logSection,
  logInfo,
  logWarning,
  logError,
  fileExists,
  readJsonSafe,
  readFileSafe,
} from '../utils.js';
import type { AiKitConfig, ProjectScan } from '../types.js';

export async function diffCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  console.log(chalk.bold('AI Kit — Diff (dry run)\n'));

  // 1. Read existing config
  if (!fileExists(configPath)) {
    logError('No ai-kit.config.json found. Run `ai-kit init` first.');
    return;
  }

  const existingConfig = readJsonSafe<AiKitConfig>(configPath);
  if (!existingConfig) {
    logError('Could not read ai-kit.config.json. Run `ai-kit init` to re-initialize.');
    return;
  }

  // Warn if major version mismatch
  const existingMajor = parseInt(existingConfig.version.split('.')[0], 10);
  const currentMajor = parseInt(VERSION.split('.')[0], 10);
  if (existingMajor !== currentMajor) {
    logWarning(
      `Config was generated with ai-kit v${existingConfig.version}, but you're running v${VERSION}. Consider running \`ai-kit init\` to re-initialize.`,
    );
  }

  // 2. Re-scan the project
  const spinner = ora('Scanning project...').start();
  const newScan = await scanProject(projectDir);
  spinner.succeed('Project scanned');

  const oldScan = existingConfig.scanResult;

  // 3. Show stack changes
  logSection('Stack Changes');
  const stackChanges = diffStack(oldScan, newScan);
  if (stackChanges.length === 0) {
    console.log(chalk.dim('  No stack changes detected'));
  } else {
    for (const change of stackChanges) {
      if (change.type === 'added') {
        console.log(chalk.green(`  + ${change.label}`));
      } else if (change.type === 'modified') {
        console.log(chalk.yellow(`  ~ ${change.label}`));
      } else {
        console.log(chalk.red(`  - ${change.label}`));
      }
    }
  }

  // 4. Compare generated file contents
  logSection('File Changes');

  const oldFragments = selectFragments(oldScan);
  const newFragments = selectFragments(newScan);

  let modified = 0;
  let added = 0;
  let unchanged = 0;

  // CLAUDE.md
  const claudeMdStatus = diffGeneratedFile(
    projectDir,
    GENERATED_FILES.claudeMd,
    existingConfig,
    () => generateClaudeMd(newScan),
    oldFragments,
    newFragments,
  );
  logFileChange(claudeMdStatus);
  if (claudeMdStatus.status === 'modified') modified++;
  else if (claudeMdStatus.status === 'added') added++;
  else unchanged++;

  // .cursorrules
  const cursorRulesStatus = diffGeneratedFile(
    projectDir,
    GENERATED_FILES.cursorRules,
    existingConfig,
    () => generateCursorRules(newScan),
    oldFragments,
    newFragments,
  );
  logFileChange(cursorRulesStatus);
  if (cursorRulesStatus.status === 'modified') modified++;
  else if (cursorRulesStatus.status === 'added') added++;
  else unchanged++;

  // Skills
  const skillsDir = path.join(projectDir, GENERATED_FILES.claudeSkills);
  const skillCount = countFilesInDir(skillsDir);
  console.log(chalk.dim(`  unchanged ${GENERATED_FILES.claudeSkills}/ (${skillCount} skills)`));
  unchanged++;

  // Guides
  const guidesDir = path.join(projectDir, AI_KIT_FOLDER_NAME, 'guides');
  const guideCount = existingConfig.guides?.length || 0;
  console.log(chalk.dim(`  unchanged ai-kit/guides/ (${guideCount} guides)`));
  unchanged++;

  // 5. Summary
  console.log('');
  const parts: string[] = [];
  if (modified > 0) parts.push(`${modified} files would be modified`);
  if (added > 0) parts.push(`${added} added`);
  const removed = 0;
  parts.push(`${removed} removed`);

  logInfo(`Summary: ${parts.join(', ')}`);
  logInfo('Run `ai-kit update` to apply these changes.');
}

const AI_KIT_FOLDER_NAME = 'ai-kit';

interface StackChange {
  type: 'added' | 'removed' | 'modified';
  label: string;
}

function diffStack(oldScan: ProjectScan, newScan: ProjectScan): StackChange[] {
  const changes: StackChange[] = [];

  // Framework version
  if (oldScan.framework === newScan.framework && newScan.framework === 'nextjs') {
    if (oldScan.nextjsVersion !== newScan.nextjsVersion) {
      changes.push({
        type: 'modified',
        label: `Next.js version: ${oldScan.nextjsVersion || 'unknown'} → ${newScan.nextjsVersion || 'unknown'}`,
      });
    }
  } else if (oldScan.framework !== newScan.framework) {
    if (oldScan.framework !== 'unknown') {
      changes.push({ type: 'removed', label: `${oldScan.framework} no longer detected` });
    }
    if (newScan.framework !== 'unknown') {
      changes.push({ type: 'added', label: `${newScan.framework} detected` });
    }
  }

  // Router type
  if (oldScan.routerType !== newScan.routerType && newScan.framework === 'nextjs') {
    changes.push({
      type: 'modified',
      label: `Router type: ${oldScan.routerType || 'unknown'} → ${newScan.routerType || 'unknown'}`,
    });
  }

  // TypeScript
  if (!oldScan.typescript && newScan.typescript) {
    changes.push({ type: 'added', label: 'TypeScript detected' });
  } else if (oldScan.typescript && !newScan.typescript) {
    changes.push({ type: 'removed', label: 'TypeScript no longer detected' });
  }

  // Styling changes
  const oldStyles = new Set(oldScan.styling);
  const newStyles = new Set(newScan.styling);
  for (const style of newStyles) {
    if (!oldStyles.has(style)) {
      changes.push({ type: 'added', label: `${style} detected (styling)` });
    }
  }
  for (const style of oldStyles) {
    if (!newStyles.has(style)) {
      changes.push({ type: 'removed', label: `${style} no longer detected` });
    }
  }

  // Tailwind version
  if (
    oldScan.styling.includes('tailwind') &&
    newScan.styling.includes('tailwind') &&
    oldScan.tailwindVersion !== newScan.tailwindVersion
  ) {
    changes.push({
      type: 'modified',
      label: `Tailwind version: ${oldScan.tailwindVersion || 'unknown'} → ${newScan.tailwindVersion || 'unknown'}`,
    });
  }

  // Monorepo
  if (!oldScan.monorepo && newScan.monorepo) {
    changes.push({
      type: 'added',
      label: `monorepo detected${newScan.monorepoTool ? ` (${newScan.monorepoTool})` : ''}`,
    });
  } else if (oldScan.monorepo && !newScan.monorepo) {
    changes.push({ type: 'removed', label: 'monorepo no longer detected' });
  } else if (oldScan.monorepoTool !== newScan.monorepoTool && newScan.monorepo) {
    changes.push({
      type: 'modified',
      label: `monorepo tool: ${oldScan.monorepoTool || 'unknown'} → ${newScan.monorepoTool || 'unknown'}`,
    });
  }

  // CMS
  if (oldScan.cms !== newScan.cms) {
    if (oldScan.cms !== 'none') {
      changes.push({ type: 'removed', label: `${oldScan.cms} no longer detected` });
    }
    if (newScan.cms !== 'none') {
      changes.push({ type: 'added', label: `${newScan.cms} detected (CMS)` });
    }
  }

  // Package manager
  if (oldScan.packageManager !== newScan.packageManager) {
    changes.push({
      type: 'modified',
      label: `Package manager: ${oldScan.packageManager} → ${newScan.packageManager}`,
    });
  }

  // Figma
  if (!oldScan.figma?.detected && newScan.figma?.detected) {
    changes.push({ type: 'added', label: 'Figma integration detected' });
  } else if (oldScan.figma?.detected && !newScan.figma?.detected) {
    changes.push({ type: 'removed', label: 'Figma integration no longer detected' });
  }

  // Tools changes
  if (oldScan.tools && newScan.tools) {
    const toolNames = Object.keys(newScan.tools) as (keyof typeof newScan.tools)[];
    for (const tool of toolNames) {
      if (!oldScan.tools[tool] && newScan.tools[tool]) {
        changes.push({ type: 'added', label: `${tool} detected (tooling)` });
      }
    }
    const oldToolNames = Object.keys(oldScan.tools) as (keyof typeof oldScan.tools)[];
    for (const tool of oldToolNames) {
      if (oldScan.tools[tool] && !newScan.tools[tool]) {
        changes.push({ type: 'removed', label: `${tool} no longer detected` });
      }
    }
  }

  return changes;
}

interface FileChangeResult {
  filename: string;
  status: 'added' | 'modified' | 'unchanged';
  detail?: string;
}

function diffGeneratedFile(
  projectDir: string,
  filename: string,
  config: AiKitConfig,
  generate: () => string,
  oldFragments: string[],
  newFragments: string[],
): FileChangeResult {
  const filePath = path.join(projectDir, filename);
  const currentContent = readFileSafe(filePath);
  const newContent = generate();

  // File does not exist yet but would be generated
  if (!currentContent) {
    if (config.templates.includes(filename)) {
      return { filename, status: 'added', detail: 'file missing, would be created' };
    }
    return { filename, status: 'unchanged', detail: 'not configured' };
  }

  // Compare contents
  if (currentContent.trim() === newContent.trim()) {
    return { filename, status: 'unchanged' };
  }

  // Determine which fragments changed
  const addedFragments = newFragments.filter((f) => !oldFragments.includes(f));
  const removedFragments = oldFragments.filter((f) => !newFragments.includes(f));

  const fragmentDetails: string[] = [];
  if (addedFragments.length > 0) {
    fragmentDetails.push(`+${addedFragments.join(', +')}`);
  }
  if (removedFragments.length > 0) {
    fragmentDetails.push(`-${removedFragments.join(', -')}`);
  }

  const detail =
    fragmentDetails.length > 0
      ? `template fragments changed: ${fragmentDetails.join(', ')}`
      : 'content changed';

  return { filename, status: 'modified', detail };
}

function logFileChange(result: FileChangeResult): void {
  if (result.status === 'added') {
    console.log(chalk.green(`  added     ${result.filename}`) + (result.detail ? chalk.dim(` (${result.detail})`) : ''));
  } else if (result.status === 'modified') {
    console.log(
      chalk.yellow(`  modified  ${result.filename}`) + (result.detail ? chalk.dim(` (${result.detail})`) : ''),
    );
  } else {
    console.log(chalk.dim(`  unchanged ${result.filename}`));
  }
}

function countFilesInDir(dirPath: string): number {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    const entries = fs.readdirSync(dirPath) as string[];
    return entries.filter((e: string) => !e.startsWith('.')).length;
  } catch {
    return 0;
  }
}
