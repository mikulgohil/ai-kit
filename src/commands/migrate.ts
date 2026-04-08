import path from 'path';
import fs from 'fs-extra';
import { confirm } from '@inquirer/prompts';
import ora from 'ora';
import { scanProject } from '../scanner/index.js';
import { generateClaudeMd } from '../generator/claude-md.js';
import { generateCursorRules } from '../generator/cursorrules.js';
import { generateMdcFiles } from '../generator/cursor-mdc.js';
import { generateConfig } from '../generator/config.js';
import { generateSettingsLocal } from '../generator/hooks.js';
import { copySkills } from '../copier/skills.js';
import { copyGuides } from '../copier/guides.js';
import { copyAgents } from '../copier/agents.js';
import { copyContexts } from '../copier/contexts.js';
import { loadCustomFragments } from '../generator/assembler.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES } from '../constants.js';
import {
  logSuccess,
  logError,
  logInfo,
  logWarning,
  logSection,
  fileExists,
  readJsonSafe,
  readFileSafe,
  backupFiles,
  parseSections,
} from '../utils.js';
import type { AiKitConfig, StrictnessLevel, HookProfile, ToolsSelection } from '../types.js';

const AI_KIT_START = '<!-- AI-KIT:START -->';
const AI_KIT_END = '<!-- AI-KIT:END -->';
const CUSTOM_START = '<!-- CUSTOM RULES (preserved by ai-kit) -->';
const CUSTOM_END = '<!-- /CUSTOM RULES -->';

