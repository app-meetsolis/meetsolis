/**
 * useChat Hook
 * Real-time messaging hook for Story 2.4 - Real-Time Messaging and Chat Features
 *
 * Features:
 * - Subscribe to Supabase Realtime for messages
 * - Handle INSERT/UPDATE events
 * - Optimistic UI updates
 * - Message sending with retry logic
 * - Connection state handling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Message, MessageInsert } from '@meetsolis/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface UseChatOptions {
  meetingId: string;
  currentUserId: string;
  enabled?: boolean;
}

export interface UseChatResult {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (
    content: string,
    type: 'public' | 'private',
    recipientId?: string
  ) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export function useChat({
  meetingId,
  currentUserId,
  enabled = true,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actualMeetingId, setActualMeetingId] = useState<string | null>(null);
  const [actualUserId, setActualUserId] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize Supabase client
  useEffect(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(supabaseUrl, supabaseKey);
    }
  }, []);

  // Resolve meeting_code to UUID and user Clerk ID to database ID
  useEffect(() => {
    if (!enabled) return;

    const resolveIds = async () => {
      try {
        const isMeetingUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            meetingId
          );
        const isUserUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            currentUserId
          );

        if (isMeetingUUID && isUserUUID) {
          setActualMeetingId(meetingId);
          setActualUserId(currentUserId);
          return;
        }

        // Lookup meeting UUID by meeting_code
        const response = await fetch(`/api/meetings/${meetingId}`);
        if (!response.ok) throw new Error('Failed to resolve IDs');

        const data = await response.json();
        setActualMeetingId(data.meeting.id);

        // Find current user's database ID from participants
        const currentUserParticipant = data.participants.find(
          (p: any) =>
            p.clerk_id === currentUserId || p.user_id === currentUserId
        );

        if (currentUserParticipant) {
          setActualUserId(currentUserParticipant.user_id);
        } else {
          setActualUserId(currentUserId); // Fallback
        }
      } catch (err) {
        console.error('Failed to resolve IDs:', err);
        setError(err as Error);
      }
    };

    resolveIds();
  }, [meetingId, currentUserId, enabled]);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/meetings/${meetingId}/messages?limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { messages: data } = await response.json();
      setMessages((data || []) as Message[]);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [meetingId, enabled]);

  // Setup Realtime subscription
  useEffect(() => {
    if (!enabled || !supabaseRef.current || !actualMeetingId) return;

    fetchMessages();

    // Create Realtime channel using actual UUID
    const channel = supabaseRef.current
      .channel(`meeting:${actualMeetingId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `meeting_id=eq.${actualMeetingId}`,
        },
        payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Avoid duplicates - check if message already exists
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          setIsConnected(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `meeting_id=eq.${actualMeetingId}`,
        },
        payload => {
          const updatedMessage = payload.new as Message;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
          setIsConnected(true);
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabaseRef.current?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [actualMeetingId, enabled, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      type: 'public' | 'private',
      recipientId?: string
    ) => {
      if (!supabaseRef.current)
        throw new Error('Supabase client not initialized');
      if (!actualUserId) throw new Error('User ID not resolved');

      const messageInsert: MessageInsert = {
        meeting_id: meetingId,
        sender_id: actualUserId, // Use database ID
        content,
        type,
        recipient_id: recipientId || null,
        metadata: {},
      };

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        meeting_id: messageInsert.meeting_id,
        sender_id: messageInsert.sender_id, // Now uses database ID
        content: messageInsert.content,
        type: messageInsert.type || 'public',
        recipient_id: messageInsert.recipient_id || null,
        timestamp: new Date().toISOString(),
        edited_at: null,
        is_deleted: false,
        message_read_by: [],
        file_id: messageInsert.file_id || null,
        metadata: messageInsert.metadata || {},
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, optimisticMessage]);

      try {
        // Call API instead of direct Supabase insert
        const response = await fetch(`/api/meetings/${meetingId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            type,
            recipient_id: recipientId || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }

        const { message: data } = await response.json();

        // Replace optimistic message with real one
        setMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticMessage.id ? (data as Message) : msg
          )
        );
      } catch (err) {
        // Remove optimistic message on error
        setMessages(prev =>
          prev.filter(msg => msg.id !== optimisticMessage.id)
        );
        throw err;
      }
    },
    [meetingId, actualUserId]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/messages/${messageId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to edit message');
        }
      } catch (err) {
        console.error('Failed to edit message:', err);
        throw err;
      }
    },
    [meetingId]
  );

  // Delete message (soft delete)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/messages/${messageId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete message');
        }

        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (err) {
        console.error('Failed to delete message:', err);
        throw err;
      }
    },
    [meetingId]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(
          `/api/meetings/${meetingId}/messages/${messageId}/read`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to mark as read');
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err);
        // Don't throw - read receipts are not critical
      }
    },
    [meetingId]
  );

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
  };
}
