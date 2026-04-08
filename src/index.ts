import { Command } from 'commander';
import { VERSION } from './constants.js';
import { registerCommands } from './cli/register-commands.js';

const program = new Command();

program
  .name('ai-kit')
  .description(
    'AI-powered project setup — generates CLAUDE.md, .cursorrules, slash commands, and guides tailored to your stack.',
  )
  .version(VERSION);

registerCommands(program);

program.parse();
