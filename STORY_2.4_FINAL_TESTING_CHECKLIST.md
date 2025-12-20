# Story 2.4: Real-Time Messaging and Chat - Final Testing Checklist

**Test Date**: _______________
**Tester**: _______________
**Environment**: _______________

---

## ⚠️ PREREQUISITES

**Before testing, ensure database migration is applied:**
```sql
-- Run migration: apps/web/migrations/012_add_chat_and_reactions.sql
-- Or via Supabase Dashboard → SQL Editor
```

**Migration adds:**
- ✅ `recipient_id`, `edited_at`, `is_deleted`, `message_read_by`, `file_id` to messages table
- ✅ `hand_raised`, `hand_raised_at` to participants table
- ✅ Renames `user_id` → `sender_id` in messages

---

## 1. HAND RAISE FUNCTIONALITY ✋

### Test 1.1: Raise Hand (Self)
**Setup**: Join meeting as User A
1. ✅ Locate hand raise button (✋) in control bar (bottom, before Leave button)
2. Click hand raise button
3. ✅ Button turns yellow/highlighted
4. ✅ Toast notification: "Hand raised"
5. ✅ Yellow animated ✋ badge appears on YOUR video tile (top-right corner)
6. ✅ Badge visible in all views (gallery/speaker/2-person)
7. Click hand raise button again
8. ✅ Badge disappears from your tile
9. ✅ Toast notification: "Hand lowered"
10. ✅ Button returns to gray color

### Test 1.2: Hand Raise Visibility (Other Participants)
**Setup**: 2 users in meeting
1. User B raises hand
2. ✅ User A sees yellow ✋ badge on User B's video tile
3. ✅ Badge visible in all layout views (gallery/speaker/filmstrip)
4. User B lowers hand
5. ✅ Badge disappears for User A immediately

### Test 1.3: Hand Raise Persistence
1. User A raises hand
2. User B joins meeting
3. ✅ User B sees User A's hand raise badge on load
4. User A refreshes browser
5. ✅ Hand raise state persists (badge still visible)

---

## 2. CHAT WINDOW INTEGRATION

### Test 2.1: Open/Close Chat
1. ✅ Chat button (💬) visible in control bar
2. Click chat button
3. ✅ Chat window slides in from right (full height sidebar)
4. ✅ Shows: Header with title, close (X) button
5. ✅ Shows: Public/Private tabs, search button
6. ✅ Shows: Message list area, input field at bottom
7. Click close button
8. ✅ Chat window slides out/disappears
9. ✅ Chat button remains in control bar

### Test 2.2: Chat Unread Badge
**Setup**: 2 users in meeting, User A has chat closed
1. User B sends message "Test unread"
2. ✅ Blue badge with number "1" appears on User A's chat button
3. User B sends 2 more messages
4. ✅ Badge updates to "3"
5. User A opens chat
6. ✅ Badge disappears immediately
7. Close chat, User B sends message
8. ✅ Badge reappears

---

## 3. PUBLIC CHAT MESSAGING

### Test 3.1: Send Public Message
1. User A: Type "Hello everyone" in message input
2. Press Enter (or click send button)
3. ✅ Message appears immediately in chat (optimistic UI)
4. ✅ Displays: "You" as sender name, timestamp, message content
5. ✅ Auto-scroll to newest message

### Test 3.2: Receive Public Message
**Setup**: 2 users in meeting
1. User B sends "Message from B"
2. ✅ User A sees message in <1 second
3. ✅ Shows: Sender name ("User B"), timestamp, content
4. ✅ Auto-scroll to bottom

### Test 3.3: Message Grouping
1. User A sends 3 messages rapidly
2. ✅ Messages group together
3. ✅ Sender name only on first message in group
4. ✅ Timestamps on all messages
5. User B sends message
6. ✅ New group starts with sender name

---

## 4. PRIVATE CHAT

### Test 4.1: Send Private Message
1. User A: Switch to "Private" tab
2. ✅ Recipient dropdown appears with participant list
3. Select "User B" from dropdown
4. Type "Private to B" → Send
5. ✅ Message shows indicator: "Private message to [User B]"
6. ✅ Message background color differs from public
7. Switch to Public tab
8. ✅ Private message NOT visible in public

### Test 4.2: Receive Private Message
**Setup**: User A sends private message to User B
1. User B: Switch to Private tab
2. Select "User A" from dropdown
3. ✅ Sees private message from A
4. Reply "Private reply"
5. ✅ User A sees reply in Private tab
6. ✅ Conversation thread visible only to sender/recipient

