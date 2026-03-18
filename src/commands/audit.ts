import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import {
  logSuccess,
  logWarning,
  logError,
  logInfo,
  logSection,
  fileExists,
  readFileSafe,
  readJsonSafe,
} from '../utils.js';
import { AI_KIT_CONFIG_FILE, GENERATED_FILES } from '../constants.js';
import type { AiKitConfig } from '../types.js';

interface AuditCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export async function auditCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());

  logSection('AI Kit — Security & Configuration Audit');
  logInfo(`Auditing: ${projectDir}`);

  const checks: AuditCheck[] = [];

  // 1. Check ai-kit.config.json exists
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);
  if (fileExists(configPath)) {
    checks.push({ name: 'Config file', status: 'pass', message: 'ai-kit.config.json found' });
  } else {
    checks.push({ name: 'Config file', status: 'fail', message: 'ai-kit.config.json missing — run `ai-kit init`' });
  }

  // 2. Check CLAUDE.md exists and has AI-KIT markers
  const claudeMdPath = path.join(projectDir, GENERATED_FILES.claudeMd);
  const claudeMd = readFileSafe(claudeMdPath);
  if (claudeMd) {
    if (claudeMd.includes('AI-KIT:START') && claudeMd.includes('AI-KIT:END')) {
      checks.push({ name: 'CLAUDE.md', status: 'pass', message: 'CLAUDE.md has AI-KIT markers' });
    } else {
      checks.push({ name: 'CLAUDE.md', status: 'warn', message: 'CLAUDE.md exists but missing AI-KIT markers — may not update correctly' });
    }
  } else {
    checks.push({ name: 'CLAUDE.md', status: 'warn', message: 'CLAUDE.md not found' });
  }

  // 3. Check for secrets in CLAUDE.md
  if (claudeMd) {
    const secretPatterns = [
      /(?:api[_-]?key|secret|token|password|credential)\s*[:=]\s*['"][^'"]+['"]/i,
      /(?:sk|pk|rk)[-_][a-zA-Z0-9]{20,}/,
      /ghp_[a-zA-Z0-9]{36}/,
      /xox[bpoas]-[a-zA-Z0-9-]+/,
    ];

    const hasSecrets = secretPatterns.some((p) => p.test(claudeMd));
    if (hasSecrets) {
      checks.push({ name: 'Secrets in CLAUDE.md', status: 'fail', message: 'Potential secrets detected in CLAUDE.md — remove immediately' });
    } else {
      checks.push({ name: 'Secrets in CLAUDE.md', status: 'pass', message: 'No secrets detected' });
    }
  }

  // 4. Check hooks configuration
  const settingsLocalPath = path.join(projectDir, GENERATED_FILES.claudeSettingsLocal);
  if (fileExists(settingsLocalPath)) {
    const settings = readJsonSafe<Record<string, unknown>>(settingsLocalPath);
    if (settings?.hooks) {
      checks.push({ name: 'Hooks', status: 'pass', message: 'Hooks configured in settings.local.json' });
    } else {
      checks.push({ name: 'Hooks', status: 'warn', message: 'settings.local.json exists but no hooks defined' });
    }
  } else {
    checks.push({ name: 'Hooks', status: 'warn', message: 'No hooks configured — run `ai-kit init` to generate' });
  }

  // 5. Check agents directory
  const agentsDir = path.join(projectDir, GENERATED_FILES.claudeAgents);
  if (await fs.pathExists(agentsDir)) {
    const agentFiles = (await fs.readdir(agentsDir)).filter((f: string) => f.endsWith('.md'));
    if (agentFiles.length > 0) {
      checks.push({ name: 'Agents', status: 'pass', message: `${agentFiles.length} agent(s) configured` });

      // Validate agent frontmatter
      let invalidAgents = 0;
      for (const file of agentFiles) {
        const content = readFileSafe(path.join(agentsDir, file));
        if (content && !content.startsWith('---')) {
          invalidAgents++;
        }
      }
      if (invalidAgents > 0) {
        checks.push({ name: 'Agent frontmatter', status: 'warn', message: `${invalidAgents} agent(s) missing YAML frontmatter` });
      }
    } else {
      checks.push({ name: 'Agents', status: 'warn', message: 'Agents directory empty' });
    }
  } else {
    checks.push({ name: 'Agents', status: 'warn', message: 'No agents directory — run `ai-kit init` to generate' });
  }

  // 6. Check contexts directory
  const contextsDir = path.join(projectDir, GENERATED_FILES.claudeContexts);
  if (await fs.pathExists(contextsDir)) {
    const contextFiles = (await fs.readdir(contextsDir)).filter((f: string) => f.endsWith('.md'));
    checks.push({ name: 'Contexts', status: contextFiles.length > 0 ? 'pass' : 'warn', message: `${contextFiles.length} context mode(s) available` });
  } else {
    checks.push({ name: 'Contexts', status: 'warn', message: 'No contexts directory' });
  }

  // 7. Check skills directory
  const skillsDir = path.join(projectDir, GENERATED_FILES.claudeSkills);
  if (await fs.pathExists(skillsDir)) {
    const skillDirs = (await fs.readdir(skillsDir)).filter(async (f: string) => {
      try {
        return (await fs.stat(path.join(skillsDir, f))).isDirectory();
      } catch {
        return false;
      }
    });
    checks.push({ name: 'Skills', status: 'pass', message: `${skillDirs.length} skill(s) installed` });
  } else {
    checks.push({ name: 'Skills', status: 'warn', message: 'No skills directory' });
  }

  // 8. Check .env files are gitignored
  const gitignorePath = path.join(projectDir, '.gitignore');
  const gitignore = readFileSafe(gitignorePath);
  if (gitignore) {
    const envIgnored = gitignore.includes('.env') || gitignore.includes('.env.local');
    if (envIgnored) {
      checks.push({ name: '.env gitignore', status: 'pass', message: '.env files are gitignored' });
    } else {
      checks.push({ name: '.env gitignore', status: 'fail', message: '.env files are NOT gitignored — add to .gitignore immediately' });
    }
  }

  // 9. Check settings.local.json is gitignored
  if (gitignore) {
    const settingsIgnored = gitignore.includes('settings.local.json');
    if (!settingsIgnored) {
      checks.push({ name: 'Settings gitignore', status: 'warn', message: 'settings.local.json not in .gitignore — may leak local config' });
    }
  }

  // 10. Check for MCP server security
  const settingsPath = path.join(projectDir, '.claude', 'settings.json');
  const settings = readFileSafe(settingsPath);
  if (settings) {
    const hasEnvVarsInSettings = /(?:api[_-]?key|token|secret|password)\s*[:=]\s*"[^"]+"/i.test(settings);
    if (hasEnvVarsInSettings) {
      checks.push({ name: 'MCP secrets', status: 'fail', message: 'Potential secrets in .claude/settings.json — use environment variables instead' });
    } else {
      checks.push({ name: 'MCP secrets', status: 'pass', message: 'No hardcoded secrets in settings' });
    }
  }

  // Output results
  logSection('Audit Results');

  const passed = checks.filter((c) => c.status === 'pass');
  const warned = checks.filter((c) => c.status === 'warn');
  const failed = checks.filter((c) => c.status === 'fail');

  for (const check of checks) {
    const icon =
      check.status === 'pass'
        ? chalk.green('✓')
        : check.status === 'warn'
          ? chalk.yellow('⚠')
          : chalk.red('✗');
    console.log(`  ${icon} ${check.name}: ${check.message}`);
  }

  // Score
  const total = checks.length;
  const score = Math.round(((passed.length + warned.length * 0.5) / total) * 100);
  const grade =
    score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';

  console.log('');
  logSection('Score');
  const gradeColor = grade <= 'B' ? chalk.green : grade <= 'C' ? chalk.yellow : chalk.red;
  console.log(`  ${gradeColor.bold(grade)} (${score}/100)`);
  console.log(`  ${chalk.green(String(passed.length))} passed · ${chalk.yellow(String(warned.length))} warnings · ${chalk.red(String(failed.length))} failures`);

  if (failed.length > 0) {
    console.log('');
    logError('Fix the failures above before proceeding.');
  }
}
