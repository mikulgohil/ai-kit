import type { ProjectScan, HooksConfig, HookDefinition, HookProfile } from '../types.js';
import { VERSION } from '../constants.js';

export function generateHooks(
  scan: ProjectScan,
  profile: HookProfile = 'standard',
): HooksConfig {
  const hooks: HooksConfig = {};

  const sessionStart: HookDefinition[] = [];
  const preToolUse: HookDefinition[] = [];
  const postToolUse: HookDefinition[] = [];
  const postCompact: HookDefinition[] = [];
  const stop: HookDefinition[] = [];

  // --- SessionStart hooks ---

  // Echo project context at the start of every session (all profiles)
  const stackParts = [
    scan.framework === 'nextjs'
      ? `Next.js ${scan.nextjsVersion || ''}`.trim()
      : scan.framework,
    scan.routerType ? `(${scan.routerType} router)` : '',
    scan.cms !== 'none' ? scan.cms : '',
    scan.styling.length > 0 ? scan.styling.join(', ') : '',
  ].filter(Boolean);

  const scriptNames = Object.keys(scan.scripts).slice(0, 8).join(', ');
  const stackStr = stackParts.join(' + ');

  sessionStart.push({
    matcher: '',
    hooks: [
      {
        type: 'command',
        command: [
          `echo "📋 ai-kit v${VERSION} | Stack: ${stackStr}"`,
          `echo "   PM: ${scan.packageManager} | Scripts: ${scriptNames}"`,
          scan.monorepo
            ? `echo "   Monorepo: ${scan.monorepoTool || 'yes'}"`
            : '',
          `if [ -f "ai-kit.config.json" ]; then SCAN_DATE=$(node -e "try{const c=JSON.parse(require('fs').readFileSync('ai-kit.config.json','utf8'));console.log(c.generatedAt?.split('T')[0]||'unknown')}catch{console.log('unknown')}" 2>/dev/null); echo "   Last scan: $SCAN_DATE"; fi`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
  });

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

  // --- Pre-Edit Investigation Reminder ---
  // Warns before editing large files to encourage reading them first (standard + strict)
  if (profile !== 'minimal') {
    preToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: [
            'if [ -f "$CLAUDE_FILE_PATH" ]; then',
            '  LINES=$(wc -l < "$CLAUDE_FILE_PATH" 2>/dev/null || echo 0)',
            '  if [ "$LINES" -gt 150 ]; then',
            '    echo "📖 Large file ($LINES lines): $CLAUDE_FILE_PATH"',
            '    echo "   Ensure you have read the full file before editing to avoid missing imports or breaking invariants."',
            '  fi',
            'fi',
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

  // --- Config Weakening Guard ---
  // Detects eslint-disable, @ts-ignore/@ts-nocheck, and strict:false additions (strict only)
  if (profile === 'strict') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: [
            'if [ -f "$CLAUDE_FILE_PATH" ]; then',
            '  GUARDS=""',
            '  case "$CLAUDE_FILE_PATH" in',
            '    *.ts|*.tsx|*.js|*.jsx|*.mjs)',
            '      DISABLE=$(grep -c "eslint-disable" "$CLAUDE_FILE_PATH" 2>/dev/null || echo 0)',
            '      if [ "$DISABLE" -gt 0 ]; then',
            '        GUARDS="${GUARDS}\\n  ⚠️  eslint-disable: $DISABLE directive(s) found — weakens linting"',
            '      fi',
            '      SUPPRESS=$(grep -cE "@ts-ignore|@ts-nocheck" "$CLAUDE_FILE_PATH" 2>/dev/null || echo 0)',
            '      if [ "$SUPPRESS" -gt 0 ]; then',
            '        GUARDS="${GUARDS}\\n  ⚠️  TypeScript suppression: $SUPPRESS @ts-ignore/@ts-nocheck found"',
            '      fi',
            '      ;;',
            '    *tsconfig*.json)',
            '      if grep -qE \'"strict"[[:space:]]*:[[:space:]]*false|"noImplicitAny"[[:space:]]*:[[:space:]]*false\' "$CLAUDE_FILE_PATH" 2>/dev/null; then',
            '        GUARDS="${GUARDS}\\n  ⚠️  TypeScript strict mode disabled — this weakens type safety"',
            '      fi',
            '      ;;',
            '  esac',
            '  if [ -n "$GUARDS" ]; then',
            '    echo "🛡️  Config guard triggered in $CLAUDE_FILE_PATH:"',
            '    printf "$GUARDS\\n"',
            '    echo "   Confirm these are intentional before committing."',
            '  fi',
            'fi',
          ].join('\n'),
        },
      ],
    });
  }

  // --- Credential Scan ---
  // Detects hardcoded secrets and credentials in edited files (strict only)
  if (profile === 'strict') {
    postToolUse.push({
      matcher: 'Edit|Write',
      hooks: [
        {
          type: 'command',
          command: [
            'case "$CLAUDE_FILE_PATH" in',
            '  *.ts|*.tsx|*.js|*.jsx|*.json|*.yaml|*.yml)',
            '    CREDS=$(grep -inE "(apikey|api_key|secret_key|access_token|private_key|password|auth_token)[[:space:]]*[:=][[:space:]]*[^$][^[:space:]]{8,}" "$CLAUDE_FILE_PATH" 2>/dev/null | grep -v "process\\.env" | head -3)',
            '    if [ -n "$CREDS" ]; then',
            '      echo "🔐 Credential scan — potential secret detected in $CLAUDE_FILE_PATH:"',
            '      echo "$CREDS"',
            '      echo "   Move real secrets to .env and reference via process.env — never commit credentials."',
            '    fi',
            '    ;;',
            'esac',
          ].join('\n'),
        },
      ],
    });
  }

  // --- PostCompact hooks ---

  // Re-echo critical context after context compaction (standard + strict)
  if (profile !== 'minimal') {
    postCompact.push({
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: [
            'echo "🔄 Context was compacted. Key reminders:"',
            'if [ -f "CLAUDE.md" ]; then echo "  → CLAUDE.md is loaded — project rules are preserved"; fi',
            'if [ -f "ai-kit.config.json" ]; then',
            '  STACK=$(node -e "try{const c=JSON.parse(require(\'fs\').readFileSync(\'ai-kit.config.json\',\'utf8\'));console.log([c.scanResult.framework,c.scanResult.cms,c.scanResult.styling?.join(\',\')].filter(Boolean).join(\' + \'))}catch{}" 2>/dev/null)',
            '  if [ -n "$STACK" ]; then echo "  → Tech stack: $STACK"; fi',
            'fi',
            'echo "  → Run /effort to adjust reasoning depth if needed"',
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

  if (sessionStart.length > 0) hooks.SessionStart = sessionStart;
  if (preToolUse.length > 0) hooks.PreToolUse = preToolUse;
  if (postToolUse.length > 0) hooks.PostToolUse = postToolUse;
  if (postCompact.length > 0) hooks.PostCompact = postCompact;
  if (stop.length > 0) hooks.Stop = stop;

  return hooks;
}

export function generateSettingsLocal(
  scan: ProjectScan,
  profile: HookProfile = 'standard',
): Record<string, unknown> {
  const hooks = generateHooks(scan, profile);

  return {
    env: {
      CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '65',
    },
    hooks,
  };
}
