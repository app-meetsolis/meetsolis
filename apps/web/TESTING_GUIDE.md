# Story 2.3: End-to-End Testing Guide

This guide provides comprehensive testing procedures for all features implemented in Story 2.3 (Video Layout and Participant Management).

## Test Environment Setup

### Prerequisites

- Two browser windows/devices for multi-participant testing
- Admin/host account and regular participant account
- Meeting with waiting room enabled (if testing waiting room features)

### Test Data

- Meeting ID: [Create a test meeting]
- Host User: [Your host account]
- Participant User 1: [Regular participant account]
- Participant User 2: [Optional second participant]

---

## Test Suite 1: View Modes & Layout

### 1.1 Auto-View Detection

**Objective**: Verify automatic view mode switching based on participant count

| Participants    | Expected View | Test Steps                                           | Pass/Fail |
| --------------- | ------------- | ---------------------------------------------------- | --------- |
| 1 (self only)   | Gallery       | Join meeting alone, verify gallery view              | ☐         |
| 2 participants  | Speaker       | Add 1 participant, verify switches to speaker view   | ☐         |
| 3+ participants | Gallery       | Add 2+ participants, verify switches to gallery view | ☐         |

**Expected Behavior**:

- Smooth transition between views when participants join/leave
- No flickering or layout jumps
- View mode indicator button reflects current mode

### 1.2 Manual View Toggle

**Objective**: Verify manual override of auto-detected view mode

**Test Steps**:

1. Join meeting with 2 participants (auto-detected: speaker view)
2. Click view mode toggle button in control bar
3. Verify switches to gallery view
4. Click again
5. Verify switches back to speaker view

**Expected**: Manual override persists until changed again

**Result**: ☐ Pass ☐ Fail

### 1.3 Speaker View Layout

**Objective**: Verify 75/25 split layout with correct speaker priority

**Test Steps**:

1. Join meeting with 3+ participants in speaker view
2. Verify main speaker area (75% width) shows large video
3. Verify thumbnail strip (25% width) shows other participants
4. Note which participant is shown as main speaker

**Expected**:

- Large speaker area on left (75%)
- Vertical thumbnail strip on right (25%)
- Active speaker (person talking) shown in main area

**Result**: ☐ Pass ☐ Fail

### 1.4 Gallery View Grid

**Objective**: Verify responsive grid layout adapts to participant count

| Participants | Expected Grid             | Test Steps                                  | Pass/Fail |
| ------------ | ------------------------- | ------------------------------------------- | --------- |
| 1            | 1x1 (centered, max-w-4xl) | Solo, verify centered                       | ☐         |
| 2            | 1x2                       | 2 participants, verify side-by-side         | ☐         |
| 3-4          | 2x2                       | 3-4 participants, verify 2x2 grid           | ☐         |
| 5-9          | 3x3                       | 5-9 participants, verify 3x3 grid           | ☐         |
| 10-16        | 4x4                       | 10-16 participants, verify 4x4 grid         | ☐         |
| 17-25        | 5x5 with pagination       | 17+ participants, verify pagination buttons | ☐         |

### 1.5 Gallery View Pagination

**Objective**: Verify pagination for meetings with >16 participants

**Test Steps** (requires 17+ participants):

1. Join meeting with 17+ participants
2. Verify only first 16 shown
3. Verify "Next" button appears at bottom
4. Click "Next", verify shows next page
5. Verify "Previous" button appears
6. Click "Previous", verify returns to first page

**Expected**: 16 participants per page, smooth pagination

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 2: Participant Management

### 2.1 Participant Panel Display

**Objective**: Verify participant list renders correctly with role badges

**Test Steps**:

1. Click "Participants" button in control bar
2. Verify panel opens on right side (width: 320px)
3. Verify participant list shows:
   - Avatar/initial
   - Display name
   - Role badge (Host, Co-host, or none)
   - Audio status icon (mic on/off)
   - Video status icon (camera on/off)
   - Speaking indicator (green pulse when talking)

**Expected**: All participants listed, sorted by role (Host > Co-host > Participant), then alphabetically

**Result**: ☐ Pass ☐ Fail

### 2.2 Participant Sorting

**Objective**: Verify correct sorting order

**Test Steps**:

1. Open participant panel
2. Note participant order
3. Promote a participant to co-host
4. Verify co-host moves up in list

**Expected Order**:

1. Host(s) - alphabetically
2. Co-host(s) - alphabetically
3. Participants - alphabetically

**Result**: ☐ Pass ☐ Fail

### 2.3 Pin Participant (Local)

