import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { confirm } from '@inquirer/prompts';
import { scanProject } from '../scanner/index.js';
import { generateClaudeMd } from '../generator/claude-md.js';
import { generateCursorRules } from '../generator/cursorrules.js';
import { generateMdcFiles } from '../generator/cursor-mdc.js';
import { generateConfig } from '../generator/config.js';
import { copyCommands } from '../copier/commands.js';
import { copyGuides } from '../copier/guides.js';
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

  logSection('Updating Files');

  const templates: string[] = [];

  // Update CLAUDE.md if it was previously generated
  if (
    existingConfig.templates.includes('CLAUDE.md') ||
    fileExists(path.join(projectDir, GENERATED_FILES.claudeMd))
  ) {
    const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
    const newContent = generateClaudeMd(scan);
    const existing = readFileSafe(claudeMdPath);
    if (existing) {
      await fs.writeFile(claudeMdPath, mergeWithMarkers(existing, newContent), 'utf-8');
    } else {
      await fs.writeFile(claudeMdPath, newContent, 'utf-8');
    }
    templates.push('CLAUDE.md');
    logSuccess('CLAUDE.md updated');
  }

  // Update .cursorrules if it was previously generated
  if (
    existingConfig.templates.includes('.cursorrules') ||
    fileExists(path.join(projectDir, GENERATED_FILES.cursorRules))
  ) {
    const cursorRulesPath = path.join(projectDir, GENERATED_FILES.cursorRules);
    const newContent = generateCursorRules(scan);
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

  // Update commands and guides
  const commands = await copyCommands(projectDir);
  logSuccess(`${commands.length} slash commands updated`);

  const guides = await copyGuides(projectDir);
  logSuccess(`${guides.length} guides updated`);

  // Update config
  const config = generateConfig(scan, templates, commands, guides);
  await fs.writeJson(configPath, config, { spaces: 2 });
  logSuccess('ai-kit.config.json updated');

  console.log('');
  logInfo('All AI configs refreshed with latest project scan.');
}
