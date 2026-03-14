import { SessionSummary } from '@meetsolis/shared';

export function parseSessionSummary(raw: string): SessionSummary {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw.substring(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('AI response is not an object');
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title) {
    throw new Error('AI response missing required field: title');
  }
  if (typeof obj.summary !== 'string' || !obj.summary) {
    throw new Error('AI response missing required field: summary');
  }
  if (!Array.isArray(obj.key_topics)) {
    throw new Error('AI response missing required field: key_topics');
  }
  if (!Array.isArray(obj.action_items)) {
    throw new Error('AI response missing required field: action_items');
  }

  const action_items = (obj.action_items as unknown[]).map((item, i) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`action_items[${i}] is not an object`);
    }
    const ai = item as Record<string, unknown>;
    if (typeof ai.description !== 'string') {
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

  return {
    title: obj.title,
    summary: obj.summary,
    key_topics: (obj.key_topics as unknown[]).map(String),
    action_items,
  };
}
