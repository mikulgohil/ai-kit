import path from 'path';
import fs from 'fs-extra';
import { AGENTS_DIR } from '../constants.js';
import type { ProjectScan } from '../types.js';

const UNIVERSAL_AGENTS = [
  'planner',
  'code-reviewer',
  'security-reviewer',
  'build-resolver',
  'doc-updater',
  'refactor-cleaner',
  'architect',
  // New agents (v1.7.0) — inspired by oh-my-claudecode evaluation
  'data-scientist',
  'performance-profiler',
  'migration-specialist',
  'dependency-auditor',
  'api-designer',
];

const CONDITIONAL_AGENTS: { name: string; condition: (scan: ProjectScan) => boolean }[] = [
  {
    name: 'e2e-runner',
    condition: (scan) => scan.tools.playwright,
  },
  {
    name: 'sitecore-specialist',
    condition: (scan) => scan.cms !== 'none',
  },
  {
    name: 'tdd-guide',
    condition: (scan) => scan.tools.playwright || !!scan.scripts['test'],
  },
];

export async function copyAgents(
  targetDir: string,
  scan: ProjectScan,
): Promise<string[]> {
  const agentsTarget = path.join(targetDir, '.claude', 'agents');
  await fs.ensureDir(agentsTarget);

  const copied: string[] = [];

  // Copy universal agents
  for (const agent of UNIVERSAL_AGENTS) {
    const src = path.join(AGENTS_DIR, `${agent}.md`);
    if (!(await fs.pathExists(src))) continue;

    await fs.copy(src, path.join(agentsTarget, `${agent}.md`), {
      overwrite: true,
    });
    copied.push(agent);
  }

  // Copy conditional agents based on scan results
  for (const { name, condition } of CONDITIONAL_AGENTS) {
    if (!condition(scan)) continue;

    const src = path.join(AGENTS_DIR, `${name}.md`);
    if (!(await fs.pathExists(src))) continue;

    await fs.copy(src, path.join(agentsTarget, `${name}.md`), {
      overwrite: true,
    });
    copied.push(name);
  }

  return copied;
}
