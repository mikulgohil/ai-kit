import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { scanProject } from '../scanner/index.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES, VERSION } from '../constants.js';
import {
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logSection,
  fileExists,
  dirExists,
  readJsonSafe,
  readFileSafe,
} from '../utils.js';
import type { AiKitConfig, ProjectScan } from '../types.js';

export async function doctorCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  let passed = 0;
  let warnings = 0;
  let issues = 0;

  logSection('AI Kit — Doctor');
  console.log('');

  // 1. Check ai-kit.config.json exists
  if (!fileExists(configPath)) {
    logError('ai-kit.config.json not found. Run `ai-kit init` first.');
    issues++;
    showSummary(passed, warnings, issues);
    return;
  }

  const config = readJsonSafe<AiKitConfig>(configPath);
  if (!config) {
    logError('ai-kit.config.json is corrupted or unreadable. Run `ai-kit init` to re-initialize.');
    issues++;
    showSummary(passed, warnings, issues);
    return;
  }

  logSuccess(`ai-kit.config.json found (v${config.version})`);
  passed++;

  // 2. Version check
  if (config.version !== VERSION) {
    logWarning(
      `Config version mismatch — config is v${config.version}, CLI is v${VERSION}. Run \`ai-kit update\` to sync.`,
    );
    warnings++;
  } else {
    logSuccess(`Version matches CLI (v${VERSION})`);
    passed++;
  }

  // 3. File integrity — check templates exist
  for (const template of config.templates) {
    const templateFile =
      template === 'CLAUDE.md'
        ? GENERATED_FILES.claudeMd
        : template === '.cursorrules'
          ? GENERATED_FILES.cursorRules
          : template;
    const templatePath = path.join(projectDir, templateFile);

    if (fileExists(templatePath)) {
      logSuccess(`${template} exists and in sync`);
      passed++;
    } else {
      logError(`${template} is listed in config but missing from disk`);
      issues++;
    }
  }

  // 4. Skills check — verify all skills from config.commands exist
  const missingSkills: string[] = [];
  for (const skill of config.commands) {
    const claudeSkillPath = path.join(projectDir, GENERATED_FILES.claudeSkills, skill);
    const cursorSkillPath = path.join(projectDir, GENERATED_FILES.cursorSkills, skill);

    if (!fileExists(claudeSkillPath) && !fileExists(cursorSkillPath)) {
      missingSkills.push(skill);
    }
  }

  if (missingSkills.length === 0) {
    logSuccess(`${config.commands.length}/${config.commands.length} skills present`);
    passed++;
  } else {
    logError(
      `${config.commands.length - missingSkills.length}/${config.commands.length} skills present — missing: ${missingSkills.join(', ')}`,
    );
    issues++;
  }

  // 5. Guides check — verify all guides from config.guides exist
  const guidesDir = path.join(projectDir, 'ai-kit', 'guides');
  const missingGuides: string[] = [];
  for (const guide of config.guides) {
    const guidePath = path.join(guidesDir, guide);
    if (!fileExists(guidePath)) {
      missingGuides.push(guide);
    }
  }

  if (missingGuides.length === 0) {
    logSuccess(`${config.guides.length}/${config.guides.length} guides present`);
    passed++;
  } else {
    logError(
      `${config.guides.length - missingGuides.length}/${config.guides.length} guides present — missing: ${missingGuides.join(', ')}`,
    );
    issues++;
  }

  // 6. Staleness check — compare config.scanResult with fresh scan
  const spinner = ora('Running fresh project scan...').start();
  let freshScan: ProjectScan;
  try {
    freshScan = await scanProject(projectDir);
    spinner.succeed('Project re-scanned');
  } catch (err) {
    spinner.fail('Failed to scan project');
    logWarning(`Could not run staleness check: ${String(err)}`);
    warnings++;
    freshScan = config.scanResult;
  }

  const stalenessWarnings = compareScanResults(config.scanResult, freshScan);
  if (stalenessWarnings.length === 0) {
    logSuccess('Config is up to date with project state');
    passed++;
  } else {
    for (const warning of stalenessWarnings) {
      logWarning(warning);
      warnings++;
    }
  }

  // 7. MCP server health
  const mcpChecks: { name: string; key: keyof typeof freshScan.mcpServers }[] = [
    { name: 'Playwright MCP', key: 'playwright' },
    { name: 'Context7 MCP', key: 'context7' },
    { name: 'GitHub MCP', key: 'github' },
    { name: 'Perplexity MCP', key: 'perplexity' },
    { name: 'Figma MCP', key: 'figma' },
  ];

  for (const mcp of mcpChecks) {
    if (freshScan.mcpServers[mcp.key]) {
      logSuccess(`${mcp.name} configured`);
      passed++;
    } else {
      logWarning(`${mcp.name} not configured`);
      warnings++;
    }
  }

  // 8. Missing recommended tools
  const toolChecks: { name: string; key: keyof typeof freshScan.tools; hint: string }[] = [
    { name: 'Playwright', key: 'playwright', hint: 'npm install -D @playwright/test' },
    { name: 'ESLint', key: 'eslint', hint: 'npm install -D eslint' },
    { name: 'Prettier', key: 'prettier', hint: 'npm install -D prettier' },
    { name: 'axe-core', key: 'axeCore', hint: 'npm install -D @axe-core/playwright' },
    { name: 'Knip', key: 'knip', hint: 'npm install -D knip' },
    { name: 'Bundle Analyzer', key: 'bundleAnalyzer', hint: 'npm install -D @next/bundle-analyzer' },
  ];

  for (const tool of toolChecks) {
    if (freshScan.tools[tool.key]) {
      logSuccess(`${tool.name} detected`);
      passed++;
    } else {
      logError(`${tool.name} not found — recommend installing: ${tool.hint}`);
      issues++;
    }
  }

  // 9. Summary
  console.log('');
  showSummary(passed, warnings, issues);
}

