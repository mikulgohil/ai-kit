# Bug Fix Workflow

Guided workflow for fixing bugs systematically.

## Step 1: Gather Information
Ask the developer:
1. Which file(s) have the bug?
2. What should happen vs. what actually happens?
3. Any error messages? (paste them)
4. Steps to reproduce?

## Step 2: Investigate
1. Read the reported file(s)
2. Trace the data flow from input to output
3. Check for common causes:
   - Null/undefined access
   - Wrong variable or stale closure
   - Missing await on async calls
   - Off-by-one errors
   - Incorrect conditional logic
   - Wrong event handler binding
   - CSS specificity or layout issues

## Step 3: Propose Fix
1. Explain the root cause clearly
2. Show the minimal fix (don't refactor unrelated code)
3. Highlight what changed and why
4. List any side effects of the fix

## Step 4: Verify
1. Suggest how to test the fix
2. List edge cases to verify
3. Check if similar bugs exist elsewhere in the codebase

Target file(s): $ARGUMENTS
