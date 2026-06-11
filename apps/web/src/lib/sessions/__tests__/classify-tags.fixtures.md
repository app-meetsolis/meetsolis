# Session Tag Classifier — Synthetic Fixtures (Story 7.7)

10 synthetic session summaries with expected tag outputs.

**Real-data validation is DEFERRED to post-launch** (within 2 weeks of first Pro coach onboarding — same precedent as Story 7.2 intelligence strip).

Use these fixtures only as a sanity check during dev. They are NOT a substitute for the production prompt gate which requires ≥10 real coaching sessions scored against three rubrics (specificity, groundedness, clinical-drift).

## Closed enum

`breakthrough`, `stuck`, `milestone`, `goal-setting`

Conservative rules:

- 1 tag if uncertain
- Default for unclear sessions: `goal-setting`
- Never invent tags outside the enum

## Fixtures

### 1. Clear breakthrough

**Summary:** Client articulated for the first time that imposter syndrome surfaces specifically before board presentations, never before peer-level meetings. Connected pattern to childhood feedback about "talking too much." Shifted from seeing the anxiety as a flaw to seeing it as a signal to slow down.
**Key topics:** imposter syndrome, board meetings, pattern recognition
**Expected tags:** `["breakthrough"]`

### 2. Clear stuck

**Summary:** Client returned to delegation challenges from session 4. Acknowledges intellectually that micromanagement is hurting team, but cannot bring herself to release control of the Q3 product launch. Same loop as last three sessions — names the problem, then defends against changing.
**Key topics:** delegation, control, defensiveness
**Expected tags:** `["stuck"]`

### 3. Clear milestone

**Summary:** Client completed the difficult conversation with her co-founder that she had been avoiding for six weeks. Reported the conversation went better than expected; co-founder validated her concerns and agreed to a revised partnership structure. Visibly relieved and proud.
**Key topics:** difficult conversation, co-founder, partnership restructure
**Expected tags:** `["milestone"]`

### 4. Clear goal-setting

**Summary:** Session focused on defining the next quarter's priorities. Client outlined three competing goals — hiring a VP of Engineering, finalizing the Series B round, and launching the new product line. Worked together to rank by impact and identify which one would be sacrificed if needed.
**Key topics:** quarterly planning, prioritization, goal-setting
**Expected tags:** `["goal-setting"]`

### 5. Breakthrough + goal-setting

**Summary:** Major shift this session — client realized that her constant "I'm not ready" refrain about hiring is actually about her not being ready to release her identity as the technical founder. Used the rest of the session to redefine what success looks like as a CEO who hires technical leaders.
**Key topics:** identity, founder transition, hiring, self-image
**Expected tags:** `["breakthrough","goal-setting"]`

### 6. Milestone + breakthrough

**Summary:** Client finally launched the podcast she had been planning for eight months. In recording the first episode, she realized she had been over-preparing as a way to delay; the actual recording took 40 minutes and felt easy. Aha: perfectionism was procrastination in disguise.
**Key topics:** podcast launch, perfectionism, procrastination
**Expected tags:** `["milestone","breakthrough"]`

### 7. Stuck + goal-setting

**Summary:** Client unable to articulate a clear direction for the next 90 days. Cycled between three competing options without committing to any. Session ended with agreement to journal between sessions about what she would do if no one was watching.
**Key topics:** direction, indecision, journaling exercise
**Expected tags:** `["stuck","goal-setting"]`

### 8. Ambiguous — defaults to goal-setting

**Summary:** Client gave a high-level update on the past month. Mentioned promotion happened. Briefly discussed the upcoming offsite. No clear theme emerged; coach used the session as a check-in.
**Key topics:** check-in, monthly update
**Expected tags:** `["goal-setting"]` (default for unclear)

### 9. Empty summary edge case

**Summary:**
**Key topics:**
**Expected tags:** `["goal-setting"]` (default — never throw)

### 10. Stuck but progressing

**Summary:** Client struggled with the homework from last session — could not bring herself to send the network outreach emails. However, in talking through the resistance, she identified that her real fear is being seen as "asking for help" rather than fear of rejection. Coach reframed: send 1 email instead of 10.
**Key topics:** outreach, fear of judgment, reframe
**Expected tags:** `["stuck","breakthrough"]` OR `["breakthrough"]` (both acceptable — model can be conservative or full)

## How to validate (post-launch)

**One command — when ≥10 real sessions exist from a consented Pro coach:**

```bash
cd apps/web
npx tsx scripts/validate-session-tags.ts             # 10 most-recent completed sessions
npx tsx scripts/validate-session-tags.ts --limit=20
npx tsx scripts/validate-session-tags.ts --user=<uuid>  # scope to one coach
```

The script:

- Loads N most-recent completed sessions
- Re-runs each through the live AI service's `classifySessionTags`
- Prints per-session detail + an aggregate score
- Flags out-of-enum (invented) tags
- Exits PASS if accuracy ≥80% AND zero invented tags

If FAIL: iterate `SESSION_TAGS_SYSTEM_PROMPT_V1` in `apps/web/src/lib/ai/prompts.ts`, bump version to `V2` if shipped, re-run script.

**Privacy:** the script reads raw session summaries. Run only with explicit coach consent. Output contains transcript-derived text — do NOT paste into public channels.

**Cost:** ~$0.00005 per classification (Haiku 4.5). 50 sessions ≈ $0.0025.
