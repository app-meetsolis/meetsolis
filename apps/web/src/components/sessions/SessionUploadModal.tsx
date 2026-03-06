'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Mic, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  parseTranscriptFile,
  validateTranscriptText,
} from '@/lib/files/parseTranscript';

interface SessionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function SessionUploadModal({
  isOpen,
  onClose,
  clientId,
}: SessionUploadModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [pastedText, setPastedText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedText, setParsedText] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({
      transcriptText,
      isAudio,
      audioUrl,
    }: {
      transcriptText?: string;
      isAudio?: boolean;
      audioUrl?: string;
    }) => {
      // 1. Create session
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          title: title || undefined,
          session_date: sessionDate,
          transcript_text: transcriptText || undefined,
          transcript_audio_url: audioUrl || undefined,
        }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        throw new Error(err.error?.message || 'Failed to create session');
      }

      const session = await sessionRes.json();

      // 2. Auto-summarize if we have text
      if (transcriptText) {
        const sumRes = await fetch(`/api/sessions/${session.id}/summarize`, {
          method: 'POST',
        });
        if (!sumRes.ok) {
          // Don't throw — session created, summarize can be retried
          toast.warning(
            'Session saved but summarization failed. Try again from the session card.'
          );
        }
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', clientId] });
      toast.success('Session uploaded successfully');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload session');
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setIsParsingFile(true);
    try {
      const text = await parseTranscriptFile(file);
      const validation = validateTranscriptText(text);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setParsedText(text);
      toast.success(`File parsed: ${text.length.toLocaleString()} characters`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file');
      setSelectedFileName('');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleSubmitManual = (source: 'file' | 'paste') => {
    const text = source === 'file' ? parsedText : pastedText;
    const validation = validateTranscriptText(text);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    uploadMutation.mutate({ transcriptText: text });
  };

  const handleClose = () => {
    setTitle('');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setPastedText('');
    setSelectedFileName('');
    setParsedText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Session Transcript</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-title">Session Title (optional)</Label>
              <Input
                id="session-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Q1 Goal Review"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-date">Session Date</Label>
              <Input
                id="session-date"
                type="date"
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
              />
            </div>
          </div>

          {/* Transcript source tabs */}
          <Tabs defaultValue="paste">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste" className="gap-2">
                <FileText className="h-4 w-4" />
                Paste Text
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File (.txt, .docx)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-3">
              <Textarea
                placeholder="Paste your session transcript here..."
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                rows={10}
                className="resize-none font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  {pastedText.length.toLocaleString()} characters
                </p>
                <Button
                  onClick={() => handleSubmitManual('paste')}
                  disabled={uploadMutation.isPending || !pastedText.trim()}
                  className="gap-2 bg-[#001F3F] hover:bg-[#003366]"
                >
                  <Sparkles className="h-4 w-4" />
                  {uploadMutation.isPending
                    ? 'Uploading...'
                    : 'Upload & Summarize'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-3">
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-8 text-center hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                {selectedFileName ? (
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {selectedFileName}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-[#6B7280]">
                      Click to upload .txt or .docx file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max 25MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {parsedText && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600">
                    {parsedText.length.toLocaleString()} characters parsed
                  </p>
                  <Button
                    onClick={() => handleSubmitManual('file')}
                    disabled={uploadMutation.isPending || isParsingFile}
                    className="gap-2 bg-[#001F3F] hover:bg-[#003366]"
                  >
                    <Sparkles className="h-4 w-4" />
                    {uploadMutation.isPending
                      ? 'Uploading...'
                      : 'Upload & Summarize'}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
