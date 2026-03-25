import path from 'path';
import fs from 'fs-extra';
import type { ComponentInfo, ComponentScanResult } from '../scanner/components.js';
import { readFileSafe } from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
export interface ComponentDocOptions {
  confluenceBaseUrl?: string;
  overwrite?: boolean;
}

// ─── Health Score ──────────────────────────────────────────────────────
function calculateHealthScore(component: ComponentInfo): number {
  let score = 0;
  const max = 100;

  // Has props documented (auto-extracted) — 15 points
  if (component.props.length > 0) score += 15;

  // Has tests — 25 points
  if (component.hasTests) score += 25;

  // Has Storybook story — 20 points
  if (component.hasStory) score += 20;

  // Has existing AI doc — 15 points
  if (component.hasAiDoc) score += 15;

  // Has Sitecore integration documented — 10 points
  const sc = component.sitecore;
  if (sc.datasourceFields.length > 0 || sc.renderingParams.length > 0 || sc.placeholders.length > 0) {
    score += 10;
  }

  // Has dependencies mapped — 5 points
  if (component.dependencies.length > 0) score += 5;

  // Has clear export — 10 points
  if (component.exportType === 'default' || component.exportType === 'both') score += 10;

  return Math.min(score, max);
}

// ─── Frontmatter Generation ───────────────────────────────────────────
function generateFrontmatter(component: ComponentInfo): string {
  const health = calculateHealthScore(component);
  const today = new Date().toISOString().slice(0, 10);

  let yaml = '---\n';
  yaml += `name: ${component.name}\n`;
  yaml += `category: ${component.category}\n`;
  yaml += `path: ${component.relativePath}\n`;
  yaml += 'confluence_spec: ""\n';

  // Sitecore section (only if Sitecore-related)
  const sc = component.sitecore;
  const hasSitecore = sc.usesContext || sc.datasourceFields.length > 0 ||
    sc.renderingParams.length > 0 || sc.placeholders.length > 0;

  if (hasSitecore) {
    yaml += 'sitecore:\n';
    if (sc.datasourceFields.length > 0) {
      yaml += `  datasource_fields: [${sc.datasourceFields.join(', ')}]\n`;
    }
    if (sc.renderingParams.length > 0) {
      yaml += `  rendering_params: [${sc.renderingParams.join(', ')}]\n`;
    }
    if (sc.placeholders.length > 0) {
      yaml += `  placeholders: [${sc.placeholders.join(', ')}]\n`;
    }
    if (sc.graphqlQueries.length > 0) {
      yaml += `  graphql_queries: [${sc.graphqlQueries.join(', ')}]\n`;
    }
    yaml += `  uses_context: ${sc.usesContext}\n`;
  }

  // Health section
  yaml += 'health:\n';
  yaml += `  has_tests: ${component.hasTests}\n`;
  yaml += `  has_story: ${component.hasStory}\n`;
  yaml += `  has_spec: false\n`;
  yaml += `  score: ${health}\n`;

  yaml += `last_modified: ${today}\n`;
  yaml += '---';

  return yaml;
}

// ─── Props Table ──────────────────────────────────────────────────────
function generatePropsTable(component: ComponentInfo): string {
  if (component.props.length === 0) {
    return '| Prop | Type | Required | Description |\n|------|------|----------|-------------|\n| — | — | — | No props detected. Add props interface to component. |';
  }

  let table = '| Prop | Type | Required | Description |\n';
  table += '|------|------|----------|-------------|\n';

  for (const prop of component.props) {
    const required = prop.required ? 'Yes' : 'No';
    table += `| ${prop.name} | \`${prop.type}\` | ${required} | <!-- TODO: Add description --> |\n`;
  }

  return table;
}

// ─── Sitecore Section ─────────────────────────────────────────────────
function generateSitecoreSection(component: ComponentInfo): string {
  const sc = component.sitecore;
  const hasSitecore = sc.usesContext || sc.datasourceFields.length > 0 ||
    sc.renderingParams.length > 0 || sc.placeholders.length > 0;

  if (!hasSitecore) return '';

  let section = '\n## Sitecore Integration\n\n';

  if (sc.datasourceFields.length > 0) {
    section += '**Datasource Fields:**\n';
    for (const field of sc.datasourceFields) {
      section += `- \`${field}\` — <!-- TODO: Field type (Single-Line Text, Rich Text, Image, etc.) -->\n`;
    }
    section += '\n';
  }

  if (sc.renderingParams.length > 0) {
    section += '**Rendering Parameters:**\n';
    for (const param of sc.renderingParams) {
      section += `- \`${param}\` — <!-- TODO: Parameter type and allowed values -->\n`;
    }
    section += '\n';
  }

  if (sc.placeholders.length > 0) {
    section += '**Placeholders:**\n';
    for (const ph of sc.placeholders) {
      section += `- \`${ph}\` — <!-- TODO: Allowed renderings -->\n`;
    }
    section += '\n';
  }

  if (sc.graphqlQueries.length > 0) {
    section += '**GraphQL Queries:**\n';
    for (const query of sc.graphqlQueries) {
      section += `- \`${query}\`\n`;
    }
    section += '\n';
  }

  if (sc.usesContext) {
    section += '> Uses `useSitecoreContext` — this component accesses page-level Sitecore context.\n\n';
  }

  return section;
}

// ─── Dependencies Section ─────────────────────────────────────────────
function generateDependenciesSection(component: ComponentInfo): string {
  if (component.dependencies.length === 0) return '';

  let section = '\n## Dependencies\n\n';
  section += '**Uses these components:**\n';
  for (const dep of component.dependencies) {
    section += `- \`${dep}\`\n`;
  }
  section += '\n';

  return section;
}

