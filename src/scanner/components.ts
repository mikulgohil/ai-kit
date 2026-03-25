import path from 'path';
import fs from 'fs-extra';
import { readFileSafe, dirExists } from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface SitecoreComponentMeta {
  usesContext: boolean;
  datasourceFields: string[];
  renderingParams: string[];
  placeholders: string[];
  graphqlQueries: string[];
}

export interface ComponentInfo {
  name: string;
  filePath: string;
  relativePath: string;
  category: string;
  props: ComponentProp[];
  sitecore: SitecoreComponentMeta;
  dependencies: string[];
  hasTests: boolean;
  hasStory: boolean;
  hasAiDoc: boolean;
  exportType: 'default' | 'named' | 'both';
}

export interface ComponentScanResult {
  components: ComponentInfo[];
  totalFiles: number;
  directories: string[];
}

// ─── File Discovery ────────────────────────────────────────────────────
const COMPONENT_DIRS = [
  'src/components',
  'src/Components',
  'components',
  'Components',
  'src/rendering/src/components',
  'src/rendering/src/Components',
  'headapps',
  'app',
];

const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  '.storybook',
  '__tests__',
  '__mocks__',
  'dist',
  'build',
  '.git',
];

const TEST_SUFFIXES = ['.test.tsx', '.test.ts', '.spec.tsx', '.spec.ts'];
const STORY_SUFFIXES = ['.stories.tsx', '.stories.ts', '.stories.mdx'];

function findComponentFiles(projectPath: string): { files: string[]; directories: string[] } {
  const files: string[] = [];
  const directories = new Set<string>();

  for (const dir of COMPONENT_DIRS) {
    const fullDir = path.join(projectPath, dir);
    if (dirExists(fullDir)) {
      walkForComponents(fullDir, files, directories);
    }
  }

  return { files, directories: Array.from(directories) };
}

function walkForComponents(
  dir: string,
  files: string[],
  directories: Set<string>,
): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORE_PATTERNS.includes(entry.name)) continue;
        walkForComponents(full, files, directories);
        continue;
      }

      if (!entry.name.endsWith('.tsx')) continue;

      // Skip test and story files
      const isTest = TEST_SUFFIXES.some((s) => entry.name.endsWith(s));
      const isStory = STORY_SUFFIXES.some((s) => entry.name.endsWith(s));
      if (isTest || isStory) continue;

      // Skip index-only re-exports (very small files)
      const content = readFileSafe(full);
      if (!content || content.length < 50) continue;

      // Must export a React component (function or const with JSX return)
      if (isReactComponent(content)) {
        files.push(full);
        directories.add(dir);
      }
    }
  } catch {
    // Skip unreadable directories
  }
}

function isReactComponent(content: string): boolean {
  // Check for common React component patterns
  const patterns = [
    /export\s+(?:default\s+)?function\s+\w+/,
    /export\s+(?:default\s+)?const\s+\w+\s*[:=]\s*(?:React\.)?(?:FC|FunctionComponent|memo|forwardRef)/,
    /export\s+(?:default\s+)?const\s+\w+\s*=\s*\([^)]*\)\s*(?::\s*\w+)?\s*=>/,
    /export\s+default\s+\w+/,
  ];

  const hasExport = patterns.some((p) => p.test(content));
  const hasJsx = /<[\w.]+[\s/>]/.test(content) || /return\s*\(/.test(content);

  return hasExport && hasJsx;
}

// ─── Metadata Extraction ───────────────────────────────────────────────
function extractComponentName(filePath: string, content: string): string {
  // Try to extract from export statement
  const defaultExport = content.match(
    /export\s+default\s+function\s+(\w+)/,
  );
  if (defaultExport) return defaultExport[1];

  const namedExport = content.match(
    /export\s+(?:const|function)\s+(\w+)/,
  );
  if (namedExport) return namedExport[1];

  // Fallback to filename
  return path.basename(filePath, '.tsx');
}

function extractExportType(content: string): 'default' | 'named' | 'both' {
  const hasDefault = /export\s+default\s/.test(content);
  const hasNamed = /export\s+(?:const|function|class)\s+\w+/.test(content);

  if (hasDefault && hasNamed) return 'both';
  if (hasDefault) return 'default';
  return 'named';
}

function extractProps(content: string): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Match interface/type props definitions
  // Pattern: interface XxxProps { ... }
  const propsInterface = content.match(
    /(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?{([^}]*)}/s,
  );

  if (!propsInterface) return props;

  const body = propsInterface[1];
  const lines = body.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

    // Match: propName: Type or propName?: Type
    const propMatch = trimmed.match(/^(\w+)(\?)?:\s*(.+?)(?:;|$)/);
    if (propMatch) {
      props.push({
        name: propMatch[1],
        type: propMatch[3].trim().replace(/;$/, ''),
        required: !propMatch[2],
      });
    }
  }

  return props;
}

