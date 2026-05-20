# AI Prep Note — prompt-eval corpus (Story 6.4 §9 GATE)

The AI Prep Note is the Coach Brief hero feature. Per BRAINSTORM §9, the prompt
must clear a quality bar against a 10-case corpus before the story ships.

## Status: corpus delivered

`01.json` … `10.json` — 10 synthetic coaching contexts (`PrepNoteInput` shape,
see `../../ai-prep-note.ts`). Varied on purpose:

| File | Context                                          |
| ---- | ------------------------------------------------ |
| 01   | Long-running client — delegation / control       |
| 02   | Crisis session — biggest customer just churned   |
| 03   | First-ever session (no history)                  |
| 04   | Goal-setting — new COO defining his role         |
| 05   | Boundaries — chronic overcommitting              |
| 06   | Leadership transition — IC → engineering manager |
| 07   | Founder burnout — unsustainable pace             |
| 08   | Imposter syndrome — first-time CTO               |
| 09   | Career-pivot decision                            |
| 10   | Co-founder conflict                              |

`ideal-01.md`, `ideal-05.md`, `ideal-09.md` — hand-written "ideal" prep notes.
These are the quality bar: specific names, one named pattern, one question or
reframe, one breakthrough reference, tight narrative, no wall of text.

## Running the eval

**Structural check (CI, no tokens):**

```
npm test -- prep-note-eval
```

Validates every fixture builds a well-formed prompt.

**Live quality check (opt-in, spends Claude tokens):**

```
RUN_PREP_EVAL=1 AI_PROVIDER=claude ANTHROPIC_API_KEY=sk-... npm test -- prep-note-eval
```

Calls Claude for all 10 fixtures and prints each prep note to the console.

## The §9 gate — sign-off

1. Run the live eval.
2. Read all 10 generated notes. Compare 01 / 05 / 09 to their `ideal-*.md`.
3. Score each: does it name ONE real pattern, offer ONE question/reframe,
   stay specific and narrative, avoid generic filler?
4. Iterate the prompt in `../../ai-prep-note.ts` until **8 / 10+** clear the bar.
5. Record the pass in the Story 6.4 QA notes — that closes the gate.
