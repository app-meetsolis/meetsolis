# Manual Testing Scenarios - Story 2.4: Real-Time Messaging and Chat Features

## Pre-Test Setup
1. Ensure database migration 012 has been applied
2. Run `npm run dev` in apps/web
3. Create two test accounts (User A and User B)
4. User A should create a meeting and get the invite link
5. User B joins via the invite link

---

## Test Scenario 1: Chat Window UI Integration
**Objective**: Verify chat window renders and toggles correctly

### Steps:
1. Join a meeting as User A
2. Look for chat button (💬 MessageSquare icon) in bottom control bar
3. Click chat button
4. Verify chat window slides in from the right side
5. Verify chat window shows:
   - "Chat" header with close button (X)
   - Search button (magnifying glass)
   - Two tabs: "Public" and "Private"
   - Message list area (empty or with system messages)
   - Message input at bottom with emoji and file attachment buttons
6. Click close (X) button
7. Verify chat window disappears

**Expected Result**: Chat window opens/closes smoothly, all UI elements visible

---

## Test Scenario 2: Public Chat Messaging
**Objective**: Test sending and receiving public messages

### Steps:
1. User A opens chat window
2. Ensure "Public" tab is selected
3. Type "Hello from User A" in message input
4. Press Enter or click Send button
5. Verify message appears in chat with:
   - "You" as sender name
   - Message content
   - Timestamp (e.g., "just now")
6. User B opens chat window
7. Verify User B sees message from User A (sender shows "Participant")
8. User B types "Hi from User B" and sends
9. Verify both users see both messages in chronological order

**Expected Result**: Messages sent/received in real-time, displayed correctly

---

## Test Scenario 3: Private Chat Messaging
**Objective**: Test private 1:1 messaging

### Steps:
1. User A clicks "Private" tab
2. Verify recipient selector dropdown appears
3. Select User B from dropdown
4. Type "Private message to B" and send
5. Verify message shows "Private message to [Name]" indicator
6. User B switches to "Private" tab
7. Select User A from dropdown
8. Verify User B sees the private message from A
9. User B replies with "Private reply"
10. Verify conversation continues privately
11. Switch back to "Public" tab
12. Verify private messages do NOT appear in public chat

**Expected Result**: Private messages only visible to sender and recipient

---

## Test Scenario 4: Message Edit Functionality
**Objective**: Test editing own messages within 5-minute window

### Steps:
1. User A sends message "Original messag" (typo intentional)
2. Hover over own message
3. Verify edit icon (✏️) appears
4. Click edit icon
5. Verify textarea appears with message content
6. Fix typo to "Original message"
7. Click "Save"
8. Verify message updates with "(edited)" indicator
9. Verify timestamp shows edited time
10. Wait 6 minutes
11. Try to edit the same message
12. Verify edit button no longer available

**Expected Result**: Messages editable within 5 min, "(edited)" indicator shown

---

## Test Scenario 5: Message Delete Functionality
**Objective**: Test soft delete for own messages

### Steps:
1. User A sends message "Test delete"
2. Hover over message
3. Click delete icon (🗑️)
4. Confirm deletion in prompt
5. Verify message replaced with "Message deleted" placeholder
6. User B refreshes chat
7. Verify deleted message shows as deleted for User B too
8. Host tries to delete another participant's message
9. Verify host CAN delete any message
10. Participant tries to delete host's message
11. Verify participant CANNOT delete other's messages

**Expected Result**: Soft delete works, host has delete permissions

---

## Test Scenario 6: Hand Raise Feature
**Objective**: Test hand raise button and notifications

### Steps:
1. User B clicks hand raise button (✋) in control bar
2. Verify button turns yellow/highlighted
3. Verify toast notification: "Hand raised"
4. Host (User A) should see hand raise indicator
   - Check participant video tile for ✋ badge
   - Check participant panel for raised hand indicator
5. User B clicks hand raise button again
6. Verify button returns to normal state
7. Verify toast: "Hand lowered"
8. Host tries to lower participant's raised hand
9. Verify host can lower any hand

**Expected Result**: Hand raise toggles, host sees notifications

---

## Test Scenario 7: File Attachment Upload
**Objective**: Test file upload in chat

### Steps:
1. User A opens chat
2. Click file attachment button (📎)
3. Select a file <10MB (e.g., PDF, image, text file)
4. Verify upload progress indicator/spinner
5. Verify file preview shows in message input
6. Type "Sharing document" and send
7. Verify message sent with file attachment displayed
8. User B sees message with file
9. Click download icon on file
10. Verify file downloads correctly
11. Try uploading file >10MB
12. Verify error message about size limit

**Expected Result**: Files upload/download correctly, size limit enforced

---

## Test Scenario 8: Emoji Picker
**Objective**: Test emoji insertion

### Steps:
1. User A opens chat
2. Click emoji button (😊)
3. Verify emoji picker popup appears with quick emojis
4. Click an emoji (e.g., 👍)
5. Verify emoji inserted into message input
6. Add text "Great idea"
7. Send message
8. Verify message displays: "👍 Great idea"
9. User B sees emoji correctly rendered

**Expected Result**: Emojis insert and display correctly

---

## Test Scenario 9: Search Messages
**Objective**: Test message search functionality

### Steps:
1. Send several messages with different content
2. Click search button (🔍)
3. Verify search input field appears
4. Type search query (e.g., "test")
5. Verify only messages containing "test" are displayed
6. Clear search
7. Verify all messages reappear

