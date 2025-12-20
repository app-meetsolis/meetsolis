# Story 2.4: Testing Setup & Instructions

## Overview
This document provides detailed pre-testing setup instructions and verification steps for Story 2.4: Real-Time Messaging and Chat Features.

---

## 1. Prerequisites

### Required Accounts
- ✅ Supabase account with project created
- ✅ Clerk account with application configured
- ✅ Two different Clerk test users (for Host and Participant testing)

### Environment Variables
Verify `.env.local` contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 2. Database Migration Setup

### Migration File
**Location:** `apps/web/migrations/012_add_chat_and_reactions.sql`

This migration adds essential columns for Story 2.4 features:
- `messages` table: `recipient_id`, `edited_at`, `is_deleted`, `message_read_by`, `file_id`
- `participants` table: `hand_raised`, `hand_raised_at`
- `meetings` table: `settings` JSONB with chat permission fields

### Apply Migration

#### Option A: Supabase Dashboard (Recommended for Manual Testing)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy Migration SQL**
   - Open `apps/web/migrations/012_add_chat_and_reactions.sql`
   - Copy entire file contents

4. **Run Migration**
   - Paste SQL into editor
   - Click "Run" button
   - Verify "Success. No rows returned" message

5. **Verify Migration Applied**
   ```sql
   -- Check messages table columns
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'messages'
   ORDER BY ordinal_position;
   ```

   **Expected Columns:**
   - `id` (uuid)
   - `meeting_id` (uuid)
   - `sender_id` (uuid) ← renamed from user_id
   - `recipient_id` (uuid) ← NEW
   - `content` (text)
   - `type` (text)
   - `timestamp` (timestamp with time zone)
   - `edited_at` (timestamp with time zone) ← NEW
   - `is_deleted` (boolean) ← NEW
   - `message_read_by` (jsonb) ← NEW
   - `file_id` (uuid) ← NEW
   - `created_at` (timestamp with time zone)

   ```sql
   -- Check participants table columns
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'participants'
   AND column_name IN ('hand_raised', 'hand_raised_at');
   ```

   **Expected Columns:**
   - `hand_raised` (boolean) ← NEW
   - `hand_raised_at` (timestamp with time zone) ← NEW

   ```sql
   -- Check meetings table settings column
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'meetings'
   AND column_name = 'settings';
   ```

   **Expected Column:**
   - `settings` (jsonb)

#### Option B: Supabase CLI

1. **Ensure Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase (if not already)**
   ```bash
   supabase init
   ```

3. **Link to Project**
   ```bash
   supabase link --project-ref your_project_ref
   ```

4. **Apply Migration**
   ```bash
   supabase migration up
   ```

5. **Verify**
   ```bash
   supabase db diff
   # Should show no pending changes
   ```

---

## 3. Verify Database Schema

Run these SQL queries in Supabase Dashboard → SQL Editor:

### Check Messages Table Structure
```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

**Expected Output (12 columns):**
| column_name | data_type | is_nullable |
|------------|-----------|-------------|
| id | uuid | NO |
| meeting_id | uuid | NO |
| sender_id | uuid | NO |
| recipient_id | uuid | YES |
| content | text | NO |
| type | text | YES |
| timestamp | timestamp with time zone | YES |
| edited_at | timestamp with time zone | YES |
| is_deleted | boolean | YES |
| message_read_by | jsonb | YES |
| file_id | uuid | YES |
| created_at | timestamp with time zone | YES |

### Check Participants Table Structure
```sql
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'participants'
AND column_name IN ('hand_raised', 'hand_raised_at');
```

**Expected Output (2 columns):**
| column_name | data_type | is_nullable |
|------------|-----------|-------------|
| hand_raised | boolean | YES |
| hand_raised_at | timestamp with time zone | YES |

### Check Meetings Table Settings
```sql
SELECT
    id,
    settings
FROM meetings
LIMIT 1;
```

**Expected Output:**
- `settings` should be JSONB (null or `{}` for new meetings)

### Verify Foreign Keys
```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'messages';
```

**Expected Foreign Keys:**
- `messages.meeting_id` → `meetings.id`
- `messages.sender_id` → `users.id`
- `messages.recipient_id` → `users.id`
- `messages.file_id` → `files.id`

---

## 4. Development Server Setup

### Stop Current Server
```bash
# Press Ctrl+C in terminal where dev server is running
```

### Clear Cache & Restart
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies (if needed)
npm install

# Start dev server
npm run dev
```

