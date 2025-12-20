/**
 * MessageInput Component Tests
 * Tests for Story 2.4 - Message input functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageInput, MessageInputProps } from '../MessageInput';

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const defaultProps: MessageInputProps = {
  onSend: jest.fn().mockResolvedValue(undefined),
  disabled: false,
  placeholder: 'Type a message...',
  maxLength: 1000,
};

describe('MessageInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input field', () => {
    render(<MessageInput {...defaultProps} />);
    expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<MessageInput {...defaultProps} placeholder="Custom placeholder" />);
    expect(
      screen.getByPlaceholderText('Custom placeholder')
    ).toBeInTheDocument();
  });

  it('should render send button', () => {
    render(<MessageInput {...defaultProps} />);
    expect(screen.getByLabelText(/send message/i)).toBeInTheDocument();
  });

  it('should show file attachment button when provided', () => {
    const onAttachFile = jest.fn();
    render(<MessageInput {...defaultProps} onAttachFile={onAttachFile} />);
    expect(screen.getByLabelText(/attach file/i)).toBeInTheDocument();
  });

  it('should show emoji picker button when provided', () => {
    const onEmojiPicker = jest.fn();
    render(<MessageInput {...defaultProps} onEmojiPicker={onEmojiPicker} />);
    expect(screen.getByLabelText(/add emoji/i)).toBeInTheDocument();
  });

  describe('Message sending', () => {
    it('should send message when send button clicked', async () => {
      const onSend = jest.fn().mockResolvedValue(undefined);
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const input = screen.getByLabelText(/message input/i);
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onSend).toHaveBeenCalledWith('Test message');
      });
    });

    it('should send message on Ctrl+Enter', async () => {
      const onSend = jest.fn().mockResolvedValue(undefined);
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const input = screen.getByLabelText(/message input/i);

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(onSend).toHaveBeenCalledWith('Test message');
      });
    });

    it('should clear input after sending', async () => {
      const onSend = jest.fn().mockResolvedValue(undefined);
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const input = screen.getByLabelText(
        /message input/i
      ) as HTMLTextAreaElement;
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should not send empty messages', async () => {
      const onSend = jest.fn().mockResolvedValue(undefined);
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const input = screen.getByLabelText(/message input/i);
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onSend).not.toHaveBeenCalled();
      });
    });

    it('should trim whitespace from messages', async () => {
      const onSend = jest.fn().mockResolvedValue(undefined);
      render(<MessageInput {...defaultProps} onSend={onSend} />);

      const input = screen.getByLabelText(/message input/i);
      const sendButton = screen.getByLabelText(/send message/i);

      fireEvent.change(input, { target: { value: '  Test message  ' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(onSend).toHaveBeenCalledWith('Test message');
      });
    });
  });

  describe('Character limit', () => {
    it('should show character count when near limit', () => {
      render(<MessageInput {...defaultProps} maxLength={100} />);

      const input = screen.getByLabelText(/message input/i);
      fireEvent.change(input, { target: { value: 'a'.repeat(95) } });

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should set maxLength attribute on textarea', () => {
      render(<MessageInput {...defaultProps} maxLength={10} />);

      const input = screen.getByLabelText(
        /message input/i
      ) as HTMLTextAreaElement;
      expect(input).toHaveAttribute('maxLength', '10');
    });
  });

  describe('Disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(<MessageInput {...defaultProps} disabled={true} />);

      const input = screen.getByLabelText(/message input/i);
      expect(input).toBeDisabled();
    });

    it('should disable send button when disabled', () => {
      render(<MessageInput {...defaultProps} disabled={true} />);

      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).toBeDisabled();
    });

    it('should disable attachment button when disabled', () => {
      const onAttachFile = jest.fn();
      render(
        <MessageInput
          {...defaultProps}
          onAttachFile={onAttachFile}
          disabled={true}
        />
      );

      const attachButton = screen.getByLabelText(/attach file/i);
      expect(attachButton).toBeDisabled();
    });
  });

  describe('Keyboard shortcuts hint', () => {
    it('should show keyboard shortcut hint', () => {
      render(<MessageInput {...defaultProps} />);
      expect(
        screen.getByText(/press ctrl\+enter to send/i)
      ).toBeInTheDocument();
    });
  });
});