**Objective**: Verify local pin feature (not synced to other users)

**Test Steps**:

1. In gallery view, click on a participant tile
2. Verify that participant is pinned (visual indicator)
3. Switch to speaker view
4. Verify pinned participant shows in main speaker area
5. Ask another participant to check their view
6. Verify they do NOT see your pinned participant (local only)

**Expected**: Pin is local, not synced across participants

**Result**: ☐ Pass ☐ Fail

### 2.4 Spotlight Participant (Global)

**Objective**: Verify host spotlight syncs to all participants

**Test Steps** (as host):

1. Open participant panel
2. Click three-dot menu on a participant
3. Select "Spotlight"
4. Verify that participant shows in main area
5. Ask other participants to check their view
6. Verify they ALL see the spotlighted participant

**Expected**: Spotlight syncs to all users, overrides local pins

**Result**: ☐ Pass ☐ Fail

### 2.5 Spotlight Overrides Pin Priority

**Objective**: Verify spotlight has higher priority than local pin

**Test Steps**:

1. Pin participant A locally
2. Ask host to spotlight participant B
3. Verify participant B shows in main area (not A)
4. Ask host to clear spotlight
5. Verify returns to showing participant A (your pin)

**Expected Priority**:

1. Spotlight (host-set, global)
2. Pin (user-set, local)
3. Active speaker
4. First participant

**Result**: ☐ Pass ☐ Fail

### 2.6 Promote to Co-host

**Objective**: Verify role promotion

**Test Steps** (as host):

1. Open participant panel
2. Click three-dot menu on a participant
3. Select "Promote to Co-host"
4. Verify role badge updates to "Co-host"
5. Verify that participant can now access host controls
6. Ask co-host to open participant panel
7. Verify co-host sees three-dot menus with controls

**Expected**: Co-host gains host control permissions

**Result**: ☐ Pass ☐ Fail

### 2.7 Demote Co-host

**Objective**: Verify role demotion

**Test Steps** (as host):

1. Open participant panel
2. Click three-dot menu on a co-host
3. Select "Demote to Participant"
4. Verify role badge changes to none
5. Ask demoted participant to open panel
6. Verify they no longer see host control menus

**Expected**: Participant loses host control permissions

**Result**: ☐ Pass ☐ Fail

### 2.8 Remove Participant

**Objective**: Verify participant removal

**Test Steps** (as host):

1. Open participant panel
2. Click three-dot menu on a participant
3. Select "Remove from meeting"
4. Verify confirmation dialog appears
5. Click "Confirm"
6. Verify participant is removed from list
7. Verify removed participant sees "You have been removed" message
8. Verify removed participant is redirected to dashboard

**Expected**: Participant removed, cannot rejoin without new invite

**Result**: ☐ Pass ☐ Fail

### 2.9 Cannot Remove Host

**Objective**: Verify host cannot be removed

**Test Steps** (as co-host):

1. Open participant panel
2. Try to remove the host
3. Verify "Remove" option is disabled or not shown

**Expected**: Host cannot be removed by anyone

**Result**: ☐ Pass ☐ Fail

### 2.10 Cannot Demote Last Host

**Objective**: Verify last host cannot be demoted

**Test Steps** (as the only host):

1. Open participant panel
2. Try to demote yourself to co-host
3. Verify error message: "Cannot demote the last host. Promote another participant first."

**Expected**: System prevents removing last host role

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 3: Waiting Room

### 3.1 Participant Enters Waiting Room

**Objective**: Verify participants wait for admission

**Test Steps**:

1. Create meeting with waiting room enabled
2. Join as host
3. Join as participant in different browser
4. Verify participant sees waiting room view:
   - "Waiting for host to admit you..."
   - Meeting title displayed
   - Host name displayed
   - Leave button available

**Expected**: Participant cannot join until admitted

**Result**: ☐ Pass ☐ Fail

### 3.2 Host Sees Waiting Participants

**Objective**: Verify waiting room panel for hosts

**Test Steps** (as host):

1. While participant is waiting
2. Open waiting room panel (notification badge should appear)
3. Verify panel shows:
   - Participant name
   - Join time ("Joined X minutes ago")
   - Admit button
   - Reject button

**Expected**: Waiting list updates in real-time

**Result**: ☐ Pass ☐ Fail

### 3.3 Admit Single Participant

**Objective**: Verify individual admission

**Test Steps** (as host):

1. Open waiting room panel
2. Click "Admit" for a participant
3. Verify participant is removed from waiting list
4. Verify participant auto-joins meeting (no manual click)
5. Verify participant appears in participant list

