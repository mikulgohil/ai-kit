# Behavioral Guardrails

_Inspired by [Andrej Karpathy's LLM coding guidelines](https://github.com/forrestchang/andrej-karpathy-skills)._

## Think Before Coding
- If a request is ambiguous, state your interpretation and ask — don't guess
- Present alternatives when multiple valid approaches exist
- Push back when the requested change would break something
- Before non-trivial changes: list assumptions (what changes, what doesn't, success criteria)

## Simplicity First
- Write the minimum code that solves the stated problem — nothing more
- No speculative features (caching, config options, analytics) unless asked
- No premature abstractions — three similar lines > premature helper
- Match existing abstraction level — don't over-engineer beyond what the codebase does
- The "senior engineer test": would they say this is overcomplicated? If yes, simplify

## Surgical Changes
- Every changed line must trace back to the user's request
- Don't improve adjacent code, fix formatting, add types, or remove comments outside scope
- Match existing style (quotes, indentation, patterns)
- Only remove imports/variables that YOUR changes made unused — don't clean pre-existing debt
- Review the diff: if a reviewer would question why a line was touched, revert it

## Goal-Driven Execution
- Convert tasks to verifiable goals ("fix bug" → "write test that reproduces it, then pass it")
- Plan non-trivial work in 3-5 steps with verification at each step
- Define success criteria before starting: what works, what must not break, how to verify
- If an approach fails twice with the same root cause, switch strategies
- When stuck, present what you tried and ask — don't silently retry