/**
 * MessageBubble Component Tests
 * Tests for Story 2.4 - Message display functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble, MessageBubbleProps } from '../MessageBubble';
import { Message, Participant } from '@meetsolis/shared';

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockParticipants: Participant[] = [];

const mockMessage: Message = {
  id: 'msg-1',
  meeting_id: 'meeting-1',
  sender_id: 'user-1',
  content: 'Test message content',
  type: 'public',
  recipient_id: null,
  timestamp: new Date().toISOString(),
  edited_at: null,
  is_deleted: false,
  message_read_by: [],
  file_id: null,
  metadata: {},
  created_at: new Date().toISOString(),
};

const defaultProps: MessageBubbleProps = {
  message: mockMessage,
  currentUserId: 'user-2',
  isHost: false,
  participants: mockParticipants,
  onEdit: jest.fn().mockResolvedValue(undefined),
  onDelete: jest.fn().mockResolvedValue(undefined),
};

describe('MessageBubble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message content', () => {
    render(<MessageBubble {...defaultProps} />);
    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('should show "You" for own messages', () => {
    render(
      <MessageBubble
        {...defaultProps}
        message={{ ...mockMessage, sender_id: 'user-2' }}
      />
    );
    expect(screen.queryByText('You')).not.toBeInTheDocument(); // Name not shown for own messages
  });

  it('should show sender name for other messages', () => {
    render(<MessageBubble {...defaultProps} />);
    expect(screen.getByText('Participant')).toBeInTheDocument();
  });

  it('should display timestamp', () => {
    render(<MessageBubble {...defaultProps} />);
    expect(screen.getByText(/5 minutes ago/i)).toBeInTheDocument();
  });

  it('should show edited indicator', () => {
    const editedMessage = {
      ...mockMessage,
      edited_at: new Date().toISOString(),
    };
    render(<MessageBubble {...defaultProps} message={editedMessage} />);
    expect(screen.getByText(/edited/i)).toBeInTheDocument();
  });

  it('should show deleted message placeholder', () => {
    const deletedMessage = {
      ...mockMessage,
      is_deleted: true,
    };
    render(<MessageBubble {...defaultProps} message={deletedMessage} />);
    expect(screen.getByText(/message deleted/i)).toBeInTheDocument();
  });

  it('should show read receipts for own messages', () => {
    const messageWithReceipts = {
      ...mockMessage,
      sender_id: 'user-2',
      message_read_by: [
        { user_id: 'user-1', read_at: new Date().toISOString() },
        { user_id: 'user-3', read_at: new Date().toISOString() },
      ],
    };
    render(<MessageBubble {...defaultProps} message={messageWithReceipts} />);
    expect(screen.getByText(/seen by 2/i)).toBeInTheDocument();
  });

  it('should show system messages differently', () => {
    const systemMessage = {
      ...mockMessage,
      type: 'system' as const,
      content: 'User joined the meeting',
    };
    render(<MessageBubble {...defaultProps} message={systemMessage} />);
    expect(screen.getByText('User joined the meeting')).toBeInTheDocument();
  });

  it('should show private message indicator', () => {
    const privateMessage = {
      ...mockMessage,
      type: 'private' as const,
      recipient_id: 'user-3',
    };
    render(<MessageBubble {...defaultProps} message={privateMessage} />);
    expect(screen.getByText(/private message/i)).toBeInTheDocument();
  });

  describe('Edit functionality', () => {
    it('should show edit button for own messages', () => {
      const ownMessage = { ...mockMessage, sender_id: 'user-2' };
      render(<MessageBubble {...defaultProps} message={ownMessage} />);

      // Hover to show actions
      const bubble = screen.getByText('Test message content').closest('div');
      if (bubble) {
        fireEvent.mouseEnter(bubble.parentElement!);
        expect(screen.getByLabelText(/edit message/i)).toBeInTheDocument();
      }
    });

    it('should not show edit button for other messages', () => {
      render(<MessageBubble {...defaultProps} />);

      const bubble = screen.getByText('Test message content').closest('div');
      if (bubble) {
        fireEvent.mouseEnter(bubble.parentElement!);
        expect(
          screen.queryByLabelText(/edit message/i)
        ).not.toBeInTheDocument();
      }
    });
  });

  describe('Delete functionality', () => {
    it('should show delete button for own messages', () => {
      const ownMessage = { ...mockMessage, sender_id: 'user-2' };
      render(<MessageBubble {...defaultProps} message={ownMessage} />);

      const bubble = screen.getByText('Test message content').closest('div');
      if (bubble) {
        fireEvent.mouseEnter(bubble.parentElement!);
        expect(screen.getByLabelText(/delete message/i)).toBeInTheDocument();
      }
    });

    it('should show delete button for host', () => {
      render(<MessageBubble {...defaultProps} isHost={true} />);

      const bubble = screen.getByText('Test message content').closest('div');
      if (bubble) {
        fireEvent.mouseEnter(bubble.parentElement!);
        expect(screen.getByLabelText(/delete message/i)).toBeInTheDocument();
      }
    });
  });
});