**Expected**: Participant admitted and joins automatically

**Result**: ☐ Pass ☐ Fail

### 3.4 Admit All Participants

**Objective**: Verify bulk admission

**Test Steps** (as host with 3+ waiting):

1. Open waiting room panel with 3+ participants waiting
2. Click "Admit All" button
3. Verify all participants admitted simultaneously
4. Verify waiting list clears
5. Verify all participants appear in meeting

**Expected**: All participants admitted at once

**Result**: ☐ Pass ☐ Fail

### 3.5 Reject Participant

**Objective**: Verify participant rejection

**Test Steps** (as host):

1. Open waiting room panel
2. Click "Reject" for a participant
3. Verify participant removed from waiting list
4. Verify participant sees rejection message
5. Verify participant redirected to dashboard

**Expected**: Participant cannot re-enter without new invite

**Result**: ☐ Pass ☐ Fail

### 3.6 Waiting Room Real-time Updates

**Objective**: Verify real-time synchronization

**Test Steps**:

1. Have 2 co-hosts in meeting
2. Have participant enter waiting room
3. Host 1: admit participant
4. Host 2: check waiting room panel
5. Verify participant removed from both panels

**Expected**: Real-time sync across all hosts/co-hosts

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 4: Meeting Lock

### 4.1 Lock Meeting

**Objective**: Verify meeting lock prevents new joins

**Test Steps** (as host):

1. Open participant panel or settings
2. Toggle "Lock Meeting" option
3. Verify lock icon appears
4. Try to join as new participant in different browser
5. Verify new participant sees "Meeting is locked" message

**Expected**: No new participants can join

**Result**: ☐ Pass ☐ Fail

### 4.2 Unlock Meeting

**Objective**: Verify unlocking allows new joins

**Test Steps** (as host):

1. With meeting locked
2. Toggle "Lock Meeting" off
3. Try to join as new participant
4. Verify participant can join

**Expected**: New participants can join after unlock

**Result**: ☐ Pass ☐ Fail

### 4.3 Lock Status Syncs

**Objective**: Verify lock status syncs to all participants

**Test Steps**:

1. Host locks meeting
2. Check all participant views
3. Verify all see lock indicator

**Expected**: Real-time sync of lock status

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 5: Self-View

### 5.1 Self-View Display

**Objective**: Verify self-view renders correctly

**Test Steps**:

1. Join meeting
2. Verify self-view window appears (bottom-right by default)
3. Verify shows your own video
4. Verify name label shows "Self View" on hover

**Expected**: Draggable window with your video

**Result**: ☐ Pass ☐ Fail

### 5.2 Self-View Dragging

**Objective**: Verify draggable functionality

**Test Steps**:

1. Hover over self-view
2. Verify drag handle appears
3. Click and drag to new position
4. Release
5. Verify window stays at new position
6. Refresh page
7. Verify position persisted (localStorage)

**Expected**: Draggable and position persists

**Result**: ☐ Pass ☐ Fail

### 5.3 Self-View Resizing

**Objective**: Verify size cycling (small → medium → large)

**Test Steps**:

1. Hover over self-view
2. Click resize button (Maximize icon)
3. Verify size changes to medium (240x160)
4. Click again
5. Verify changes to large (320x180)
6. Click again
7. Verify cycles back to small (150x100)

**Expected**: Cycles through 3 sizes smoothly

**Result**: ☐ Pass ☐ Fail

### 5.4 Self-View Toggle Visibility

**Objective**: Verify show/hide toggle

**Test Steps**:

1. Hover over self-view
2. Click hide button (EyeOff icon)
3. Verify self-view disappears
4. Verify floating "Show Self View" button appears (bottom-right)
5. Click floating button
6. Verify self-view reappears

**Expected**: Hide/show toggle works smoothly

**Result**: ☐ Pass ☐ Fail

### 5.5 Self-View Bounds Constraint

**Objective**: Verify stays within viewport

**Test Steps**:

1. Try to drag self-view outside viewport (top, right, bottom, left)
2. Verify window stops at viewport edge
3. Verify cannot drag off-screen

**Expected**: Always stays within visible area

**Result**: ☐ Pass ☐ Fail

### 5.6 Self-View in Immersive Mode

**Objective**: Verify minimizes to tiny corner

**Test Steps**:

1. Press F key to enter immersive mode
2. Verify self-view minimizes to 48x32px
3. Verify moves to top-right corner
4. Verify close button still visible
5. Press F or ESC to exit immersive
6. Verify self-view returns to normal size and position

**Expected**: Minimizes in immersive, restores on exit

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 6: Immersive Mode

