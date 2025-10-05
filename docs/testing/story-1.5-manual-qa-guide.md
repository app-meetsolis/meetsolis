# Story 1.5 - Manual QA Testing Guide

**Story:** Basic Dashboard with Meeting Management
**Status:** Pending Manual QA
**Tester:** _[Your Name]_
**Date:** _[Test Date]_
**Browser:** _[Chrome/Edge/Firefox]_
**Environment:** Development (localhost:3000)

---

## 🎯 **SETUP - Do This First**

### **Step 1: Start the Development Server**

```bash
# Open terminal in project root (D:\meetsolis)
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**If errors occur:**
- Check that all dependencies are installed: `npm install`
- Verify no other process is using port 3000

---

### **⚠️ TROUBLESHOOTING: Common Setup Errors**

#### **Error: MIME Type / Static Assets 404**

**Symptoms:**
```
Refused to apply style from '/_next/static/css/...' because its MIME type ('text/html') is not a supported stylesheet MIME type
GET /_next/static/chunks/main-app.js 404 (Not Found)
Refused to execute script from '/_next/static/chunks/main-app.js' because its MIME type ('text/html') is not executable
```

**What this means:** Next.js build cache (`.next` folder) is corrupted. The server is serving HTML error pages instead of CSS/JavaScript files.

**How to fix:**
1. **Stop the dev server** (press `Ctrl+C` in terminal)
2. **Delete the build cache:**
   ```bash
   # In project root (D:\meetsolis)
   cd apps/web
   rm -rf .next
   ```
   Or on Windows CMD:
   ```cmd
   cd apps\web
   rmdir /s /q .next
   ```
3. **Restart the server:**
   ```bash
   npm run dev
   ```
4. Wait for "compiled successfully" message
5. Refresh browser (`Ctrl+Shift+R` for hard refresh)

**Why this happens:**
- Dev server stopped mid-build
- Environment variables changed without clean rebuild
- File system issues during hot reload
- Route structure changes while server running

**Prevention:**
- Always stop server before major code changes
- Clear cache after adding/changing environment variables
- Let builds complete before refreshing browser

---

#### **Error: API Route 404 (GET /api/meetings)** ⚠️ **CRITICAL**

**Symptoms:**
```
meetings.ts:51 GET http://localhost:3000/api/meetings 404 (Not Found)
```

**Impact:**
- 🚨 **BLOCKS ALL TESTING** - Dashboard cannot load meetings
- Meeting History shows empty or loading forever
- Create Meeting button may work but meetings won't appear in list

**Root Cause:**
This is **NOT a bug** - the server needs to be restarted after we:
1. Added missing environment variable `NEXT_PUBLIC_APP_URL`
2. Deleted corrupted `.next` cache
3. Created API routes while server was running

**Why restart is required:**
- Next.js does NOT hot-reload environment variable changes
- New API routes need server restart to register
- Deleted cache requires full rebuild

**How to fix (REQUIRED, not optional):**

**Step 1: Stop the server**
- In terminal where `npm run dev` is running
- Press **Ctrl+C**
- Wait for process to stop completely (command prompt returns)

**Step 2: Restart the server**
```bash
npm run dev
```

**Step 3: Wait for successful compilation**
Look for these messages:
```
✓ Ready in X seconds
✓ Compiled successfully
```
⏱️ **Time:** ~1-2 minutes (full rebuild)

**Step 4: Hard refresh browser**
- Press **Ctrl+Shift+R** (Windows/Linux)
- Or **Cmd+Shift+R** (Mac)

**Step 5: Verify fix worked**
- Open DevTools Console (F12)
- Navigate to `http://localhost:3000/dashboard`
- Check console for API call:
  - ✅ **GOOD:** `GET /api/meetings 200 OK` (or 401 if not signed in)
  - ❌ **STILL BROKEN:** `GET /api/meetings 404 Not Found`

**If still 404 after restart:**
```bash
# Nuclear option - full clean rebuild
cd apps/web
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

**Prevention:** Always restart server after:
- Adding/changing environment variables in `.env.local`
- Deleting `.next` cache folder
- Creating new API routes or pages

---

#### **Error: Rate Limiting Failure + API 404** ⚠️ **CRITICAL**

**Symptoms:**
```
Rate limiting error: [TypeError: fetch failed] { cause: [Error: AggregateError] }
GET /api/meetings 404 in 767ms
```

**Impact:**
- 🚨 Rate limiting middleware failing on every request
- API routes return 404
- Console flooded with error messages
- Dashboard completely broken

**Root Cause:**
Upstash Redis configured to connect to `http://localhost:8079` (doesn't exist). Rate limiting middleware tries to connect and fails.

**Fix Applied (Already Done):**
✅ I've disabled Redis in `.env.local` for you

**You MUST restart server for this to take effect:**

```bash
# 1. Stop server
Ctrl+C

# 2. Restart
npm run dev

# 3. Wait for success
# Look for: ✓ Compiled successfully

# 4. Hard refresh browser
Ctrl+Shift+R
```

**Expected after restart:**
- ✅ No more "Rate limiting error" messages
- ✅ GET /api/meetings returns 200 or 401 (not 404)
- ✅ Dashboard loads successfully

**Why this happened:**
- Development environment doesn't need rate limiting
- Redis connection was misconfigured
- Middleware should skip rate limiting in dev mode

**Note:** Rate limiting is disabled in development. In production, configure real Upstash Redis credentials.

---

#### **Error: Favicon 404**

**Symptoms:**
```
GET http://localhost:3000/favicon.ico 404 (Not Found)
```

**Impact:** Low - This is cosmetic only, won't affect testing
**Note:** Fixed in current version, ignore if you see this error

---

### **Step 2: Open Browser and DevTools**

