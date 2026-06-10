import {
  SessionSummaryResult,
  ActionItemsResult,
  IntelligenceStripFields,
  ClassifySessionTagsResult,
  SESSION_TAGS,
} from '@meetsolis/shared';

function parseJson(raw: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw.substring(0, 200)}`);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI response is not an object');
  }
  return parsed as Record<string, unknown>;
}

/** Parse the summary AI response — title (optional) + summary + key_topics. */
export function parseSummary(raw: string): SessionSummaryResult {
  const obj = parseJson(raw);

  if (typeof obj.summary !== 'string' || !obj.summary) {
    throw new Error('AI response missing required field: summary');
  }
  if (!Array.isArray(obj.key_topics)) {
    throw new Error('AI response missing required field: key_topics');
  }

  // Title is optional — a missing/blank title degrades gracefully rather
  // than failing the whole summary.
  const title =
    typeof obj.title === 'string' && obj.title.trim()
      ? obj.title.trim()
      : undefined;

  return {
    ...(title ? { title } : {}),
    summary: obj.summary,
    key_topics: (obj.key_topics as unknown[]).map(String),
  };
}

/** Parse the action-items AI response (Story 6.2c). */
export function parseActionItems(raw: string): ActionItemsResult {
  const obj = parseJson(raw);

  if (!Array.isArray(obj.action_items)) {
    throw new Error('AI response missing required field: action_items');
  }

  const action_items = (obj.action_items as unknown[]).map((item, i) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`action_items[${i}] is not an object`);
    }
    const ai = item as Record<string, unknown>;
    if (typeof ai.description !== 'string' || !ai.description) {
      throw new Error(`action_items[${i}].description missing`);
    }
    if (ai.assigned_to !== 'coach' && ai.assigned_to !== 'client') {
      throw new Error(
        `action_items[${i}].assigned_to must be 'coach' or 'client'`
      );
    }
    return {
      description: ai.description,
      assigned_to: ai.assigned_to as 'coach' | 'client',
    };
  });

  return { action_items };
}

/**
 * Story 7.7 — parse session tag classification JSON.
 *
 * AI returns { "tags": [...] }. Filter to closed-set SESSION_TAGS values, dedupe,
 * cap at 2, fallback to ['goal-setting'] if empty after filtering (conservative
 * default per prompt spec).
 */
export function parseSessionTags(raw: string): ClassifySessionTagsResult {
  const obj = parseJson(raw);
  if (!Array.isArray(obj.tags)) {
    throw new Error('AI tag response missing required field: tags');
  }
  const allowed = new Set<string>(SESSION_TAGS);
  const seen = new Set<string>();
  const filtered: string[] = [];
  for (const t of obj.tags as unknown[]) {
    if (typeof t !== 'string') continue;
    const tag = t.toLowerCase().trim();
    if (!allowed.has(tag) || seen.has(tag)) continue;
    seen.add(tag);
    filtered.push(tag);
    if (filtered.length >= 2) break;
  }
  const tags = filtered.length ? filtered : ['goal-setting'];
  return { tags };
}

/** Story 7.2 — parse intelligence strip JSON. Throws on malformed/missing fields. */
export function parseIntelligenceStrip(raw: string): IntelligenceStripFields {
  const obj = parseJson(raw);

  const fields = [
    'recurring_theme',
    'theme_frequency',
    'recent_breakthrough',
    'current_focus',
  ] as const;

  for (const f of fields) {
    if (typeof obj[f] !== 'string' || !obj[f]) {
      throw new Error(`AI intelligence strip missing required field: ${f}`);
    }
  }

  return {
    recurring_theme: obj.recurring_theme as string,
    theme_frequency: obj.theme_frequency as string,
    recent_breakthrough: obj.recent_breakthrough as string,
    current_focus: obj.current_focus as string,
  };
}