export async function migrateCommand(
  targetPath?: string,
  opts?: { dryRun?: boolean },
): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);
  const dryRun = opts?.dryRun ?? false;

  logSection('AI Kit — Migrate Existing Project');

  // Check if already managed by ai-kit
  const existingConfig = readJsonSafe<AiKitConfig>(configPath);
  if (existingConfig) {
    logInfo('This project is already managed by ai-kit.');
    logInfo('Use `ai-kit update` to refresh configs.');
    return;
  }

  // Check for existing AI config files
  const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
  const cursorRulesPath = path.join(projectDir, GENERATED_FILES.cursorRules);
  const existingClaudeMd = readFileSafe(claudeMdPath);
  const existingCursorRules = readFileSafe(cursorRulesPath);

  if (!existingClaudeMd && !existingCursorRules) {
    logInfo('No existing AI config files found (CLAUDE.md or .cursorrules).');
    logInfo('Use `ai-kit init` for a fresh setup.');
    return;
  }

  // Scan the project
  const spinner = ora('Scanning project...').start();
  const scan = await scanProject(projectDir);
  spinner.succeed('Project scanned');

  // Show detected stack
  logSection('Detected Stack');
  const frameworkLabel =
    scan.framework === 'nextjs'
      ? `Next.js ${scan.nextjsVersion || ''} (${scan.routerType || 'unknown'} router)`.trim()
      : scan.framework;
  logInfo(`Framework: ${frameworkLabel}`);
  logInfo(`CMS: ${scan.cms === 'none' ? 'None' : scan.cms}`);
  logInfo(`Styling: ${scan.styling.join(', ') || 'None'}`);
  logInfo(`TypeScript: ${scan.typescript ? 'Yes' : 'No'}`);
  logInfo(`Package Manager: ${scan.packageManager}`);

  // Analyze existing files
  const customSections = existingClaudeMd
    ? parseSections(existingClaudeMd)
    : [];

  // Generate what ai-kit would produce
  const customFragments = loadCustomFragments(projectDir);
  const strictness: StrictnessLevel = 'standard';
  const hookProfile: HookProfile = 'standard';
  const tools: ToolsSelection = {
    claude: true,
    cursor: !!existingCursorRules || fileExists(path.join(projectDir, '.cursor')),
  };

  const aiKitClaudeMd = generateClaudeMd(scan, { strictness, customFragments });
  const aiKitSections = parseSections(
    aiKitClaudeMd
      .replace(AI_KIT_START, '')
      .replace(AI_KIT_END, ''),
  );

  // Show migration plan
  logSection('Migration Plan');

  if (customSections.length > 0) {
    logInfo(`Your existing CLAUDE.md has ${customSections.length} section(s):`);
    for (const s of customSections) {
      logSuccess(`  KEEP: "${s.heading}"`);
    }
  }

  logInfo(`ai-kit will generate ${aiKitSections.length} section(s) for your stack:`);
  for (const s of aiKitSections) {
    logInfo(`  + ADD: "${s.heading}"`);
  }

  console.log('');
  logInfo('Your custom sections will be placed at the TOP of the file.');
  logInfo('ai-kit sections will be wrapped in AI-KIT markers below.');
  logInfo('Future `ai-kit update` will only touch the marked section.');

  if (dryRun) {
    console.log('');
    logInfo('Dry run — no files were modified.');
    return;
  }

  console.log('');
  const proceed = await confirm({
    message: 'Apply this migration?',
    default: true,
  });

  if (!proceed) {
    logInfo('Cancelled.');
    return;
  }

  // Backup existing files before any modifications
  const filesToBackup = [
    GENERATED_FILES.claudeMd,
    GENERATED_FILES.cursorRules,
  ].filter((f) => fileExists(path.join(projectDir, f)));

  if (filesToBackup.length > 0) {
    const backupPath = await backupFiles(projectDir, filesToBackup);
    if (backupPath) {
      logSuccess(
        `Backed up existing files to ${path.relative(projectDir, backupPath)}`,
      );
    }
  }

  logSection('Migrating');

  // Build merged CLAUDE.md: custom sections at top, ai-kit in markers
  if (tools.claude) {
    const customBlock =
      customSections.length > 0
        ? `${CUSTOM_START}\n\n${customSections.map((s) => s.raw).join('\n\n')}\n\n${CUSTOM_END}\n\n`
        : '';

    const merged = `${customBlock}${aiKitClaudeMd}`;
    await fs.writeFile(claudeMdPath, merged, 'utf-8');
    logSuccess('CLAUDE.md migrated (custom rules preserved at top)');
  }

  // Generate .cursorrules
  if (tools.cursor) {
    const cursorContent = generateCursorRules(scan, {
      strictness,
      customFragments,
    });
    await fs.writeFile(cursorRulesPath, cursorContent, 'utf-8');
    logSuccess('.cursorrules generated');

    // Generate .cursor/rules/*.mdc files
    const mdcDir = path.join(projectDir, GENERATED_FILES.cursorMdcDir);
    await fs.ensureDir(mdcDir);
    const mdcFiles = generateMdcFiles(scan);
    for (const mdc of mdcFiles) {
      await fs.writeFile(path.join(mdcDir, mdc.filename), mdc.content, 'utf-8');
    }
    logSuccess(`${mdcFiles.length} .cursor/rules/*.mdc files generated`);
  }

  // Copy skills, agents, contexts, guides
  const commands = await copySkills(projectDir);
  logSuccess(`${commands.length} skills copied`);

  const agents = await copyAgents(projectDir, scan);
  logSuccess(`${agents.length} agents copied`);

  const contexts = await copyContexts(projectDir);
  logSuccess(`${contexts.length} context modes copied`);

  // Generate hooks
  const settingsLocalPath = path.join(
    projectDir,
    GENERATED_FILES.claudeSettingsLocal,
  );
  const settingsLocal = generateSettingsLocal(scan, hookProfile);
  await fs.ensureDir(path.dirname(settingsLocalPath));
  await fs.writeJson(settingsLocalPath, settingsLocal, { spaces: 2 });
  logSuccess(`Hooks configured (profile: ${hookProfile})`);

  const guides = await copyGuides(projectDir);
  logSuccess(`${guides.length} guides copied`);

  // Write ai-kit config
  const templates: string[] = [];
  if (tools.claude) templates.push('CLAUDE.md');
  if (tools.cursor) templates.push('.cursorrules');

  const config = generateConfig(scan, templates, commands, guides, {
    strictness,
    customFragments,
    agents,
    contexts,
    hooks: true,
    hookProfile,
    tools,
  });
  await fs.writeJson(configPath, config, { spaces: 2 });
  logSuccess('ai-kit.config.json created');

  // Summary
  logSection('Migration Complete');
  if (customSections.length > 0) {
    logInfo(
      `${customSections.length} custom section(s) preserved in CLAUDE.md`,
    );
  }
  logInfo('This project is now managed by ai-kit.');
  logInfo('Run `ai-kit update` anytime to refresh generated sections.');
  logInfo('Your custom rules above the AI-KIT markers will never be touched.');
  if (filesToBackup.length > 0) {
    logInfo('Rollback available: `ai-kit rollback --latest`');
  }
}
