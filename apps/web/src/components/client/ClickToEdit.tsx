/**
 * ClickToEdit — inline-edit primitive.
 *
 * Extracted from AIIntelligenceStrip.tsx (Story 7.2, MAINT-001 from QA gate).
 * Reused across Client Card: AI Intelligence Strip rows, ClientHeader fields,
 * AboutSection fields.
 *
 * Behavior:
 * - Display mode: button reveals current value or placeholder
 * - Edit mode: focused input/textarea; Enter saves, Esc cancels, blur saves
 * - Trim before save; only fires onSave when content actually changed
 */

'use client';

import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

interface Props {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  ariaLabel: string;
  placeholder?: string;
}

export function ClickToEdit({
  value,
  onSave,
  multiline,
  ariaLabel,
  placeholder,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      try {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      } catch {
        // Some browsers throw on setSelectionRange for non-text inputs; ignore.
      }
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value.trim()) onSave(trimmed);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKey = (
    e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
  };

  if (!editing) {
    const trimmed = value?.trim() ?? '';
    const isPlaceholder = !trimmed;
    const isBuilding = trimmed === 'Building...';
    const display = isPlaceholder ? (placeholder ?? 'Click to add…') : value;
    const tone =
      isPlaceholder || isBuilding
        ? 'italic text-foreground/35'
        : 'text-foreground/85';
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit ${ariaLabel}`}
        className={`block w-full text-left text-[13px] leading-relaxed transition-colors py-1 px-2 -mx-2 rounded-md hover:text-foreground hover:ring-1 hover:ring-primary/20 hover:bg-primary/[0.03] ${tone}`}
      >
        {display}
      </button>
    );
  }

  const sharedProps = {
    ref: inputRef as never,
    value: draft,
    onChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setDraft(e.target.value),
    onBlur: (_e: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      commit(),
    onKeyDown: handleKey,
    'aria-label': ariaLabel,
    className:
      'w-full bg-background border border-primary/30 rounded-md px-2 py-1 text-[13px] text-foreground focus:outline-none focus:border-primary',
  };

  if (multiline) {
    return <textarea {...sharedProps} rows={3} />;
  }
  return <input type="text" {...sharedProps} />;
}
