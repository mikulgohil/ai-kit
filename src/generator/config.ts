import type { AiKitConfig, ProjectScan, StrictnessLevel, HookProfile, ToolsSelection } from '../types.js';
import { VERSION } from '../constants.js';

export function generateConfig(
  scan: ProjectScan,
  templates: string[],
  commands: string[],
  guides: string[],
  options?: {
    strictness?: StrictnessLevel;
    customFragments?: string[];
    agents?: string[];
    contexts?: string[];
    hooks?: boolean;
    hookProfile?: HookProfile;
    tools?: ToolsSelection;
  },
): AiKitConfig {
  return {
    $schema: 'https://ai-kit.mikul.me/schema/ai-kit.config.schema.json',
    version: VERSION,
    scanResult: scan,
    generatedAt: new Date().toISOString(),
    templates,
    commands,
    guides,
    agents: options?.agents || [],
    contexts: options?.contexts || [],
    hooks: options?.hooks || false,
    hookProfile: options?.hookProfile || 'standard',
    strictness: options?.strictness || 'standard',
    customFragments: options?.customFragments || [],
    tools: options?.tools || { claude: true, cursor: true },
  };
}
