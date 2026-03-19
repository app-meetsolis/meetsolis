'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Upload, FileText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parseTranscript } from '@/lib/files/parseTranscript';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB
const MAX_AUDIO_BYTES = 500 * 1024 * 1024; // 500MB
const MAX_PASTE_CHARS = 50_000;
const ACCEPTED_TYPES = ['.txt', '.docx'];
const ACCEPTED_AUDIO = '.mp3,.mp4,.m4a,.wav,.webm';
const ACCEPTED_AUDIO_EXTS = ['.mp3', '.mp4', '.m4a', '.wav', '.webm'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

type InputMode = 'file' | 'paste' | 'audio';

interface SessionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess: () => void;
}

export function SessionUploadModal({
  isOpen,
  onClose,
  clientId,
  onSuccess,
}: SessionUploadModalProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileError, setAudioFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('file');
      setFile(null);
      setFileError(null);
      setPasteText('');
      setAudioFile(null);
      setAudioFileError(null);
      setUploadProgress(null);
      setTitle('');
      setSessionDate(todayISO());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setFileError(`Unsupported file type "${ext}". Accepted: .txt, .docx`);
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileError('File exceeds 25MB limit.');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAudioFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_AUDIO_EXTS.includes(ext)) {
      setAudioFileError(
        `Unsupported file type "${ext}". Accepted: ${ACCEPTED_AUDIO_EXTS.join(', ')}`
      );
      setAudioFile(null);
      return;
    }
    if (selected.size > MAX_AUDIO_BYTES) {
      setAudioFileError('File exceeds 500MB limit.');
      setAudioFile(null);
      return;
    }
    setAudioFile(selected);
  }

  function isFormValid() {
    if (!title.trim()) return false;
    if (!sessionDate) return false;
    if (mode === 'file') return !!file && !fileError;
    if (mode === 'audio') return !!audioFile && !audioFileError;
    return pasteText.trim().length > 0 && pasteText.length <= MAX_PASTE_CHARS;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (mode === 'audio' && audioFile) {
        // Step 1: Get signed upload URL
        const urlRes = await fetch('/api/sessions/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: audioFile.name,
            contentType: audioFile.type || 'audio/mpeg',
          }),
        });

        if (!urlRes.ok) {
          const data = await urlRes.json().catch(() => ({}));
          toast.error(data?.error?.message || 'Failed to get upload URL.');
          return;
        }

        const { signedUrl, publicUrl } = await urlRes.json();

        // Step 2: Upload directly to Supabase Storage
        setUploadProgress(0);
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': audioFile.type || 'audio/mpeg' },
          body: audioFile,
        });
        setUploadProgress(100);

        if (!uploadRes.ok) {
          toast.error('Audio upload failed. Please try again.');
          return;
        }

        // Step 3: Create session with audio URL
        const sessionRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            title: title.trim(),
            session_date: sessionDate,
            transcript_audio_url: publicUrl,
          }),
        });

        if (!sessionRes.ok) {
          const data = await sessionRes.json().catch(() => ({}));
          toast.error(data?.error?.message || 'Failed to create session.');
          return;
        }

        toast.success('Session uploaded — transcribing audio…');
        onSuccess();
        onClose();
        return;
      }

      // File / paste modes
      const formData = new FormData();
      formData.append('client_id', clientId);
      formData.append('title', title.trim());
      formData.append('session_date', sessionDate);

      if (mode === 'file' && file) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'txt') {
          const parsed = await parseTranscript(file);
          formData.append('transcript_text', parsed.text);
        }
        formData.append('file', file);
      } else {
        formData.append('transcript_text', pasteText);
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error?.message || 'Upload failed. Please try again.';
        toast.error(msg);
        return;
      }

      toast.success('Session uploaded — processing transcript…');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('[SessionUploadModal] submit error:', err);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Upload Session Transcript
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#6B7280] hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Mode tabs */}
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'file'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'paste'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Paste Text
            </button>
            <button
              type="button"
              onClick={() => setMode('audio')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-colors ${
                mode === 'audio'
                  ? 'bg-white text-[#1A1A1A] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              Auto-Transcribe
            </button>
          </div>

          {/* File input */}
          {mode === 'file' && (
            <div className="space-y-1.5">
              <Label>Transcript File</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100"
              >
                <Upload className="mb-2 h-6 w-6 text-[#6B7280]" />
                {file ? (
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {file.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Click to select file
                    </p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      .txt or .docx — max 25MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileError && <p className="text-xs text-red-500">{fileError}</p>}
            </div>
          )}

          {/* Paste textarea */}
          {mode === 'paste' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Transcript Text</Label>
                <span
                  className={`text-xs ${
                    pasteText.length > MAX_PASTE_CHARS
                      ? 'text-red-500'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  {pasteText.length.toLocaleString()} /{' '}
                  {MAX_PASTE_CHARS.toLocaleString()}
                </span>
              </div>
              <Textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste your session transcript here…"
                className="h-36 resize-none text-sm"
                maxLength={MAX_PASTE_CHARS}
              />
            </div>
          )}

          {/* Audio file input */}
          {mode === 'audio' && (
            <div className="space-y-1.5">
              <Label>Audio / Video Recording</Label>
              <div
                onClick={() => audioInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100"
              >
                <Mic className="mb-2 h-6 w-6 text-[#6B7280]" />
                {audioFile ? (
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {audioFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Click to select audio or video file
                    </p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      .mp3, .mp4, .m4a, .wav, .webm — max 500MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept={ACCEPTED_AUDIO}
                className="hidden"
                onChange={handleAudioChange}
              />
              {audioFileError && (
                <p className="text-xs text-red-500">{audioFileError}</p>
              )}
              {uploadProgress !== null && (
                <p className="text-xs text-[#6B7280]">
                  {uploadProgress < 100
                    ? 'Uploading…'
                    : 'Upload complete — creating session…'}
                </p>
              )}
              <p className="text-xs text-[#9CA3AF]">
                File uploads directly to secure storage. Transcription begins
                automatically.
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="session-title">Session Title</Label>
            <Input
              id="session-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Session 5 — Leadership Transition"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="session-date">Session Date</Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting
                ? 'Uploading…'
                : mode === 'audio'
                  ? 'Upload & Transcribe'
                  : 'Upload & Process'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
