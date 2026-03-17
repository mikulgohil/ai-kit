import path from 'path';
import fs from 'fs-extra';
import { confirm } from '@inquirer/prompts';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES } from '../constants.js';
import { logSuccess, logWarning, logInfo, logSection, fileExists } from '../utils.js';

export async function resetCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());

  logSection('AI Kit — Reset');
  logWarning('This will remove all AI Kit generated files:');
  logInfo(`  - ${GENERATED_FILES.claudeMd}`);
  logInfo(`  - ${GENERATED_FILES.cursorRules}`);
  logInfo(`  - ${GENERATED_FILES.cursorMdcDir}/`);
  logInfo(`  - ${GENERATED_FILES.claudeCommands}/`);
  logInfo(`  - ai-kit/`);
  logInfo(`  - ${AI_KIT_CONFIG_FILE}`);
  console.log('');

  const proceed = await confirm({
    message: 'Are you sure? This cannot be undone.',
    default: false,
  });

  if (!proceed) {
    logInfo('Cancelled.');
    return;
  }

  const removed: string[] = [];

  // Remove CLAUDE.md
  const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
  if (fileExists(claudeMdPath)) {
    await fs.remove(claudeMdPath);
    removed.push(GENERATED_FILES.claudeMd);
  }

  // Remove .cursorrules
  const cursorPath = path.join(projectDir, GENERATED_FILES.cursorRules);
  if (fileExists(cursorPath)) {
    await fs.remove(cursorPath);
    removed.push(GENERATED_FILES.cursorRules);
  }

  // Remove .cursor/rules/ (mdc files)
  const cursorMdcDir = path.join(projectDir, GENERATED_FILES.cursorMdcDir);
  if (fileExists(cursorMdcDir)) {
    await fs.remove(cursorMdcDir);
    removed.push(GENERATED_FILES.cursorMdcDir);
  }

  // Remove .claude/commands/ (only ai-kit commands)
  const commandsDir = path.join(projectDir, GENERATED_FILES.claudeCommands);
  if (fileExists(commandsDir)) {
    await fs.remove(commandsDir);
    removed.push(GENERATED_FILES.claudeCommands);
  }

  // Remove ai-kit/ folder
  const aiKitDir = path.join(projectDir, 'ai-kit');
  if (fileExists(aiKitDir)) {
    await fs.remove(aiKitDir);
    removed.push('ai-kit/');
  }

  // Remove config
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);
  if (fileExists(configPath)) {
    await fs.remove(configPath);
    removed.push(AI_KIT_CONFIG_FILE);
  }

  logSection('Reset Complete');
  if (removed.length > 0) {
    removed.forEach((f) => logSuccess(`Removed ${f}`));
  } else {
    logInfo('No AI Kit files found to remove.');
  }
}
