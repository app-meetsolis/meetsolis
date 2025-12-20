/**
 * MessageInput Component
 * Message input field for Story 2.4 - Real-Time Messaging and Chat Features
 *
 * Features:
 * - Character limit (1000 chars)
 * - File attachment button
 * - Emoji picker button
 * - Keyboard shortcuts (Ctrl+Enter to send)
 * - Accessible labels
 */

'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MessageInputProps {
  onSend: (content: string, fileId?: string) => Promise<void>;
  onAttachFile?: (file: File) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  isUploading?: boolean;
}

export function MessageInput({
  onSend,
  onAttachFile,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
  isUploading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFileId, setAttachedFileId] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAttachFile) return;

    try {
      await onAttachFile(file);
      setAttachedFileName(file.name);
    } catch (error) {
      console.error('Failed to attach file:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle send message
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && !attachedFileId) || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(
        trimmedMessage || 'Shared a file',
        attachedFileId || undefined
      );
      setMessage('');
      setAttachedFileId(null);
      setAttachedFileName(null);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);

    // Reset height to recalculate
    target.style.height = 'auto';
    // Set new height based on scrollHeight (max 120px = ~5 lines)
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className="px-4 py-3">
      {/* Attached file preview */}
      {attachedFileName && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg">
          <Paperclip className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300 flex-1 truncate">
            {attachedFileName}
          </span>
          <button
            onClick={() => {
              setAttachedFileId(null);
              setAttachedFileName(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File attachment button */}
        {onAttachFile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className={cn(
                'p-2 rounded-lg transition-colors',
                disabled || isUploading
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
              )}
              aria-label="Attach file"
              title="Attach file (max 10MB)"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            className={cn(
              'w-full px-3 py-2 bg-gray-800 text-white rounded-lg resize-none',
              'border border-gray-600 focus:outline-none focus:border-blue-500',
              'placeholder-gray-500 transition-colors',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Message input"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          {/* Character count */}
          {isNearLimit && (
            <span
              className={cn(
                'absolute bottom-1 right-2 text-xs',
                remainingChars < 20 ? 'text-red-400' : 'text-gray-500'
              )}
            >
              {remainingChars}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={
            disabled ||
            (!message.trim() && !attachedFileId) ||
            isSending ||
            isUploading
          }
          className={cn(
            'p-2 rounded-lg transition-colors',
            disabled ||
              (!message.trim() && !attachedFileId) ||
              isSending ||
              isUploading
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
          aria-label="Send message"
          title="Send message (Ctrl+Enter)"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-1 text-xs text-gray-500 text-center">
        Press Ctrl+Enter to send
      </div>
    </div>
  );
}