// ─── Full Document ────────────────────────────────────────────────────
export function generateComponentDoc(component: ComponentInfo): string {
  const today = new Date().toISOString().slice(0, 10);

  let doc = generateFrontmatter(component);
  doc += '\n\n';
  doc += `# ${component.name}\n\n`;
  doc += '> <!-- TODO: Brief description of what this component does and when to use it. -->\n\n';

  // Props
  doc += '## Props\n\n';
  doc += generatePropsTable(component);
  doc += '\n';

  // Usage
  doc += '\n## Usage\n\n';
  doc += '```tsx\n';
  if (component.exportType === 'default') {
    doc += `import ${component.name} from './${component.name}';\n`;
  } else {
    doc += `import { ${component.name} } from './${component.name}';\n`;
  }
  doc += '\n';
  doc += `<${component.name} />\n`;
  doc += '```\n';

  // Sitecore
  doc += generateSitecoreSection(component);

  // Dependencies
  doc += generateDependenciesSection(component);

  // States
  doc += '\n## States\n\n';
  doc += '- **Loading**: <!-- How does it look while data is loading? -->\n';
  doc += '- **Error**: <!-- What does the user see on failure? -->\n';
  doc += '- **Empty**: <!-- What if there\'s no data? -->\n';

  // Confluence spec notes
  doc += '\n## Confluence Spec Notes\n\n';
  doc += '> Link the functional spec in the `confluence_spec` frontmatter field above.\n';
  doc += '> Then add key requirements, accepted variants, and deferred items here.\n\n';
  doc += '- <!-- TODO: Key requirement from spec -->\n';

  // Design decisions
  doc += '\n## Design Decisions\n\n';
  doc += '- <!-- TODO: Why was this built this way? Note any trade-offs. -->\n';

  // Edge cases
  doc += '\n## Edge Cases\n\n';
  doc += '- <!-- TODO: List known edge cases and how they\'re handled. -->\n';

  // Change log
  doc += '\n## Change Log\n\n';
  doc += `- ${today}: AI doc generated by ai-kit scan-components\n`;

  return doc;
}

// ─── Merge Logic ──────────────────────────────────────────────────────
const AI_DOC_MARKER_START = '<!-- AI-KIT:COMPONENT-START -->';
const AI_DOC_MARKER_END = '<!-- AI-KIT:COMPONENT-END -->';

function mergeExistingDoc(existing: string, component: ComponentInfo): string {
  // If the existing doc has our markers, update only the auto-generated section
  if (existing.includes(AI_DOC_MARKER_START) && existing.includes(AI_DOC_MARKER_END)) {
    const beforeStart = existing.indexOf(AI_DOC_MARKER_START);
    const afterEnd = existing.indexOf(AI_DOC_MARKER_END) + AI_DOC_MARKER_END.length;

    const before = existing.substring(0, beforeStart);
    const after = existing.substring(afterEnd);

    const autoSection = generateAutoSection(component);
    return `${before}${AI_DOC_MARKER_START}\n${autoSection}\n${AI_DOC_MARKER_END}${after}`;
  }

  // If no markers, preserve the entire existing document — don't overwrite manual work
  return existing;
}

function generateAutoSection(component: ComponentInfo): string {
  const today = new Date().toISOString().slice(0, 10);
  let section = `<!-- Auto-updated by ai-kit on ${today} -->\n`;

  // Update frontmatter-style metadata as comments
  section += `<!-- health_score: ${calculateHealthScore(component)} -->\n`;
  section += `<!-- has_tests: ${component.hasTests} -->\n`;
  section += `<!-- has_story: ${component.hasStory} -->\n`;
  section += `<!-- props_count: ${component.props.length} -->\n`;

  if (component.sitecore.datasourceFields.length > 0) {
    section += `<!-- sitecore_fields: ${component.sitecore.datasourceFields.join(', ')} -->\n`;
  }
  if (component.sitecore.renderingParams.length > 0) {
    section += `<!-- sitecore_params: ${component.sitecore.renderingParams.join(', ')} -->\n`;
  }

  return section;
}

// ─── Write Component Docs ─────────────────────────────────────────────
export async function writeComponentDocs(
  projectPath: string,
  scanResult: ComponentScanResult,
  options: ComponentDocOptions = {},
): Promise<{ created: string[]; updated: string[]; skipped: string[] }> {
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const component of scanResult.components) {
    const dir = path.dirname(component.filePath);
    const docFileName = `${component.name}.ai.md`;
    const docPath = path.join(dir, docFileName);

    const existing = readFileSafe(docPath);

    if (existing) {
      if (options.overwrite) {
        // Full overwrite
        const content = generateComponentDoc(component);
        await fs.writeFile(docPath, content, 'utf-8');
        updated.push(component.name);
      } else {
        // Smart merge — update auto-generated parts, preserve manual edits
        const merged = mergeExistingDoc(existing, component);
        if (merged !== existing) {
          await fs.writeFile(docPath, merged, 'utf-8');
          updated.push(component.name);
        } else {
          skipped.push(component.name);
        }
      }
    } else {
      // Create new doc
      const content = generateComponentDoc(component);
      await fs.writeFile(docPath, content, 'utf-8');
      created.push(component.name);
    }
  }

  return { created, updated, skipped };
}

// ─── Export health calculator for registry ─────────────────────────────
export { calculateHealthScore };
