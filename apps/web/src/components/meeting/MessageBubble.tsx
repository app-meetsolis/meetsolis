/**
 * MessageBubble Component
 * Individual message display for Story 2.4 - Real-Time Messaging and Chat Features
 *
 * Features:
 * - Sender name and avatar
 * - Message timestamp (relative time)
 * - Edit/delete indicators
 * - Read receipts
 * - Message grouping by sender
 */

'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  Download,
  FileIcon,
} from 'lucide-react';
import { Message, Participant } from '@meetsolis/shared';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  isHost: boolean;
  participants: Participant[];
  onEdit?: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function MessageBubble({
  message,
  currentUserId,
  isHost,
  participants,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  // Get current user's database ID from participants (currentUserId might be Clerk ID)
  const currentUserDbId =
    participants.find(p => {
      // Try matching by user_id (database ID) OR by clerk_id if available
      return (
        p.user_id === currentUserId || (p as any).clerk_id === currentUserId
      );
    })?.user_id || currentUserId;

  const isOwnMessage = message.sender_id === currentUserDbId;
  const canEdit = isOwnMessage && !message.is_deleted;
  const canDelete = isOwnMessage || isHost;

  // Get sender name
  const senderName = isOwnMessage ? 'You' : 'Participant';

  // Format timestamp
  const timestamp = message.edited_at || message.timestamp;
  const relativeTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });

  // Calculate read receipts count
  const readCount = message.message_read_by.filter(
    r => r.user_id !== currentUserId
  ).length;

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (editContent.trim() && onEdit) {
      await onEdit(editContent.trim());
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (onDelete && confirm('Delete this message?')) {
      await onDelete();
    }
  };

  // Check if message is within 5-minute edit window
  const messageAge = Date.now() - new Date(message.timestamp).getTime();
  const isEditableTime = messageAge < 5 * 60 * 1000; // 5 minutes

  if (message.is_deleted) {
    return (
      <div className="flex items-center gap-2 text-gray-500 italic text-sm py-2">
        <Trash2 className="w-4 h-4" />
        <span>Message deleted</span>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isOwnMessage ? 'items-end' : 'items-start'
      )}
      aria-label={`${senderName} said: ${message.content}`}
    >
      {/* Sender name */}
      {!isOwnMessage && (
        <span className="text-xs text-gray-400 px-2">{senderName}</span>
      )}

      {/* Message bubble */}
      <div
        className="relative group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div
          className={cn(
            'px-4 py-2 rounded-lg max-w-xs break-words',
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-100'
          )}
        >
          {/* Private message indicator */}
          {message.type === 'private' && (
            <div className="text-xs opacity-75 mb-1">
              Private message {isOwnMessage ? 'to' : 'from'} {senderName}
            </div>
          )}

          {/* Message content (editing mode) */}
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full px-2 py-1 bg-gray-800 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                maxLength={1000}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>

              {/* File attachment display */}
              {message.file_id && message.metadata?.file_name && (
                <a
                  href={(message.metadata.file_url as string) || '#'}
                  download={message.metadata.file_name as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FileIcon className="w-4 h-4" />
                  <span className="text-sm flex-1 truncate">
                    {message.metadata.file_name as string}
                  </span>
                  <Download className="w-4 h-4" />
                </a>
              )}
            </>
          )}
        </div>

        {/* Actions menu */}
        {showActions && !isEditing && (canEdit || canDelete) && (
          <div className="absolute top-0 right-0 -mr-8 flex flex-col gap-1 bg-gray-800 rounded-lg shadow-lg p-1">
            {canEdit && isEditableTime && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                aria-label="Edit message"
                title="Edit message"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Delete message"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Timestamp and metadata */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-xs text-gray-500">
          {relativeTime}
          {message.edited_at && ' (edited)'}
        </span>

        {/* Read receipts for own messages */}
        {isOwnMessage && readCount > 0 && (
          <div
            className="flex items-center gap-1 text-xs text-gray-500"
            title={`Seen by ${readCount} participant${readCount > 1 ? 's' : ''}`}
          >
            <Check className="w-3 h-3" />
            <span>Seen by {readCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
