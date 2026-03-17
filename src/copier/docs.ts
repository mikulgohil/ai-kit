import path from 'path';
import fs from 'fs-extra';
import { DOCS_SCAFFOLDS_DIR } from '../constants.js';

const DOC_SCAFFOLDS = ['mistakes-log', 'decisions-log', 'time-log'];

export async function scaffoldDocs(targetDir: string): Promise<string[]> {
  const docsTarget = path.join(targetDir, 'docs');
  await fs.ensureDir(docsTarget);

  const created: string[] = [];

  for (const doc of DOC_SCAFFOLDS) {
    const src = path.join(DOCS_SCAFFOLDS_DIR, `${doc}.md`);
    const dest = path.join(docsTarget, `${doc}.md`);

    if ((await fs.pathExists(dest))) {
      continue; // Don't overwrite existing docs
    }

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
      created.push(doc);
    }
  }

  return created;
}
