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

  // --- Bundle Impact Warning ---
  // Warns when new dependencies are added (standard + strict)
  if (profile !== 'minimal') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: [
            'case "$CLAUDE_FILE_PATH" in',
            '  */package.json)',
            '    ADDED=$(git diff --no-index /dev/null "$CLAUDE_FILE_PATH" 2>/dev/null | grep "^+" | grep -E \'"dependencies"|"devDependencies"\' | head -1)',
            '    if [ -n "$ADDED" ]; then',
            '      NEW_DEPS=$(git diff "$CLAUDE_FILE_PATH" 2>/dev/null | grep "^+" | grep -v "^+++" | grep -E \'"[^"]+": "[^"]+"\' | sed \'s/.*"\\([^"]*\\)".*/\\1/\' | head -5)',
            '      if [ -n "$NEW_DEPS" ]; then',
            '        echo "📦 New dependencies detected:"',
            '        echo "$NEW_DEPS" | while read dep; do echo "  → $dep"; done',
            '        echo "⚠️  Check bundle impact before committing. Run: npx bundlesize or npm run build"',
            '      fi',
            '    fi',
            '  ;;',
            'esac',
          ].join('\n'),
        },
      ],
    });
  }

  // --- Pre-Commit Review Hook ---
  // Lightweight review of staged changes before git commit (strict only)
  if (profile === 'strict') {
    preToolUse.push({
      matcher: 'Bash(git commit*)',
      hooks: [
        {
          type: 'command',
          command: [
            'STAGED=$(git diff --cached --name-only 2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$")',
            'if [ -n "$STAGED" ]; then',
            '  ISSUES=""',
            '  for f in $STAGED; do',
            '    if [ -f "$f" ]; then',
            '      # Check for any types',
            '      ANY_COUNT=$(grep -c ": any" "$f" 2>/dev/null || echo 0)',
            '      if [ "$ANY_COUNT" -gt 0 ]; then',
            '        ISSUES="$ISSUES\\n  ⚠️  $f: $ANY_COUNT \\`any\\` type(s) found"',
            '      fi',
            '      # Check for console.log',
            '      LOG_COUNT=$(grep -c "console\\.log" "$f" 2>/dev/null || echo 0)',
            '      if [ "$LOG_COUNT" -gt 0 ]; then',
            '        ISSUES="$ISSUES\\n  ⚠️  $f: $LOG_COUNT console.log(s) found"',
            '      fi',
            '      # Check for TODO without ticket',
            '      TODO_COUNT=$(grep -c "// TODO[^(]\\|// TODO$" "$f" 2>/dev/null || echo 0)',
            '      if [ "$TODO_COUNT" -gt 0 ]; then',
            '        ISSUES="$ISSUES\\n  ⚠️  $f: $TODO_COUNT TODO(s) without ticket reference"',
            '      fi',
            '    fi',
            '  done',
            '  if [ -n "$ISSUES" ]; then',
            '    echo "🔍 Pre-commit review found issues:"',
            '    printf "$ISSUES\\n"',
            '    echo "Fix these before committing, or proceed if intentional."',
            '  fi',
            'fi',
          ].join('\n'),
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
