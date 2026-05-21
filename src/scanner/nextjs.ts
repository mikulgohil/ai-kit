import path from 'path';
import fs from 'fs-extra';
import { dirExists, fileExists, readFileSafe } from '../utils.js';

export type ProxyFileState = 'proxy' | 'middleware' | 'both' | 'none';
export type TurbopackConfigLocation = 'top-level' | 'experimental' | 'none';

export interface NextjsResult {
  framework: 'nextjs' | 'react' | 'unknown';
  nextjsVersion?: string;
  nextjsMajorVersion?: number;
  routerType?: 'app' | 'pages' | 'hybrid';

  // --- Next.js 16+ feature detections (only populated when nextjsMajorVersion >= 16) ---
  proxyFile?: ProxyFileState;
  cacheComponents?: boolean;
  reactCompiler?: boolean;
  turbopackConfigLocation?: TurbopackConfigLocation;
  turbopackFsCache?: boolean;
  parallelRoutesMissingDefault?: string[];
  imageConfigUsesDomains?: boolean;
  deprecatedExperimentalFlags?: string[];
  reactVersion?: string;
  reactMajorMinor?: number;
  nodeEnginesSatisfiesNext16?: boolean;
}

const NEXT_CONFIG_CANDIDATES = [
  'next.config.ts',
  'next.config.mts',
  'next.config.js',
  'next.config.mjs',
  'next.config.cjs',
];

// Regex-based parser of next.config — handles common forms (object literal,
// `const x = { ... }; export default x`, `module.exports = { ... }`). Does
// not handle dynamic config or function-returning configs reliably; those
// are rare in practice. Documented as best-effort.
function readNextConfig(projectPath: string): string | null {
  for (const candidate of NEXT_CONFIG_CANDIDATES) {
    const full = path.join(projectPath, candidate);
    const content = readFileSafe(full);
    if (content) return content;
  }
  return null;
}

function hasTopLevelKey(config: string, key: string): boolean {
  // Match `key:` at column 0 or preceded by `{`/`,` and optional whitespace,
  // with a truthy-ish value (true | "..." | { | numeric | [). Filters out
  // matches inside `experimental: { ... }` by checking the line isn't deeply
  // indented after an experimental opener — best-effort.
  const re = new RegExp(`(^|[\\n,{])\\s*${key}\\s*:\\s*(true|"|'|\\{|\\[|\\d)`, 'm');
  return re.test(config);
}