### Test 4.3: Private Message Isolation
**Setup**: 3 users in meeting
1. User A sends private message to User B
2. ✅ User C CANNOT see this message (even in Private tab)
3. ✅ Only User A and User B see the conversation

---

## 5. MESSAGE EDIT

### Test 5.1: Edit Own Message
1. Send message "Orignal text" (typo intentional)
2. Hover over message
3. ✅ Edit icon (✏️) appears
4. Click edit icon
5. ✅ Message becomes editable textarea
6. ✅ Save/Cancel buttons appear
7. Fix to "Original text" → Save
8. ✅ Message updates immediately
9. ✅ Shows "(edited)" indicator
10. ✅ Timestamp updated

### Test 5.2: Edit Time Limit (5 Minutes)
1. Send message
2. Wait 6 minutes
3. Hover over message
4. ✅ Edit button NOT visible
5. ✅ Message no longer editable

### Test 5.3: Edit Sync (Real-Time)
**Setup**: 2 users viewing same chat
1. User A edits message
2. ✅ User B sees edit immediately
3. ✅ "(edited)" indicator visible to both

---

## 6. MESSAGE DELETE

### Test 6.1: Delete Own Message
1. Send message "Delete me"
2. Hover → Click delete icon (🗑️)
3. ✅ Confirmation prompt appears
4. Confirm deletion
5. ✅ Message replaced with "Message deleted" placeholder
6. ✅ Original content hidden
7. Other user refreshes
8. ✅ Still shows as deleted

### Test 6.2: Host Delete Any Message
**Setup**: Host and participant in meeting
1. Participant sends message
2. Host hovers over participant's message
3. ✅ Delete icon visible
4. Host deletes message
5. ✅ Message deleted for all users
6. ✅ Participant sees own message as deleted

### Test 6.3: Participant Cannot Delete Others
1. Participant hovers over host's message
2. ✅ Delete icon NOT visible
3. ✅ Only edit/delete own messages

---

## 7. FILE ATTACHMENTS

### Test 7.1: Upload File (<10MB)
1. Click attach file button (📎) in input
2. Select PDF file (5MB)
3. ✅ File picker opens
4. ✅ Upload progress indicator shown
5. ✅ File preview appears in input area
6. Type "Sharing document" → Send
7. ✅ Message shows with file attachment card
8. ✅ File card shows: icon, filename, download button

### Test 7.2: Download Attached File
1. Other user sees message with attachment
2. Click download button on file card
3. ✅ File downloads correctly
4. ✅ Filename matches original

### Test 7.3: File Size Limit
1. Attempt to attach file >10MB
2. ✅ Error message: "File size exceeds 10MB limit"
3. ✅ File NOT uploaded
4. ✅ Can still send regular messages

### Test 7.4: Multiple File Types
Test with: PDF, PNG, JPG, DOCX, TXT
✅ All types upload successfully
✅ Download works for all types

---

## 8. EMOJI PICKER

### Test 8.1: Insert Emoji
1. Click emoji button (😊) in message input
2. ✅ Popup appears with 10 quick emojis (👍👎👏❤️😀🤔✋🎉🔥👀)
3. Click 👍 emoji
4. ✅ Emoji inserted at cursor position in input
5. ✅ Popup closes automatically
6. Type "Agreed" → Send
7. ✅ Message displays: "👍 Agreed"

### Test 8.2: Emoji Rendering
1. Send message with multiple emojis: "🎉🔥👏"
2. ✅ All emojis render correctly
3. ✅ Other users see emojis correctly

---

## 9. SEARCH MESSAGES

### Test 9.1: Search Functionality
1. Send 5 messages: "Hello", "Test message", "Another test", "Final message", "Goodbye"
2. Click search button (🔍)
3. ✅ Search input appears at top
4. Type "test"
5. ✅ Only messages containing "test" shown (2 messages)
6. ✅ Match highlighting (optional)
7. Clear search
8. ✅ All messages reappear

### Test 9.2: Search Case Insensitive
1. Search for "TEST"
2. ✅ Finds messages with "test" (lowercase)
3. Search for "hello"
4. ✅ Finds "Hello" (capitalized)

---

## 10. READ RECEIPTS

### Test 10.1: Mark Message as Read
**Setup**: 2 users in meeting
1. User A sends message
2. Initially: No read receipt shown
3. User B opens chat, scrolls to message
4. ✅ User A sees "Seen by 1" below message
5. ✅ Read receipt shows timestamp

