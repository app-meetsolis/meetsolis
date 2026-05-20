/**
 * EditableText — inline-editable AI field for the Coach Brief (Story 6.4).
 * Click to edit, autosave on blur/Tab, Escape to cancel. Shows an "edited"
 * pencil when the coach has overridden the AI value.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

export interface EditableTextProps {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  edited?: boolean;
  placeholder?: string;
  textClassName?: string;
  ariaLabel?: string;
}

export function EditableText({
  value,
  onSave,
  multiline = false,
  edited = false,
  placeholder = 'Click to add…',
  textClassName = 'text-[13px] leading-relaxed text-foreground',
  ariaLabel,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const autoGrow = () => {
    if (multiline && ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
      autoGrow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== value.trim()) onSave(next);
  };

  if (editing) {
    const common = {
      ref,
      value: draft,
      'aria-label': ariaLabel,
      onChange: (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        setDraft(e.target.value);
        autoGrow();
      },
      onBlur: commit,
      onKeyDown: (
        e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        } else if (e.key === 'Tab') {
          commit();
        } else if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      },
      className: `w-full resize-none rounded-md border border-primary/40 bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 ${textClassName}`,
    };
    return multiline ? (
      <textarea rows={1} {...common} />
    ) : (
      <input type="text" {...common} />
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => setEditing(true)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          setEditing(true);
        }
      }}
      className="group -mx-2 flex cursor-text items-start gap-1.5 rounded-md px-2 py-1.5 transition-colors hover:bg-foreground/[0.04]"
    >
      <span
        className={`flex-1 whitespace-pre-wrap ${textClassName} ${value ? '' : 'text-foreground/30'}`}
      >
        {value || placeholder}
      </span>
      {edited && (
        <Pencil
          className="mt-0.5 h-3 w-3 shrink-0 text-foreground/25"
          aria-label="edited"
        />
      )}
    </div>
  );
}