### 6.1 Enter Immersive Mode - Button

**Objective**: Verify entering fullscreen via button

**Test Steps**:

1. Click immersive mode button (Maximize2 icon) in control bar
2. Verify browser enters fullscreen
3. Verify meeting ID chip hidden
4. Verify exit button visible (top-right)
5. Verify controls visible initially

**Expected**: Fullscreen mode activated

**Result**: ☐ Pass ☐ Fail

### 6.2 Enter Immersive Mode - Keyboard

**Objective**: Verify F key shortcut

**Test Steps**:

1. Press F key
2. Verify enters fullscreen
3. Press F again
4. Verify exits fullscreen

**Expected**: F key toggle works

**Result**: ☐ Pass ☐ Fail

### 6.3 Exit Immersive Mode - Button

**Objective**: Verify exit button works

**Test Steps**:

1. Enter immersive mode
2. Click exit button (X icon, top-right)
3. Verify exits fullscreen
4. Verify meeting ID chip reappears

**Expected**: Exit button works

**Result**: ☐ Pass ☐ Fail

### 6.4 Exit Immersive Mode - ESC Key

**Objective**: Verify ESC key shortcut

**Test Steps**:

1. Enter immersive mode
2. Press ESC key
3. Verify exits fullscreen

**Expected**: ESC key exits immersive mode

**Result**: ☐ Pass ☐ Fail

### 6.5 Auto-Hide Controls

**Objective**: Verify controls hide after 2 seconds

**Test Steps**:

1. Enter immersive mode
2. Wait 2 seconds without moving mouse
3. Verify control bar disappears
4. Move mouse
5. Verify control bar reappears
6. Wait 2 seconds again
7. Verify control bar hides again

**Expected**: Controls auto-hide/show on mouse movement

**Result**: ☐ Pass ☐ Fail

### 6.6 Immersive Mode UI Changes

**Objective**: Verify all UI changes in immersive mode

**Checklist**:

- ☐ Meeting ID chip hidden
- ☐ Participant panel hidden (if open)
- ☐ Keyboard shortcuts help disabled
- ☐ Self-view minimized to 48x32px
- ☐ Exit button always visible (top-right)
- ☐ Control bar auto-hides after 2s
- ☐ Video takes full screen

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 7: Real-time Synchronization

### 7.1 Participant Join/Leave Events

**Objective**: Verify real-time participant list updates

**Test Steps**:

1. Have participant join meeting
2. Verify all users see new participant appear
3. Have participant leave meeting
4. Verify all users see participant disappear

**Expected**: <1 second delay for updates

**Result**: ☐ Pass ☐ Fail

### 7.2 Spotlight Changes

**Objective**: Verify spotlight broadcasts to all

**Test Steps**:

1. Host spotlights participant A
2. Verify all users see participant A in main area
3. Host changes spotlight to participant B
4. Verify all users see switch to participant B
5. Host clears spotlight
6. Verify all users see spotlight cleared

**Expected**: Instant sync across all participants

**Result**: ☐ Pass ☐ Fail

### 7.3 Role Changes

**Objective**: Verify role changes broadcast

**Test Steps**:

1. Host promotes participant to co-host
2. Verify all participants see updated role badge
3. Verify promoted user gains host controls

**Expected**: Real-time role update

**Result**: ☐ Pass ☐ Fail

### 7.4 Meeting Lock Status

**Objective**: Verify lock status broadcasts

**Test Steps**:

1. Host locks meeting
2. Verify all participants see lock indicator
3. Host unlocks meeting
4. Verify all participants see unlock

**Expected**: Instant lock status sync

**Result**: ☐ Pass ☐ Fail

### 7.5 Waiting Room Events

**Objective**: Verify waiting room real-time updates

**Test Steps**:

1. Have 2 co-hosts
2. Participant enters waiting room
3. Verify both co-hosts see participant in waiting list
4. Co-host 1 admits participant
5. Verify Co-host 2's waiting list updates immediately

**Expected**: Real-time waiting room sync

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 8: Accessibility & Keyboard Navigation

### 8.1 Keyboard Shortcuts

**Objective**: Verify all keyboard shortcuts work

| Shortcut    | Action                       | Test                       | Pass/Fail |
| ----------- | ---------------------------- | -------------------------- | --------- |
| F           | Toggle immersive mode        | Press F twice              | ☐         |
| ESC         | Exit immersive mode          | Enter immersive, press ESC | ☐         |
| Shift+/     | Show keyboard shortcuts help | Press Shift+/              | ☐         |
| Tab         | Navigate focusable elements  | Press Tab through UI       | ☐         |
| Enter/Space | Activate focused button      | Focus button, press Enter  | ☐         |

