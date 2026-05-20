/**
 * LastSessionPanel — last-session commitments + key theme (Story 6.4).
 * Falls back to a first-session placeholder when there is no history.
 */

'use client';

import { Check } from 'lucide-react';
import type { BriefLastSession } from '@meetsolis/shared';
import { EditableText } from './EditableText';

export interface LastSessionPanelProps {
  lastSession: BriefLastSession | null;
  isFirstSession: boolean;
  clientName: string;
  keyThemeEdited: boolean;
  onToggleActionItem: (id: string, current: 'open' | 'done') => void;
  onSaveKeyTheme: (theme: string) => void;
}

function SectionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[12px] bg-card px-6 py-5 shadow-card">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/40">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LastSessionPanel({
  lastSession,
  isFirstSession,
  clientName,
  keyThemeEdited,
  onToggleActionItem,
  onSaveKeyTheme,
}: LastSessionPanelProps) {
  if (isFirstSession || !lastSession) {
    return (
      <SectionShell title="Last Session">
        <p className="text-[13px] leading-relaxed text-foreground/55">
          First session with{' '}
          <span className="font-medium text-foreground">{clientName}</span> — no
          history yet.
        </p>
      </SectionShell>
    );
  }

  const weeks = lastSession.weeks_ago;
  const ago =
    weeks === 0 ? 'this week' : `${weeks} week${weeks === 1 ? '' : 's'} ago`;

  return (
    <SectionShell title={`Last Session · ${ago}`}>
      {lastSession.action_items.length > 0 ? (
        <>
          <p className="mb-2 text-[13px] text-foreground/55">
            {clientName.split(' ')[0]} committed to:
          </p>
          <ul className="space-y-1.5">
            {lastSession.action_items.map(item => {
              const done = item.status === 'done';
              return (
                <li key={item.id} className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleActionItem(item.id, item.status)}
                    aria-label={done ? 'Mark as open' : 'Mark as done'}
                    aria-pressed={done}
                    className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      done
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-foreground/25 hover:border-primary'
                    }`}
                  >
                    {done && <Check className="h-3 w-3" />}
                  </button>
                  <span
                    className={`text-[13px] leading-relaxed ${
                      done
                        ? 'text-foreground/35 line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-[13px] text-foreground/40">
          No action items from the last session.
        </p>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-1 text-[11px] font-medium text-foreground/40">
          Key theme
        </p>
        <EditableText
          value={lastSession.key_theme}
          onSave={onSaveKeyTheme}
          edited={keyThemeEdited}
          placeholder="Add the session's key theme…"
          ariaLabel="Key theme"
          textClassName="text-[13px] leading-relaxed text-foreground"
        />
      </div>
    </SectionShell>
  );
}