function extractSitecoreMeta(content: string): SitecoreComponentMeta {
  const meta: SitecoreComponentMeta = {
    usesContext: false,
    datasourceFields: [],
    renderingParams: [],
    placeholders: [],
    graphqlQueries: [],
  };

  // Detect useSitecoreContext
  meta.usesContext = /useSitecoreContext/.test(content);

  // Detect datasource field access patterns
  // fields.fieldName or fields?.fieldName or props.fields.fieldName
  const fieldAccess = content.matchAll(
    /fields[?.]\.(\w+)/g,
  );
  for (const match of fieldAccess) {
    if (!meta.datasourceFields.includes(match[1])) {
      meta.datasourceFields.push(match[1]);
    }
  }

  // Also check for Field component usage: <Text field={fields.title} />
  const fieldComponents = content.matchAll(
    /field=\{(?:fields|props\.fields)[?.]\.(\w+)\}/g,
  );
  for (const match of fieldComponents) {
    if (!meta.datasourceFields.includes(match[1])) {
      meta.datasourceFields.push(match[1]);
    }
  }

  // Detect rendering params
  // params.paramName or params?.paramName
  const paramAccess = content.matchAll(
    /params[?.]\.(\w+)/g,
  );
  for (const match of paramAccess) {
    const name = match[1];
    if (name !== 'styles' && !meta.renderingParams.includes(name)) {
      meta.renderingParams.push(name);
    }
  }

  // Detect Placeholder usage
  const placeholders = content.matchAll(
    /(?:<Placeholder|Placeholder)\s[^>]*name=["'{]([^"'}]+)["'}]/g,
  );
  for (const match of placeholders) {
    if (!meta.placeholders.includes(match[1])) {
      meta.placeholders.push(match[1]);
    }
  }

  // Detect GraphQL queries
  const gqlQueries = content.matchAll(
    /(?:gql|graphql)`\s*(query\s+(\w+))/g,
  );
  for (const match of gqlQueries) {
    meta.graphqlQueries.push(match[2] || match[1]);
  }

  return meta;
}

function extractDependencies(content: string): string[] {
  const deps: string[] = [];
  const imports = content.matchAll(
    /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g,
  );

  for (const match of imports) {
    const importPath = match[1];
    // Only track local component imports (relative paths)
    if (importPath.startsWith('.') || importPath.startsWith('..')) {
      const basename = path.basename(importPath).replace(/\.\w+$/, '');
      // Likely a component if PascalCase
      if (/^[A-Z]/.test(basename)) {
        deps.push(basename);
      }
    }
  }

  return deps;
}

function checkForTests(componentPath: string, componentName: string): boolean {
  const dir = path.dirname(componentPath);
  const base = path.basename(componentPath, '.tsx');

  for (const suffix of TEST_SUFFIXES) {
    if (fs.existsSync(path.join(dir, base + suffix))) return true;
  }

  // Check __tests__ subdirectory
  const testsDir = path.join(dir, '__tests__');
  if (dirExists(testsDir)) {
    for (const suffix of TEST_SUFFIXES) {
      if (fs.existsSync(path.join(testsDir, base + suffix))) return true;
      if (fs.existsSync(path.join(testsDir, componentName + suffix))) return true;
    }
  }

  return false;
}

function checkForStory(componentPath: string, componentName: string): boolean {
  const dir = path.dirname(componentPath);
  const base = path.basename(componentPath, '.tsx');

  for (const suffix of STORY_SUFFIXES) {
    if (fs.existsSync(path.join(dir, base + suffix))) return true;
    if (fs.existsSync(path.join(dir, componentName + suffix))) return true;
  }

  return false;
}

function checkForAiDoc(componentPath: string): boolean {
  const dir = path.dirname(componentPath);
  const base = path.basename(componentPath, '.tsx');

  return (
    fs.existsSync(path.join(dir, `${base}.ai.md`)) ||
    fs.existsSync(path.join(dir, 'component.ai.md'))
  );
}

function categorizeComponent(relativePath: string): string {
  const lower = relativePath.toLowerCase();

  if (lower.includes('layout')) return 'layout';
  if (lower.includes('page') || lower.includes('route')) return 'page';
  if (lower.includes('form')) return 'form';
  if (lower.includes('nav') || lower.includes('header') || lower.includes('footer')) return 'navigation';
  if (lower.includes('ui') || lower.includes('common') || lower.includes('shared')) return 'ui';
  if (lower.includes('feature')) return 'feature';
  if (lower.includes('marketing') || lower.includes('hero') || lower.includes('banner')) return 'marketing';
  if (lower.includes('card') || lower.includes('list') || lower.includes('grid')) return 'content';

  return 'general';
}

// ─── Main Scanner ──────────────────────────────────────────────────────
function parseComponent(
  filePath: string,
  projectPath: string,
): ComponentInfo | null {
  const content = readFileSafe(filePath);
  if (!content) return null;

  const name = extractComponentName(filePath, content);
  const relativePath = path.relative(projectPath, filePath);

  return {
    name,
    filePath,
    relativePath,
    category: categorizeComponent(relativePath),
    props: extractProps(content),
    sitecore: extractSitecoreMeta(content),
    dependencies: extractDependencies(content),
    hasTests: checkForTests(filePath, name),
    hasStory: checkForStory(filePath, name),
    hasAiDoc: checkForAiDoc(filePath),
    exportType: extractExportType(content),
  };
}

export function scanComponents(projectPath: string): ComponentScanResult {
  const { files, directories } = findComponentFiles(projectPath);

  const components: ComponentInfo[] = [];

  for (const file of files) {
    const info = parseComponent(file, projectPath);
    if (info) {
      components.push(info);
    }
  }

  // Sort by name for consistent output
  components.sort((a, b) => a.name.localeCompare(b.name));

  return {
    components,
    totalFiles: files.length,
    directories,
  };
}
