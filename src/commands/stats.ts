import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { AI_KIT_CONFIG_FILE, VERSION, TEMPLATE_FRAGMENTS } from '../constants.js';
import {
  logSection,
  logInfo,
  logSuccess,
  logWarning,
  fileExists,
  dirExists,
  readJsonSafe,
} from '../utils.js';
import type { AiKitConfig } from '../types.js';

// ─── Skill Categories ───────────────────────────────────────────────────
const SKILL_CATEGORIES: Record<string, string[]> = {
  'Getting Started': ['prompt-help', 'understand'],
  'Building': [
    'new-component',
    'new-page',
    'api-route',
    'error-boundary',
    'extract-hook',
    'figma-to-code',
    'design-tokens',
  ],
  'Quality & Review': [
    'review',
    'test',
    'accessibility-audit',
    'security-check',
    'responsive-check',
    'type-fix',
    'pre-pr',
  ],
  'Maintenance': [
    'optimize',
    'refactor',
    'dep-check',
    'bundle-check',
    'migrate',
    'env-setup',
  ],
  'Workflow': ['fix-bug', 'commit-msg', 'document', 'token-tips'],
};

// ─── Helpers ────────────────────────────────────────────────────────────
function getComplexityLabel(score: number): string {
  if (score >= 10) return 'Enterprise';
  if (score >= 7) return 'Complex';
  if (score >= 4) return 'Moderate';
  return 'Simple';
}

function calculateComplexity(config: AiKitConfig): {
  score: number;
  items: { label: string; active: boolean }[];
} {
  const scan = config.scanResult;
  let score = 0;
  const items: { label: string; active: boolean }[] = [];

  // Framework: +1
  const hasFramework = scan.framework !== 'unknown';
  if (hasFramework) score += 1;
  const frameworkLabel =
    scan.framework === 'nextjs'
      ? `Next.js ${scan.nextjsVersion || ''} (${scan.routerType === 'app' ? 'App Router' : scan.routerType === 'pages' ? 'Pages Router' : 'Hybrid'})`
      : scan.framework === 'react'
        ? 'React'
        : 'Unknown';
  items.push({ label: frameworkLabel.trim(), active: hasFramework });

  // CMS: +2
  const hasCms = scan.cms !== 'none';
  if (hasCms) score += 2;
  const cmsLabel =
    scan.cms === 'sitecore-xmc'
      ? 'Sitecore XM Cloud'
      : scan.cms === 'sitecore-jss'
        ? 'Sitecore JSS'
        : 'CMS';
  items.push({ label: cmsLabel, active: hasCms });

  // TypeScript: +1
  if (scan.typescript) score += 1;
  items.push({
    label: `TypeScript${scan.typescriptStrict ? ' (strict)' : ''}`,
    active: scan.typescript,
  });

  // Each styling solution: +1
  for (const style of scan.styling) {
    score += 1;
    const styleLabel =
      style === 'tailwind'
        ? `Tailwind CSS${scan.tailwindVersion ? ` v${scan.tailwindVersion}` : ''}`
        : style === 'css-modules'
          ? 'CSS Modules'
          : style === 'styled-components'
            ? 'Styled Components'
            : style === 'scss'
              ? 'SCSS'
              : style;
    items.push({ label: styleLabel, active: true });
  }

  // Monorepo: +2
  items.push({
    label: scan.monorepo
      ? `Monorepo (${scan.monorepoTool || 'detected'})`
      : 'Monorepo',
    active: scan.monorepo,
  });
  if (scan.monorepo) score += 2;

  // Figma: +1
  items.push({ label: 'Figma', active: scan.figma.detected });
  if (scan.figma.detected) score += 1;

  return { score, items };
}

function categorizeSkills(skills: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const categorized = new Set<string>();

  for (const [category, categorySkills] of Object.entries(SKILL_CATEGORIES)) {
    const matched = skills.filter((s) => categorySkills.includes(s));
    if (matched.length > 0) {
      result[category] = matched;
      matched.forEach((s) => categorized.add(s));
    }
  }

  // Any skills not in a known category
  const uncategorized = skills.filter((s) => !categorized.has(s));
  if (uncategorized.length > 0) {
    result['Other'] = uncategorized;
  }

  return result;
}

// ─── Tool & MCP Display Names ───────────────────────────────────────────
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  playwright: 'Playwright',
  storybook: 'Storybook',
  eslint: 'ESLint',
  prettier: 'Prettier',
  axeCore: 'axe-core',
  snyk: 'Snyk',
  knip: 'Knip',
  bundleAnalyzer: 'Bundle Analyzer',
};