**Expected Result**: Search filters messages by content

---

## Test Scenario 10: Read Receipts
**Objective**: Test message read tracking

### Steps:
1. User A sends message in public chat
2. Verify message shows under it initially: no read receipt
3. User B opens chat and views message
4. Verify User A sees "Seen by 1" under their message
5. Add User C to meeting
6. User C views message
7. Verify User A sees "Seen by 2"
8. Hover over read receipt
9. Verify tooltip/detail shows who read it

**Expected Result**: Read receipts update in real-time

---

## Test Scenario 11: Chat Permissions
**Objective**: Test host chat controls

### Steps:
1. Host opens meeting settings
2. Look for chat permission toggles
3. Toggle "Disable public chat"
4. Verify participants see "Chat disabled by host" message
5. Verify participants cannot send public messages
6. Verify private chat still works (if not disabled)
7. Host re-enables public chat
8. Verify participants can send again

**Expected Result**: Host controls enforce chat restrictions

---

## Test Scenario 12: Unread Message Badge
**Objective**: Test unread counter on chat button

### Steps:
1. User A closes chat window
2. User B sends 3 messages
3. Verify User A sees unread badge "3" on chat button
4. User A opens chat
5. Verify badge disappears
6. User A closes chat again
7. User B sends 2 more messages
8. Verify badge shows "2"

**Expected Result**: Unread count accurate, clears when opened

---

## Test Scenario 13: Message Grouping
**Objective**: Verify consecutive messages from same sender group nicely

### Steps:
1. User A sends 3 messages rapidly:
   - "Message 1"
   - "Message 2"
   - "Message 3"
2. Verify sender name only shows on first message
3. Verify messages visually grouped together
4. User B sends a message
5. Verify grouping breaks, User B's message starts new group

**Expected Result**: Messages from same sender group visually

---

## Test Scenario 14: Real-Time Sync
**Objective**: Verify Supabase Realtime works

### Steps:
1. Open same meeting in two different browsers (User A and B)
2. User A sends message
3. Verify User B sees message appear instantly (<1 second)
4. User B edits a message
5. Verify User A sees edit immediately
6. User A deletes message
7. Verify User B sees deletion immediately
8. Disconnect internet on User A
9. Verify connection status indicator (if implemented)
10. User A tries to send message
11. Verify error or retry behavior

**Expected Result**: All chat actions sync in real-time

---

## Test Scenario 15: Accessibility (Keyboard Navigation)
**Objective**: Test WCAG 2.1 AA compliance

### Steps:
1. Open chat using keyboard only (Tab to button, Enter to open)
2. Tab through chat UI elements
3. Verify focus indicators visible on:
   - Tab buttons (Public/Private)
   - Search button
   - Close button
   - Message input
   - Send button
4. Type message and press Ctrl+Enter
5. Verify message sends
6. Use screen reader (NVDA/JAWS)
7. Verify ARIA labels read correctly
8. Verify new messages announced

**Expected Result**: Fully keyboard accessible, screen reader friendly

---

## Performance Tests

### Test 16: Large Message History
1. Send 100+ messages
2. Open chat window
3. Verify loads within 2 seconds
4. Scroll to top
5. Verify smooth scrolling
6. Search in large history
7. Verify search response <500ms

### Test 17: File Upload Performance
1. Upload 9MB file
2. Verify upload completes <10 seconds
3. Verify progress indicator updates smoothly

### Test 18: Concurrent Users
1. Have 5+ participants in meeting
2. All send messages simultaneously
3. Verify no messages lost
4. Verify messages appear in correct order
5. Verify no UI lag or freezing

---

## Edge Cases / Error Scenarios

### Test 19: Network Interruption
1. Start sending message
2. Disconnect network mid-send
3. Verify error handling
4. Reconnect network
5. Verify retry or error message

### Test 20: Empty/Invalid Input
1. Try sending empty message
2. Verify send button disabled
3. Try sending only spaces
4. Verify message not sent
5. Type 1001 characters
6. Verify character limit enforced

### Test 21: Malicious Input (XSS Prevention)
1. Try sending message with HTML: `<script>alert('XSS')</script>`
2. Verify HTML sanitized/escaped in display
3. Try sending `<img src=x onerror=alert(1)>`
4. Verify no script execution

---

## Regression Tests

### Test 22: Chat Doesn't Break Video
1. Start video call with 3 participants
2. Open chat
3. Send multiple messages
4. Verify video/audio quality unchanged
5. Verify no frame drops or audio issues

### Test 23: Other Features Still Work
1. Open chat
2. Toggle video on/off - verify works
3. Mute/unmute audio - verify works
4. Change view mode - verify works
5. Open participant panel - verify works
6. Both panels open simultaneously - verify layout OK

---

## Browser Compatibility

Test all above scenarios in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

---

## Sign-Off Checklist

- [ ] All 23 test scenarios pass
- [ ] No console errors during testing
- [ ] TypeScript compiles without errors
- [ ] All automated tests pass (npm test)
- [ ] Performance acceptable (<200ms API, <1s message delivery)
- [ ] Accessibility tests pass
- [ ] Cross-browser testing complete
- [ ] Mobile responsive testing complete

---

## Known Issues / Limitations

Document any known issues discovered during testing:
1.
2.
3.

---

**Test Completed By**: _______________
**Date**: _______________
**Build Version**: _______________
**Overall Status**: PASS / FAIL / PARTIAL
