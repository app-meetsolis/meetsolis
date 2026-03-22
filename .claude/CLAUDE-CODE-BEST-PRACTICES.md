# Claude Code Best Practices (from YouTube Analysis)

Source: 60-tip Claude Code best practices video, analyzed and applied to MeetSolis on 2026-03-10.

---

## Workflow: The Right Session Structure

### Plan → Execute in SEPARATE sessions
1. **Session 1 (Planning)** — Switch to plan mode (Shift+Tab), describe the feature, let Claude explore codebase, review the plan thoroughly, save it to `plans/{YYYY-MM-DD}/{HH-MM}-{title}.md`, then CLOSE the session
2. **Session 2 (Execution)** — Open fresh session, reference the saved plan, accept edits automatically
3. **Session 3 (QA)** — Run QA agent, save gate file

Why: executing in the same session as planning pollutes context with exploration noise.

### Start a NEW session when:
- Moving to a different feature/task
- Context hits 50%+ (quality degrades above this)
- Agent starts repeating itself or going in circles
- You've compacted more than 3 times

### Batch similar tasks in one session
- All API fixes together, all UI fixes together — don't mix unrelated concerns

---

## Context Window Management

- **Target: 0–50%** before starting any task. Check with `/context`
- Above 50% → start new session
- Above 70% → agent quality degrades significantly
- Use `/compact` manually instead of auto-compact (more control)
- Don't compact more than 3 times — start fresh instead
- Audit `/context` regularly: check for skill bloat and memory file bloat
- Don't read entire files unnecessarily — ask for specific sections

---

## CLAUDE.md Architecture

- **Hierarchical files load progressively** — only relevant ones load per context
  - User-level (`~/.claude/CLAUDE.md`) → global rules for all projects
  - Project root (`CLAUDE.md`) → project-wide rules
  - Subfolder (`apps/web/CLAUDE.md`) → frontend-only rules
  - Environment (`~/.claude/CLAUDE.local.md`) → machine-specific facts
- Keep each CLAUDE.md **as short as possible**
- Extract long reference material to separate files, reference them from CLAUDE.md
- Remove stale content regularly (it wastes context tokens every session)
- Don't follow random Twitter hype about what to add to CLAUDE.md

---

## Subagent Strategy (most impactful tip)

- **Always include a "WHY"** in every subagent prompt
  - Bad: *"research the clients table"*
  - Good: *"research the clients table schema to understand available columns so I can write the correct INSERT query"*
- The WHY filters signal from noise — subagents return targeted results, not generic ones
- Aggressively defer to subagents: online research, docs lookup, codebase exploration, log analysis
- When stuck in circles: spawn a fresh subagent with full context for a new perspective
- Multiple subagents: give each a distinct focus area to avoid overlapping summaries

---

## File Size Rule

- **No file should exceed 500 lines**
- Files over 500 lines force Claude to read the entire file before every edit — wastes context
- Split by concern before adding more code
- Audit periodically: `find apps/web/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20`

---

## Model Selection Guide

| Task Type | Model | Examples |
|---|---|---|
| Mechanical/checklist | Haiku | execute-checklist, index-docs, apply-qa-fixes |
| Reasoning/medium | Sonnet | story creation, code review, bug fixing, QA gate |
| Deep planning | Opus | architecture decisions, complex problem solving |

Assign models in skill frontmatter:
```yaml
---
model: claude-haiku-4-5-20251001
---
```

---

## Plan Archival

- Save every planning session output to `plans/{YYYY-MM-DD}/{HH-MM}-{title}.md`
- Example: `plans/2026-03-10/14-32-client-detail-view.md`
- Reference it in the execution session: *"plan is at plans/2026-03-10/..."*
- Archive lets you roll back if implementation goes wrong
- Compare old plans to see how your prompting and model capability has evolved

---

## Bug Fix Workflow

1. Document every fix attempt (use `.claude/bug-fix-template.md`)
2. When stuck: new session with the attempt history as context
3. Eventually find root cause via pattern recognition
4. Apply **Occam's Razor**: keep the simplest possible fix, remove all unrelated changes from failed attempts

---

## Rewind Tool

- Use `/rewind` aggressively for course correction — go back to before the agent went wrong
- Give better guidance on the rewind, don't argue with the current direction
- Much better than trying to undo bad changes manually

---

## Communication with Claude

- **Speak the agent's language** — read the thinking trace (verbose mode) to learn exact terminology the agent uses
- Use domain-specific terms: "secondary button" not just "button", "debounced autosave" not "save automatically"
- Extract codebase-specific terminology from reasoning traces and use it in future prompts
- Turn on verbose output to see token count + full reasoning trace

---

## Screenshots & Visual Work

- Right-size screenshots — not too small, not too large
- Pair a full-page screenshot with a zoomed-in crop of the specific area
- For stuck UI work: Gemini CLI has better visual understanding than Claude

---

## Skills & Slash Commands

- Create slash commands for repeated workflows (e.g., `/branch-commit-pr`)
- Add `disable_model_invocation: true` to skills that should only be called manually (never auto-triggered)
- Define model in frontmatter per skill — don't let everything default to Opus

---

## Package Choices

- Prefer **well-known packages** — more training data = first-try correct code
- This stack is well-known: Next.js App Router, Tailwind, Shadcn, Zod, tRPC, Supabase, Clerk
- For recent/obscure packages: enable Exa MCP for live documentation search

---

## What We Decided NOT to Implement

| Tip | Reason skipped |
|---|---|
| HyperWhisper voice-to-text | Nice-to-have, not workflow-critical |
| Exa MCP | Only needed for recent packages; our stack is well-known |
| Worktrees | Solo workflow doesn't need parallel isolation |
| Gemini CLI for UI | Only when Claude is stuck on visual work |

---

## Files Created From This Analysis

| File | Purpose |
|---|---|
| `apps/web/CLAUDE.md` | Frontend-specific rules (routes, components, Tailwind) |
| `apps/web/src/app/CLAUDE.md` | App Router conventions |
| `~/.claude/CLAUDE.local.md` | Windows machine facts (no jq, Node v22) |
| `.claude/library-quirks.md` | Tech gotchas and stack quirks |
| `.claude/vocabulary.md` | Domain + codebase terminology |
| `.claude/bug-fix-template.md` | Structured debugging log |
| `plans/README.md` | Plans archive convention |
| BMad agent files | Added "WHY in subagents" strategy to dev/pm/qa/architect |
| BMad task files | Model assignments (haiku/sonnet) + disable_model_invocation flags |
