import type { AiKitConfig, ProjectScan, StrictnessLevel } from '../types.js';
import { VERSION } from '../constants.js';

export function generateConfig(
  scan: ProjectScan,
  templates: string[],
  commands: string[],
  guides: string[],
  options?: { strictness?: StrictnessLevel; customFragments?: string[] },
): AiKitConfig {
  return {
    version: VERSION,
    scanResult: scan,
    generatedAt: new Date().toISOString(),
    templates,
    commands,
    guides,
    strictness: options?.strictness || 'standard',
    customFragments: options?.customFragments || [],
  };
}