### Test 10.2: Multiple Readers
**Setup**: 3 users in meeting
1. User A sends message
2. User B views message
3. ✅ Shows "Seen by 1"
4. User C views message
5. ✅ Updates to "Seen by 2"
6. ✅ Can click to see list of readers (optional)

---

## 11. MEETING SETTINGS (HOST ONLY) ⚙️

### Test 11.1: Open Settings Panel
**Setup**: Join as host
1. ✅ Settings button (sliders icon) visible in control bar (host only)
2. ✅ Settings button NOT visible for non-host participants
3. Click settings button
4. ✅ Settings panel slides in from right
5. ✅ Shows: "Meeting Settings" header, close button
6. ✅ Shows 3 toggle switches:
   - Public Chat
   - Private Chat
   - File Uploads

### Test 11.2: Toggle Chat Enabled
**Setup**: Host opens settings panel
1. Public Chat toggle currently ON (blue)
2. Click toggle to turn OFF
3. ✅ Toggle animates to gray/off position
4. ✅ Toast: "Meeting settings updated"
5. ✅ Private Chat and File Uploads toggles become disabled (grayed out)
6. **Non-host users**: Try to send message
7. ✅ Message input disabled or shows "Chat disabled by host"
8. Turn Public Chat back ON
9. ✅ Participants can send messages again

### Test 11.3: Toggle Private Chat
1. Private Chat toggle ON
2. Turn OFF
3. ✅ Settings saved
4. **Participants**: Switch to Private tab
5. ✅ Private tab disabled or shows message
6. Turn back ON
7. ✅ Private messaging works

### Test 11.4: Toggle File Uploads
1. File Uploads toggle ON
2. Turn OFF
3. ✅ Settings saved
4. **Participants**: Try to click attach file button
5. ✅ Button disabled or shows error
6. Turn back ON
7. ✅ File uploads work

### Test 11.5: Settings Persistence
1. Change all 3 settings
2. Close panel
3. Refresh browser
4. Open settings panel again
5. ✅ Settings retain values from before refresh

---

## 12. REAL-TIME SYNC

### Test 12.1: Message Sync Speed
1. Open meeting in 2 browsers (User A, B)
2. User A sends message
3. ✅ User B sees message in <1 second
4. Measure latency (optional):
   - Target: <500ms
   - Acceptable: <1s

### Test 12.2: Edit Sync
1. User A edits message
2. ✅ User B sees edit immediately
3. ✅ "(edited)" indicator syncs

### Test 12.3: Delete Sync
1. User A deletes message
2. ✅ User B sees deletion immediately
3. ✅ Placeholder syncs

### Test 12.4: Hand Raise Sync
1. User B raises hand
2. ✅ User A sees badge appear <1s
3. User B lowers hand
4. ✅ User A sees badge disappear <1s

---

## 13. ACCESSIBILITY (WCAG 2.1 AA)

### Test 13.1: Keyboard Navigation
1. **Tab through chat UI** (without mouse):
   - ✅ Focus visible on tabs
   - ✅ Focus visible on all buttons
   - ✅ Focus visible on message input
   - ✅ Focus order logical (top to bottom)
2. **Send message with keyboard**:
   - Type message
   - Press **Ctrl+Enter**
   - ✅ Message sends

### Test 13.2: Screen Reader (NVDA/JAWS)
1. Enable screen reader
2. Navigate chat interface:
   - ✅ ARIA labels read correctly
   - ✅ Tabs announced ("Public chat", "Private chat")
   - ✅ Buttons have descriptive labels
   - ✅ New messages announced
3. Send message:
   - ✅ Confirmation announced

### Test 13.3: Color Contrast
1. Check text vs background:
   - ✅ Message text: >4.5:1 contrast
   - ✅ Timestamps: >4.5:1 or >3:1 (large text)
   - ✅ Buttons: >3:1 contrast
2. Use browser dev tools or contrast checker

---

## 14. PERFORMANCE

### Test 14.1: Load Time
1. Join meeting with 50+ messages in history
2. Open chat window
3. ✅ Chat loads in <2 seconds
4. ✅ Smooth scrolling
5. ✅ No UI lag/freezing

### Test 14.2: Message Sending Speed
1. Type message → Send
2. ✅ Appears immediately (optimistic UI)
3. ✅ Server confirmation within 500ms
4. ✅ No delay or spinner needed

### Test 14.3: Search Performance
1. Chat history with 100+ messages
2. Perform search
3. ✅ Results appear <500ms
4. ✅ Typing in search doesn't lag

### Test 14.4: Real-Time Performance
1. Rapid message sending (10 messages in 5 seconds)
2. ✅ All messages sync correctly
3. ✅ No message loss
4. ✅ Order preserved