1. Open **Google Chrome** or **Microsoft Edge**
2. Navigate to `http://localhost:3000`
3. Press **F12** to open DevTools
4. Click **Console** tab (keep this visible throughout testing)
5. Click **Network** tab in another DevTools pane

---

### **Step 3: Sign In (Authentication Required)**

1. On homepage, click **"Sign In"** button
2. Use your test account credentials (Clerk authentication)
3. After sign-in, you should be on the homepage or redirected automatically

**✅ Checkpoint:** You should see "Sign Out" option, indicating you're authenticated

---

## 🧪 **TEST 1: Dashboard Page & Responsive Design (AC1)**

### **Test 1.1: Desktop View - Initial Load**

**Actions:**
1. In browser address bar, type: `http://localhost:3000/dashboard`
2. Press **Enter**
3. Watch the page load

**Expected Results:**
- [ ] Page loads within 2-3 seconds
- [ ] No red errors in Console tab
- [ ] You see a welcome message: "Welcome back, [Your First Name]!"
- [ ] Navigation menu visible at top with: Dashboard, Meetings, Settings
- [ ] "Start Meeting" button visible in header
- [ ] User profile icon/avatar visible in top-right corner
- [ ] Meeting History section below with title "Recent Meetings"
- [ ] Metrics Preview section showing cards with numbers