const MCP_DISPLAY_NAMES: Record<string, string> = {
  playwright: 'Playwright',
  figma: 'Figma',
  github: 'GitHub',
  context7: 'Context7',
  perplexity: 'Perplexity',
};

// ─── Main Command ───────────────────────────────────────────────────────
export async function statsCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  logSection('AI Kit \u2014 Project Stats');
  console.log('');

  // 1. Read config
  if (!fileExists(configPath)) {
    logWarning(
      'ai-kit.config.json not found. Run `ai-kit init` first.',
    );
    return;
  }

  const config = readJsonSafe<AiKitConfig>(configPath);
  if (!config) {
    logWarning(
      'ai-kit.config.json is corrupted or unreadable. Run `ai-kit init` to re-initialize.',
    );
    return;
  }

  const scan = config.scanResult;

  // 2. Project Overview
  console.log(`  Project:         ${chalk.bold(scan.projectName)}`);
  console.log(`  Version:         ai-kit v${config.version}`);
  console.log(`  Generated:       ${config.generatedAt}`);
  console.log(`  Package Manager: ${scan.packageManager}`);
  console.log('');

  // 3. Stack Complexity
  const { score, items } = calculateComplexity(config);
  const label = getComplexityLabel(score);
  const maxScore = 10;

  console.log(
    `  ${chalk.bold('Stack Complexity:')} ${score}/${maxScore} (${label})`,
  );

  for (const item of items) {
    if (item.active) {
      console.log(`    ${chalk.green('\u2713')} ${item.label}`);
    } else {
      console.log(`    ${chalk.gray('\u2717')} ${chalk.gray(item.label)}`);
    }
  }
  console.log('');

  // 4. Active Rules (template fragments)
  const activeFragments = (config.templates || []).filter((t) =>
    (TEMPLATE_FRAGMENTS as readonly string[]).includes(t),
  );
  const fragmentCount = activeFragments.length;

  console.log(
    `  ${chalk.bold('Active Rules:')} ${fragmentCount} template fragment${fragmentCount !== 1 ? 's' : ''}`,
  );
  if (fragmentCount > 0) {
    console.log(`    ${activeFragments.join(', ')}`);
  }
  console.log('');

  // 5. Skills Overview
  const skills = config.commands || [];
  const totalSkills = skills.length;
  const categorized = categorizeSkills(skills);

  console.log(`  ${chalk.bold('Skills:')} ${totalSkills} total`);
  for (const [category, categorySkills] of Object.entries(categorized)) {
    console.log(`    ${category}: ${categorySkills.length}`);
  }
  console.log('');

  // 6. Tools Status
  console.log(`  ${chalk.bold('Tools:')}`);
  const toolEntries = Object.entries(scan.tools) as [string, boolean][];
  const detectedTools: string[] = [];
  const missingTools: string[] = [];

  for (const [key, detected] of toolEntries) {
    const displayName = TOOL_DISPLAY_NAMES[key] || key;
    if (detected) {
      detectedTools.push(`${chalk.green('\u2713')} ${displayName}`);
    } else {
      missingTools.push(`${chalk.yellow('\u2717')} ${displayName}`);
    }
  }

  // Print tools in rows of 3
  const allToolItems = [...detectedTools, ...missingTools];
  for (let i = 0; i < allToolItems.length; i += 3) {
    const row = allToolItems
      .slice(i, i + 3)
      .map((item) => item.padEnd(22))
      .join('');
    console.log(`    ${row}`);
  }
  console.log('');

  // 7. MCP Servers Status
  console.log(`  ${chalk.bold('MCP Servers:')}`);
  const mcpEntries = Object.entries(scan.mcpServers) as [string, boolean][];
  const configuredMcps: string[] = [];
  const missingMcps: string[] = [];

  for (const [key, configured] of mcpEntries) {
    const displayName = MCP_DISPLAY_NAMES[key] || key;
    if (configured) {
      configuredMcps.push(`${chalk.green('\u2713')} ${displayName}`);
    } else {
      missingMcps.push(`${chalk.yellow('\u2717')} ${displayName}`);
    }
  }

  const allMcpItems = [...configuredMcps, ...missingMcps];
  for (let i = 0; i < allMcpItems.length; i += 3) {
    const row = allMcpItems
      .slice(i, i + 3)
      .map((item) => item.padEnd(22))
      .join('');
    console.log(`    ${row}`);
  }
  console.log('');
}
