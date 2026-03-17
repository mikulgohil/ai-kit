import path from 'path';
import fs from 'fs-extra';
import { select, confirm, input } from '@inquirer/prompts';
import ora from 'ora';
import { scanProject } from '../scanner/index.js';
import { generateClaudeMd } from '../generator/claude-md.js';
import { generateCursorRules } from '../generator/cursorrules.js';
import { generateMdcFiles } from '../generator/cursor-mdc.js';
import { generateConfig } from '../generator/config.js';
import { copyCommands } from '../copier/commands.js';
import { copyGuides } from '../copier/guides.js';
import { scaffoldDocs } from '../copier/docs.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES } from '../constants.js';
import {
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logSection,
  fileExists,
} from '../utils.js';
import type { ProjectScan, ConflictResolution, ClarificationAnswer } from '../types.js';

export async function initCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());

  logSection('AI Kit — Project Setup');
  logInfo(`Scanning: ${projectDir}`);

  // Check for existing config
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);
  if (fileExists(configPath)) {
    const overwrite = await confirm({
      message: 'AI Kit is already configured in this project. Re-initialize?',
      default: false,
    });
    if (!overwrite) {
      logInfo('Cancelled. Use `ai-kit update` to refresh configs.');
      return;
    }
  }

  // Scan the project
  const spinner = ora('Scanning project...').start();
  let scan: ProjectScan;
  try {
    scan = await scanProject(projectDir);
    spinner.succeed('Project scanned');
  } catch (err) {
    spinner.fail('Failed to scan project');
    logError(String(err));
    return;
  }

  // Show detected stack
  logSection('Detected Stack');
  logInfo(`Framework: ${formatFramework(scan)}`);
  logInfo(`CMS: ${scan.cms === 'none' ? 'None' : scan.cms}`);
  logInfo(`Styling: ${scan.styling.join(', ') || 'None detected'}`);
  logInfo(`TypeScript: ${scan.typescript ? 'Yes' : 'No'}`);
  logInfo(`Monorepo: ${scan.monorepo ? `Yes (${scan.monorepoTool})` : 'No'}`);
  logInfo(`Package Manager: ${scan.packageManager}`);

  // Clarification questions for ambiguous detections
  const clarifications = await askClarifications(scan);
  scan = applyClarifications(scan, clarifications);

  // Ask what to generate
  const tools = await selectTools();

  // Ask conflict resolution strategy
  const conflict = await selectConflictStrategy(projectDir);

  // Generate files
  logSection('Generating Files');
  const results = await generate(projectDir, scan, tools, conflict);

  // Summary
  logSection('Setup Complete');
  if (results.claudeMd) logSuccess(`CLAUDE.md generated`);
  if (results.cursorRules) logSuccess(`.cursorrules generated`);
  if (results.cursorMdcFiles > 0)
    logSuccess(`${results.cursorMdcFiles} .cursor/rules/*.mdc files generated`);
  if (results.commands.length > 0)
    logSuccess(`${results.commands.length} slash commands copied`);
  if (results.guides.length > 0)
    logSuccess(`${results.guides.length} guides added to ai-kit/guides/`);
  if (results.docs.length > 0)
    logSuccess(`${results.docs.length} doc scaffolds created in docs/`);

  console.log('');
  logInfo('Run `ai-kit update` anytime to refresh configs after project changes.');
  logInfo('Check ai-kit/guides/getting-started.md to get started.');
}

function formatFramework(scan: ProjectScan): string {
  if (scan.framework === 'nextjs') {
    const version = scan.nextjsVersion ? ` ${scan.nextjsVersion}` : '';
    const router = scan.routerType ? ` (${scan.routerType} router)` : '';
    return `Next.js${version}${router}`;
  }
  return scan.framework;
}

async function askClarifications(scan: ProjectScan): Promise<ClarificationAnswer> {
  const answers: ClarificationAnswer = {};

  // If Next.js detected but router type unclear
  if (scan.framework === 'nextjs' && !scan.routerType) {
    answers.routerType = await select({
      message: 'Which Next.js router does this project use?',
      choices: [
        { name: 'App Router (app/ directory)', value: 'app' as const },
        { name: 'Pages Router (pages/ directory)', value: 'pages' as const },
        { name: 'Both (hybrid)', value: 'hybrid' as const },
      ],
    });
  }

  return answers;
}

