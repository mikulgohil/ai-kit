import path from 'path';
import { readFileSafe } from '../utils.js';

export interface McpDetection {
  playwright: boolean;
  figma: boolean;
  github: boolean;
  context7: boolean;
  perplexity: boolean;
}

export function detectMcpServers(projectPath: string): McpDetection {
  const settingsPaths = [
    path.join(projectPath, '.claude', 'settings.json'),
    path.join(projectPath, '.claude', 'settings.local.json'),
    path.join(projectPath, '.mcp.json'),
  ];

  // Combine all MCP config file contents for searching
  let combined = '';
  for (const settingsPath of settingsPaths) {
    const content = readFileSafe(settingsPath);
    if (content) {
      combined += content.toLowerCase() + '\n';
    }
  }

  return {
    playwright: combined.includes('playwright'),
    figma: combined.includes('figma'),
    github: combined.includes('github'),
    context7: combined.includes('context7'),
    perplexity: combined.includes('perplexity'),
  };
}
