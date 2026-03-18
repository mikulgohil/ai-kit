import path from 'path';
import fs from 'fs-extra';
import { GUIDES_DIR } from '../constants.js';

const AVAILABLE_GUIDES = [
  'getting-started',
  'prompt-playbook',
  'when-to-use-ai',
  'token-saving-tips',
  'figma-workflow',
  'hooks-and-agents',
];

export async function copyGuides(targetDir: string): Promise<string[]> {
  const guidesTarget = path.join(targetDir, 'ai-kit', 'guides');
  await fs.ensureDir(guidesTarget);

  const copied: string[] = [];

  for (const guide of AVAILABLE_GUIDES) {
    const src = path.join(GUIDES_DIR, `${guide}.md`);
    const dest = path.join(guidesTarget, `${guide}.md`);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
      copied.push(guide);
    }
  }

  return copied;
}