function applyClarifications(
  scan: ProjectScan,
  clarifications: ClarificationAnswer,
): ProjectScan {
  return {
    ...scan,
    ...(clarifications.routerType && { routerType: clarifications.routerType }),
    ...(clarifications.cms && { cms: clarifications.cms }),
  };
}

async function selectTools(): Promise<{ claude: boolean; cursor: boolean }> {
  const tool = await select({
    message: 'Which AI tools does this project use?',
    choices: [
      { name: 'Both Claude Code & Cursor', value: 'both' },
      { name: 'Claude Code only', value: 'claude' },
      { name: 'Cursor only', value: 'cursor' },
    ],
    default: 'both',
  });

  return {
    claude: tool === 'both' || tool === 'claude',
    cursor: tool === 'both' || tool === 'cursor',
  };
}

async function selectConflictStrategy(
  projectDir: string,
): Promise<ConflictResolution> {
  const hasExisting =
    fileExists(path.join(projectDir, GENERATED_FILES.claudeMd)) ||
    fileExists(path.join(projectDir, GENERATED_FILES.cursorRules));

  if (!hasExisting) return 'overwrite';

  return select({
    message: 'Existing AI config files detected. How should we handle conflicts?',
    choices: [
      {
        name: 'Overwrite — replace with fresh generated files',
        value: 'overwrite' as const,
      },
      {
        name: 'Skip — keep existing files, only add missing ones',
        value: 'skip' as const,
      },
    ],
    default: 'overwrite',
  });
}

interface GenerateResult {
  claudeMd: boolean;
  cursorRules: boolean;
  cursorMdcFiles: number;
  commands: string[];
  guides: string[];
  docs: string[];
}

async function generate(
  projectDir: string,
  scan: ProjectScan,
  tools: { claude: boolean; cursor: boolean },
  conflict: ConflictResolution,
): Promise<GenerateResult> {
  const result: GenerateResult = {
    claudeMd: false,
    cursorRules: false,
    cursorMdcFiles: 0,
    commands: [],
    guides: [],
    docs: [],
  };

  // Generate CLAUDE.md
  if (tools.claude) {
    const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
    if (conflict === 'overwrite' || !fileExists(claudeMdPath)) {
      const content = generateClaudeMd(scan);
      await fs.writeFile(claudeMdPath, content, 'utf-8');
      result.claudeMd = true;
    } else {
      logWarning('CLAUDE.md exists, skipping');
    }

    // Copy slash commands
    result.commands = await copyCommands(projectDir);

    // Ensure .claude/commands directory
    await fs.ensureDir(path.join(projectDir, '.claude', 'commands'));
  }

  // Generate .cursorrules
  if (tools.cursor) {
    const cursorPath = path.join(projectDir, GENERATED_FILES.cursorRules);
    if (conflict === 'overwrite' || !fileExists(cursorPath)) {
      const content = generateCursorRules(scan);
      await fs.writeFile(cursorPath, content, 'utf-8');
      result.cursorRules = true;
    } else {
      logWarning('.cursorrules exists, skipping');
    }

    // Generate .cursor/rules/*.mdc files
    const mdcDir = path.join(projectDir, GENERATED_FILES.cursorMdcDir);
    await fs.ensureDir(mdcDir);
    const mdcFiles = generateMdcFiles(scan);
    for (const mdc of mdcFiles) {
      await fs.writeFile(path.join(mdcDir, mdc.filename), mdc.content, 'utf-8');
    }
    result.cursorMdcFiles = mdcFiles.length;
  }

  // Copy guides
  result.guides = await copyGuides(projectDir);

  // Scaffold docs
  result.docs = await scaffoldDocs(projectDir);

  // Write ai-kit config
  const templates = [];
  if (result.claudeMd) templates.push('CLAUDE.md');
  if (result.cursorRules) templates.push('.cursorrules');

  const config = generateConfig(scan, templates, result.commands, result.guides);
  await fs.writeJson(
    path.join(projectDir, AI_KIT_CONFIG_FILE),
    config,
    { spaces: 2 },
  );

  return result;
}
