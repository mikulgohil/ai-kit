import { Command } from 'commander';
import { VERSION } from './constants.js';
import { initCommand } from './commands/init.js';
import { updateCommand } from './commands/update.js';
import { resetCommand } from './commands/reset.js';
import { tokensCommand } from './commands/tokens.js';
import { doctorCommand } from './commands/doctor.js';
import { diffCommand } from './commands/diff.js';
import { exportCommand } from './commands/export.js';
import { statsCommand } from './commands/stats.js';
import { auditCommand } from './commands/audit.js';

const program = new Command();

program
  .name('ai-kit')
  .description(
    'AI-powered project setup — generates CLAUDE.md, .cursorrules, slash commands, and guides tailored to your stack.',
  )
  .version(VERSION);

program
  .command('init')
  .description('Scan your project and generate AI configs')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await initCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Re-scan and update all generated AI configs')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await updateCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('reset')
  .description('Remove all AI Kit generated files')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await resetCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('tokens')
  .description('Show token usage summary and cost estimates')
  .option('--export', 'Export data and open HTML dashboard')
  .option('--csv', 'Export daily usage to CSV file')
  .option('--budget <amount>', 'Monthly budget in USD (default: $20)', parseFloat)
  .action(async (opts: { export?: boolean; csv?: boolean; budget?: number }) => {
    try {
      await tokensCommand(opts);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Diagnose AI Kit setup and check for issues')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await doctorCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Show what would change on update (dry run)')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await diffCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('export')
  .description('Export rules to other AI tools (Windsurf, Aider, Cline)')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .option('--format <format>', 'Export format: windsurf, aider, cline, or all')
  .action(async (targetPath?: string, opts?: { format?: string }) => {
    try {
      await exportCommand(targetPath, opts);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show project setup statistics and complexity')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await statsCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program
  .command('audit')
  .description('Security and configuration audit for AI agent setup')
  .argument('[path]', 'Project directory (defaults to current directory)')
  .action(async (targetPath?: string) => {
    try {
      await auditCommand(targetPath);
    } catch (err) {
      if ((err as Error).name === 'ExitPromptError') {
        process.exit(0);
      }
      console.error(err);
      process.exit(1);
    }
  });

program.parse();
