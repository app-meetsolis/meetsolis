/**
 * ChatWindow Component Tests
 * Tests for Story 2.4 - Real-Time Messaging and Chat Features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatWindow, ChatWindowProps } from '../ChatWindow';
import { Message, Participant } from '@meetsolis/shared';

// Mock dependencies
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock data
const mockCurrentUserId = 'user-1';
const mockMeetingId = 'meeting-1';

const mockParticipants: Participant[] = [
  {
    id: 'p1',
    meeting_id: mockMeetingId,
    user_id: 'user-1',
    role: 'host',
    permissions: {},
    status: 'joined',
    hand_raised: false,
    hand_raised_at: null,
    joined_at: new Date().toISOString(),
    left_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    meeting_id: mockMeetingId,
    user_id: 'user-2',
    role: 'participant',
    permissions: {},
    status: 'joined',
    hand_raised: false,
    hand_raised_at: null,
    joined_at: new Date().toISOString(),
    left_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    meeting_id: mockMeetingId,
    sender_id: 'user-2',
    content: 'Hello everyone!',
    type: 'public',
    recipient_id: null,
    timestamp: new Date().toISOString(),
    edited_at: null,
    is_deleted: false,
    message_read_by: [],
    file_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    meeting_id: mockMeetingId,
    sender_id: 'user-1',
    content: 'Hi there!',
    type: 'public',
    recipient_id: null,
    timestamp: new Date().toISOString(),
    edited_at: null,
    is_deleted: false,
    message_read_by: [{ user_id: 'user-2', read_at: new Date().toISOString() }],
    file_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
  },
];

const defaultProps: ChatWindowProps = {
  meetingId: mockMeetingId,
  currentUserId: mockCurrentUserId,
  isHost: true,
  participants: mockParticipants,
  messages: mockMessages,
  isOpen: true,
  onClose: jest.fn(),
  onSendMessage: jest.fn().mockResolvedValue(undefined),
  onEditMessage: jest.fn().mockResolvedValue(undefined),
  onDeleteMessage: jest.fn().mockResolvedValue(undefined),
  unreadCount: 0,
};

describe('ChatWindow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat window when open', () => {
      render(<ChatWindow {...defaultProps} />);
      expect(
        screen.getByRole('complementary', { name: /chat window/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ChatWindow {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });

    it('should display unread count badge', () => {
      render(<ChatWindow {...defaultProps} unreadCount={5} />);
      expect(screen.getByLabelText('5 unread messages')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render public and private chat tabs', () => {
      render(<ChatWindow {...defaultProps} />);
      expect(
        screen.getByRole('tab', { name: /public chat/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /private chat/i })
      ).toBeInTheDocument();
    });

    it('should render messages in message list', () => {
      render(<ChatWindow {...defaultProps} />);
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to private chat tab', () => {
      render(<ChatWindow {...defaultProps} />);
      const privateTab = screen.getByRole('tab', { name: /private chat/i });
      fireEvent.click(privateTab);
      expect(privateTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show recipient selector in private chat', () => {
      render(<ChatWindow {...defaultProps} />);
      fireEvent.click(screen.getByRole('tab', { name: /private chat/i }));
      expect(screen.getByLabelText(/select recipient/i)).toBeInTheDocument();
    });

    it('should filter public messages in public tab', () => {
      render(<ChatWindow {...defaultProps} />);
      const publicTab = screen.getByRole('tab', { name: /public chat/i });
      expect(publicTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    });
  });

  describe('Message Actions', () => {
    it('should call onClose when close button clicked', () => {
      const onClose = jest.fn();
      render(<ChatWindow {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByLabelText(/close chat/i));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSendMessage when message sent', async () => {
      const onSendMessage = jest.fn().mockResolvedValue(undefined);
      render(<ChatWindow {...defaultProps} onSendMessage={onSendMessage} />);

      const input = screen.getByLabelText(/message input/i);
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onSendMessage).toHaveBeenCalledWith(
          'Test message',
          'public',
          undefined
        );
      });
    });
  });

  describe('Search Functionality', () => {
    it('should show search input when search button clicked', () => {
      render(<ChatWindow {...defaultProps} />);
      fireEvent.click(screen.getByLabelText(/search messages/i));
      expect(
        screen.getByPlaceholderText(/search messages/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatWindow {...defaultProps} />);
      expect(
        screen.getByRole('complementary', { name: /chat window/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('log', { name: /chat messages/i })
      ).toBeInTheDocument();
    });

    it('should have aria-live region for messages', () => {
      render(<ChatWindow {...defaultProps} />);
      const messageList = screen.getByRole('log');
      expect(messageList).toHaveAttribute('aria-live', 'polite');
      expect(messageList).toHaveAttribute('aria-atomic', 'false');
    });

    it('should have proper tab roles and states', () => {
      render(<ChatWindow {...defaultProps} />);
      const publicTab = screen.getByRole('tab', { name: /public chat/i });
      expect(publicTab).toHaveAttribute('aria-selected');
    });
  });

  describe('Empty States', () => {
    it('should show "no messages" for empty public chat', () => {
      render(<ChatWindow {...defaultProps} messages={[]} />);
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('should show "select recipient" for private chat with no selection', () => {
      render(<ChatWindow {...defaultProps} />);
      fireEvent.click(screen.getByRole('tab', { name: /private chat/i }));
      expect(screen.getByText(/select a recipient/i)).toBeInTheDocument();
    });
  });
});
