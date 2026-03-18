import type { AiKitConfig, ProjectScan, StrictnessLevel, HookProfile } from '../types.js';
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
  },
): AiKitConfig {
  return {
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
  };
}
