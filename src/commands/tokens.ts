import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import os from 'os';
import { logSection, logInfo, logSuccess, logWarning } from '../utils.js';
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
  projectName: string; // extracted from parent directory name
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
    const projectName = path.basename(path.dirname(filePath));

    return {
      sessionId,
      filePath,
      date: sessionDate,
      usage,
      model,
      messageCount,
      projectName,
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

// ─── Project Breakdown ──────────────────────────────────────────────────
function printProjectBreakdown(sessions: SessionSummary[]): void {
  const projectMap = new Map<string, { sessions: number; cost: number }>();

  for (const s of sessions) {
    const existing = projectMap.get(s.projectName) || { sessions: 0, cost: 0 };
    existing.sessions++;
    existing.cost += calculateCost(s.usage, s.model);
    projectMap.set(s.projectName, existing);
  }

  const sorted = Array.from(projectMap.entries())
    .sort((a, b) => b[1].cost - a[1].cost);

  console.log(`\n${chalk.bold('Per-Project Breakdown')}`);
  for (const [name, data] of sorted.slice(0, 10)) {
    const bar = progressBar((data.cost / sumCost(sessions)) * 100, 15);
    console.log(`  ${bar} ${chalk.yellow(fmtCost(data.cost))} ${chalk.dim(`(${data.sessions} sessions)`)} ${name}`);
  }
}

// ─── Trend Analysis ─────────────────────────────────────────────────────
function printTrendAnalysis(sessions: SessionSummary[]): void {
  const today = new Date();

  // This week
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  const thisWeekStr = thisWeekStart.toISOString().slice(0, 10);

  // Last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStartStr = lastWeekStart.toISOString().slice(0, 10);
  const lastWeekEndStr = lastWeekEnd.toISOString().slice(0, 10);

  const todayStr = today.toISOString().slice(0, 10);
  const thisWeekSessions = filterDateRange(sessions, thisWeekStr, todayStr);
  const lastWeekSessions = filterDateRange(sessions, lastWeekStartStr, lastWeekEndStr);

  const thisWeekCost = sumCost(thisWeekSessions);
  const lastWeekCost = sumCost(lastWeekSessions);

  if (lastWeekCost > 0) {
    const change = ((thisWeekCost - lastWeekCost) / lastWeekCost) * 100;
    const arrow = change > 0 ? chalk.red('\u2191') : change < 0 ? chalk.green('\u2193') : chalk.dim('\u2192');
    const changeStr = change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;

    console.log(`\n${chalk.bold('Week-over-Week Trend')}`);
    console.log(`  Last week: ${chalk.yellow(fmtCost(lastWeekCost))} (${lastWeekSessions.length} sessions)`);
    console.log(`  This week: ${chalk.yellow(fmtCost(thisWeekCost))} (${thisWeekSessions.length} sessions)`);
    console.log(`  Change: ${arrow} ${changeStr}`);
  }
}

// ─── ROI Estimate ───────────────────────────────────────────────────────
function printRoiEstimate(sessions: SessionSummary[], monthCost: number): void {
  // Estimate: each AI session saves ~15 minutes of developer time on average
  const AVG_MINUTES_SAVED_PER_SESSION = 15;
  const DEVELOPER_HOURLY_RATE = 75; // USD estimate

  const totalSessions = sessions.length;
  const minutesSaved = totalSessions * AVG_MINUTES_SAVED_PER_SESSION;
  const hoursSaved = minutesSaved / 60;
  const valueSaved = hoursSaved * DEVELOPER_HOURLY_RATE;
  const roi = monthCost > 0 ? ((valueSaved - monthCost) / monthCost) * 100 : 0;

  console.log(`\n${chalk.bold('ROI Estimate')} ${chalk.dim('(based on ~15 min saved per session)')}`);
  console.log(`  Sessions this month: ${chalk.cyan(String(totalSessions))}`);
  console.log(`  Estimated time saved: ${chalk.cyan(`${hoursSaved.toFixed(1)} hours`)} (${minutesSaved} min)`);
  console.log(`  Estimated value saved: ${chalk.green(fmtCost(valueSaved))} (at $${DEVELOPER_HOURLY_RATE}/hr)`);
  console.log(`  AI cost: ${chalk.yellow(fmtCost(monthCost))}`);
  if (roi > 0) {
    console.log(`  ROI: ${chalk.green(`${roi.toFixed(0)}%`)}`);
  }
}

// ─── Main Command ──────────────────────────────────────────────────────
export async function tokensCommand(options: { export?: boolean; csv?: boolean; budget?: number } = {}): Promise<void> {
  logSection('AI Kit \u2014 Token Usage');

  const budget = options.budget || PLAN_BUDGET;

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
  const budgetPercent = Math.min((monthCost / budget) * 100, 100);
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  const dayOfMonth = new Date().getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyAvg = dayOfMonth > 0 ? monthCost / dayOfMonth : 0;
  const estimatedDaysLeft =
    dailyAvg > 0 ? Math.floor((budget - monthCost) / dailyAvg) : daysRemaining;

  console.log(`\n${chalk.bold(`$${budget} Plan Budget`)}`);
  console.log(
    `  ${progressBar(budgetPercent)} ${Math.round(budgetPercent)}% used (~${fmtCost(monthCost)} of ${fmtCost(budget)})`,
  );
  console.log(
    `  Estimated days remaining at this rate: ${chalk.cyan(String(Math.max(estimatedDaysLeft, 0)))} days`,
  );
  console.log(`  Daily average: ${chalk.yellow(fmtCost(dailyAvg))}`);

  // Budget alerts
  if (budgetPercent >= 90) {
    console.log(chalk.red.bold('\n  \u26a0 ALERT: Over 90% of monthly budget used!'));
  } else if (budgetPercent >= 75) {
    console.log(chalk.yellow('\n  \u26a0 Warning: Over 75% of monthly budget used.'));
  } else if (budgetPercent >= 50) {
    console.log(chalk.blue('\n  \u2139 Note: Over 50% of monthly budget used.'));
  }

  // Model recommendations
  const opusSessions = monthSessions.filter(s => s.model === 'opus');
  const sonnetSessions = monthSessions.filter(s => s.model === 'sonnet');
  const opusCost = sumCost(opusSessions);
  const sonnetCost = sumCost(sonnetSessions);

  if (opusCost > sonnetCost * 2 && opusSessions.length > 5) {
    console.log(`\n${chalk.bold('Model Recommendation')}`);
    console.log(`  Opus usage: ${chalk.yellow(fmtCost(opusCost))} (${opusSessions.length} sessions)`);
    console.log(`  Sonnet usage: ${chalk.yellow(fmtCost(sonnetCost))} (${sonnetSessions.length} sessions)`);
    console.log(chalk.dim('  Tip: Use Sonnet for routine tasks (reviews, tests, docs) and Opus for complex tasks (architecture, debugging).'));
  }

  // Per-project breakdown
  printProjectBreakdown(monthSessions);

  // Trend analysis
  printTrendAnalysis(sessions);

  // ROI estimate
  printRoiEstimate(monthSessions, monthCost);

  // Tip
  console.log(
    `\n${chalk.dim('Tip: Use /kit-understand before modifying unfamiliar code \u2014')}`,
  );
  console.log(
    chalk.dim("     it's cheaper than a failed implementation attempt."),
  );
  console.log('');

  // CSV export
  if (options.csv) {
    const csvPath = path.join(process.cwd(), 'token-usage.csv');
    const csvHeader = 'Date,Sessions,Input Tokens,Output Tokens,Cache Tokens,Cost\n';
    const daily = aggregateByDate(sessions);
    const csvRows = daily.map(d =>
      `${d.date},${d.sessions},${d.usage.inputTokens},${d.usage.outputTokens},${d.usage.cacheReadTokens},${d.cost.toFixed(2)}`
    ).join('\n');
    await fs.writeFile(csvPath, csvHeader + csvRows, 'utf-8');
    logSuccess(`CSV exported to ${csvPath}`);
  }

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
    const { execFile } = await import('child_process');
    const openCmd =
      process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
          ? 'start'
          : 'xdg-open';
    execFile(openCmd, [dashboardDest]);
    logInfo('Opening dashboard in browser...');
  } catch {
    logInfo(`Open ${dashboardDest} in your browser to view the dashboard.`);
  }
}
