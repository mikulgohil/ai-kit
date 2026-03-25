import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { scanProject } from '../scanner/index.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES, VERSION } from '../constants.js';
import {
  logSection,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  fileExists,
  dirExists,
  readJsonSafe,
  readFileSafe,
} from '../utils.js';
import type { AiKitConfig, ProjectScan } from '../types.js';

// ─── Types ─────────────────────────────────────────────────────────────
interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

interface HealthSection {
  title: string;
  checks: HealthCheck[];
}

// ─── Helpers ───────────────────────────────────────────────────────────
function gradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function gradeColor(grade: string): typeof chalk.green {
  if (grade <= 'B') return chalk.green;
  if (grade <= 'C') return chalk.yellow;
  return chalk.red;
}

function statusIcon(status: 'pass' | 'warn' | 'fail'): string {
  switch (status) {
    case 'pass':
      return chalk.green('✓');
    case 'warn':
      return chalk.yellow('⚠');
    case 'fail':
      return chalk.red('✗');
  }
}

function progressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

// ─── Section: Setup Integrity (from doctor) ────────────────────────────
function checkSetup(
  projectDir: string,
  config: AiKitConfig,
): HealthSection {
  const checks: HealthCheck[] = [];

  // Version check
  if (config.version === VERSION) {
    checks.push({ name: 'Version', status: 'pass', detail: `v${VERSION}` });
  } else {
    checks.push({
      name: 'Version',
      status: 'warn',
      detail: `config v${config.version} ≠ CLI v${VERSION} — run \`ai-kit update\``,
    });
  }

  // CLAUDE.md
  const claudeMd = readFileSafe(path.join(projectDir, GENERATED_FILES.claudeMd));
  if (claudeMd && claudeMd.includes('AI-KIT:START')) {
    checks.push({ name: 'CLAUDE.md', status: 'pass', detail: 'Present with markers' });
  } else if (claudeMd) {
    checks.push({ name: 'CLAUDE.md', status: 'warn', detail: 'Missing AI-KIT markers' });
  } else {
    checks.push({ name: 'CLAUDE.md', status: 'fail', detail: 'Not found' });
  }

  // .cursorrules
  if (fileExists(path.join(projectDir, GENERATED_FILES.cursorRules))) {
    checks.push({ name: '.cursorrules', status: 'pass', detail: 'Present' });
  } else {
    checks.push({ name: '.cursorrules', status: 'warn', detail: 'Not generated' });
  }

  // Skills count
  const skillsDir = path.join(projectDir, GENERATED_FILES.claudeSkills);
  if (dirExists(skillsDir)) {
    const count = config.commands.length;
    checks.push({ name: 'Skills', status: 'pass', detail: `${count} installed` });
  } else {
    checks.push({ name: 'Skills', status: 'warn', detail: 'No skills directory' });
  }

  // Agents
  const agentsDir = path.join(projectDir, GENERATED_FILES.claudeAgents);
  if (dirExists(agentsDir)) {
    try {
      const agentFiles = fs.readdirSync(agentsDir).filter((f: string) => f.endsWith('.md'));
      checks.push({ name: 'Agents', status: 'pass', detail: `${agentFiles.length} configured` });
    } catch {
      checks.push({ name: 'Agents', status: 'warn', detail: 'Could not read agents' });
    }
  } else {
    checks.push({ name: 'Agents', status: 'warn', detail: 'Not configured' });
  }

  // Hooks
  const settingsLocal = readFileSafe(path.join(projectDir, GENERATED_FILES.claudeSettingsLocal));
  if (settingsLocal && settingsLocal.includes('"hooks"')) {
    checks.push({ name: 'Hooks', status: 'pass', detail: 'Configured' });
  } else {
    checks.push({ name: 'Hooks', status: 'warn', detail: 'Not configured' });
  }

  return { title: 'Setup Integrity', checks };
}

