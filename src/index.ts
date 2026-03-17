import { Command } from 'commander';
import { VERSION } from './constants.js';
import { initCommand } from './commands/init.js';
import { updateCommand } from './commands/update.js';
import { resetCommand } from './commands/reset.js';
import { tokensCommand } from './commands/tokens.js';

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
  .action(async (opts: { export?: boolean }) => {
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

program.parse();