---

## 15. CROSS-BROWSER TESTING

Test all features in each browser:

### Chrome (Latest)
- [ ] All features working
- [ ] No console errors
- [ ] Performance acceptable

### Firefox (Latest)
- [ ] All features working
- [ ] No console errors
- [ ] Performance acceptable

### Safari (Latest - macOS/iOS)
- [ ] All features working
- [ ] No console errors
- [ ] Performance acceptable

### Edge (Latest)
- [ ] All features working
- [ ] No console errors
- [ ] Performance acceptable

---

## 16. MOBILE RESPONSIVE

### Test 16.1: Mobile Chat UI (iOS/Android)
1. Open meeting on mobile device
2. ✅ Chat button visible and accessible
3. Open chat window
4. ✅ Chat takes full screen width on mobile
5. ✅ Header, tabs, input all visible
6. ✅ Keyboard doesn't cover input field
7. ✅ Scrolling smooth

### Test 16.2: Mobile Touch Interactions
1. ✅ Tap to send message works
2. ✅ Tap to open emoji picker works
3. ✅ Swipe to close chat (optional)
4. ✅ File upload button accessible
5. ✅ All buttons properly sized for touch (44x44px minimum)

---

## 17. ERROR HANDLING

### Test 17.1: Network Disconnect
1. Send message
2. Disconnect network
3. ✅ Error message shown
4. ✅ Message queued/retry (optional)
5. Reconnect network
6. ✅ Real-time sync resumes

### Test 17.2: Invalid File Upload
1. Try to upload corrupted file
2. ✅ Error message shown
3. ✅ Can retry with different file

### Test 17.3: API Errors
1. Simulate 500 error from backend
2. ✅ User-friendly error message
3. ✅ Can retry action

---

## 18. EDGE CASES

### Test 18.1: Empty Chat
1. New meeting with no messages
2. ✅ Shows empty state message
3. ✅ Input field still accessible

### Test 18.2: Long Messages
1. Send message with 1000+ characters
2. ✅ Message sends successfully
3. ✅ Displays correctly (text wrapping)
4. ✅ Doesn't break layout

### Test 18.3: Special Characters
1. Send message with: `<script>alert('XSS')</script>`
2. ✅ Rendered as text, not executed
3. ✅ HTML/script tags escaped
4. Send emojis, Unicode characters
5. ✅ Display correctly

### Test 18.4: Rapid Actions
1. Rapidly click hand raise button
2. ✅ No duplicate API calls
3. ✅ State remains consistent
4. Rapidly send messages
5. ✅ All messages sent
6. ✅ Correct order preserved

---

## 🎯 FINAL SIGN-OFF

### Critical Issues (Blockers)
- [ ] None found

**List any critical issues**:
_______________________________________________

### Major Issues (Must Fix)
- [ ] None found

**List any major issues**:
_______________________________________________

### Minor Issues (Nice to Have)
- [ ] None found

**List any minor issues**:
_______________________________________________

### Overall Status
- [ ] ✅ PASS - All tests passed, ready for production
- [ ] ⚠️ CONDITIONAL PASS - Minor issues, can deploy with notes
- [ ] ❌ FAIL - Critical/major issues, needs fixes before deploy

**Tested By**: _______________
**Date**: _______________
**Sign-Off**: _______________

---

## 📊 Test Results Summary

| Feature | Tests Passed | Tests Failed | Status |
|---------|-------------|--------------|--------|
| Hand Raise | ___/3 | ___ | _____ |
| Chat Integration | ___/2 | ___ | _____ |
| Public Chat | ___/3 | ___ | _____ |
| Private Chat | ___/3 | ___ | _____ |
| Message Edit | ___/3 | ___ | _____ |
| Message Delete | ___/3 | ___ | _____ |
| File Attachments | ___/4 | ___ | _____ |
| Emoji Picker | ___/2 | ___ | _____ |
| Search | ___/2 | ___ | _____ |
| Read Receipts | ___/2 | ___ | _____ |
| Meeting Settings | ___/5 | ___ | _____ |
| Real-Time Sync | ___/4 | ___ | _____ |
| Accessibility | ___/3 | ___ | _____ |
| Performance | ___/4 | ___ | _____ |
| Cross-Browser | ___/4 | ___ | _____ |
| Mobile | ___/2 | ___ | _____ |
| Error Handling | ___/3 | ___ | _____ |
| Edge Cases | ___/4 | ___ | _____ |
| **TOTAL** | **___/56** | **___** | **_____** |

**Pass Rate**: ____%

