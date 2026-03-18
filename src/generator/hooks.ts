import type { ProjectScan, HooksConfig, HookDefinition, HookProfile } from '../types.js';

export function generateHooks(
  scan: ProjectScan,
  profile: HookProfile = 'standard',
): HooksConfig {
  const hooks: HooksConfig = {};

  const preToolUse: HookDefinition[] = [];
  const postToolUse: HookDefinition[] = [];
  const stop: HookDefinition[] = [];

  // --- PreToolUse hooks ---

  // Git push safety reminder (all profiles)
  preToolUse.push({
    matcher: 'Bash(git push*)',
    hooks: [
      {
        type: 'command',
        command:
          'echo "⚠️  Review your changes before pushing. Run tests and type-check first."',
      },
    ],
  });

  // --- PostToolUse hooks ---

  // Auto-format on file edit
  if (scan.tools.biome) {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: `npx @biomejs/biome check --write --unsafe "$CLAUDE_FILE_PATH" 2>/dev/null || true`,
        },
      ],
    });
  } else if (scan.tools.prettier) {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: `npx prettier --write "$CLAUDE_FILE_PATH" 2>/dev/null || true`,
        },
      ],
    });
  }

  // TypeScript type-check after edits (standard + strict)
  if (scan.typescript && profile !== 'minimal') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command:
            'case "$CLAUDE_FILE_PATH" in *.ts|*.tsx) npx tsc --noEmit --pretty 2>&1 | head -20 ;; esac',
        },
      ],
    });
  }

  // ESLint check after edits (strict only)
  if (scan.tools.eslint && profile === 'strict') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command:
            'case "$CLAUDE_FILE_PATH" in *.ts|*.tsx|*.js|*.jsx) npx eslint "$CLAUDE_FILE_PATH" --max-warnings 0 2>&1 | head -15 ;; esac',
        },
      ],
    });
  }

  // Console.log warning (standard + strict)
  if (profile !== 'minimal') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command:
            'case "$CLAUDE_FILE_PATH" in *.ts|*.tsx|*.js|*.jsx) grep -n "console\\.log" "$CLAUDE_FILE_PATH" && echo "⚠️  console.log detected — remove before committing" || true ;; esac',
        },
      ],
    });
  }

  // --- Stop hooks ---

  // Console.log check in all modified files (strict only)
  if (profile === 'strict') {
    stop.push({
      matcher: '',
      hooks: [
        {
          type: 'command',
          command:
            'git diff --name-only --diff-filter=M 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | xargs grep -l "console\\.log" 2>/dev/null && echo "⚠️  console.log found in modified files" || true',
        },
      ],
    });
  }

  if (preToolUse.length > 0) hooks.PreToolUse = preToolUse;
  if (postToolUse.length > 0) hooks.PostToolUse = postToolUse;
  if (stop.length > 0) hooks.Stop = stop;

  return hooks;
}

export function generateSettingsLocal(
  scan: ProjectScan,
  profile: HookProfile = 'standard',
): Record<string, unknown> {
  const hooks = generateHooks(scan, profile);

  return {
    hooks,
  };
}