**Screenshot Checkpoint:** Page should look clean with navy (#001F3F) and teal (#00A0B0) colors

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 1.2: Desktop - Component Verification**

**Actions:**
1. Scroll through the dashboard page
2. Visually inspect all sections

**Expected Results:**
- [ ] **Header Section:**
  - Logo on left (if present)
  - Navigation menu in center/left
  - "Start Meeting" button prominent
  - User profile avatar on right

- [ ] **Metrics Cards (3 cards displayed):**
  - Card 1: "Total Meetings" with a number
  - Card 2: "Meeting Hours" with hours count
  - Card 3: "Average Duration" with time

- [ ] **Meeting History Section:**
  - Search input field with placeholder "Search meetings..."
  - Filter dropdown labeled "Status"
  - Date range inputs or filters
  - List of meetings (or empty state if no meetings)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 1.3: Tablet View (768px - 1023px)**

**Actions:**
1. Press **F12** to open DevTools
2. Press **Ctrl+Shift+M** (Windows) or **Cmd+Shift+M** (Mac) for device toolbar
3. In top bar, select dropdown that shows screen size
4. Choose **"iPad"** or manually set width to **800px**

**Expected Results:**
- [ ] Layout adjusts to 2-column grid
- [ ] Navigation menu still visible and clickable
- [ ] Metrics cards stack in 2 columns or single column
- [ ] Meeting History table/cards resize appropriately
- [ ] User profile dropdown still accessible
- [ ] No horizontal scrolling required
- [ ] All text remains readable (no truncation)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 1.4: Mobile View (320px - 767px)**

**Actions:**
1. In DevTools device toolbar, select **"iPhone SE"** or **"iPhone 12"**
2. Or manually set width to **375px**
3. Scroll through entire page

**Expected Results:**
- [ ] Layout changes to single-column stack
- [ ] Navigation menu visible (may be hamburger icon or bottom tabs)
- [ ] "Start Meeting" button full-width or centered
- [ ] Metrics cards stack vertically (1 per row)
- [ ] Meeting History table converts to cards or scrollable list
- [ ] Search and filters stack vertically
- [ ] All buttons are at least 48px tall (easy to tap)
- [ ] No text overlapping or cut off
- [ ] User profile avatar still visible and tappable

**Try Tapping:**
- [ ] Tap "Start Meeting" button → should work
- [ ] Tap user profile → dropdown should open
- [ ] Tap navigation items → should navigate

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 1.5: Responsive - Return to Desktop**

**Actions:**
1. In DevTools, click **"Responsive"** mode
2. Drag the viewport width from 375px → 1440px slowly

**Expected Results:**
- [ ] Layout smoothly transitions from mobile → tablet → desktop
- [ ] No layout breaks or overlapping elements during resize
- [ ] All components remain functional at every width

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC1 COMPLETE** - Dashboard is fully responsive!

---

## 🧪 **TEST 2: Meeting History with Search & Filter (AC2)**

### **Test 2.1: Display Meetings**

**Actions:**
1. Navigate to `/dashboard` (if not already there)
2. Scroll to "Recent Meetings" section
3. Look at the meeting list

**Expected Results:**

**If NO meetings exist:**
- [ ] Empty state message appears: "No meetings found" or "Get started by creating your first meeting!"
- [ ] Illustration or icon shown
- [ ] No table/cards visible

**If meetings exist:**
- [ ] Meetings displayed in table or card grid
- [ ] Each meeting shows:
  - Meeting title
  - Status badge (green "Scheduled", blue "Active", gray "Ended")
  - Date/time of meeting
  - Join/View button
- [ ] Meetings sorted by most recent first

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 2.2: Search Functionality**

**Actions:**
1. Find the search input box (labeled "Search meetings...")
2. Click inside the search box
3. Type: `Test`
4. **Wait 1 second** (debounce delay)

**Expected Results:**
- [ ] As you type, there's a ~500ms delay before search activates
- [ ] Meeting list filters to show only meetings with "Test" in title
- [ ] Other meetings are hidden

**Actions (continued):**
5. Clear the search box (delete all text)
6. **Wait 1 second**

**Expected Results:**
- [ ] All meetings return to the list
- [ ] No console errors

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 2.3: Search - No Results**

**Actions:**
1. In search box, type: `XYZ99999NonExistent`
2. Wait 1 second

**Expected Results:**
- [ ] Meeting list becomes empty
- [ ] Empty state message appears: "No meetings match your search"
- [ ] No errors in console

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 2.4: Search - Case Insensitive**

**Actions:**
1. Clear search box
2. Create a test meeting with title "Quick Standup" (see Test 3 below for how)
3. In search box, type: `quick` (lowercase)
4. Wait 1 second

**Expected Results:**
- [ ] "Quick Standup" meeting appears in results
- [ ] Search is case-insensitive

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 2.5: Status Filter**

**Actions:**
1. Clear search box
2. Find the "Status" dropdown/select component
3. Click the dropdown to open it

**Expected Results:**
- [ ] Dropdown opens showing options:
  - "All" (or "All Statuses")
  - "Scheduled"
  - "Active"
  - "Ended"

**Actions (continued):**
4. Click **"Scheduled"**

**Expected Results:**
- [ ] Dropdown closes
- [ ] Only meetings with status "scheduled" are shown
- [ ] Badge shows green or appropriate color

**Actions (continued):**
5. Open dropdown again, select **"Active"**

**Expected Results:**
- [ ] Only active meetings shown (if any)

**Actions (continued):**
6. Select **"All"** from dropdown

**Expected Results:**
- [ ] All meetings return to list

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 2.6: Combined Search + Filter**

**Actions:**
1. In search box, type: `Team`
2. Wait 1 second
3. Open status dropdown, select **"Scheduled"**

**Expected Results:**
- [ ] Meetings list shows only scheduled meetings with "Team" in title
- [ ] Both filters applied simultaneously

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC2 COMPLETE** - Search and filters work correctly!

---

## 🧪 **TEST 3: Quick Meeting Creation (AC3)**

### **Test 3.1: Open Create Meeting Dialog**

**Actions:**
1. On dashboard, locate the **"Start Meeting"** button (usually in header)
2. Click the button

**Expected Results:**
- [ ] Modal/dialog appears in center of screen
- [ ] Screen behind dialog is dimmed (overlay)
- [ ] Dialog title says "Create New Meeting" or similar
- [ ] Form contains:
  - **Meeting Title** input field (may be pre-filled with "Quick Meeting" or similar)
  - **Description** textarea (optional)
  - **"Start Meeting"** button (primary/navy color)
  - **"Cancel"** button or **X** close icon

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.2: Form Validation - Empty Title**

**Actions:**
1. If title field has default text, clear it completely
2. Leave title field **empty**
3. Click **"Start Meeting"** button

**Expected Results:**
- [ ] Error message appears: "Title is required" or "Please enter a meeting title"
- [ ] Form does NOT submit
- [ ] Modal stays open
- [ ] Title input field shows red border or error styling

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.3: Form Validation - Valid Input**

**Actions:**
1. In title field, type: `Quick Standup`
2. In description field (if present), type: `Daily team sync`
3. Keep DevTools Network tab open and visible

**Expected Results:**
- [ ] Error message disappears
- [ ] "Start Meeting" button is enabled (not grayed out)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.4: Create Meeting - Success Flow**

**Actions:**
1. Click **"Start Meeting"** button
2. **Watch carefully:**
   - Button text
   - Network tab
   - Page changes

**Expected Results:**

**Immediately after clicking:**
- [ ] Button text changes to "Creating..." or shows spinner
- [ ] Button becomes disabled (can't click again)

**Within 1-2 seconds:**
- [ ] In Network tab, see **POST** request to `/api/meetings`
- [ ] Request shows status **201** (Created) - click it to see details
- [ ] Response body contains meeting object with:
  ```json
  {
    "id": "some-uuid",
    "title": "Quick Standup",
    "description": "Daily team sync",
    "invite_link": "http://localhost:3000/meeting/abc123",
    "status": "scheduled",
    ...
  }
  ```

**Within 2-3 seconds:**
- [ ] Success toast notification appears (top-right or top-center):
  - Message: "Meeting created successfully!"
  - Green checkmark icon
  - Auto-dismisses after 3-5 seconds
- [ ] Browser redirects to `/meeting/[id]` (meeting room page)
  - **Note:** Meeting room may not be fully implemented yet, you might see 404 or placeholder - **this is OK for now**

**Fallback if no redirect:**
- [ ] Modal closes
- [ ] New meeting appears in dashboard meeting list
- [ ] Meeting has "Scheduled" status

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.5: Create Another Meeting**

**Actions:**
1. Navigate back to `/dashboard` (if redirected away)
2. Click "Start Meeting" button again
3. Enter title: `Client Demo`
4. Enter description: `Product walkthrough for client`
5. Click "Start Meeting"

**Expected Results:**
- [ ] Second meeting created successfully
- [ ] Same success flow as before
- [ ] Both meetings now visible in meeting list

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.6: Cancel Meeting Creation**

**Actions:**
1. Click "Start Meeting" button
2. Enter title: `Cancel Test`
3. Click **"Cancel"** button or **X** close icon

**Expected Results:**
- [ ] Modal closes immediately
- [ ] No meeting created (no API call in Network tab)
- [ ] Dashboard unchanged

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 3.7: Error Handling - Network Offline**

**Actions:**
1. In DevTools, click **Network** tab
2. Find dropdown that says **"Online"** or **"No throttling"**
3. Change to **"Offline"**
4. Click "Start Meeting" button
5. Enter title: `Offline Test`
6. Click "Start Meeting"

**Expected Results:**
- [ ] Button shows loading state briefly
- [ ] After 5-10 seconds, error toast appears:
  - Message: "Failed to create meeting" or "Network error"
  - Red color or error icon
- [ ] Modal stays open (form data NOT lost)
- [ ] You can edit the form again

**Actions (continued):**
7. In DevTools Network tab, change back to **"Online"**
8. Click "Start Meeting" button again (without re-entering data)

**Expected Results:**
- [ ] Meeting creates successfully this time
- [ ] Success toast appears

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC3 COMPLETE** - Meeting creation works with proper feedback!

---

## 🧪 **TEST 4: User Profile Section (AC4)**

### **Test 4.1: Profile Display**

**Actions:**
1. On dashboard page, look at top-right corner
2. Find user profile component

**Expected Results:**
- [ ] Avatar/icon visible showing:
  - User's profile image (if uploaded to Clerk), OR
  - Initials in colored circle (fallback) - e.g., "JD" for John Doe
- [ ] Avatar size is consistent (likely 40px diameter)
- [ ] Avatar has hover effect (slight brightness change or border)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 4.2: Open Profile Dropdown**

**Actions:**
1. Click on the user avatar/icon
2. Watch what happens

**Expected Results:**
- [ ] Dropdown menu appears below avatar
- [ ] Dropdown contains user information:
  - **Name:** Your full name from Clerk account
  - **Email:** Your email address
  - **Role:** "freelancer" or "host" (or similar)
- [ ] Dropdown menu items visible:
  - **Settings** (with gear icon)
  - **Profile** (with user icon)
  - **Sign Out** (with logout icon)
- [ ] Icons display next to each menu item (Lucide React icons)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 4.3: Navigate to Settings**

**Actions:**
1. Click on user avatar to open dropdown (if not already open)
2. Click **"Settings"** menu item

**Expected Results:**
- [ ] Browser navigates to `/dashboard/settings`
- [ ] Settings page loads (may show "Page not found" if not implemented - **this is OK**)

**Actions (continued):**
3. Click browser **Back** button to return to dashboard

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 4.4: Navigate to Profile**

**Actions:**
1. Click user avatar
2. Click **"Profile"** menu item

**Expected Results:**
- [ ] Browser navigates to `/dashboard/profile`
- [ ] Profile page loads (may show 404 - **this is OK**)

**Actions (continued):**
3. Navigate back to `/dashboard`

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 4.5: Sign Out Flow**

**Actions:**
1. Click user avatar
2. Click **"Sign Out"** menu item
3. **Watch carefully**

**Expected Results:**
- [ ] Clerk sign-out process triggers
- [ ] You're redirected to login page or homepage
- [ ] Dashboard is no longer accessible (protected route)

**Actions (continued):**
4. Sign back in to continue testing
5. Navigate to `/dashboard`

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC4 COMPLETE** - User profile displays and dropdown works!

---

## 🧪 **TEST 5: Navigation & Keyboard Shortcuts (AC5)**

### **Test 5.1: Navigation Menu Display**

**Actions:**
1. On dashboard, look for navigation menu (usually top-left or left sidebar)
2. Identify navigation items

**Expected Results:**
- [ ] Navigation contains items:
  - **Dashboard** (home icon)
  - **Meetings** (video icon)
  - **Settings** (gear icon)
- [ ] Current active route is highlighted (navy background or teal accent)
- [ ] Icons display correctly (Lucide React icons)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 5.2: Click Navigation**

**Actions:**
1. Click **"Meetings"** nav item
2. Observe page change

**Expected Results:**
- [ ] Browser navigates to `/dashboard/meetings`
- [ ] "Meetings" nav item becomes highlighted/active
- [ ] Page loads (may show 404 if not implemented - **OK**)

**Actions (continued):**
3. Click browser Back button
4. Click **"Settings"** nav item

**Expected Results:**
- [ ] Navigates to `/dashboard/settings`
- [ ] "Settings" becomes active

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 5.3: Keyboard Shortcut - Dashboard (Ctrl+D)**

**Actions:**
1. Navigate away from dashboard (e.g., go to `/dashboard/meetings`)
2. Press **Ctrl+D** (Windows) or **Cmd+D** (Mac)
3. **Watch for browser bookmark dialog** - if it appears, this is browser default behavior

**Expected Results:**

**If bookmark dialog appears:**
- This means keyboard shortcut needs testing in different way
- ⚠️ **Note:** Ctrl+D is browser default for bookmarking, may conflict

**If NO bookmark dialog:**
- [ ] Page navigates to `/dashboard`
- [ ] Dashboard nav item highlighted

**Workaround if conflict:**
- Test shortcuts in incognito/private window
- Or note this as potential issue for review

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ CONFLICT
**Notes:**

---

### **Test 5.4: Keyboard Shortcut - Meetings (Ctrl+M)**

**Actions:**
1. Make sure you're on `/dashboard` page
2. Press **Ctrl+M** (Windows) or **Cmd+M** (Mac)

**Expected Results:**
- [ ] Page navigates to `/dashboard/meetings`
- [ ] "Meetings" nav item highlighted
- [ ] No browser conflicts (Ctrl+M is usually unused)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 5.5: Keyboard Shortcut - Settings (Ctrl+,)**

**Actions:**
1. Navigate to `/dashboard`
2. Press **Ctrl+,** (Ctrl and comma key)

**Expected Results:**
- [ ] Page navigates to `/dashboard/settings`
- [ ] "Settings" nav item highlighted

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 5.6: Tooltip Display**

**Actions:**
1. Navigate to `/dashboard`
2. **Hover** your mouse over **"Dashboard"** nav item
3. **Wait 300-500ms** without moving mouse

**Expected Results:**
- [ ] Tooltip appears showing: "Dashboard (Ctrl+D)"
- [ ] Tooltip styled with Shadcn UI design
- [ ] Tooltip disappears when mouse moves away

**Actions (continued):**
4. Hover over **"Meetings"** nav item

**Expected Results:**
- [ ] Tooltip shows: "Meetings (Ctrl+M)"

**Actions (continued):**
5. Hover over **"Settings"** nav item

**Expected Results:**
- [ ] Tooltip shows: "Settings (Ctrl+,)"

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 5.7: Mobile Navigation**

**Actions:**
1. Open DevTools device mode (Ctrl+Shift+M)
2. Set width to **375px** (iPhone size)
3. Look for navigation menu

**Expected Results:**
- [ ] Navigation adapts to mobile:
  - Hamburger menu icon appears (3 horizontal lines), OR
  - Bottom tab bar with nav items, OR
  - Collapsed menu with icons only
- [ ] All nav items are still accessible
- [ ] Tapping nav items works (test by clicking)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC5 COMPLETE** - Navigation and shortcuts work!

---

## 🧪 **TEST 6: Meeting Performance Metrics (AC6)**

### **Test 6.1: Metrics Display**

**Actions:**
1. Navigate to `/dashboard`
2. Scroll to metrics section (usually near top, below welcome message)
3. Identify 3 metric cards

**Expected Results:**
- [ ] **Card 1 - Total Meetings:**
  - Shows number (e.g., "12" or "0")
  - Icon displayed (calendar or list icon)
  - Label: "Total Meetings"

- [ ] **Card 2 - Meeting Hours:**
  - Shows number (e.g., "24.5" or "0")
  - Icon displayed (clock icon)
  - Label: "Total Meeting Hours" or "Meeting Hours"

- [ ] **Card 3 - Average Duration:**
  - Shows time (e.g., "45 min" or "0 min")
  - Icon displayed (timer icon)
  - Label: "Average Duration"

- [ ] All cards have consistent styling:
  - Same height and width
  - Shadcn Card component styling (white background, subtle border)
  - Numbers are large and prominent
  - Labels are smaller, gray text

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 6.2: Loading State**

**Actions:**
1. Open DevTools Network tab
2. Find dropdown that says "Online" or "No throttling"
3. Change to **"Slow 3G"** or **"Fast 3G"** (to simulate slow network)
4. Press **Ctrl+Shift+R** (hard refresh) or **F5** (refresh)
5. **Watch metrics section carefully** as page loads

**Expected Results:**
- [ ] While loading, skeleton loaders appear:
  - Gray animated shimmer effect
  - Placeholder rectangles where numbers will be
  - Same card structure but grayed out
- [ ] After 1-3 seconds, real data loads
- [ ] Smooth transition from skeleton → actual content (fade-in)

**Actions (continued):**
6. Change DevTools Network back to **"Online"**

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 6.3: Placeholder/Mock Data**

**Actions:**
1. On dashboard, check the numbers in metrics cards

**Expected Results:**
- [ ] Numbers display correctly (even if placeholder/mock data)
- [ ] **Note:** These are placeholder metrics for now
- [ ] Actual analytics will be implemented in Epic 4
- [ ] For now, seeing ANY consistent numbers is a pass (e.g., "0" or mock data like "5 meetings")

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC6 COMPLETE** - Metrics preview displays correctly!

---

## 🧪 **TEST 7: Real-time Updates with Supabase (AC7)**

> **Note:** This test requires Supabase database access and Realtime enabled.

### **Test 7.1: Realtime Subscription Active**

**Actions:**
1. Navigate to `/dashboard`
2. Open DevTools Console tab
3. Look for console logs related to Supabase Realtime

**Expected Results:**
- [ ] No errors like "Realtime connection failed"
- [ ] May see log: "Subscribed to meetings channel" or similar
- [ ] Connection indicator shows "Connected" (if implemented)

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 7.2: Multi-Tab Realtime Test**

**Actions:**
1. Open dashboard in **Browser Tab 1**: `http://localhost:3000/dashboard`
2. Open dashboard in **Browser Tab 2**: `http://localhost:3000/dashboard` (duplicate tab)
3. Arrange tabs side-by-side so you can see both
4. In **Tab 1**, create a new meeting:
   - Click "Start Meeting"
   - Title: "Realtime Test"
   - Click "Start Meeting"
   - **Stay on dashboard** (or navigate back after creation)

**Expected Results:**
- [ ] In **Tab 1**, new meeting appears immediately
- [ ] In **Tab 2** (within 1-2 seconds), new meeting automatically appears WITHOUT refreshing
- [ ] No page reload occurred in Tab 2
- [ ] Meeting list updated live

**If meeting doesn't appear in Tab 2:**
- ⚠️ Realtime subscription may not be working
- Check console for Supabase Realtime errors
- Note this as issue for review

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 7.3: Realtime Status Update (Advanced)**

> **Requires Supabase Studio access**

**Actions:**
1. Open Supabase Studio in browser: `https://app.supabase.com`
2. Select your MeetSolis project
3. Go to **Table Editor** → **meetings** table
4. Find a meeting with status "scheduled"
5. In dashboard browser tab, keep it open on `/dashboard`
6. In Supabase Studio, click Edit on that meeting row
7. Change **status** from `scheduled` to `active`
8. Click **Save**
9. **Switch immediately to dashboard tab**

**Expected Results:**
- [ ] Within 1-2 seconds, meeting status badge updates from "Scheduled" to "Active"
- [ ] Badge color changes (green → blue)
- [ ] No page refresh required

**If no update:**
- Try refreshing dashboard manually - meeting should show as "active"
- Note Realtime may need configuration review

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ SKIP (no Supabase access)
**Notes:**

---

### **Test 7.4: Connection Status Indicator (If Implemented)**

**Actions:**
1. On dashboard, look for connection status indicator (usually top-right, near profile)
2. It may show:
   - Green dot with "Connected"
   - Icon indicating connection status

**Expected Results:**
- [ ] Shows "Connected" or green indicator

**Actions (continued):**
3. Open DevTools Network tab
4. Change dropdown to **"Offline"**
5. Wait 5 seconds
6. Check connection indicator

**Expected Results:**
- [ ] Changes to "Disconnected" or red indicator

**Actions (continued):**
7. Change back to **"Online"**
8. Wait 3 seconds

**Expected Results:**
- [ ] Returns to "Connected" green status

**If no connection indicator visible:**
- ⚠️ This may not be implemented yet - **note for optional enhancement**

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ NOT IMPLEMENTED
**Notes:**

**✅ AC7 COMPLETE** - Real-time updates functional!

---

## 🧪 **TEST 8: Accessibility Compliance (AC8)**

### **Test 8.1: Keyboard Navigation - Tab Order**

**Actions:**
1. Navigate to `/dashboard`
2. Click in browser address bar (to reset focus)
3. Press **Tab** key repeatedly
4. **Watch which elements get focus** (should see outline/border)

**Expected Results:**
- [ ] Focus moves through elements in logical order:
  1. Logo/brand (if present)
  2. Navigation menu items (Dashboard → Meetings → Settings)
  3. "Start Meeting" button
  4. User profile avatar
  5. Search input in Meeting History
  6. Status filter dropdown
  7. Meeting cards/rows (if present)
  8. Any action buttons on meetings
- [ ] Each focused element shows **visible focus indicator**:
  - 2px outline in teal color (#00A0B0), OR
  - Blue browser default outline
- [ ] Focus never disappears (always visible)
- [ ] No focus trapped in one component

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 8.2: Keyboard Navigation - Activate Elements**

**Actions:**
1. Press **Tab** until "Start Meeting" button has focus (outlined)
2. Press **Enter** key

**Expected Results:**
- [ ] Modal opens (same as clicking)
- [ ] Focus moves to first input field in modal (title field)

**Actions (continued):**
3. Press **Escape** key

**Expected Results:**
- [ ] Modal closes
- [ ] Focus returns to "Start Meeting" button

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 8.3: Keyboard Navigation - Form Interaction**

**Actions:**
1. Open "Start Meeting" modal (Tab + Enter on button)
2. Type meeting title: `Keyboard Test`
3. Press **Tab** to move to description field
4. Type description: `Testing keyboard access`
5. Press **Tab** to move to "Start Meeting" button
6. Press **Enter**

**Expected Results:**
- [ ] Meeting creates successfully (same as mouse click)
- [ ] All form interactions work via keyboard only

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 8.4: Color Contrast Check**

**Actions:**
1. On dashboard, right-click on page
2. Select **Inspect** (DevTools opens)
3. Click **Elements** tab
4. Find **Accessibility** pane (may need to click >> to expand more tabs)
5. If available, click **"Contrast"** or use Lighthouse

**Alternative Method:**
1. Open DevTools
2. Click **Lighthouse** tab
3. Check **"Accessibility"** only
4. Click **"Generate report"**
5. Wait for report to complete

**Expected Results (Lighthouse Report):**
- [ ] Score: **90+** (Accessibility)
- [ ] No contrast errors in report
- [ ] Specifically check:
  - Navy text (#001F3F) on white background: **Pass** (high contrast)
  - Teal text (#00A0B0) on white: **Should pass** (4.5:1 minimum)
  - Button text readable on navy background

**Manual Visual Check:**
- [ ] All text is easily readable
- [ ] Status badges have clear text
- [ ] No light gray text on white background

**Result:** ⬜ PASS / ⬜ FAIL
**Lighthouse Score:** ___/100
**Notes:**

---

### **Test 8.5: ARIA Labels (Screen Reader Support)**

**Actions:**
1. In DevTools, click **Elements** tab
2. Find "Start Meeting" button in HTML tree
3. Click on it to inspect

**Expected Results:**
- [ ] Button has appropriate attributes:
  - `aria-label="Start Meeting"` OR
  - Visible text content: "Start Meeting"
- [ ] Icon-only buttons have `aria-label`

**Actions (continued):**
4. Inspect status filter dropdown
5. Check for ARIA attributes

**Expected Results:**
- [ ] `role="combobox"` or `role="button"`
- [ ] `aria-label` or `aria-labelledby` present

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 8.6: Screen Reader Test (Optional - Advanced)**

> **Skip this if you don't have screen reader enabled**

**Windows Users:**
1. Press **Ctrl+Win+Enter** to start Narrator
2. Navigate to `/dashboard`
3. Use **Tab** and **Arrow keys** to navigate

**Expected Results:**
- [ ] All buttons are announced clearly
- [ ] Meeting titles are read aloud
- [ ] Form inputs announce their labels
- [ ] Status changes announced (if Realtime works)

**Mac Users:**
1. Press **Cmd+F5** to enable VoiceOver
2. Navigate dashboard with **Tab** and **VO keys**

**Expected Results:**
- [ ] Similar to Windows - all elements announced

**Turn off screen reader when done:**
- Windows: Ctrl+Win+Enter
- Mac: Cmd+F5

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ SKIP
**Notes:**

---

### **Test 8.7: Focus Visible Styling**

**Actions:**
1. Navigate dashboard with **Tab** key
2. Carefully observe each focused element

**Expected Results:**
- [ ] Every interactive element shows focus state:
  - Buttons: Outline or ring around button
  - Inputs: Border changes color
  - Links: Underline or outline appears
  - Cards: Border highlights
- [ ] Focus outline is **2px thick** or visually prominent
- [ ] Teal color (#00A0B0) preferred for focus indicators

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC8 COMPLETE** - Accessibility standards met!

---

## 🧪 **TEST 9: Loading States & Error Handling (AC9)**

### **Test 9.1: Page Loading - Skeleton Loaders**

**Actions:**
1. Open DevTools Network tab
2. Set throttling to **"Slow 3G"**
3. Clear browser cache:
   - Press **Ctrl+Shift+Delete**
   - Select "Cached images and files"
   - Click "Clear data"
4. Navigate to `/dashboard`
5. **Watch page load carefully**

**Expected Results:**

**During initial load (first 1-2 seconds):**
- [ ] **User Profile:** Gray skeleton circle where avatar will be
- [ ] **Metrics Cards:** 3 skeleton cards with shimmer animation
- [ ] **Meeting History:** Skeleton rows/cards (3-5 placeholders)
- [ ] **Navigation:** May show skeletons or load immediately

**After data loads (2-5 seconds):**
- [ ] Smooth fade-in transition from skeleton → real content
- [ ] No "flash" or jarring layout shift
- [ ] All skeletons replaced with actual data

**Actions (continued):**
6. Set Network throttling back to **"Online"**

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 9.2: Button Loading States**

**Actions:**
1. Click "Start Meeting" button
2. Enter title: `Loading State Test`
3. Open DevTools Network tab
4. Set to **"Slow 3G"** (to see loading state longer)
5. Click "Start Meeting" button
6. **Immediately watch button**

**Expected Results:**

**While request is processing:**
- [ ] Button text changes to "Creating..." OR spinner icon appears
- [ ] Button becomes disabled (grayed out, can't click again)
- [ ] Button shows loading animation (spinner rotating)

**After request completes:**
- [ ] Button returns to normal "Start Meeting" text
- [ ] Modal closes
- [ ] Success toast appears

**Actions (continued):**
7. Set Network back to **"Online"**

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 9.3: Error Handling - Network Failure**

**Actions:**
1. Click "Start Meeting" button
2. Enter title: `Error Test`
3. In DevTools Network tab, change to **"Offline"**
4. Click "Start Meeting" button
5. **Wait 10 seconds**

**Expected Results:**
- [ ] Button shows loading state initially
- [ ] After timeout (5-10 seconds), error toast appears:
  - Message: "Failed to create meeting" or "Network error"
  - Red background or error icon
  - Toast auto-dismisses after 5 seconds
- [ ] Modal **stays open** (form data preserved)
- [ ] You can still edit title/description
- [ ] No console errors (or only network-related errors)

**Actions (continued):**
6. Change Network to **"Online"**
7. Click "Start Meeting" again (without changing form data)

**Expected Results:**
- [ ] Meeting creates successfully
- [ ] Success toast appears
- [ ] Modal closes

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 9.4: Error Handling - Invalid Input**

**Actions:**
1. Click "Start Meeting"
2. Clear title field (make it empty)
3. Click "Start Meeting" button

**Expected Results:**
- [ ] Error message appears immediately: "Title is required"
- [ ] Red text or border on title input
- [ ] No API request made (check Network tab - should be no POST)
- [ ] Modal stays open
- [ ] User can correct error

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 9.5: Error Boundary - Component Error (Advanced)**

> **This simulates a React component crash**

**Actions:**
1. Open DevTools Console
2. Paste this code and press Enter to intentionally break a component:
   ```javascript
   // This will throw an error next time component renders
   window.throwError = true;
   ```
3. Navigate to a different page (e.g., `/dashboard/meetings`)
4. Navigate back to `/dashboard`

**Expected Results:**

**If ErrorBoundary is working:**
- [ ] Page shows fallback UI instead of blank screen
- [ ] Message like "Something went wrong" or "Error loading component"
- [ ] "Refresh" or "Try again" button visible
- [ ] Clicking refresh reloads component

**If ErrorBoundary NOT implemented:**
- ⚠️ Page may be blank or show error
- Note this for review

**Actions (continued):**
5. Reset the error by refreshing page (F5)

**Result:** ⬜ PASS / ⬜ FAIL / ⬜ NOT IMPLEMENTED
**Notes:**

---

### **Test 9.6: Toast Notifications - Success**

**Actions:**
1. Create a new meeting successfully (any title)
2. **Watch top-right corner of screen**

**Expected Results:**
- [ ] Green toast notification appears
- [ ] Message: "Meeting created successfully!"
- [ ] Checkmark icon visible
- [ ] Toast auto-dismisses after 3-5 seconds
- [ ] Toast has smooth fade-in/out animation

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Test 9.7: Toast Notifications - Error**

**Actions:**
1. Set Network to **"Offline"**
2. Try creating a meeting
3. **Watch for toast notification**

**Expected Results:**
- [ ] Red/orange toast notification appears
- [ ] Message: "Failed to create meeting" or similar error
- [ ] Error icon visible (X or warning symbol)
- [ ] Toast auto-dismisses after 5 seconds

**Actions (continued):**
4. Set Network back to **"Online"**

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

**✅ AC9 COMPLETE** - Loading and error handling works correctly!

---

## 📊 **ADDITIONAL TESTING - Performance & Quality**

### **Performance Test 1: Page Load Time**

**Actions:**
1. Open DevTools
2. Click **Network** tab
3. Press **Ctrl+Shift+R** (hard refresh)
4. Wait for page to fully load
5. Look at bottom of Network tab for timing info

**Expected Results:**
- [ ] **DOMContentLoaded:** < 2 seconds
- [ ] **Load:** < 3 seconds
- [ ] Page feels snappy and responsive

**Actual Results:**
- DOMContentLoaded: _____ ms
- Load: _____ ms

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Performance Test 2: Bundle Size**

**Actions:**
1. In Network tab, filter by **"JS"** (JavaScript files)
2. Look for largest bundles (main.js, page.js, etc.)
3. Check file sizes

**Expected Results:**
- [ ] Initial bundle < 300KB (gzipped)
- [ ] Total JS < 1MB
- [ ] No massive files (> 500KB single file)

**Actual Results:**
- Largest file: _____ KB (_____ file)
- Total JS: _____ KB

**Result:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### **Console Errors Check**

**Actions:**
1. Navigate through entire dashboard
2. Create a meeting
3. Search and filter meetings
4. Open user profile dropdown
5. **Keep Console tab open entire time**

**Expected Results:**
- [ ] **Zero red errors** in console
- [ ] Yellow warnings OK (React development warnings)
- [ ] No unhandled promise rejections
- [ ] No CORS errors
- [ ] No 404 errors for assets

**Common acceptable warnings:**
- React development mode warnings
- Next.js fast refresh messages
- Source map warnings

**Unacceptable errors:**
- Failed API calls (except intentional offline tests)
- Component render errors
- Missing dependencies

**Result:** ⬜ PASS / ⬜ FAIL
**Error Count:** _____
**Notes:**

---

## ✅ **FINAL QA CHECKLIST - Sign Off**

Once all tests above are complete, verify:

- [ ] **AC1 ✅** Dashboard responsive on desktop/tablet/mobile
- [ ] **AC2 ✅** Search and filters work correctly
- [ ] **AC3 ✅** Meeting creation with validation and feedback
- [ ] **AC4 ✅** User profile displays with working dropdown
- [ ] **AC5 ✅** Navigation menu and keyboard shortcuts functional
- [ ] **AC6 ✅** Metrics preview displays with loading states
- [ ] **AC7 ✅** Real-time updates working (or documented if issues)
- [ ] **AC8 ✅** Accessibility: keyboard nav, focus, contrast pass
- [ ] **AC9 ✅** Loading states and error handling correct
- [ ] **No console errors** during normal usage
- [ ] **Performance** acceptable (< 3 sec load time)

---

## 📝 **TEST SUMMARY**

**Tester Name:** _________________________
**Test Date:** _________________________
**Browser:** ⬜ Chrome ⬜ Edge ⬜ Firefox ⬜ Safari
**Browser Version:** _________________________
**Operating System:** ⬜ Windows ⬜ Mac ⬜ Linux

**Overall Result:** ⬜ PASS ⬜ FAIL ⬜ PARTIAL

**Total Tests Executed:** _____
**Tests Passed:** _____
**Tests Failed:** _____
**Tests Skipped:** _____

---

## 🐛 **BUGS FOUND**

### Bug #1
**Severity:** ⬜ Critical ⬜ High ⬜ Medium ⬜ Low
**Test:** _________________________
**Description:**

**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**
**Screenshot/Console Error:**

---

### Bug #2
**Severity:** ⬜ Critical ⬜ High ⬜ Medium ⬜ Low
**Test:** _________________________
**Description:**

**Steps to Reproduce:**
1.
2.
3.

**Expected:**
**Actual:**
**Screenshot/Console Error:**

---

## 💡 **RECOMMENDATIONS & NOTES**

**What worked well:**


**Areas for improvement:**


**Suggestions for enhancement:**


---

## ✍️ **SIGN-OFF**

**QA Tester Signature:** _________________________
**Date:** _________________________

**Status:**
- ⬜ **APPROVED** - Ready for Review
- ⬜ **APPROVED WITH MINOR ISSUES** - Non-blocking issues noted
- ⬜ **REJECTED** - Critical issues must be fixed before review

**Next Steps:**
- [ ] Document bugs in Story 1.5 Debug Log
- [ ] Fix 3 remaining automated test issues
- [ ] Update story status to "Ready for Review"
- [ ] Create PR for Story 1.5

---

## 📚 **QUICK TROUBLESHOOTING REFERENCE**

### **🚨 Problem #1: API 404 Error - "GET /api/meetings 404 Not Found"**

**This is the MOST COMMON issue - check this FIRST!**

**Symptoms:**
- Console error: `GET http://localhost:3000/api/meetings 404 (Not Found)`
- Dashboard loads but no meetings show
- Meeting History section empty or stuck loading

**Solution:**
```bash
# STOP server (Ctrl+C), then:
npm run dev

# Wait for "✓ Compiled successfully"
# Refresh browser (Ctrl+Shift+R)
```

**Why:** Server needs restart to pick up:
- New environment variables
- Deleted cache rebuild
- New API routes

**Time to fix:** ~2 minutes

---

### **Problem #2: Dashboard won't load - MIME type errors in console**

**Symptoms:**
- Browser shows blank page or partially loaded page
- Console errors: "Refused to apply style... MIME type ('text/html')"
- Multiple 404 errors for /_next/static/ files

**Solution:**
```bash
# Stop server (Ctrl+C), then run:
cd apps/web
rm -rf .next
npm run dev
```

**Time to fix:** ~2 minutes (rebuild time)

---

### **Problem: No meetings showing / API 404 errors**

**Symptoms:**
- Dashboard loads but meeting list empty
- Console error: "GET /api/meetings 404"

**Solution:**
1. Check `apps/web/.env.local` exists
2. Verify it has `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. Restart server: `npm run dev`

**Time to fix:** ~30 seconds

---

### **Problem: "User not found" error when creating meeting**

**Cause:** Your Clerk user hasn't been synced to Supabase database

**Solution:**
1. Sign out of application
2. Sign in again (triggers webhook sync)
3. Wait 2-3 seconds
4. Try creating meeting again

---

### **Problem: Build taking too long / server not starting**

**Symptoms:**
- `npm run dev` hangs at "compiling..."
- Terminal shows no errors but never finishes

**Solution:**
```bash
# Force kill any Node processes
# Windows:
taskkill /f /im node.exe

# Mac/Linux:
killall node

# Then restart:
npm run dev
```

---

### **Emergency Reset (if nothing else works)**

```bash
# Full clean and restart (takes 3-5 minutes)
cd D:\meetsolis

# Stop server (Ctrl+C)

# Clean all caches
cd apps/web
rm -rf .next
rm -rf node_modules
cd ../..

# Reinstall and restart
npm install
npm run dev
```

**Use this only as last resort!**

---

**END OF MANUAL QA GUIDE**
