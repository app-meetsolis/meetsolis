/**
 * NotesEditor Component — Story 2.7
 * View (markdown render) / Edit (textarea) toggle with auto-save.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_CHARS = 10_000;
const DEBOUNCE_MS = 2_000;

interface NotesEditorProps {
  clientId: string;
  initialNotes: string | null;
}

async function saveNotes(clientId: string, notes: string): Promise<void> {
  const res = await fetch(`/api/clients/${clientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Save failed');
  }
}

export function NotesEditor({ clientId, initialNotes }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialNotes ?? '');
  const [savedContent, setSavedContent] = useState(initialNotes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const doSave = useCallback(
    async (value: string) => {
      if (value === savedContent) return;
      setIsSaving(true);
      try {
        await saveNotes(clientId, value);
        setSavedContent(value);
        toast.success('Notes saved');
      } catch {
        toast.error('Failed to save notes');
      } finally {
        setIsSaving(false);
      }
    },
    [clientId, savedContent]
  );

  // Debounced auto-save on content change
  useEffect(() => {
    if (!isEditing) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(content);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, isEditing, doSave]);

  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSave(content);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) setContent(val);
  };

  const isEmpty = !content.trim();

  // ── View mode ──────────────────────────────────────────────────────────────
  if (!isEditing) {
    if (isEmpty) {
      return (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-200 bg-white p-6 text-center text-sm text-[#9CA3AF] transition hover:border-gray-300 hover:text-[#6B7280]"
        >
          Click to add notes about this client
        </button>
      );
    }

    return (
      <div className="group relative rounded-lg bg-white p-6 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>

        <div className="prose prose-sm max-w-none text-[#374151]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  const isAtLimit = content.length >= MAX_CHARS;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Write notes in markdown format..."
        rows={12}
        className="w-full resize-y rounded-md border border-gray-200 bg-[#FAFAFA] p-3 text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:border-[#001F3F] focus:outline-none focus:ring-1 focus:ring-[#001F3F]"
      />

      {/* Footer: status + counter + done button */}
      <div className="mt-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-xs text-[#9CA3AF]">Saving...</span>
          )}
          <span
            className={`text-xs ${isAtLimit ? 'font-medium text-red-500' : 'text-[#9CA3AF]'}`}
          >
            {content.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
            {isAtLimit && ' — limit reached'}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onMouseDown={e => {
            // Prevent blur from firing before click
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            doSave(content);
            setIsEditing(false);
          }}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Done
        </Button>
      </div>
    </div>
  );
}
