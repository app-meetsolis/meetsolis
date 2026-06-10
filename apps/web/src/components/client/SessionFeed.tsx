/**
 * Story 7.7 — Session Feed (list of SessionFeedRow with single-open behavior).
 *
 * Q5 locked: only one row expanded at a time. Empty state shows a prompt
 * to upload first session (progressive enrichment).
 */

'use client';

import { useState } from 'react';
import type { ClientActionItem, Session } from '@meetsolis/shared';
import { SessionFeedRow } from './SessionFeedRow';

interface Props {
  sessions: Session[];
  actionItems: ClientActionItem[];
  clientId: string;
}

export function SessionFeed({ sessions, actionItems, clientId }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="rounded-[12px] bg-card shadow-card px-6 py-10 text-center">
        <p className="text-[13px] text-foreground/50">
          No sessions yet — upload your first session to start the feed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[14px] font-semibold text-foreground tracking-tight">
          Sessions
        </h2>
        <span className="inline-flex items-center rounded-full bg-foreground/[0.08] px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
          {sessions.length}
        </span>
      </div>
      {sessions.map(s => (
        <SessionFeedRow
          key={s.id}
          session={s}
          actionItems={actionItems}
          isOpen={openId === s.id}
          onToggle={() => setOpenId(curr => (curr === s.id ? null : s.id))}
          clientId={clientId}
        />
      ))}
    </div>
  );
}
