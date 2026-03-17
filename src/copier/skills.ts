import path from 'path';
import fs from 'fs-extra';
import { COMMANDS_DIR } from '../constants.js';

const AVAILABLE_SKILLS = [
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
  'accessibility-audit',
  'security-check',
  'refactor',
  'api-route',
  'pre-pr',
  'migrate',
  'error-boundary',
  'type-fix',
  'extract-hook',
  'dep-check',
  'env-setup',
  'commit-msg',
  'sitecore-debug',
  'responsive-check',
  'document',
  'token-tips',
];

// Short descriptions for auto-discovery — AI reads these to decide when to apply
const SKILL_DESCRIPTIONS: Record<string, string> = {
  'prompt-help': 'Help developers write effective AI prompts with structured context',
  'review': 'Deep code review following project coding standards',
  'fix-bug': 'Systematic debugging workflow with root cause analysis and regression testing',
  'new-component': 'Scaffold new React components with types, tests, and documentation',
  'new-page': 'Scaffold new Next.js pages/routes with proper file structure',
  'understand': 'Explain code architecture, data flow, and design decisions',
  'test': 'Generate unit and integration tests with React Testing Library',
  'optimize': 'Analyze and fix performance issues in components and pages',
  'figma-to-code': 'Implement Figma designs using project design tokens',
  'design-tokens': 'Audit and manage design token systems',
  'accessibility-audit': 'WCAG 2.1 AA accessibility compliance audit',
  'security-check': 'Scan for XSS, injection, secrets, and OWASP Top 10 vulnerabilities',
  'refactor': 'Restructure code to improve readability without changing behavior',
  'api-route': 'Scaffold Next.js API routes with validation, typing, and error handling',
  'pre-pr': 'Pre-pull-request checklist covering types, a11y, security, tests, and more',
  'migrate': 'Guide framework and library migrations step by step',
  'error-boundary': 'Generate error boundaries, loading states, and fallback UI',
  'type-fix': 'Fix TypeScript issues — replace any types, add null checks, tighten types',
  'extract-hook': 'Extract component logic into reusable custom React hooks',
  'dep-check': 'Audit dependencies for unused, outdated, vulnerable, and bloated packages',
  'env-setup': 'Generate .env.example, validate environment variables, check for leaked secrets',
  'commit-msg': 'Generate conventional commit messages from staged git changes',
  'sitecore-debug': 'Debug Sitecore XM Cloud integration issues',
  'responsive-check': 'Audit responsive design — breakpoints, touch targets, overflow',
  'document': 'Generate documentation for existing components and utilities',
  'token-tips': 'Token usage optimization strategies for AI coding assistants',
};

export async function copySkills(targetDir: string): Promise<string[]> {
  const copied: string[] = [];

  for (const skill of AVAILABLE_SKILLS) {
    const src = path.join(COMMANDS_DIR, `${skill}.md`);
    if (!(await fs.pathExists(src))) continue;

    const content = await fs.readFile(src, 'utf-8');
    const description = SKILL_DESCRIPTIONS[skill] || skill;

    // Generate for Claude Code: .claude/skills/[name]/SKILL.md
    const claudeSkillDir = path.join(targetDir, '.claude', 'skills', skill);
    await fs.ensureDir(claudeSkillDir);
    await fs.writeFile(
      path.join(claudeSkillDir, 'SKILL.md'),
      content,
      'utf-8',
    );

    // Generate for Cursor: .cursor/skills/[name]/SKILL.md
    const cursorSkillDir = path.join(targetDir, '.cursor', 'skills', skill);
    await fs.ensureDir(cursorSkillDir);
    await fs.writeFile(
      path.join(cursorSkillDir, 'SKILL.md'),
      content,
      'utf-8',
    );

    // Legacy: also copy to .claude/commands/ for older Claude Code versions
    const legacyDir = path.join(targetDir, '.claude', 'commands');
    await fs.ensureDir(legacyDir);
    await fs.copy(src, path.join(legacyDir, `${skill}.md`), { overwrite: true });

    copied.push(skill);
  }

  return copied;
}

// Keep the old function name as an alias for backward compatibility
export const copyCommands = copySkills;