function showSummary(passed: number, warnings: number, issues: number): void {
  const parts: string[] = [];
  parts.push(chalk.green(`${passed} passed`));
  if (warnings > 0) parts.push(chalk.yellow(`${warnings} warnings`));
  if (issues > 0) parts.push(chalk.red(`${issues} issues`));

  console.log(chalk.bold(`Summary: ${parts.join(', ')}`));
}

function compareScanResults(
  previous: ProjectScan,
  current: ProjectScan,
): string[] {
  const warnings: string[] = [];

  // Framework change
  if (previous.framework !== current.framework) {
    warnings.push(
      `Stack may have changed — framework was ${previous.framework}, now ${current.framework}`,
    );
  }

  // Next.js version change
  if (previous.nextjsVersion && current.nextjsVersion && previous.nextjsVersion !== current.nextjsVersion) {
    warnings.push(
      `Next.js version changed: ${previous.nextjsVersion} → ${current.nextjsVersion}`,
    );
  }

  // Router type change
  if (previous.routerType && current.routerType && previous.routerType !== current.routerType) {
    warnings.push(
      `Router type changed: ${previous.routerType} → ${current.routerType}`,
    );
  }

  // Styling changes
  const prevStyles = new Set(previous.styling);
  const currStyles = new Set(current.styling);
  for (const style of currStyles) {
    if (!prevStyles.has(style)) {
      warnings.push(`Stack may have changed — detected new styling: ${style}`);
    }
  }
  for (const style of prevStyles) {
    if (!currStyles.has(style)) {
      warnings.push(`Stack may have changed — styling removed: ${style}`);
    }
  }

  // TypeScript change
  if (previous.typescript !== current.typescript) {
    warnings.push(
      `TypeScript ${current.typescript ? 'detected (was not before)' : 'no longer detected'}`,
    );
  }

  // Monorepo change
  if (previous.monorepo !== current.monorepo) {
    warnings.push(
      `Monorepo ${current.monorepo ? 'detected (was not before)' : 'no longer detected'}`,
    );
  }

  // Package manager change
  if (previous.packageManager !== current.packageManager) {
    warnings.push(
      `Package manager changed: ${previous.packageManager} → ${current.packageManager}`,
    );
  }

  // Tool changes — check for newly detected tools
  const toolKeys = Object.keys(current.tools) as (keyof typeof current.tools)[];
  for (const key of toolKeys) {
    if (current.tools[key] && !previous.tools[key]) {
      warnings.push(`Stack may have changed — detected new tool: ${key}`);
    }
    if (!current.tools[key] && previous.tools[key]) {
      warnings.push(`Stack may have changed — tool removed: ${key}`);
    }
  }

  // CMS change
  if (previous.cms !== current.cms) {
    warnings.push(`CMS changed: ${previous.cms} → ${current.cms}`);
  }

  return warnings;
}
