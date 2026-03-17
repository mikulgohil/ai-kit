import type { ToolsDetection } from './scanner/tools.js';
import type { McpDetection } from './scanner/mcp.js';

export interface ProjectScan {
  framework: 'nextjs' | 'react' | 'unknown';
  nextjsVersion?: string;
  routerType?: 'app' | 'pages' | 'hybrid';

  cms: 'sitecore-xmc' | 'sitecore-jss' | 'none';
  sitecorejssVersion?: string;

  styling: ('tailwind' | 'css-modules' | 'styled-components' | 'scss')[];
  tailwindVersion?: string;

  typescript: boolean;
  typescriptStrict?: boolean;

  monorepo: boolean;
  monorepoTool?: 'turborepo' | 'nx' | 'lerna' | 'pnpm-workspaces';

  figma: {
    detected: boolean;
    figmaMcp: boolean;
    figmaCodeCli: boolean;
    designTokens: boolean;
    tokenFormat: 'tailwind-v4' | 'tailwind-v3' | 'css-variables' | 'none';
    visualTests: boolean;
  };

  tools: ToolsDetection;
  mcpServers: McpDetection;

  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';

  projectName: string;
  projectPath: string;

  scripts: Record<string, string>;
}

export interface AiKitConfig {
  version: string;
  scanResult: ProjectScan;
  generatedAt: string;
  templates: string[];
  commands: string[];
  guides: string[];
}

export interface GeneratorOptions {
  scan: ProjectScan;
  overwrite: boolean;
  outputDir: string;
}

export type ConflictResolution = 'overwrite' | 'merge' | 'skip';

export interface ClarificationAnswer {
  cms?: 'sitecore-xmc' | 'sitecore-jss' | 'none';
  routerType?: 'app' | 'pages' | 'hybrid';
  primaryBranch?: string;
  useStorybook?: boolean;
}