// ─── Section: Security (from audit) ────────────────────────────────────
function checkSecurity(projectDir: string): HealthSection {
  const checks: HealthCheck[] = [];

  // Secrets in CLAUDE.md
  const claudeMd = readFileSafe(path.join(projectDir, GENERATED_FILES.claudeMd));
  if (claudeMd) {
    const secretPatterns = [
      /(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*['"][^'"]+['"]/i,
      /(?:sk|pk|rk)[-_][a-zA-Z0-9]{20,}/,
      /ghp_[a-zA-Z0-9]{36}/,
      /xox[bpoas]-[a-zA-Z0-9-]+/,
    ];
    const hasSecrets = secretPatterns.some((p) => p.test(claudeMd));
    checks.push({
      name: 'Secrets in CLAUDE.md',
      status: hasSecrets ? 'fail' : 'pass',
      detail: hasSecrets ? 'Potential secrets detected — remove immediately' : 'Clean',
    });
  }

  // .env gitignored
  const gitignore = readFileSafe(path.join(projectDir, '.gitignore'));
  if (gitignore) {
    const envIgnored = gitignore.includes('.env') || gitignore.includes('.env.local');
    checks.push({
      name: '.env gitignore',
      status: envIgnored ? 'pass' : 'fail',
      detail: envIgnored ? 'Protected' : 'NOT gitignored — add .env to .gitignore',
    });
  }

  // MCP secrets check
  const settingsJson = readFileSafe(path.join(projectDir, '.claude', 'settings.json'));
  if (settingsJson) {
    const hasHardcoded = /(?:api[_-]?key|token|secret|password)\s*[:=]\s*"[^"]+"/i.test(settingsJson);
    checks.push({
      name: 'MCP config',
      status: hasHardcoded ? 'fail' : 'pass',
      detail: hasHardcoded ? 'Hardcoded secrets in settings.json' : 'No hardcoded secrets',
    });
  }

  return { title: 'Security', checks };
}

// ─── Section: Stack (from stats) ───────────────────────────────────────
function checkStack(config: AiKitConfig): HealthSection {
  const checks: HealthCheck[] = [];
  const scan = config.scanResult;

  // Framework
  if (scan.framework !== 'unknown') {
    const label =
      scan.framework === 'nextjs'
        ? `Next.js ${scan.nextjsVersion || ''} (${scan.routerType === 'app' ? 'App Router' : scan.routerType === 'pages' ? 'Pages Router' : 'Hybrid'})`
        : scan.framework;
    checks.push({ name: 'Framework', status: 'pass', detail: label.trim() });
  } else {
    checks.push({ name: 'Framework', status: 'warn', detail: 'Not detected' });
  }

  // CMS
  if (scan.cms !== 'none') {
    const label =
      scan.cms === 'sitecore-xmc-v2'
        ? 'Sitecore XM Cloud (Content SDK v2)'
        : scan.cms === 'sitecore-xmc'
          ? 'Sitecore XM Cloud'
          : scan.cms;
    checks.push({ name: 'CMS', status: 'pass', detail: label });
  }

  // TypeScript
  checks.push({
    name: 'TypeScript',
    status: scan.typescript ? 'pass' : 'warn',
    detail: scan.typescript
      ? `Enabled${scan.typescriptStrict ? ' (strict)' : ''}`
      : 'Not detected',
  });

  // Styling
  if (scan.styling.length > 0) {
    checks.push({ name: 'Styling', status: 'pass', detail: scan.styling.join(', ') });
  }

  // Monorepo
  if (scan.monorepo) {
    checks.push({
      name: 'Monorepo',
      status: 'pass',
      detail: scan.monorepoTool || 'Detected',
    });
  }

  return { title: 'Stack Detection', checks };
}

// ─── Section: Tools (from stats + doctor) ──────────────────────────────
function checkTools(scan: ProjectScan): HealthSection {
  const checks: HealthCheck[] = [];

  const toolMap: Record<string, { key: keyof typeof scan.tools; hint: string }> = {
    Playwright: { key: 'playwright', hint: 'npm i -D @playwright/test' },
    ESLint: { key: 'eslint', hint: 'npm i -D eslint' },
    Prettier: { key: 'prettier', hint: 'npm i -D prettier' },
    'axe-core': { key: 'axeCore', hint: 'npm i -D @axe-core/playwright' },
    Knip: { key: 'knip', hint: 'npm i -D knip' },
    'Bundle Analyzer': { key: 'bundleAnalyzer', hint: 'npm i -D @next/bundle-analyzer' },
    Storybook: { key: 'storybook', hint: 'npx storybook@latest init' },
  };

  for (const [name, { key, hint }] of Object.entries(toolMap)) {
    checks.push({
      name,
      status: scan.tools[key] ? 'pass' : 'warn',
      detail: scan.tools[key] ? 'Detected' : `Missing — ${hint}`,
    });
  }

  // MCP servers
  const mcpMap: Record<string, keyof typeof scan.mcpServers> = {
    'GitHub MCP': 'github',
    'Figma MCP': 'figma',
    'Context7 MCP': 'context7',
    'Perplexity MCP': 'perplexity',
  };

  for (const [name, key] of Object.entries(mcpMap)) {
    checks.push({
      name,
      status: scan.mcpServers[key] ? 'pass' : 'warn',
      detail: scan.mcpServers[key] ? 'Configured' : 'Not configured',
    });
  }

  return { title: 'Tools & MCP', checks };
}

