import path from 'path';
import { select, confirm } from '@inquirer/prompts';
import {
  logSuccess,
  logError,
  logInfo,
  logSection,
  listBackups,
  restoreBackup,
} from '../utils.js';

export async function rollbackCommand(
  targetPath?: string,
  latest?: boolean,
): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const backups = await listBackups(projectDir);

  if (backups.length === 0) {
    logInfo('No backups found. Backups are created when you run `ai-kit update`.');
    return;
  }

  logSection('Available Backups');

  let selected: string;

  if (latest) {
    selected = backups[0];
    logInfo(`Restoring latest backup: ${selected}`);
  } else {
    for (const b of backups) {
      const label = b === backups[0] ? `${b}  (latest)` : b;
      logInfo(label);
    }
    console.log('');

    selected = await select({
      message: 'Which backup do you want to restore?',
      choices: backups.map((b, i) => ({
        name: i === 0 ? `${b}  (latest)` : b,
        value: b,
      })),
    });
  }

  const proceed = await confirm({
    message: `Restore configs from backup ${selected}? This will overwrite current files.`,
    default: true,
  });

  if (!proceed) {
    logInfo('Cancelled.');
    return;
  }

  try {
    const restored = await restoreBackup(projectDir, selected);

    logSection('Restored Files');
    for (const file of restored) {
      logSuccess(`Restored: ${file}`);
    }

    console.log('');
    logInfo(`Configs restored from backup ${selected}`);
  } catch (err) {
    logError(`Failed to restore backup: ${String(err)}`);
  }
}