function hasExperimentalKey(config: string, key: string): boolean {
  // Find the experimental: { ... } block (greedy through outermost braces is
  // hard with regex; we approximate by capturing up to the next matching `}`
  // at the same brace depth via a small scanner).
  const expIdx = config.search(/experimental\s*:\s*\{/);
  if (expIdx === -1) return false;
  let depth = 0;
  let started = false;
  let i = expIdx;
  while (i < config.length) {
    const ch = config[i];
    if (ch === '{') {
      depth++;
      started = true;
    } else if (ch === '}') {
      depth--;
      if (started && depth === 0) {
        const block = config.slice(expIdx, i + 1);
        const re = new RegExp(`(^|[\\n,{])\\s*${key}\\s*:`, 'm');
        return re.test(block);
      }
    }
    i++;
  }
  return false;
}

export function detectProxyFile(projectPath: string): ProxyFileState {
  const roots = ['', 'src/'];
  let hasProxy = false;
  let hasMiddleware = false;
  for (const root of roots) {
    for (const ext of ['ts', 'js', 'mts', 'mjs']) {
      if (fileExists(path.join(projectPath, `${root}proxy.${ext}`))) hasProxy = true;
      if (fileExists(path.join(projectPath, `${root}middleware.${ext}`))) hasMiddleware = true;
    }
  }
  if (hasProxy && hasMiddleware) return 'both';
  if (hasProxy) return 'proxy';
  if (hasMiddleware) return 'middleware';
  return 'none';
}

function findParallelRoutesMissingDefault(projectPath: string): string[] {
  const appDirs = [
    path.join(projectPath, 'app'),
    path.join(projectPath, 'src', 'app'),
  ].filter(dirExists);

  const missing: string[] = [];
  for (const appDir of appDirs) {
    walkForParallelSlots(appDir, appDir, missing);
  }
  return missing;
}

function walkForParallelSlots(root: string, current: string, missing: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(current, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

    const childPath = path.join(current, entry.name);

    if (entry.name.startsWith('@')) {
      // Parallel route slot — needs a default.{ts,js,tsx,jsx}
      const hasDefault = ['default.tsx', 'default.ts', 'default.jsx', 'default.js'].some(
        (f) => fileExists(path.join(childPath, f)),
      );
      if (!hasDefault) {
        missing.push(path.relative(root, childPath));
      }
    }

    walkForParallelSlots(root, childPath, missing);
  }
}

function detectImageConfigUsesDomains(config: string): boolean {
  return /(^|[\n{,])\s*images\s*:\s*\{[\s\S]*?\bdomains\s*:/m.test(config);
}

function detectDeprecatedFlags(config: string): string[] {
  const flags: string[] = [];
  if (hasExperimentalKey(config, 'ppr')) flags.push('experimental.ppr');
  if (hasExperimentalKey(config, 'dynamicIO')) flags.push('experimental.dynamicIO');
  if (hasExperimentalKey(config, 'turbopack')) flags.push('experimental.turbopack');
  if (/serverRuntimeConfig\s*:/.test(config)) flags.push('serverRuntimeConfig');
  if (/publicRuntimeConfig\s*:/.test(config)) flags.push('publicRuntimeConfig');
  return flags;
}

function compareNodeEngine(engines: unknown): boolean | undefined {
  if (!engines || typeof engines !== 'object') return undefined;
  const node = (engines as Record<string, string>).node;
  if (!node) return undefined;
  // Extract the first numeric major.minor and compare against 20.9
  const match = node.match(/(\d+)\.(\d+)/);
  if (!match) return undefined;
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  if (major > 20) return true;
  if (major < 20) return false;
  return minor >= 9;
}

export function detectNextjs(
  projectPath: string,
  pkg: Record<string, unknown>,
): NextjsResult {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  if (!deps.next) {
    if (deps.react) return { framework: 'react' };
    return { framework: 'unknown' };
  }

  const nextjsVersion = deps.next.replace(/[\^~>=<]/g, '');
  const nextjsMajorVersion = parseInt(nextjsVersion.split('.')[0], 10) || undefined;

  const hasAppDir =
    dirExists(path.join(projectPath, 'app')) ||
    dirExists(path.join(projectPath, 'src', 'app'));

  const hasPagesDir =
    dirExists(path.join(projectPath, 'pages')) ||
    dirExists(path.join(projectPath, 'src', 'pages'));

  let routerType: 'app' | 'pages' | 'hybrid' | undefined;
  if (hasAppDir && hasPagesDir) routerType = 'hybrid';
  else if (hasAppDir) routerType = 'app';
  else if (hasPagesDir) routerType = 'pages';

  const base: NextjsResult = {
    framework: 'nextjs',
    nextjsVersion,
    nextjsMajorVersion,
    routerType,
  };

  // Next.js 16+ feature detection — only run when relevant
  if ((nextjsMajorVersion ?? 0) < 16) return base;

  const reactVersion = deps.react?.replace(/[\^~>=<]/g, '');
  let reactMajorMinor: number | undefined;
  if (reactVersion) {
    const [maj, min] = reactVersion.split('.').map((p) => parseInt(p, 10));
    if (!Number.isNaN(maj) && !Number.isNaN(min)) {
      reactMajorMinor = maj + min / 100;
    }
  }

  const proxyFile = detectProxyFile(projectPath);
  const parallelRoutesMissingDefault = findParallelRoutesMissingDefault(projectPath);
  const nodeEnginesSatisfiesNext16 = compareNodeEngine(pkg.engines);

  const config = readNextConfig(projectPath);

  let cacheComponents = false;
  let reactCompiler = false;
  let turbopackConfigLocation: TurbopackConfigLocation = 'none';
  let turbopackFsCache = false;
  let imageConfigUsesDomains = false;
  let deprecatedExperimentalFlags: string[] = [];

  if (config) {
    cacheComponents = hasTopLevelKey(config, 'cacheComponents');
    reactCompiler = hasTopLevelKey(config, 'reactCompiler');
    if (hasTopLevelKey(config, 'turbopack')) {
      turbopackConfigLocation = 'top-level';
    } else if (hasExperimentalKey(config, 'turbopack')) {
      turbopackConfigLocation = 'experimental';
    }
    turbopackFsCache = hasExperimentalKey(config, 'turbopackFileSystemCacheForDev');
    imageConfigUsesDomains = detectImageConfigUsesDomains(config);
    deprecatedExperimentalFlags = detectDeprecatedFlags(config);
  }

  return {
    ...base,
    proxyFile,
    cacheComponents,
    reactCompiler,
    turbopackConfigLocation,
    turbopackFsCache,
    parallelRoutesMissingDefault,
    imageConfigUsesDomains,
    deprecatedExperimentalFlags,
    reactVersion,
    reactMajorMinor,
    nodeEnginesSatisfiesNext16,
  };
}
