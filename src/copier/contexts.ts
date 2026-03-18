import path from 'path';
import fs from 'fs-extra';
import { CONTEXTS_DIR } from '../constants.js';

const AVAILABLE_CONTEXTS = ['dev', 'review', 'research'];

export async function copyContexts(targetDir: string): Promise<string[]> {
  const contextsTarget = path.join(targetDir, '.claude', 'contexts');
  await fs.ensureDir(contextsTarget);

  const copied: string[] = [];

  for (const context of AVAILABLE_CONTEXTS) {
    const src = path.join(CONTEXTS_DIR, `${context}.md`);
    if (!(await fs.pathExists(src))) continue;

    await fs.copy(src, path.join(contextsTarget, `${context}.md`), {
      overwrite: true,
    });
    copied.push(context);
  }

  return copied;
}