### Verify Server Running
- Open browser: http://localhost:3000
- Check terminal for "ready - started server on 0.0.0.0:3000"
- No compilation errors should appear

---

## 5. TypeScript Compilation Check

### Run TypeScript Checker
```bash
npx tsc --noEmit
```

**Expected Output:**
```
✓ No errors found
```

If errors appear, they must be fixed before testing.

---

## 6. Browser Setup

### Clear Browser Cache

#### Chrome / Edge
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

#### Firefox
1. Press `Ctrl+Shift+Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "Clear Now"

#### Safari
1. Press `Cmd+Option+E`
2. Or use Developer menu → "Empty Caches"

### Recommended: Use Incognito/Private Windows
- Chrome: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Edge: `Ctrl+Shift+N`
- Safari: `Cmd+Shift+N`

---

## 7. Test Environment Setup

### Two Browser Windows Required

#### Window 1: Host User
- **Browser:** Chrome (regular or incognito)
- **User:** User A (Host)
- **Clerk Account:** Sign in with first test user
- **URL:** http://localhost:3000

#### Window 2: Participant User
- **Browser:** Firefox or Chrome Incognito
- **User:** User B (Participant)
- **Clerk Account:** Sign in with second test user
- **URL:** http://localhost:3000

### Create Test Meeting
1. In **Window 1 (Host)**:
   - Sign in as User A
   - Create new meeting
   - Copy meeting URL/ID

2. In **Window 2 (Participant)**:
   - Sign in as User B
   - Join meeting using URL/ID from step 1

---

## 8. Verification Checklist

Run through this checklist before starting full testing:

### Database Verification
- [ ] Migration 012 applied successfully
- [ ] messages table has 12 columns (including recipient_id, edited_at, is_deleted, message_read_by, file_id)
- [ ] participants table has hand_raised and hand_raised_at columns
- [ ] meetings table has settings column (JSONB)
- [ ] Foreign keys validated

### Development Environment
- [ ] TypeScript: 0 compilation errors
- [ ] Dev server running on http://localhost:3000
- [ ] No console errors on page load
- [ ] Browser cache cleared

### Test Accounts
- [ ] Two different Clerk users created
- [ ] User A can sign in successfully
- [ ] User B can sign in successfully
- [ ] Both users can join same meeting

### Browser DevTools
- [ ] Open DevTools in both windows (F12)
- [ ] Check Console tab for errors
- [ ] Check Network tab for failed requests

---

## 9. Quick Verification Tests

Run these quick tests to ensure setup is correct:

### Test 1: Hand Raise Button Appears
**Window 1 (Host):**
- Join meeting
- Look for ✋ button in control bar
- ✅ Button visible and clickable

### Test 2: Hand Raise API Works
**Window 1 (Host):**
- Click ✋ button
- Check DevTools → Network tab
- ✅ `PUT /api/meetings/[id]/participants/[userId]/hand-raise` returns 200 OK

### Test 3: Hand Raise Indicator Shows
**Window 1 (Host):**
- Click ✋ button to raise hand
- Look at own video tile (top-right corner)
- ✅ Yellow ✋ badge appears with animation

**Window 2 (Participant):**
- Look at Host's video tile
- ✅ Yellow ✋ badge visible on host's tile

### Test 4: Chat Window Opens
**Window 1 (Host):**
- Click chat button (💬) in control bar
- ✅ Chat window slides in from right

### Test 5: Send Public Message
**Window 1 (Host):**
- Type message in chat input
- Press Enter or click Send
- ✅ Message appears in chat window

**Window 2 (Participant):**
- ✅ Same message appears in chat window

### Test 6: Meeting Settings (Host Only)
**Window 1 (Host):**
- Look for Sliders icon (⚙️) in control bar
- ✅ Settings button visible

**Window 2 (Participant):**
- ✅ Settings button NOT visible (host-only)

**Window 1 (Host):**
- Click Settings button
- ✅ Settings panel slides in from right
- Toggle "Public Chat" off
- ✅ Toggle switches to gray/disabled state

**Window 2 (Participant):**
- Try typing message in chat
- ✅ Input disabled or shows "Chat disabled by host" message

---

## 10. Common Issues & Solutions

### Issue: Migration Error "column already exists"
**Solution:**
- Migration was already partially applied
- Check which columns exist with schema queries above
- Manually drop conflicting columns:
  ```sql
  ALTER TABLE messages DROP COLUMN IF EXISTS recipient_id;
  ALTER TABLE messages DROP COLUMN IF EXISTS edited_at;
  -- etc...
  ```
- Then re-run migration

### Issue: 404 Error on Hand Raise API
**Cause:** API route file not found or server not restarted
**Solution:**
- Verify file exists: `apps/web/src/app/api/meetings/[id]/participants/[userId]/hand-raise/route.ts`
- Restart dev server: `Ctrl+C` → `npm run dev`

### Issue: 400 Error "Could not find 'recipient_id' column"
**Cause:** Migration not applied
**Solution:**
- Follow "Apply Migration" section above
- Verify with schema check queries

### Issue: TypeScript Errors
**Cause:** Missing type definitions
**Solution:**
```bash
# Reinstall dependencies
npm install

# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild
npx tsc --noEmit
```

### Issue: Chat Messages Not Syncing
**Cause:** Supabase Realtime subscription issue
**Solution:**
- Check Supabase Dashboard → Database → Replication
- Ensure "messages" table has replication enabled
- Check browser console for WebSocket errors

### Issue: Hand Raise Indicator Not Showing
**Cause:** dbParticipants not passed to view components
**Solution:**
- Verify files updated:
  - `GalleryView.tsx`
  - `SpeakerView.tsx`
  - `TwoPersonView.tsx`
  - `StreamVideoTile.tsx`
  - `StreamVideoCallManagerV2.tsx`

---

## 11. Ready to Test Checklist

Before proceeding to full testing (`STORY_2.4_FINAL_TESTING_CHECKLIST.md`), confirm:

- [x] Database migration applied successfully
- [x] All schema verification queries return expected results
- [x] TypeScript: 0 compilation errors
- [x] Dev server running without errors
- [x] Two browser windows ready with different users
- [x] Both users joined same test meeting
- [x] Quick verification tests (1-6) all passed
- [x] No console errors in browser DevTools
- [x] Network tab shows API calls returning 200 OK

---

## 12. Next Steps

Once all items above are checked:

1. **Open Full Testing Checklist**
   - File: `STORY_2.4_FINAL_TESTING_CHECKLIST.md`

2. **Execute 56 Test Scenarios**
   - 18 categories covering all Story 2.4 features
   - Mark Pass/Fail for each test

3. **Report Issues**
   - Note any failing tests
   - Capture console errors
   - Take screenshots if needed

4. **Complete Testing**
   - Sign off on checklist
   - Document results
   - Report blockers/bugs

---

## Test Data Examples

### Sample Meeting Settings JSON
```json
{
  "chat_enabled": true,
  "private_chat_enabled": true,
  "file_uploads_enabled": true,
  "waiting_room_enabled": false
}
```

### Sample Message Object
```json
{
  "id": "uuid",
  "meeting_id": "uuid",
  "sender_id": "uuid",
  "recipient_id": null,
  "content": "Hello everyone!",
  "type": "public",
  "timestamp": "2025-12-19T10:30:00Z",
  "edited_at": null,
  "is_deleted": false,
  "message_read_by": [
    {
      "user_id": "uuid",
      "read_at": "2025-12-19T10:31:00Z"
    }
  ],
  "file_id": null,
  "created_at": "2025-12-19T10:30:00Z"
}
```

### Sample Participant with Hand Raised
```json
{
  "id": "uuid",
  "meeting_id": "uuid",
  "user_id": "uuid",
  "role": "participant",
  "hand_raised": true,
  "hand_raised_at": "2025-12-19T10:35:00Z",
  "joined_at": "2025-12-19T10:00:00Z"
}
```

---

## Support

If you encounter issues not covered in this guide:
1. Check browser console for error messages
2. Check Network tab for failed API calls
3. Verify Supabase logs in Dashboard → Logs
4. Ensure all environment variables are set correctly
