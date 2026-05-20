/**
 * BreakthroughsPanel — past breakthroughs, or first-session opening
 * questions when the client has no history (Story 6.4).
 */

'use client';

import { format, parseISO } from 'date-fns';
import type { BriefBreakthrough } from '@meetsolis/shared';
import { EditableText } from './EditableText';

export interface BreakthroughsPanelProps {
  isFirstSession: boolean;
  breakthroughs: BriefBreakthrough[];
  suggestedQuestions: string[];
  breakthroughsEdited: boolean;
  questionsEdited: boolean;
  onSaveBreakthroughs: (b: BriefBreakthrough[]) => void;
  onSaveQuestions: (q: string[]) => void;
}

function safeDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d');
  } catch {
    return iso;
  }
}

export function BreakthroughsPanel({
  isFirstSession,
  breakthroughs,
  suggestedQuestions,
  breakthroughsEdited,
  questionsEdited,
  onSaveBreakthroughs,
  onSaveQuestions,
}: BreakthroughsPanelProps) {
  // ---- First session: suggested opening questions -----------------------
  if (isFirstSession) {
    return (
      <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
          Suggested Opening Questions
          {questionsEdited && (
            <span className="ml-2 normal-case text-[10px] tracking-normal text-foreground/30">
              · edited
            </span>
          )}
        </h2>
        {suggestedQuestions.length === 0 ? (
          <p className="text-[13px] text-foreground/40">
            No suggested questions available.
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestedQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <EditableText
                    value={q}
                    onSave={next => {
                      const updated = [...suggestedQuestions];
                      updated[i] = next;
                      onSaveQuestions(updated);
                    }}
                    ariaLabel={`Opening question ${i + 1}`}
                    textClassName="text-[13px] leading-relaxed text-foreground"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  // ---- Past breakthroughs -----------------------------------------------
  return (
    <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
        Past Breakthroughs
        {breakthroughsEdited && (
          <span className="ml-2 normal-case text-[10px] tracking-normal text-foreground/30">
            · edited
          </span>
        )}
      </h2>
      {breakthroughs.length === 0 ? (
        <p className="text-[13px] text-foreground/40">
          No breakthroughs surfaced yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {breakthroughs.map((b, i) => (
            <li key={b.session_id} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-primary">
                {safeDate(b.date)}
              </span>
              <div className="flex-1">
                <EditableText
                  value={b.summary}
                  onSave={next => {
                    const updated = breakthroughs.map((x, idx) =>
                      idx === i ? { ...x, summary: next } : x
                    );
                    onSaveBreakthroughs(updated);
                  }}
                  ariaLabel={`Breakthrough ${i + 1}`}
                  textClassName="text-[13px] leading-relaxed text-foreground/85"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
