import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { AI_KIT_CONFIG_FILE } from '../constants.js';
import { scanComponents } from '../scanner/components.js';
import { calculateHealthScore } from '../generator/component-docs.js';
import {
  logSection,
  logSuccess,
  logWarning,
  logInfo,
  fileExists,
} from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
interface RegistryEntry {
  name: string;
  path: string;
  category: string;
  props: { name: string; type: string; required: boolean }[];
  exportType: 'default' | 'named' | 'both';
  dependencies: string[];
  sitecore: {
    datasourceFields: string[];
    renderingParams: string[];
    placeholders: string[];
  };
  health: {
    score: number;
    hasTests: boolean;
    hasStory: boolean;
    hasAiDoc: boolean;
  };
}

interface ComponentRegistry {
  version: string;
  generatedAt: string;
  projectName: string;
  totalComponents: number;
  categories: Record<string, number>;
  components: RegistryEntry[];
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function componentRegistryCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());

  console.log('');
  logSection('AI Kit — Component Registry');
  console.log(chalk.dim(`  ${projectDir}`));
  console.log('');

  // Pre-check
  if (!fileExists(path.join(projectDir, AI_KIT_CONFIG_FILE))) {
    logWarning('ai-kit.config.json not found. Run `ai-kit init` first.');
    return;
  }

  // Scan components
  const spinner = ora('Scanning components...').start();
  const scanResult = scanComponents(projectDir);

  if (scanResult.components.length === 0) {
    spinner.fail('No components found.');
    return;
  }

  spinner.succeed(`Found ${scanResult.components.length} components in ${scanResult.directories.length} directories`);

  // Build registry
  const entries: RegistryEntry[] = scanResult.components.map((c) => ({
    name: c.name,
    path: c.relativePath,
    category: c.category,
    props: c.props,
    exportType: c.exportType,
    dependencies: c.dependencies,
    sitecore: {
      datasourceFields: c.sitecore.datasourceFields,
      renderingParams: c.sitecore.renderingParams,
      placeholders: c.sitecore.placeholders,
    },
    health: {
      score: calculateHealthScore(c),
      hasTests: c.hasTests,
      hasStory: c.hasStory,
      hasAiDoc: c.hasAiDoc,
    },
  }));

  // Calculate category counts
  const categories: Record<string, number> = {};
  for (const entry of entries) {
    categories[entry.category] = (categories[entry.category] || 0) + 1;
  }

  const pkgPath = path.join(projectDir, 'package.json');
  const pkg = fs.readJsonSync(pkgPath, { throws: false }) || {};

  const registry: ComponentRegistry = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    projectName: (pkg.name as string) || path.basename(projectDir),
    totalComponents: entries.length,
    categories,
    components: entries,
  };

  // Write registry
  const outputPath = path.join(projectDir, 'ai-kit', 'component-registry.json');
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeJson(outputPath, registry, { spaces: 2 });

  // Also generate a markdown summary for AI context
  const mdPath = path.join(projectDir, 'ai-kit', 'component-registry.md');
  const md = generateRegistryMarkdown(registry);
  await fs.writeFile(mdPath, md, 'utf-8');

  // Display summary
  console.log('');
  console.log(`  ${chalk.bold('Categories:')}`);
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${chalk.cyan(String(count).padStart(3))} ${cat}`);
  }

  // Health summary
  const avgHealth = Math.round(entries.reduce((sum, e) => sum + e.health.score, 0) / entries.length);
  const withTests = entries.filter((e) => e.health.hasTests).length;
  const withStories = entries.filter((e) => e.health.hasStory).length;
  const withDocs = entries.filter((e) => e.health.hasAiDoc).length;

  console.log('');
  console.log(`  ${chalk.bold('Health:')}`);
  console.log(`    Average score: ${chalk.cyan(String(avgHealth))}/100`);
  console.log(`    With tests: ${chalk.cyan(String(withTests))}/${entries.length}`);
  console.log(`    With stories: ${chalk.cyan(String(withStories))}/${entries.length}`);
  console.log(`    With .ai.md docs: ${chalk.cyan(String(withDocs))}/${entries.length}`);

  console.log('');
  logSuccess(`Registry written to ${chalk.cyan('ai-kit/component-registry.json')}`);
  logSuccess(`Summary written to ${chalk.cyan('ai-kit/component-registry.md')}`);
  logInfo('AI agents can use this registry to discover existing components before creating new ones.');
  console.log('');
}

// ─── Markdown Generation ────────────────────────────────────────────────
function generateRegistryMarkdown(registry: ComponentRegistry): string {
  const lines: string[] = [
    '# Component Registry',
    '',
    `> Auto-generated by ai-kit on ${registry.generatedAt.split('T')[0]}`,
    `> ${registry.totalComponents} components in ${registry.projectName}`,
    '',
    '## How to Use',
    '',
    'Before creating a new component, check this registry to see if one already exists.',
    'AI agents should reference this file to avoid duplicating components.',
    '',
  ];

  // Group by category
  const grouped = new Map<string, typeof registry.components>();
  for (const comp of registry.components) {
    const list = grouped.get(comp.category) || [];
    list.push(comp);
    grouped.set(comp.category, list);
  }

  for (const [category, components] of grouped) {
    lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)} (${components.length})`);
    lines.push('');
    lines.push('| Component | Path | Props | Tests | Story | Health |');
    lines.push('|-----------|------|-------|-------|-------|--------|');

    for (const comp of components) {
      const propsCount = comp.props.length;
      const tests = comp.health.hasTests ? 'Yes' : 'No';
      const story = comp.health.hasStory ? 'Yes' : 'No';
      const health = `${comp.health.score}/100`;
      lines.push(`| ${comp.name} | \`${comp.path}\` | ${propsCount} | ${tests} | ${story} | ${health} |`);
    }

    lines.push('');
  }

  return lines.join('\n');
}
