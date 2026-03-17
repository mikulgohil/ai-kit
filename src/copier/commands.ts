import path from 'path';
import fs from 'fs-extra';
import { COMMANDS_DIR } from '../constants.js';

const AVAILABLE_COMMANDS = [
  'prompt-help',
  'review',
  'fix-bug',
  'new-component',
  'new-page',
  'understand',
  'test',
  'optimize',
  'figma-to-code',
  'design-tokens',
];

export async function copyCommands(targetDir: string): Promise<string[]> {
  const commandsTarget = path.join(targetDir, '.claude', 'commands');
  await fs.ensureDir(commandsTarget);

  const copied: string[] = [];

  for (const cmd of AVAILABLE_COMMANDS) {
    const src = path.join(COMMANDS_DIR, `${cmd}.md`);
    const dest = path.join(commandsTarget, `${cmd}.md`);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
      copied.push(cmd);
    }
  }

  return copied;
}
