/**
 * Story 7.2 — One-time backfill of clients.ai_intelligence_strip.
 *
 * Without this, existing clients sit blank until their next session triggers
 * the auto-regen in summarize-session.ts. Run once after Story 7.2 ships.
 *
 * Run:
 *   cd apps/web
 *   npx tsx scripts/backfill-intelligence-strips.ts
 *
 * Idempotent: skips clients that already have a strip. Pass --force to overwrite.
 * Skips clients with <2 complete sessions (AI returns "Building..." anyway).
 *
 * Cost: ~$0.0005 per client (Haiku 4.5). 200 existing clients ≈ $0.10 total.
 */

import { loadEnvConfig } from '@next/env';

// Load env BEFORE importing modules that read it.
loadEnvConfig(process.cwd());

// eslint-disable-next-line import/first
import { createClient } from '@supabase/supabase-js';
// eslint-disable-next-line import/first
import { generateIntelligenceStrip } from '../src/lib/clients/generate-intelligence-strip';

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const CONCURRENCY = 3;

interface ClientRow {
  id: string;
  user_id: string;
  name: string;
  ai_intelligence_strip: unknown;
  session_count: number;
}

async function loadClients(): Promise<ClientRow[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Pull all clients + their complete-session count via a raw query.
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT
        c.id,
        c.user_id,
        c.name,
        c.ai_intelligence_strip,
        (
          SELECT COUNT(*)::int
          FROM sessions s
          WHERE s.client_id = c.id
            AND s.status = 'complete'
            AND s.summary IS NOT NULL
        ) AS session_count
      FROM clients c
      ORDER BY c.created_at ASC;
    `,
  });

  if (error || !data) {
    // Fallback: do it in two queries (works without exec_sql RPC).
    const { data: clients, error: cErr } = await supabase
      .from('clients')
      .select('id, user_id, name, ai_intelligence_strip')
      .order('created_at', { ascending: true });
    if (cErr || !clients) throw cErr ?? new Error('Failed to load clients');

    const out: ClientRow[] = [];
    for (const c of clients) {
      const { count } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', c.id)
        .eq('status', 'complete')
        .not('summary', 'is', null);
      out.push({
        id: c.id as string,
        user_id: c.user_id as string,
        name: c.name as string,
        ai_intelligence_strip: c.ai_intelligence_strip,
        session_count: count ?? 0,
      });
    }
    return out;
  }
  return data as ClientRow[];
}

async function processClient(c: ClientRow): Promise<string> {
  if (c.ai_intelligence_strip && !FORCE) return 'skip:already_has_strip';
  if (c.session_count < 2) return 'skip:insufficient_sessions';
  if (DRY_RUN) return 'dry_run';

  const result = await generateIntelligenceStrip(c.id, c.user_id);
  if (!result.success) {
    return `fail:${result.skipped ?? result.error ?? 'unknown'}`;
  }
  return 'ok';
}

async function main() {
  const startedAt = Date.now();
  console.log(`[Backfill] FORCE=${FORCE} DRY_RUN=${DRY_RUN}`);
  const clients = await loadClients();
  console.log(`[Backfill] Loaded ${clients.length} clients`);

  const counts: Record<string, number> = {};
  let idx = 0;

  async function worker() {
    while (idx < clients.length) {
      const i = idx++;
      const c = clients[i];
      try {
        const outcome = await processClient(c);
        counts[outcome] = (counts[outcome] ?? 0) + 1;
        console.log(
          `[Backfill] ${i + 1}/${clients.length} ${c.name} (${c.session_count} sess) → ${outcome}`
        );
      } catch (err) {
        counts['error'] = (counts['error'] ?? 0) + 1;
        console.error(
          `[Backfill] ${i + 1}/${clients.length} ${c.name} → error:`,
          err
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n[Backfill] Done in ${elapsed}s. Outcomes:`);
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch(err => {
  console.error('[Backfill] Fatal:', err);
  process.exit(1);
});
