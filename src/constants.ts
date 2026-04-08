import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, '..');
export const TEMPLATES_DIR = path.join(PACKAGE_ROOT, 'templates');
export const COMMANDS_DIR = path.join(PACKAGE_ROOT, 'commands');
export const GUIDES_DIR = path.join(PACKAGE_ROOT, 'guides');
export const DOCS_SCAFFOLDS_DIR = path.join(PACKAGE_ROOT, 'docs-scaffolds');
export const AGENTS_DIR = path.join(PACKAGE_ROOT, 'agents');
export const CONTEXTS_DIR = path.join(PACKAGE_ROOT, 'contexts');

export const VERSION = '1.11.0';

export const AI_KIT_FOLDER = 'ai-kit';
export const AI_KIT_CONFIG_FILE = 'ai-kit.config.json';
export const BACKUP_DIR = '.ai-kit/backups';

export const GENERATED_FILES = {
  claudeMd: 'CLAUDE.md',
  cursorRules: '.cursorrules',
  cursorMdcDir: '.cursor/rules',
  claudeSettings: '.claude/settings.json',
  claudeSettingsLocal: '.claude/settings.local.json',
  claudeCommands: '.claude/commands',
  claudeSkills: '.claude/skills',
  claudeAgents: '.claude/agents',
  claudeContexts: '.claude/contexts',
  cursorSkills: '.cursor/skills',
} as const;

export const TEMPLATE_FRAGMENTS = [
  'base',
  'nextjs-app-router',
  'nextjs-pages-router',
  'sitecore-xmc',
  'optimizely-saas',
  'tailwind',
  'typescript',
  'monorepo',
  'figma',
  'static-site',
] as const;

export type TemplateFragment = (typeof TEMPLATE_FRAGMENTS)[number];
