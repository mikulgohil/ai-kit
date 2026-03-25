import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { AI_KIT_CONFIG_FILE } from '../constants.js';
import { scanComponents } from '../scanner/components.js';
import type { ComponentInfo } from '../scanner/components.js';
import {
  logSection,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  fileExists,
  readFileSafe,
} from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
interface DriftEntry {
  name: string;
  filePath: string;
  documentedProps: string[];
  actualProps: string[];
  documentedFields: string[];
  actualFields: string[];
  missingFromDoc: string[];
  extraInDoc: string[];
  fieldMissingFromDoc: string[];
  fieldExtraInDoc: string[];
  status: 'in-sync' | 'drifted' | 'outdated';
}

// ─── AI Doc Parsing ─────────────────────────────────────────────────────
function parseAiDocFrontmatter(content: string): {
  props: string[];
  fields: string[];
} {
  const props: string[] = [];
  const fields: string[] = [];

  // Extract YAML frontmatter between --- markers
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { props, fields };

  const frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split('\n');

  let currentSection: 'none' | 'props' | 'fields' = 'none';

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect section headers
    if (/^props\s*:/i.test(trimmed)) {
      currentSection = 'props';
      continue;
    }
    if (/^(?:fields|sitecore[-_]?fields|datasource[-_]?fields)\s*:/i.test(trimmed)) {
      currentSection = 'fields';
      continue;
    }

    // Any other top-level key resets
    if (/^\w+\s*:/.test(trimmed) && !trimmed.startsWith('-')) {
      currentSection = 'none';
      continue;
    }

    // Collect list items
    if (currentSection !== 'none' && trimmed.startsWith('-')) {
      const value = trimmed
        .replace(/^-\s*/, '')
        .replace(/\s*[:#].*$/, '')  // Strip trailing comments/types
        .trim();

      if (value) {
        if (currentSection === 'props') props.push(value);
        if (currentSection === 'fields') fields.push(value);
      }
    }
  }

  return { props, fields };
}

function findAiDocPath(componentPath: string): string | null {
  const dir = path.dirname(componentPath);
  const base = path.basename(componentPath, '.tsx');

  const candidates = [
    path.join(dir, `${base}.ai.md`),
    path.join(dir, 'component.ai.md'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

// ─── Drift Analysis ─────────────────────────────────────────────────────
function analyzeDrift(component: ComponentInfo, projectDir: string): DriftEntry | null {
  const aiDocPath = findAiDocPath(component.filePath);
  if (!aiDocPath) return null;

  const aiDocContent = readFileSafe(aiDocPath);
  if (!aiDocContent) return null;

  const { props: documentedProps, fields: documentedFields } = parseAiDocFrontmatter(aiDocContent);
  const actualProps = component.props.map((p) => p.name);
  const actualFields = component.sitecore.datasourceFields;

  // Calculate drift for props
  const missingFromDoc = actualProps.filter((p) => !documentedProps.includes(p));
  const extraInDoc = documentedProps.filter((p) => !actualProps.includes(p));

  // Calculate drift for Sitecore fields
  const fieldMissingFromDoc = actualFields.filter((f) => !documentedFields.includes(f));
  const fieldExtraInDoc = documentedFields.filter((f) => !actualFields.includes(f));

  const hasPropDrift = missingFromDoc.length > 0 || extraInDoc.length > 0;
  const hasFieldDrift = fieldMissingFromDoc.length > 0 || fieldExtraInDoc.length > 0;

  let status: DriftEntry['status'];
  if (!hasPropDrift && !hasFieldDrift) {
    status = 'in-sync';
  } else if (extraInDoc.length > 0 || fieldExtraInDoc.length > 0) {
    // Doc mentions things that no longer exist in code
    status = 'outdated';
  } else {
    status = 'drifted';
  }

  return {
    name: component.name,
    filePath: component.relativePath,
    documentedProps,
    actualProps,
    documentedFields,
    actualFields,
    missingFromDoc,
    extraInDoc,
    fieldMissingFromDoc,
    fieldExtraInDoc,
    status,
  };
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function driftCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  console.log('');
  logSection('AI Kit — Component Drift Detector');
  console.log(chalk.dim(`  ${projectDir}`));
  console.log('');

  // Pre-check: config must exist
  if (!fileExists(configPath)) {
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

  // Filter to components with .ai.md files
  const componentsWithDocs = scanResult.components.filter((c) => c.hasAiDoc);

  if (componentsWithDocs.length === 0) {
    spinner.warn('No components have .ai.md documentation files.');
    logInfo('Run `ai-kit generate` to create component documentation.');
    console.log('');
    return;
  }

  spinner.text = `Analyzing drift for ${componentsWithDocs.length} documented components...`;

  // Analyze each component
  const entries: DriftEntry[] = [];

  for (const component of componentsWithDocs) {
    const entry = analyzeDrift(component, projectDir);
    if (entry) {
      entries.push(entry);
    }
  }

  spinner.succeed(`Analyzed ${entries.length} components with .ai.md docs`);

  // Sort: drifted/outdated first, then in-sync
  const statusOrder: Record<string, number> = { outdated: 0, drifted: 1, 'in-sync': 2 };
  entries.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  // Count summaries
  const inSync = entries.filter((e) => e.status === 'in-sync');
  const drifted = entries.filter((e) => e.status === 'drifted');
  const outdated = entries.filter((e) => e.status === 'outdated');

  // Display table
  console.log('');
  const nameWidth = 28;
  const docPropsWidth = 12;
  const actPropsWidth = 12;
  const statusWidth = 12;

  // Header
  console.log(
    `  ${chalk.bold('Component'.padEnd(nameWidth))} ${chalk.bold('Doc Props'.padStart(docPropsWidth))} ${chalk.bold('Act Props'.padStart(actPropsWidth))} ${chalk.bold('Status'.padEnd(statusWidth))}`,
  );
  console.log(
    `  ${'─'.repeat(nameWidth)} ${'─'.repeat(docPropsWidth)} ${'─'.repeat(actPropsWidth)} ${'─'.repeat(statusWidth)}`,
  );

  for (const entry of entries) {
    const name = entry.name.length > nameWidth - 1
      ? entry.name.substring(0, nameWidth - 3) + '...'
      : entry.name.padEnd(nameWidth);

    const docProps = String(entry.documentedProps.length).padStart(docPropsWidth);
    const actProps = String(entry.actualProps.length).padStart(actPropsWidth);

    let statusLabel: string;
    switch (entry.status) {
      case 'in-sync':
        statusLabel = chalk.green('in-sync');
        break;
      case 'drifted':
        statusLabel = chalk.yellow('drifted');
        break;
      case 'outdated':
        statusLabel = chalk.red('outdated');
        break;
    }

    console.log(`  ${name} ${docProps} ${actProps} ${statusLabel}`);

    // Show details for drifted/outdated
    if (entry.status !== 'in-sync') {
      if (entry.missingFromDoc.length > 0) {
        console.log(
          chalk.dim(`    + undocumented props: ${entry.missingFromDoc.join(', ')}`),
        );
      }
      if (entry.extraInDoc.length > 0) {
        console.log(
          chalk.dim(`    - removed props (still in doc): ${entry.extraInDoc.join(', ')}`),
        );
      }
      if (entry.fieldMissingFromDoc.length > 0) {
        console.log(
          chalk.dim(`    + undocumented fields: ${entry.fieldMissingFromDoc.join(', ')}`),
        );
      }
      if (entry.fieldExtraInDoc.length > 0) {
        console.log(
          chalk.dim(`    - removed fields (still in doc): ${entry.fieldExtraInDoc.join(', ')}`),
        );
      }
    }
  }

  // Summary
  console.log('');
  console.log(
    `  ${chalk.bold('Summary:')} ${chalk.green(String(inSync.length))} in-sync · ${chalk.yellow(String(drifted.length))} drifted · ${chalk.red(String(outdated.length))} outdated`,
  );
  console.log(
    chalk.dim(`  ${scanResult.components.length} total components, ${componentsWithDocs.length} with .ai.md, ${scanResult.components.length - componentsWithDocs.length} undocumented`),
  );

  if (drifted.length > 0 || outdated.length > 0) {
    console.log('');
    logWarning('Run `ai-kit generate` to update .ai.md files for drifted components.');
  }

  console.log('');
}
