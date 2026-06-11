/**
 * Story 7.7 — Real-data prompt-gate validation for the session-tag classifier.
 *
 * Loads the N most-recent COMPLETED sessions from the live DB, runs each through
 * the configured AI service's classifySessionTags, and prints results in a format
 * suitable for human scoring. Run this AFTER the first Pro coach has produced ≥10
 * real sessions.
 *
 * Run:
 *   cd apps/web
 *   npx tsx scripts/validate-session-tags.ts                  # 10 sessions, default
 *   npx tsx scripts/validate-session-tags.ts --limit=20       # custom N
 *   npx tsx scripts/validate-session-tags.ts --json           # JSON output for tooling
 *   npx tsx scripts/validate-session-tags.ts --user=<uuid>    # scope to one coach
 *
 * What to do with the output:
 *   1. Score each row against the rubric in
 *      apps/web/src/lib/sessions/__tests__/classify-tags.fixtures.md
 *      (accuracy / conservatism / default handling).
 *   2. Target: ≥80% accuracy, zero invented tags.
 *   3. If below threshold, iterate on SESSION_TAGS_SYSTEM_PROMPT_V1 in
 *      apps/web/src/lib/ai/prompts.ts (bump version to V2 if shipped).
 *
 * Privacy: this script reads raw session summaries. Run only with explicit
 * coach consent. The output contains transcript-derived text — do NOT paste
 * into public channels.
 *
 * Cost: ~$0.00005 per session classified (Haiku 4.5). 50 sessions ≈ $0.0025.
 */

import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

// eslint-disable-next-line import/first
import { createClient } from '@supabase/supabase-js';
// eslint-disable-next-line import/first
import { ServiceFactory } from '../src/lib/service-factory';

function parseArgs() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const userArg = args.find(a => a.startsWith('--user='));
  return {
    limit: limitArg ? parseInt(limitArg.split('=')[1] ?? '10', 10) : 10,
    user: userArg ? userArg.split('=')[1] : null,
    json: args.includes('--json'),
  };
}

interface SessionRow {
  id: string;
  session_date: string;
  title: string;
  summary: string | null;
  key_topics: string[] | null;
  tags: string[] | null;
}

async function loadSessions(
  limit: number,
  userId: string | null
): Promise<SessionRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let query = supabase
    .from('sessions')
    .select('id, session_date, title, summary, key_topics, tags')
    .eq('status', 'complete')
    .not('summary', 'is', null)
    .order('session_date', { ascending: false })
    .limit(limit);
  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SessionRow[];
}

interface RunResult {
  session_id: string;
  date: string;
  title: string;
  summary_preview: string;
  key_topics: string[];
  stored_tags: string[];
  classified_tags: string[];
  match: boolean;
  error?: string;
}

async function classifyOne(
  session: SessionRow,
  ai: ReturnType<typeof ServiceFactory.createAIService>
): Promise<RunResult> {
  const stored = session.tags ?? [];
  try {
    const result = await ai.classifySessionTags({
      summary: session.summary ?? '',
      key_topics: session.key_topics ?? [],
    });
    const classified = result.tags;
    return {
      session_id: session.id,
      date: session.session_date,
      title: session.title,
      summary_preview: (session.summary ?? '').slice(0, 160) + '…',
      key_topics: session.key_topics ?? [],
      stored_tags: stored,
      classified_tags: classified,
      match:
        stored.length === classified.length &&
        stored.every(t => classified.includes(t)),
    };
  } catch (err) {
    return {
      session_id: session.id,
      date: session.session_date,
      title: session.title,
      summary_preview: (session.summary ?? '').slice(0, 160) + '…',
      key_topics: session.key_topics ?? [],
      stored_tags: stored,
      classified_tags: [],
      match: false,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

function printText(results: RunResult[]) {
  console.log(`\n=== Session Tag Classifier — Real-Data Validation ===`);
  console.log(`Sessions classified: ${results.length}`);
  const matches = results.filter(r => r.match).length;
  const errors = results.filter(r => r.error).length;
  const accuracy = ((matches / results.length) * 100).toFixed(1);
  console.log(`Matches stored: ${matches} (${accuracy}%)`);
  console.log(`Errors: ${errors}`);

  // Check for any classified tags outside the enum
  const ENUM = new Set(['breakthrough', 'stuck', 'milestone', 'goal-setting']);
  const invented = results.flatMap(r =>
    r.classified_tags.filter(t => !ENUM.has(t))
  );
  console.log(`Invented (out-of-enum) tags: ${invented.length}`);

  console.log(`\n--- Per-session detail ---\n`);
  for (const r of results) {
    console.log(`Session ${r.session_id} (${r.date}) — ${r.title}`);
    console.log(`  Summary:        ${r.summary_preview}`);
    console.log(`  Key topics:     ${r.key_topics.join(', ') || '(none)'}`);
    console.log(`  Stored tags:    [${r.stored_tags.join(', ')}]`);
    console.log(`  Classifier:     [${r.classified_tags.join(', ')}]`);
    console.log(
      `  Match:          ${r.match ? '✓' : '✗'}${r.error ? '   ERROR: ' + r.error : ''}`
    );
    console.log();
  }

  console.log(`--- Score against the rubric ---`);
  console.log(`Target: accuracy ≥80%, zero invented tags.`);
  console.log(
    `Current run: ${accuracy}% accuracy, ${invented.length} invented tag(s).`
  );
  if (Number(accuracy) < 80 || invented.length > 0) {
    console.log(
      `\nACTION: iterate SESSION_TAGS_SYSTEM_PROMPT_V1 in apps/web/src/lib/ai/prompts.ts.`
    );
  } else {
    console.log(`\nPASS: classifier meets the prompt-gate bar.`);
  }
}

async function main() {
  const { limit, user, json } = parseArgs();
  console.error(
    `Loading up to ${limit} sessions${user ? ` for user ${user}` : ''}…`
  );
  const sessions = await loadSessions(limit, user);

  if (sessions.length === 0) {
    console.error(
      'No sessions found. Run after at least one Pro coach has completed sessions.'
    );
    process.exit(1);
  }

  const ai = ServiceFactory.createAIService();
  console.error(`Classifying ${sessions.length} session(s)…`);

  const results: RunResult[] = [];
  // Serial to keep cost predictable + avoid rate limits; small N.
  for (const session of sessions) {
    results.push(await classifyOne(session, ai));
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printText(results);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