### 8.2 Screen Reader Support

**Objective**: Verify ARIA labels and announcements

**Test Steps** (with screen reader):

1. Navigate control bar buttons
2. Verify each button announces its purpose
3. Toggle audio/video
4. Verify state changes announced
5. Navigate participant list
6. Verify participant info announced

**Expected**: All interactive elements properly labeled

**Result**: ☐ Pass ☐ Fail

### 8.3 Focus Management

**Objective**: Verify visible focus indicators

**Test Steps**:

1. Use Tab key to navigate UI
2. Verify focused element has visible outline (2px)
3. Verify focus never gets lost
4. Verify focus trap in modals (dialogs)

**Expected**: Focus always visible and logical order

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 9: Edge Cases & Error Handling

### 9.1 Network Interruption

**Objective**: Verify graceful handling of network loss

**Test Steps**:

1. Join meeting
2. Disconnect network
3. Verify connection lost indicator
4. Reconnect network
5. Verify auto-reconnect

**Expected**: Auto-reconnect on network restore

**Result**: ☐ Pass ☐ Fail

### 9.2 Last Participant Leaves

**Objective**: Verify meeting ends correctly

**Test Steps**:

1. Join meeting with 2 participants
2. Have both leave
3. Verify meeting ended notification
4. Verify redirect to dashboard

**Expected**: Clean meeting termination

**Result**: ☐ Pass ☐ Fail

### 9.3 Host Leaves (End Meeting)

**Objective**: Verify host leaving ends meeting

**Test Steps**:

1. Join as host with 2+ participants
2. Host leaves and ends meeting
3. Verify all participants see "Meeting ended by host"
4. Verify all redirected to dashboard

**Expected**: Meeting ends for all participants

**Result**: ☐ Pass ☐ Fail

### 9.4 Concurrent Actions

**Objective**: Verify handling of simultaneous operations

**Test Steps**:

1. Have 2 co-hosts
2. Both try to spotlight different participants at same time
3. Verify one wins (last write wins)
4. Verify no errors or conflicts

**Expected**: Last action wins, no errors

**Result**: ☐ Pass ☐ Fail

### 9.5 Invalid Participant ID

**Objective**: Verify error handling for invalid actions

**Test Steps**:

1. Try to spotlight non-existent participant (API test)
2. Verify 404 error returned
3. Verify no UI crash

**Expected**: Graceful error handling

**Result**: ☐ Pass ☐ Fail

---

## Test Suite 10: Performance & Browser Compatibility

### 10.1 Browser Compatibility

**Objective**: Verify features work across browsers

| Browser | Version | View Modes | Immersive | Draggable | Real-time | Pass/Fail |
| ------- | ------- | ---------- | --------- | --------- | --------- | --------- |
| Chrome  | Latest  | ☐          | ☐         | ☐         | ☐         | ☐         |
| Firefox | Latest  | ☐          | ☐         | ☐         | ☐         | ☐         |
| Safari  | Latest  | ☐          | ☐         | ☐         | ☐         | ☐         |
| Edge    | Latest  | ☐          | ☐         | ☐         | ☐         | ☐         |

### 10.2 Large Meeting (25+ Participants)

**Objective**: Verify performance with many participants

**Test Steps** (simulation or load testing):

1. Join meeting with 25+ participants
2. Verify pagination works smoothly
3. Verify no lag in UI
4. Verify real-time updates still fast

**Expected**: No performance degradation

**Result**: ☐ Pass ☐ Fail

### 10.3 Mobile Responsive (Bonus)

**Objective**: Verify mobile compatibility

**Test Steps** (on mobile device):

1. Join meeting on mobile
2. Verify touch controls work
3. Verify layout adapts to small screen
4. Verify pinch-to-zoom disabled

**Expected**: Mobile-friendly experience

**Result**: ☐ Pass ☐ Fail

---

## Summary Report Template

### Test Execution Summary

**Date**: ******\_******
**Tester**: ******\_******
**Environment**: ******\_******

**Overall Results**:

- Total Tests: 50+
- Passed: \_\_\_
- Failed: \_\_\_
- Skipped: \_\_\_

**Critical Issues Found**: \_\_\_

**Blocker Issues**: \_\_\_

**Notes**:

---

---

---

### Sign-off

- [ ] All critical features tested and working
- [ ] No blocker issues remaining
- [ ] Ready for production deployment

**Approved by**: ******\_\_\_\_******
**Date**: ******\_\_\_\_******
