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

  // --- Mistakes Auto-Capture Hook ---
  // Captures build/lint/typecheck failures into docs/mistakes-log.md
  if (profile !== 'minimal') {
    postToolUse.push({
      matcher: 'Bash',
      hooks: [
        {
          type: 'command',
          command: [
            'if [ "$CLAUDE_TOOL_EXIT_CODE" != "0" ] && [ -n "$CLAUDE_TOOL_EXIT_CODE" ]; then',
            '  OUTPUT="$CLAUDE_TOOL_OUTPUT"',
            '  IS_BUILD_ERROR=false',
            '  case "$OUTPUT" in',
            '    *"error TS"*|*"tsc"*) IS_BUILD_ERROR=true ;;',
            '    *"ESLint"*|*"eslint"*|*"Lint error"*) IS_BUILD_ERROR=true ;;',
            '    *"Build error"*|*"build failed"*|*"ELIFECYCLE"*) IS_BUILD_ERROR=true ;;',
            '    *"Module not found"*|*"Cannot find module"*) IS_BUILD_ERROR=true ;;',
            '    *"SyntaxError"*|*"TypeError"*) IS_BUILD_ERROR=true ;;',
            '  esac',
            '  if [ "$IS_BUILD_ERROR" = "true" ]; then',
            '    LOG_FILE="docs/mistakes-log.md"',
            '    if [ -f "$LOG_FILE" ]; then',
            '      DATE=$(date +"%Y-%m-%d %H:%M")',
            '      ERROR_PREVIEW=$(echo "$OUTPUT" | grep -i "error" | head -3 | sed "s/^/  /")',
            '      {',
            '        echo ""',
            '        echo "### $DATE — Build/lint failure (auto-captured)"',
            '        echo "- **What happened**: Command exited with code $CLAUDE_TOOL_EXIT_CODE"',
            '        echo "- **Error preview**:"',
            '        echo "\\`\\`\\`"',
            '        echo "$ERROR_PREVIEW"',
            '        echo "\\`\\`\\`"',
            '        echo "- **Root cause**: <!-- TODO: Fill in after investigating -->"',
            '        echo "- **Fix**: <!-- TODO: How was it resolved? -->"',
            '        echo "- **Lesson**: <!-- TODO: What to do differently -->"',
            '        echo ""',
            '        echo "---"',
            '      } >> "$LOG_FILE"',
            '      echo "📝 Mistake auto-logged to docs/mistakes-log.md"',
            '    fi',
            '  fi',
            'fi',
          ].join('\n'),
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
