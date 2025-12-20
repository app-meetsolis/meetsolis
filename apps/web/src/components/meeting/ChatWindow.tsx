/**
 * ChatWindow Component
 * Main chat container for Story 2.4 - Real-Time Messaging and Chat Features
 *
 * Features:
 * - Collapsible chat panel (sidebar/overlay)
 * - Public and private chat tabs
 * - Message list with auto-scroll
 * - Unread message badges
 * - WCAG 2.1 AA accessible
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Users, User } from 'lucide-react';
import { Message, Participant } from '@meetsolis/shared';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/meeting/useFileUpload';
import { toast } from 'sonner';

export interface MeetingSettings {
  chat_enabled?: boolean;
  private_chat_enabled?: boolean;
  file_uploads_enabled?: boolean;
}

export interface ChatWindowProps {
  meetingId: string;
  currentUserId: string;
  isHost: boolean;
  participants: Participant[];
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (
    content: string,
    type: 'public' | 'private',
    recipientId?: string
  ) => Promise<void>;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  unreadCount?: number;
  meetingSettings?: MeetingSettings | null;
}

export function ChatWindow({
  meetingId,
  currentUserId,
  isHost,
  participants,
  messages,
  isOpen,
  onClose,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  unreadCount = 0,
  meetingSettings = null,
}: ChatWindowProps) {
  const [chatType, setChatType] = useState<'public' | 'private'>('public');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Get current user's database ID from participants (currentUserId might be Clerk ID)
  const currentUserDbId =
    participants.find(p => {
      return (
        p.user_id === currentUserId || (p as any).clerk_id === currentUserId
      );
    })?.user_id || currentUserId;

  // File upload
  const { uploadFile, isUploading } = useFileUpload();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Filter messages based on chat type and selected recipient
  const filteredMessages = messages.filter(msg => {
    // Search filter
    if (
      searchQuery &&
      !msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Public chat
    if (chatType === 'public') {
      return msg.type === 'public' || msg.type === 'system';
    }

    // Private chat
    if (chatType === 'private' && selectedRecipient) {
      return (
        msg.type === 'private' &&
        ((msg.sender_id === currentUserDbId &&
          msg.recipient_id === selectedRecipient) ||
          (msg.sender_id === selectedRecipient &&
            msg.recipient_id === currentUserDbId))
      );
    }

    return false;
  });

  // Get recipient name for private chat
  const getRecipientName = (recipientId: string) => {
    const participant = participants.find(p => p.user_id === recipientId);
    return participant ? 'Participant' : 'Unknown';
  };

  // Check if features are enabled (default to true if settings not loaded)
  const isChatEnabled = meetingSettings?.chat_enabled !== false;
  const isPrivateChatEnabled = meetingSettings?.private_chat_enabled !== false;
  const isFileUploadEnabled = meetingSettings?.file_uploads_enabled !== false;

  // Determine disabled state and reason
  const getDisabledState = (): { disabled: boolean; reason: string } => {
    if (!isChatEnabled) {
      return { disabled: true, reason: 'Chat has been disabled by the host' };
    }
    if (chatType === 'private' && !isPrivateChatEnabled) {
      return {
        disabled: true,
        reason: 'Private chat has been disabled by the host',
      };
    }
    if (chatType === 'private' && !selectedRecipient) {
      return { disabled: true, reason: 'Select a recipient first...' };
    }
    return { disabled: false, reason: '' };
  };

  const disabledState = getDisabledState();

  // Handle file attachment
  const handleFileAttach = async (file: File): Promise<void> => {
    try {
      const { fileId } = await uploadFile(file, meetingId);
      // File ID stored for later use when sending
      console.log('File uploaded:', fileId);
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  // Handle sending message
  const handleSendMessage = async (content: string, fileId?: string) => {
    // Validate chat is enabled before sending
    if (!isChatEnabled) {
      toast.error('Chat is disabled', {
        description: 'The host has disabled chat for this meeting',
      });
      return;
    }

    if (chatType === 'private' && !isPrivateChatEnabled) {
      toast.error('Private chat is disabled', {
        description: 'The host has disabled private chat for this meeting',
      });
      return;
    }

    await onSendMessage(content, chatType, selectedRecipient || undefined);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900 border-l border-gray-700 flex flex-col z-50',
        'shadow-2xl transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      role="complementary"
      aria-label="Chat window"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Chat</h2>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
            aria-label="Search messages"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5" />
          </Button>
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        <button
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            chatType === 'public'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          )}
          onClick={() => {
            setChatType('public');
            setSelectedRecipient(null);
          }}
          aria-label="Public chat"
          role="tab"
          aria-selected={chatType === 'public'}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Public</span>
          </div>
        </button>
        <button
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors',
            chatType === 'private'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300',
            !isPrivateChatEnabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => {
            if (isPrivateChatEnabled) {
              setChatType('private');
            }
          }}
          disabled={!isPrivateChatEnabled}
          aria-label="Private chat"
          role="tab"
          aria-selected={chatType === 'private'}
          title={
            !isPrivateChatEnabled ? 'Private chat is disabled by the host' : ''
          }
        >
          <div className="flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            <span>Private</span>
          </div>
        </button>
      </div>

      {/* Search bar (when active) */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-gray-700">
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="bg-gray-800 text-white border-gray-600 focus:border-blue-500"
            aria-label="Search messages"
          />
        </div>
      )}

      {/* Recipient selector for private chat */}
      {chatType === 'private' && (
        <div className="px-4 py-2 border-b border-gray-700">
          <select
            value={selectedRecipient || ''}
            onChange={e => setSelectedRecipient(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            aria-label="Select recipient for private message"
          >
            <option value="">Select recipient...</option>
            {participants
              .filter(p => p.user_id !== currentUserDbId)
              .map(p => (
                <option key={p.id} value={p.user_id}>
                  {getRecipientName(p.user_id)}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Message List */}
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat messages"
      >
        {!isChatEnabled ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 py-8 px-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="font-medium">Chat Disabled</p>
              <p className="text-sm mt-1">
                The host has disabled chat for this meeting
              </p>
            </div>
          </div>
        ) : chatType === 'private' && !isPrivateChatEnabled ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 py-8 px-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="font-medium">Private Chat Disabled</p>
              <p className="text-sm mt-1">
                The host has disabled private chat for this meeting
              </p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {chatType === 'public'
              ? 'No messages yet'
              : 'Select a recipient to start a private chat'}
          </div>
        ) : (
          filteredMessages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              isHost={isHost}
              participants={participants}
              onEdit={content => onEditMessage(msg.id, content)}
              onDelete={() => onDeleteMessage(msg.id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700 bg-gray-800">
        <MessageInput
          onSend={handleSendMessage}
          onAttachFile={isFileUploadEnabled ? handleFileAttach : undefined}
          disabled={disabledState.disabled}
          isUploading={isUploading}
          placeholder={disabledState.reason || 'Type a message...'}
        />
      </div>
    </div>
  );
}
