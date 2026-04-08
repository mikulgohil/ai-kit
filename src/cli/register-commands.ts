import type { Command } from 'commander';
import { initCommand } from '../commands/init.js';
import { updateCommand } from '../commands/update.js';
import { resetCommand } from '../commands/reset.js';
import { tokensCommand } from '../commands/tokens.js';
import { doctorCommand } from '../commands/doctor.js';
import { diffCommand } from '../commands/diff.js';
import { exportCommand } from '../commands/export.js';
import { statsCommand } from '../commands/stats.js';
import { auditCommand } from '../commands/audit.js';
import { healthCommand } from '../commands/health.js';
import { patternsCommand } from '../commands/patterns.js';
import { deadCodeCommand } from '../commands/dead-code.js';
import { driftCommand } from '../commands/drift.js';
import { componentRegistryCommand } from '../commands/component-registry.js';
import { rollbackCommand } from '../commands/rollback.js';
import { migrateCommand } from '../commands/migrate.js';
import { withErrorHandler } from './error-handler.js';

export function registerCommands(program: Command): void {
  program
    .command('init')
    .description('Scan your project and generate AI configs')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await initCommand(targetPath);
    }));

  program
    .command('update')
    .description('Re-scan and update all generated AI configs')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await updateCommand(targetPath);
    }));

  program
    .command('reset')
    .description('Remove all AI Kit generated files')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await resetCommand(targetPath);
    }));

  program
    .command('tokens')
    .description('Show token usage summary and cost estimates')
    .option('--export', 'Export data and open HTML dashboard')
    .option('--csv', 'Export daily usage to CSV file')
    .option('--budget <amount>', 'Monthly budget in USD (default: $20)', parseFloat)
    .action(withErrorHandler(async (opts: { export?: boolean; csv?: boolean; budget?: number }) => {
      await tokensCommand(opts);
    }));

  program
    .command('doctor')
    .description('Diagnose AI Kit setup and check for issues')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await doctorCommand(targetPath);
    }));

  program
    .command('diff')
    .description('Show what would change on update (dry run)')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await diffCommand(targetPath);
    }));

  program
    .command('export')
    .description('Export rules to other AI tools (Windsurf, Aider, Cline)')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .option('--format <format>', 'Export format: windsurf, aider, cline, or all')
    .action(withErrorHandler(async (targetPath?: string, opts?: { format?: string }) => {
      await exportCommand(targetPath, opts);
    }));

  program
    .command('stats')
    .description('Show project setup statistics and complexity')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await statsCommand(targetPath);
    }));

  program
    .command('audit')
    .description('Security and configuration audit for AI agent setup')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await auditCommand(targetPath);
    }));

  program
    .command('health')
    .description('One-glance project health — setup, security, stack, tools, and docs')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await healthCommand(targetPath);
    }));

  program
    .command('patterns')
    .description('Generate a pattern library from recurring code patterns')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await patternsCommand(targetPath);
    }));

  program
    .command('dead-code')
    .description('Find unused components and dead code')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await deadCodeCommand(targetPath);
    }));

  program
    .command('drift')
    .description('Detect drift between component code and .ai.md documentation')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await driftCommand(targetPath);
    }));

  program
    .command('component-registry')
    .description('Generate a component registry for AI agent discovery')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .action(withErrorHandler(async (targetPath?: string) => {
      await componentRegistryCommand(targetPath);
    }));

  program
    .command('rollback')
    .description('Restore AI configs from a previous backup')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .option('--latest', 'Restore most recent backup without selection prompt')
    .action(withErrorHandler(async (targetPath?: string, opts?: { latest?: boolean }) => {
      await rollbackCommand(targetPath, opts?.latest);
    }));

  program
    .command('migrate')
    .description('Adopt ai-kit in a project with existing CLAUDE.md/.cursorrules')
    .argument('[path]', 'Project directory (defaults to current directory)')
    .option('--dry-run', 'Preview migration without writing files')
    .action(withErrorHandler(async (targetPath?: string, opts?: { dryRun?: boolean }) => {
      await migrateCommand(targetPath, opts);
    }));
}
