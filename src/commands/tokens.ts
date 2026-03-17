import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import os from 'os';
import { logSection, logInfo, logWarning } from '../utils.js';
import { PACKAGE_ROOT } from '../constants.js';

// ─── Pricing (per 1M tokens) ──────────────────────────────────────────
const PRICING = {
  sonnet: { input: 3, output: 15, cacheRead: 0.3 },
  opus: { input: 15, output: 75, cacheRead: 0.3 },
} as const;

const PLAN_BUDGET = 20; // $20 monthly plan

// ─── Types ─────────────────────────────────────────────────────────────
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

interface SessionSummary {
  sessionId: string;
  filePath: string;
  date: string; // YYYY-MM-DD
  usage: TokenUsage;
  model: string;
  messageCount: number;
}

interface DailySummary {
  date: string;
  sessions: number;
  usage: TokenUsage;
  cost: number;
}

interface ExportData {
  generatedAt: string;
  planBudget: number;
  daily: DailySummary[];
  sessions: SessionSummary[];
  totals: {
    thisWeek: { usage: TokenUsage; cost: number; sessions: number };
    thisMonth: { usage: TokenUsage; cost: number; sessions: number };
    today: { usage: TokenUsage; cost: number; sessions: number };
  };
}

// ─── JSONL Parsing ─────────────────────────────────────────────────────
function findSessionFiles(): string[] {
  const claudeDir = path.join(os.homedir(), '.claude', 'projects');
  if (!fs.existsSync(claudeDir)) return [];

  const files: string[] = [];

  function walkDir(dir: string): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else if (entry.name.endsWith('.jsonl')) {
          files.push(full);
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }

  walkDir(claudeDir);
  return files;
}

function parseSessionFile(filePath: string): SessionSummary | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    const usage: TokenUsage = {
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
    };

    let model = 'sonnet';
    let messageCount = 0;
    let sessionDate = '';

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);

        // Extract timestamp for date grouping
        if (obj.timestamp && !sessionDate) {
          sessionDate = new Date(obj.timestamp).toISOString().slice(0, 10);
        }

        // Detect model from message content
        if (obj.model) {
          const m = String(obj.model).toLowerCase();
          if (m.includes('opus')) model = 'opus';
          else model = 'sonnet';
        }

        // Count assistant messages
        if (obj.type === 'assistant' || obj.role === 'assistant') {
          messageCount++;
        }

        // Extract usage data — Claude Code logs usage in various shapes
        const u =
          obj.usage ||
          obj.message?.usage ||
          obj.costInfo ||
          obj.result?.usage ||
          null;

        if (u) {
          usage.inputTokens += u.input_tokens || u.inputTokens || 0;
          usage.outputTokens += u.output_tokens || u.outputTokens || 0;
          usage.cacheReadTokens +=
            u.cache_read_input_tokens || u.cacheReadTokens || u.cache_read || 0;
          usage.cacheCreationTokens +=
            u.cache_creation_input_tokens ||
            u.cacheCreationTokens ||
            u.cache_creation ||
            0;
        }
      } catch {
        // skip malformed lines
      }
    }

    // Skip empty sessions
    if (usage.inputTokens === 0 && usage.outputTokens === 0) return null;

    // Fallback date from file stat
    if (!sessionDate) {
      const stat = fs.statSync(filePath);
      sessionDate = stat.mtime.toISOString().slice(0, 10);
    }

    const sessionId = path.basename(filePath, '.jsonl');

    return {
      sessionId,
      filePath,
      date: sessionDate,
      usage,
      model,
      messageCount,
    };
  } catch {
    return null;
  }
}

function calculateCost(usage: TokenUsage, model: string = 'sonnet'): number {
  const rates = model === 'opus' ? PRICING.opus : PRICING.sonnet;
  const inputCost = (usage.inputTokens / 1_000_000) * rates.input;
  const outputCost = (usage.outputTokens / 1_000_000) * rates.output;
  const cacheCost = (usage.cacheReadTokens / 1_000_000) * rates.cacheRead;
  return inputCost + outputCost + cacheCost;
}

