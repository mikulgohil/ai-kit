import type { ToolsDetection } from './scanner/tools.js';
import type { McpDetection } from './scanner/mcp.js';

export type StrictnessLevel = 'strict' | 'standard' | 'relaxed';

export type TeamProfile = 'solo-dev' | 'small-team' | 'enterprise';

export type HookProfile = 'minimal' | 'standard' | 'strict';

export interface DesignTokensScan {
  detected: boolean;
  colors: string[];
  spacing: string[];
  fonts: string[];
  breakpoints: string[];
  source: 'tailwind-config' | 'css-variables' | 'theme-inline' | 'none';
}

export interface StaticSiteScan {
  isStatic: boolean;
  outputMode?: 'export' | 'isr' | 'ssr' | 'hybrid';
  hasGenerateStaticParams: boolean;
  hasRevalidate: boolean;
  hasStaticExport: boolean;
}

export interface ToolsSelection {
  claude: boolean;
  cursor: boolean;
}

export interface ProjectScan {
  framework: 'nextjs' | 'react' | 'unknown';
  nextjsVersion?: string;
  nextjsMajorVersion?: number;
  routerType?: 'app' | 'pages' | 'hybrid';

  cms: 'sitecore-xmc-v2' | 'sitecore-xmc' | 'sitecore-jss' | 'optimizely-saas' | 'none';
  sitecorejssVersion?: string;
  sitecoreContentSdkVersion?: string;

  optimizelyVersion?: string;
  optimizelyPackages?: string[];

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

  designTokens: DesignTokensScan;
  staticSite: StaticSiteScan;
  aiIgnorePatterns: string[];

  tools: ToolsDetection;
  mcpServers: McpDetection;

  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';

  projectName: string;
  projectPath: string;

  scripts: Record<string, string>;
}

export interface HookDefinition {
  matcher: string;
  hooks: { type: 'command'; command: string }[];
}

export interface HooksConfig {
  PreToolUse?: HookDefinition[];
  PostToolUse?: HookDefinition[];
  PostCompact?: HookDefinition[];
  Stop?: HookDefinition[];
}

export interface AiKitConfig {
  $schema?: string;
  version: string;
  scanResult: ProjectScan;
  generatedAt: string;
  templates: string[];
  commands: string[];
  guides: string[];
  agents: string[];
  contexts: string[];
  hooks: boolean;
  hookProfile: HookProfile;
  strictness: StrictnessLevel;
  teamProfile?: TeamProfile;
  customFragments: string[];
  tools: ToolsSelection;
}

export interface GeneratorOptions {
  scan: ProjectScan;
  overwrite: boolean;
  outputDir: string;
  strictness: StrictnessLevel;
  customFragments?: string[];
}

export type ConflictResolution = 'overwrite' | 'merge' | 'skip';

export interface ClarificationAnswer {
  cms?: 'sitecore-xmc-v2' | 'sitecore-xmc' | 'sitecore-jss' | 'optimizely-saas' | 'none';
  routerType?: 'app' | 'pages' | 'hybrid';
  primaryBranch?: string;
  useStorybook?: boolean;
}
