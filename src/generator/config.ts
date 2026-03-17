import type { AiKitConfig, ProjectScan } from '../types.js';
import { VERSION } from '../constants.js';

export function generateConfig(
  scan: ProjectScan,
  templates: string[],
  commands: string[],
  guides: string[],
): AiKitConfig {
  return {
    version: VERSION,
    scanResult: scan,
    generatedAt: new Date().toISOString(),
    templates,
    commands,
    guides,
  };
}
