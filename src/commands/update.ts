import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { confirm } from '@inquirer/prompts';
import { scanProject } from '../scanner/index.js';
import { generateClaudeMd } from '../generator/claude-md.js';
import { generateCursorRules } from '../generator/cursorrules.js';
import { generateMdcFiles } from '../generator/cursor-mdc.js';
import { generateConfig } from '../generator/config.js';
import { generateSettingsLocal } from '../generator/hooks.js';
import { copySkills, BASE_SKILLS } from '../copier/skills.js';
import { copyGuides } from '../copier/guides.js';
import { copyAgents, BASE_UNIVERSAL_AGENTS } from '../copier/agents.js';
import { copyContexts } from '../copier/contexts.js';
import { loadCustomFragments } from '../generator/assembler.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES, VERSION } from '../constants.js';
import {
  logSuccess,
  logError,
  logInfo,
  logWarning,
  logSection,
  fileExists,
  readJsonSafe,
  readFileSafe,
  mergeWithMarkers,
  backupFiles,
} from '../utils.js';
import type { AiKitConfig } from '../types.js';

export async function updateCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

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

  const proceed = await confirm({
    message: 'Re-scan project and update all generated files?',
    default: true,
  });

  if (!proceed) return;

  const spinner = ora('Re-scanning project...').start();
  const scan = await scanProject(projectDir);
  spinner.succeed('Project re-scanned');

  // Backup existing files before any modifications
  const filesToBackup = [
    GENERATED_FILES.claudeMd,
    GENERATED_FILES.cursorRules,
    GENERATED_FILES.claudeSettingsLocal,
    AI_KIT_CONFIG_FILE,
  ];
  const backupPath = await backupFiles(projectDir, filesToBackup);
  if (backupPath) {
    logSuccess(`Backed up current configs to ${path.relative(projectDir, backupPath)}`);
  }

  // Clean up old unprefixed skill/agent files from before the kit- namespace migration
  await cleanupUnprefixedFiles(projectDir);

  logSection('Updating Files');

  const strictness = existingConfig.strictness || 'standard';
  const hookProfile = existingConfig.hookProfile || 'standard';
  const tools = existingConfig.tools || { claude: true, cursor: true };
  const customFragments = loadCustomFragments(projectDir);
  const genOpts = { strictness, customFragments };

  logInfo(`Using saved profile — Tools: ${tools.claude && tools.cursor ? 'Claude Code + Cursor' : tools.claude ? 'Claude Code' : 'Cursor'} · Strictness: ${strictness} · Hooks: ${hookProfile}`);

  const templates: string[] = [];

  // Update CLAUDE.md if it was previously generated or tools.claude is enabled
  if (
    tools.claude &&
    (existingConfig.templates.includes('CLAUDE.md') ||
    fileExists(path.join(projectDir, GENERATED_FILES.claudeMd)))
  ) {
    const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
    const newContent = generateClaudeMd(scan, genOpts);
    const existing = readFileSafe(claudeMdPath);
    if (existing) {
      await fs.writeFile(claudeMdPath, mergeWithMarkers(existing, newContent), 'utf-8');
    } else {
      await fs.writeFile(claudeMdPath, newContent, 'utf-8');
    }
    templates.push('CLAUDE.md');
    logSuccess('CLAUDE.md updated');
  }

  // Update .cursorrules if it was previously generated or tools.cursor is enabled
  if (
    tools.cursor &&
    (existingConfig.templates.includes('.cursorrules') ||
    fileExists(path.join(projectDir, GENERATED_FILES.cursorRules)))
  ) {
    const cursorRulesPath = path.join(projectDir, GENERATED_FILES.cursorRules);
    const newContent = generateCursorRules(scan, genOpts);
    const existing = readFileSafe(cursorRulesPath);
    if (existing) {
      await fs.writeFile(cursorRulesPath, mergeWithMarkers(existing, newContent), 'utf-8');
    } else {
      await fs.writeFile(cursorRulesPath, newContent, 'utf-8');
    }
    templates.push('.cursorrules');
    logSuccess('.cursorrules updated');

    // Update .cursor/rules/*.mdc files
    const mdcDir = path.join(projectDir, GENERATED_FILES.cursorMdcDir);
    await fs.ensureDir(mdcDir);
    const mdcFiles = generateMdcFiles(scan);
    for (const mdc of mdcFiles) {
      await fs.writeFile(path.join(mdcDir, mdc.filename), mdc.content, 'utf-8');
    }
    logSuccess(`${mdcFiles.length} .cursor/rules/*.mdc files updated`);
  }

  // Update skills
  const commands = await copySkills(projectDir);
  logSuccess(`${commands.length} skills updated (.claude/skills/ + .cursor/skills/)`);

  // Update agents
  const agents = await copyAgents(projectDir, scan);
  logSuccess(`${agents.length} agents updated (.claude/agents/)`);

  // Update contexts
  const contexts = await copyContexts(projectDir);
  logSuccess(`${contexts.length} context modes updated (.claude/contexts/)`);

  // Update hooks
  if (existingConfig.hooks !== false) {
    const settingsLocalPath = path.join(projectDir, GENERATED_FILES.claudeSettingsLocal);
    const settingsLocal = generateSettingsLocal(scan, hookProfile);
    await fs.ensureDir(path.dirname(settingsLocalPath));
    await fs.writeJson(settingsLocalPath, settingsLocal, { spaces: 2 });
    logSuccess(`Hooks updated (profile: ${hookProfile})`);
  }

  // Update guides
  const guides = await copyGuides(projectDir);
  logSuccess(`${guides.length} guides updated`);

  // Update config — preserve saved tools selection
  const config = generateConfig(scan, templates, commands, guides, {
    ...genOpts,
    agents,
    contexts,
    hooks: existingConfig.hooks !== false,
    hookProfile,
    tools,
  });
  await fs.writeJson(configPath, config, { spaces: 2 });
  logSuccess('ai-kit.config.json updated');

  console.log('');
  logInfo('All AI configs refreshed with latest project scan.');
  if (backupPath) {
    logInfo('Rollback available: `ai-kit rollback --latest`');
  }
}

/**
 * Remove old unprefixed skill/agent files left over from before the kit- namespace migration.
 * This prevents duplicate skills (e.g., both /review and /kit-review showing up).
 */
async function cleanupUnprefixedFiles(projectDir: string): Promise<void> {
  let cleaned = 0;

  // Clean old skill directories: .claude/skills/{name}/ and .cursor/skills/{name}/
  for (const name of BASE_SKILLS) {
    for (const root of ['.claude/skills', '.cursor/skills']) {
      const oldDir = path.join(projectDir, root, name);
      if (await fs.pathExists(oldDir)) {
        await fs.remove(oldDir);
        cleaned++;
      }
    }
    // Clean old legacy commands: .claude/commands/{name}.md
    const oldCmd = path.join(projectDir, '.claude', 'commands', `${name}.md`);
    if (await fs.pathExists(oldCmd)) {
      await fs.remove(oldCmd);
      cleaned++;
    }
  }

  // Clean old agent files: .claude/agents/{name}.md
  for (const name of BASE_UNIVERSAL_AGENTS) {
    const oldAgent = path.join(projectDir, '.claude', 'agents', `${name}.md`);
    if (await fs.pathExists(oldAgent)) {
      await fs.remove(oldAgent);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    logInfo(`Cleaned up ${cleaned} old unprefixed skill/agent files (migrated to kit- prefix)`);
  }
}
