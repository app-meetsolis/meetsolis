/**
 * @jest-environment node
 *
 * AI Prep Note prompt-eval harness (Story 6.4 — BRAINSTORM §9 GATE).
 *
 * Uses the node test environment so the live-eval path can load the real
 * `openai` SDK (its web-runtime shims crash under jsdom — TECH-001).
 */

import fs from 'fs';
import path from 'path';
import {
  AI_PREP_NOTE_SYSTEM_PROMPT,
  buildPrepNoteUserPrompt,
  type PrepNoteInput,
} from '../ai-prep-note';
import {
  parseSuggestedQuestions,
  SUGGESTED_QUESTIONS_SYSTEM_PROMPT,
} from '../suggested-questions';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

function loadFixtures(): string[] {
  if (!fs.existsSync(FIXTURES_DIR)) return [];
  return fs.readdirSync(FIXTURES_DIR).filter(f => /^\d+\.json$/.test(f));
}

describe('AI Prep Note prompt', () => {
  it('system prompt bans generic output and wall-of-text', () => {
    expect(AI_PREP_NOTE_SYSTEM_PROMPT).toMatch(/BANNED/);
    expect(AI_PREP_NOTE_SYSTEM_PROMPT.toLowerCase()).toContain('pattern');
    expect(AI_PREP_NOTE_SYSTEM_PROMPT.toLowerCase()).toContain('wall of text');
  });

  it('builds a prompt that includes the client name and goal', () => {
    const input: PrepNoteInput = {
      clientName: 'Sarah Chen',
      clientGoal: 'Lead with less control',
      clientNotes: '',
      recentSessions: [
        { date: '2026-05-04', summary: 'Delegation.', keyTopics: ['trust'] },
      ],
      openActionItems: ['Draft OKRs'],
      retrievedSessions: [],
      isFirstSession: false,
    };
    const prompt = buildPrepNoteUserPrompt(input);
    expect(prompt).toContain('Sarah Chen');
    expect(prompt).toContain('Lead with less control');
    expect(prompt).toContain('Draft OKRs');
  });

  it('uses a simplified prompt for first sessions', () => {
    const prompt = buildPrepNoteUserPrompt({
      clientName: 'New Client',
      clientGoal: 'Goal',
      clientNotes: 'Some notes',
      recentSessions: [],
      openActionItems: [],
      retrievedSessions: [],
      isFirstSession: true,
    });
    expect(prompt).toContain('FIRST session');
  });
});

describe('Suggested questions parsing', () => {
  it('strips numbering, bullets, and quotes; caps at 3', () => {
    const raw = '1. First?\n- Second?\n"Third?"\n4) Fourth?';
    expect(parseSuggestedQuestions(raw)).toEqual([
      'First?',
      'Second?',
      'Third?',
    ]);
  });

  it('ignores blank lines', () => {
    expect(parseSuggestedQuestions('\n\nOnly one?\n\n')).toEqual(['Only one?']);
  });

  it('has a system prompt requiring exactly 3 questions', () => {
    expect(SUGGESTED_QUESTIONS_SYSTEM_PROMPT).toMatch(
      /3 (opening )?questions/i
    );
  });
});

describe('Prompt-eval corpus (BRAINSTORM §9 gate)', () => {
  const fixtures = loadFixtures();

  if (fixtures.length === 0) {
    it.todo(
      'PM: add 10 transcript fixtures to fixtures/ (see README) then run npm test -- prep-note-eval'
    );
    return;
  }

  for (const file of fixtures) {
    it(`builds a valid prompt for ${file}`, () => {
      const input: PrepNoteInput = JSON.parse(
        fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
      );
      const prompt = buildPrepNoteUserPrompt(input);
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain(input.clientName);
    });
  }
});

/**
 * LIVE eval — actually calls the AI provider and prints each prep note for
 * manual review against the ideal-*.md notes. Opt-in only:
 *
 *   RUN_PREP_EVAL=1 AI_PROVIDER=claude ANTHROPIC_API_KEY=sk-... \
 *     npm test -- prep-note-eval
 *
 * Skipped by default so CI never spends tokens.
 */
const runLive = process.env.RUN_PREP_EVAL === '1';

(runLive ? describe : describe.skip)('Prompt-eval — LIVE outputs', () => {
  const fixtures = loadFixtures();
  const OUTPUT_DIR = path.join(FIXTURES_DIR, '..', 'eval-output');

  beforeAll(() => {
    if (!fs.existsSync(OUTPUT_DIR))
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  });

  for (const file of fixtures) {
    it(`generates a prep note for ${file}`, async () => {
      // Imported lazily so CI runs never load the AI service layer.
      const { ServiceFactory } = await import('@/lib/service-factory');
      const input: PrepNoteInput = JSON.parse(
        fs.readFileSync(path.join(FIXTURES_DIR, file), 'utf8')
      );
      const note = await ServiceFactory.createAIService().generatePrepNote(
        AI_PREP_NOTE_SYSTEM_PROMPT,
        buildPrepNoteUserPrompt(input)
      );

      // Persist for manual review against the ideal-*.md notes.
      const outFile = path.join(OUTPUT_DIR, file.replace(/\.json$/, '.md'));
      const body = `# ${file} — ${input.clientName}\n\n${note}\n`;
      fs.writeFileSync(outFile, body, 'utf8');

      // eslint-disable-next-line no-console
      console.log(
        `\n===== ${file} — ${input.clientName} =====\n${note}\n` +
          '='.repeat(60)
      );
      expect(note.trim().length).toBeGreaterThan(0);
    }, 60_000);
  }
});
