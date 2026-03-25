import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { AI_KIT_CONFIG_FILE } from '../constants.js';
import {
  logSection,
  logSuccess,
  logWarning,
  logError,
  logInfo,
  fileExists,
  dirExists,
  readFileSafe,
  readJsonSafe,
} from '../utils.js';

// ─── Types ─────────────────────────────────────────────────────────────
interface PatternMatch {
  pattern: string;
  file: string;
  line: number;
}

interface PatternCategory {
  name: string;
  patterns: {
    label: string;
    regex: RegExp;
    matches: PatternMatch[];
  }[];
}

// ─── Pattern Definitions ────────────────────────────────────────────────
function buildPatternCategories(): PatternCategory[] {
  return [
    {
      name: 'Data Fetching',
      patterns: [
        { label: 'fetch()', regex: /\bfetch\s*\(/, matches: [] },
        { label: 'axios', regex: /\baxios\b/, matches: [] },
        { label: 'useSWR', regex: /\buseSWR\b/, matches: [] },
        { label: 'useQuery (React Query)', regex: /\buseQuery\b/, matches: [] },
        { label: 'useMutation', regex: /\buseMutation\b/, matches: [] },
        { label: 'getServerSideProps', regex: /\bgetServerSideProps\b/, matches: [] },
        { label: 'getStaticProps', regex: /\bgetStaticProps\b/, matches: [] },
        { label: 'Server Actions (use server)', regex: /['"]use server['"]/, matches: [] },
      ],
    },
    {
      name: 'Error Handling',
      patterns: [
        { label: 'try/catch', regex: /\btry\s*\{/, matches: [] },
        { label: 'Error Boundary', regex: /\bErrorBoundary\b/, matches: [] },
        { label: 'error.tsx (App Router)', regex: /export\s+default.*error/i, matches: [] },
        { label: '.catch()', regex: /\.catch\s*\(/, matches: [] },
        { label: 'onError callback', regex: /\bonError\b/, matches: [] },
      ],
    },
    {
      name: 'Form Handling',
      patterns: [
        { label: 'useState (controlled)', regex: /\buseState\b.*(?:onChange|handleChange)/, matches: [] },
        { label: 'useRef (uncontrolled)', regex: /\buseRef\b/, matches: [] },
        { label: 'react-hook-form', regex: /\buseForm\b/, matches: [] },
        { label: 'Formik', regex: /\buseFormik\b|\bFormik\b/, matches: [] },
        { label: 'Zod validation', regex: /\bz\.\w+\(|zod/, matches: [] },
        { label: 'Yup validation', regex: /\byup\.\w+\(|\bYup\b/, matches: [] },
      ],
    },
    {
      name: 'Auth Patterns',
      patterns: [
        { label: 'NextAuth / Auth.js', regex: /\buseSession\b|\bgetServerSession\b|\bnext-auth\b/, matches: [] },
        { label: 'JWT handling', regex: /\bjwt\b|\bjsonwebtoken\b/, matches: [] },
        { label: 'Auth middleware', regex: /\bmiddleware\b.*auth|auth.*\bmiddleware\b/i, matches: [] },
        { label: 'Protected route', regex: /\bProtectedRoute\b|\bwithAuth\b|\brequireAuth\b/, matches: [] },
      ],
    },
    {
      name: 'State Management',
      patterns: [
        { label: 'useState', regex: /\buseState\b/, matches: [] },
        { label: 'useReducer', regex: /\buseReducer\b/, matches: [] },
        { label: 'useContext', regex: /\buseContext\b/, matches: [] },
        { label: 'Zustand', regex: /\bcreate\b.*\bset\b.*\bget\b|\bzustand\b/, matches: [] },
        { label: 'Redux', regex: /\buseSelector\b|\buseDispatch\b|\bcreateSlice\b/, matches: [] },
        { label: 'Jotai', regex: /\buseAtom\b|\batom\(/, matches: [] },
        { label: 'Recoil', regex: /\buseRecoilState\b|\brecoil\b/i, matches: [] },
      ],
    },
    {
      name: 'API Route Patterns',
      patterns: [
        { label: 'NextRequest/NextResponse', regex: /\bNextRequest\b|\bNextResponse\b/, matches: [] },
        { label: 'Route handler (GET/POST)', regex: /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH)\b/, matches: [] },
        { label: 'API route (pages)', regex: /\bNextApiRequest\b|\bNextApiResponse\b/, matches: [] },
        { label: 'tRPC', regex: /\btrpc\b|\bcreateRouter\b.*\bprocedure\b/i, matches: [] },
      ],
    },
  ];
}

// ─── File Walker ────────────────────────────────────────────────────────
const IGNORE_DIRS = [
  'node_modules', '.next', '.git', 'dist', 'build', '.turbo',
  '.storybook', 'coverage', '.cache',
];

function walkTsFiles(dir: string, files: string[]): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.includes(entry.name)) continue;
        walkTsFiles(full, files);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(full);
      }
    }
  } catch {
    // Skip unreadable directories
  }
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function patternsCommand(targetPath?: string): Promise<void> {
  const projectDir = path.resolve(targetPath || process.cwd());
  const configPath = path.join(projectDir, AI_KIT_CONFIG_FILE);

  console.log('');
  logSection('AI Kit — Pattern Library');
  console.log(chalk.dim(`  ${projectDir}`));
  console.log('');

  // Pre-check: config must exist
  if (!fileExists(configPath)) {
    logWarning('ai-kit.config.json not found. Run `ai-kit init` first.');
    return;
  }

  // Discover files
  const spinner = ora('Scanning for code patterns...').start();

  const files: string[] = [];
  const srcDir = path.join(projectDir, 'src');
  if (dirExists(srcDir)) {
    walkTsFiles(srcDir, files);
  } else {
    walkTsFiles(projectDir, files);
  }

  if (files.length === 0) {
    spinner.fail('No TypeScript/JavaScript files found.');
    return;
  }

  spinner.text = `Analyzing ${files.length} files for patterns...`;

  // Build categories and scan
  const categories = buildPatternCategories();

  for (const file of files) {
    const content = readFileSafe(file);
    if (!content) continue;

    const lines = content.split('\n');

    for (const category of categories) {
      for (const pattern of category.patterns) {
        for (let i = 0; i < lines.length; i++) {
          if (pattern.regex.test(lines[i])) {
            pattern.matches.push({
              pattern: pattern.label,
              file: path.relative(projectDir, file),
              line: i + 1,
            });
          }
        }
      }
    }
  }

  spinner.succeed(`Scanned ${files.length} files`);

  // Display results
  let totalPatterns = 0;

  for (const category of categories) {
    const activePatterns = category.patterns.filter((p) => p.matches.length > 0);
    if (activePatterns.length === 0) continue;

    console.log(`\n  ${chalk.bold(category.name)}`);

    for (const pattern of activePatterns) {
      const count = pattern.matches.length;
      totalPatterns += count;
      const uniqueFiles = new Set(pattern.matches.map((m) => m.file)).size;
      console.log(
        `    ${chalk.green('✓')} ${chalk.white(pattern.label)}: ${chalk.cyan(String(count))} occurrences in ${chalk.cyan(String(uniqueFiles))} files`,
      );
    }
  }

  if (totalPatterns === 0) {
    logInfo('No recognizable patterns found.');
    return;
  }

  // Write output file
  const outputDir = path.join(projectDir, 'ai-kit');
  fs.ensureDirSync(outputDir);
  const outputPath = path.join(outputDir, 'patterns.md');

  const lines: string[] = [
    '# Code Patterns',
    '',
    `> Auto-generated by ai-kit on ${new Date().toISOString().split('T')[0]}`,
    `> Scanned ${files.length} files`,
    '',
  ];

  for (const category of categories) {
    const activePatterns = category.patterns.filter((p) => p.matches.length > 0);
    if (activePatterns.length === 0) continue;

    lines.push(`## ${category.name}`, '');
    lines.push('| Pattern | Occurrences | Files |');
    lines.push('| ------- | ----------: | ----: |');

    for (const pattern of activePatterns) {
      const uniqueFiles = new Set(pattern.matches.map((m) => m.file)).size;
      lines.push(`| ${pattern.label} | ${pattern.matches.length} | ${uniqueFiles} |`);
    }

    lines.push('');

    // List top files per pattern
    for (const pattern of activePatterns) {
      if (pattern.matches.length <= 3) continue;
      const fileCounts = new Map<string, number>();
      for (const m of pattern.matches) {
        fileCounts.set(m.file, (fileCounts.get(m.file) || 0) + 1);
      }
      const topFiles = Array.from(fileCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      lines.push(`### ${pattern.label} — top files`, '');
      for (const [file, count] of topFiles) {
        lines.push(`- \`${file}\` (${count})`);
      }
      lines.push('');
    }
  }

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');

  console.log('');
  logSuccess(`Pattern library written to ${chalk.cyan('ai-kit/patterns.md')}`);
  logInfo(`Total: ${chalk.bold(String(totalPatterns))} pattern occurrences across ${chalk.bold(String(files.length))} files`);
  console.log('');
}