// ─── Section: Docs Health ──────────────────────────────────────────────
function checkDocs(projectDir: string): HealthSection {
  const checks: HealthCheck[] = [];

  const docsToCheck = [
    { name: 'Mistakes Log', path: 'docs/mistakes-log.md' },
    { name: 'Decisions Log', path: 'docs/decisions-log.md' },
    { name: 'Time Log', path: 'docs/time-log.md' },
  ];

  for (const doc of docsToCheck) {
    const content = readFileSafe(path.join(projectDir, doc.path));
    if (content) {
      // Check if it has any entries beyond the template
      const hasEntries = content.includes('## 20') || content.split('---').length > 2;
      checks.push({
        name: doc.name,
        status: hasEntries ? 'pass' : 'warn',
        detail: hasEntries ? 'Has entries' : 'Scaffolded but empty',
      });
    } else {
      checks.push({ name: doc.name, status: 'warn', detail: 'Not found' });
    }
  }

  return { title: 'Documentation', checks };
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function healthCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  console.log('');
  logSection('AI Kit — Project Health');
  console.log(chalk.dim(`  ${projectDir}`));
  console.log('');

  // Pre-check: config must exist
  if (!fileExists(configPath)) {
    logError('ai-kit.config.json not found. Run `ai-kit init` first.');
    return;
  }

  const config = readJsonSafe<AiKitConfig>(configPath);
  if (!config) {
    logError('ai-kit.config.json is corrupted. Run `ai-kit init` to re-initialize.');
    return;
  }

  // Fresh scan for tools/MCP accuracy
  const spinner = ora('Scanning project...').start();
  let freshScan: ProjectScan;
  try {
    freshScan = await scanProject(projectDir);
    spinner.succeed('Project scanned');
  } catch {
    spinner.fail('Scan failed — using cached data');
    freshScan = config.scanResult;
  }

  // Run all sections
  const sections: HealthSection[] = [
    checkSetup(projectDir, config),
    checkSecurity(projectDir),
    checkStack(config),
    checkTools(freshScan),
    checkDocs(projectDir),
  ];

  // Print sections
  let totalPassed = 0;
  let totalWarnings = 0;
  let totalFailed = 0;

  for (const section of sections) {
    console.log(`\n  ${chalk.bold(section.title)}`);

    for (const check of section.checks) {
      const icon = statusIcon(check.status);
      console.log(`    ${icon} ${chalk.white(check.name)}: ${chalk.dim(check.detail)}`);

      switch (check.status) {
        case 'pass':
          totalPassed++;
          break;
        case 'warn':
          totalWarnings++;
          break;
        case 'fail':
          totalFailed++;
          break;
      }
    }
  }

  // Overall score
  const total = totalPassed + totalWarnings + totalFailed;
  const score = total > 0
    ? Math.round(((totalPassed + totalWarnings * 0.5) / total) * 100)
    : 0;
  const grade = gradeFromScore(score);
  const colorFn = gradeColor(grade);

  console.log('');
  console.log(
    `  ${chalk.bold('Overall:')} ${colorFn.bold(grade)} ${chalk.dim(`(${score}/100)`)}`,
  );
  console.log(
    `  ${progressBar(score)} ${chalk.green(String(totalPassed))} passed · ${chalk.yellow(String(totalWarnings))} warnings · ${chalk.red(String(totalFailed))} failures`,
  );

  // Quick recommendations
  if (totalFailed > 0 || totalWarnings > 2) {
    console.log('');
    console.log(chalk.bold('  Recommendations:'));

    if (totalFailed > 0) {
      const failures = sections.flatMap((s) => s.checks.filter((c) => c.status === 'fail'));
      for (const f of failures.slice(0, 3)) {
        console.log(`    ${chalk.red('→')} Fix: ${f.name} — ${f.detail}`);
      }
    }

    const warnings = sections.flatMap((s) => s.checks.filter((c) => c.status === 'warn'));
    for (const w of warnings.slice(0, 3)) {
      console.log(`    ${chalk.yellow('→')} Improve: ${w.name} — ${w.detail}`);
    }
  }

  // Project summary line
  const scan = config.scanResult;
  console.log('');
  console.log(chalk.dim(`  v${config.version} · ${scan.projectName} · ${config.commands.length} skills · ${config.guides.length} guides · Generated ${config.generatedAt}`));
  console.log('');
}