// ─── Aggregation ───────────────────────────────────────────────────────
function aggregateByDate(sessions: SessionSummary[]): DailySummary[] {
  const map = new Map<string, { sessions: number; usage: TokenUsage; models: string[] }>();

  for (const s of sessions) {
    const existing = map.get(s.date) || {
      sessions: 0,
      usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 },
      models: [],
    };

    existing.sessions++;
    existing.usage.inputTokens += s.usage.inputTokens;
    existing.usage.outputTokens += s.usage.outputTokens;
    existing.usage.cacheReadTokens += s.usage.cacheReadTokens;
    existing.usage.cacheCreationTokens += s.usage.cacheCreationTokens;
    existing.models.push(s.model);

    map.set(s.date, existing);
  }

  return Array.from(map.entries())
    .map(([date, data]) => ({
      date,
      sessions: data.sessions,
      usage: data.usage,
      cost: calculateCost(data.usage, data.models.includes('opus') ? 'opus' : 'sonnet'),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function filterDateRange(
  sessions: SessionSummary[],
  startDate: string,
  endDate: string,
): SessionSummary[] {
  return sessions.filter((s) => s.date >= startDate && s.date <= endDate);
}

function sumUsage(sessions: SessionSummary[]): TokenUsage {
  return sessions.reduce(
    (acc, s) => ({
      inputTokens: acc.inputTokens + s.usage.inputTokens,
      outputTokens: acc.outputTokens + s.usage.outputTokens,
      cacheReadTokens: acc.cacheReadTokens + s.usage.cacheReadTokens,
      cacheCreationTokens: acc.cacheCreationTokens + s.usage.cacheCreationTokens,
    }),
    { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 },
  );
}

function sumCost(sessions: SessionSummary[]): number {
  return sessions.reduce((acc, s) => acc + calculateCost(s.usage, s.model), 0);
}

// ─── Formatting ────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function progressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = chalk.green('\u2588'.repeat(filled)) + chalk.gray('\u2591'.repeat(empty));
  return bar;
}

function printPeriodSummary(
  label: string,
  sessions: SessionSummary[],
): void {
  const usage = sumUsage(sessions);
  const cost = sumCost(sessions);

  console.log(`\n${chalk.bold(label)}`);
  console.log(`  Sessions: ${chalk.cyan(String(sessions.length))}`);
  console.log(`  Input tokens:  ${chalk.white(fmt(usage.inputTokens))}`);
  console.log(`  Output tokens: ${chalk.white(fmt(usage.outputTokens))}`);
  console.log(`  Cache read:    ${chalk.white(fmt(usage.cacheReadTokens))}`);
  console.log(`  Estimated cost: ${chalk.yellow('~' + fmtCost(cost))}`);
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function tokensCommand(options: { export?: boolean } = {}): Promise<void> {
  logSection('AI Kit \u2014 Token Usage');

  const spinner = ora('Scanning Claude Code session logs...').start();

  const sessionFiles = findSessionFiles();
  if (sessionFiles.length === 0) {
    spinner.fail('No Claude Code session logs found');
    logInfo('Session logs are stored in ~/.claude/projects/');
    logInfo('Use Claude Code to generate some activity first.');
    return;
  }

  const sessions: SessionSummary[] = [];
  for (const file of sessionFiles) {
    const s = parseSessionFile(file);
    if (s) sessions.push(s);
  }

  spinner.succeed(`Parsed ${sessions.length} sessions from ${sessionFiles.length} log files`);

  if (sessions.length === 0) {
    logWarning('No token usage data found in session logs.');
    return;
  }

  // Date ranges
  const today = new Date().toISOString().slice(0, 10);

  const dayOfWeek = new Date().getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - mondayOffset);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const monthStart = today.slice(0, 7) + '-01';

  const todaySessions = filterDateRange(sessions, today, today);
  const weekSessions = filterDateRange(sessions, weekStartStr, today);
  const monthSessions = filterDateRange(sessions, monthStart, today);

  // Print summaries
  printPeriodSummary(`Today (${today})`, todaySessions);
  printPeriodSummary('This Week', weekSessions);
  printPeriodSummary('This Month', monthSessions);

  // Budget progress
  const monthCost = sumCost(monthSessions);
  const budgetPercent = Math.min((monthCost / PLAN_BUDGET) * 100, 100);
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  const dayOfMonth = new Date().getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyAvg = dayOfMonth > 0 ? monthCost / dayOfMonth : 0;
  const estimatedDaysLeft =
    dailyAvg > 0 ? Math.floor((PLAN_BUDGET - monthCost) / dailyAvg) : daysRemaining;

  console.log(`\n${chalk.bold(`$${PLAN_BUDGET} Plan Budget`)}`);
  console.log(
    `  ${progressBar(budgetPercent)} ${Math.round(budgetPercent)}% used (~${fmtCost(monthCost)} of ${fmtCost(PLAN_BUDGET)})`,
  );
  console.log(
    `  Estimated days remaining at this rate: ${chalk.cyan(String(Math.max(estimatedDaysLeft, 0)))} days`,
  );
  console.log(`  Daily average: ${chalk.yellow(fmtCost(dailyAvg))}`);

  // Tip
  console.log(
    `\n${chalk.dim('Tip: Use /understand before modifying unfamiliar code \u2014')}`,
  );
  console.log(
    chalk.dim("     it's cheaper than a failed implementation attempt."),
  );
  console.log('');

  // Export mode
  if (options.export) {
    await exportDashboard(sessions, todaySessions, weekSessions, monthSessions);
  }
}

// ─── Export ────────────────────────────────────────────────────────────
async function exportDashboard(
  allSessions: SessionSummary[],
  todaySessions: SessionSummary[],
  weekSessions: SessionSummary[],
  monthSessions: SessionSummary[],
): Promise<void> {
  const spinner = ora('Generating dashboard...').start();

  const exportData: ExportData = {
    generatedAt: new Date().toISOString(),
    planBudget: PLAN_BUDGET,
    daily: aggregateByDate(allSessions),
    sessions: allSessions
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 50)
      .map((s) => ({
        ...s,
        filePath: s.filePath, // keep for reference
      })),
    totals: {
      today: {
        usage: sumUsage(todaySessions),
        cost: sumCost(todaySessions),
        sessions: todaySessions.length,
      },
      thisWeek: {
        usage: sumUsage(weekSessions),
        cost: sumCost(weekSessions),
        sessions: weekSessions.length,
      },
      thisMonth: {
        usage: sumUsage(monthSessions),
        cost: sumCost(monthSessions),
        sessions: monthSessions.length,
      },
    },
  };

  const outputDir = process.cwd();
  const dataPath = path.join(outputDir, 'token-data.json');
  const dashboardSrc = path.join(PACKAGE_ROOT, 'templates', 'token-dashboard.html');
  const dashboardDest = path.join(outputDir, 'token-dashboard.html');

  await fs.writeJson(dataPath, exportData, { spaces: 2 });
  logInfo(`Token data written to ${dataPath}`);

  if (await fs.pathExists(dashboardSrc)) {
    await fs.copy(dashboardSrc, dashboardDest, { overwrite: true });
    logInfo(`Dashboard copied to ${dashboardDest}`);
  } else {
    logWarning('Dashboard template not found. Skipping HTML export.');
  }

  spinner.succeed('Dashboard exported');

  // Try to open in browser
  try {
    const { exec } = await import('child_process');
    const openCmd =
      process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
          ? 'start'
          : 'xdg-open';
    exec(`${openCmd} "${dashboardDest}"`);
    logInfo('Opening dashboard in browser...');
  } catch {
    logInfo(`Open ${dashboardDest} in your browser to view the dashboard.`);
  }
}
