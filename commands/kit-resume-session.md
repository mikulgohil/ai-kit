# Resume Session — Restore Previous Context

Restore context from a saved session and continue where you left off.

## Process

### 1. Find the Session
- Look in `ai-kit/sessions/` for saved session files
- List available sessions sorted by date (most recent first)
- If user specifies a topic, filter by filename
- Otherwise, offer the most recent session

### 2. Read and Summarize
Read the session file and present:
- **What was done**: summary of previous work
- **What's pending**: remaining checklist items
- **Key decisions**: important context from last time
- **Files involved**: which files were being worked on

### 3. Verify Current State
Before resuming work, check:
- Are the files from the session still in the expected state?
- Have other changes been made since the session was saved?
- Is the build currently passing?
- Are there any uncommitted changes that might conflict?

### 4. Resume
- Pick up from the first unchecked item in the pending list
- Reference previous decisions to maintain consistency
- Update the session file as work progresses

## If No Sessions Found
- Check `ai-kit/sessions/` directory exists
- Suggest running `/kit-save-session` at the end of future sessions
- Offer to start fresh by creating a new session

## Tips
- Always verify file state before making changes — the codebase may have evolved
- If significant time has passed, re-read modified files for context
- Update the session file when work is complete
