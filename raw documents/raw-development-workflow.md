### Development Workflow (Updated with Competitor Features/Controls)

The goal is to build a Minimum Viable Product (MVP) for MeetSoli that includes core features (HD video, low-latency mode, whiteboard, timers, messaging, file sharing, and AI-driven features) while incorporating relevant competitor buttons, controls, and features from Zoom and Google Meet. These additions enhance the niche focus on freelancers and small agencies by improving professionalism, efficiency, and trust in 1:1/small-group client calls (e.g., pitches, reviews). We've prioritized "Add" and "Enhance" recommendations from the analysis, skipping irrelevant ones like breakout rooms or live streaming to maintain minimalism and align with the single $12-15/month plan.

Since you’re using Next.js (App Router recommended for modern features), which supports both frontend and backend (via API routes), you can develop them in parallel but with a slight frontend-first approach for rapid iteration and user feedback. The workflow now integrates all recommended features/controls across phases, with detailed tasks for implementation. This ensures scalability (e.g., via WebRTC for video, Supabase for real-time data) and maintainability (e.g., TypeScript types, modular components).

Key updates:

- **New Components**: Added for features like ParticipantPanel.tsx, Reactions.tsx, Polls.tsx, WaitingRoom.tsx, etc., to handle controls/buttons.
- **Tech Stack Expansions**: WebRTC for video/audio controls; OpenAI/DeepL for AI enhancements; Twilio for SMS; Google Calendar API for scheduling.
- **File Structure**: Expanded to include new components, API routes, and utils.
- **Timeline**: Extended slightly to 5-7 weeks to accommodate additions, assuming solo development with Claude/Cursor AI.
- **Best Practices**: Use dynamic imports for heavy libs (e.g., Excalidraw for whiteboard); track all new features in PostHog for metrics (e.g., usage of mute button).

### 1. Project Setup and Planning (1-2 days)

- **Objective**: Set up the development environment, define the project structure, and plan integration of all recommended features/controls.
- **Tasks**:
    - Initialize a Next.js project with TypeScript: Run npx create-next-app@latest freelancervc --typescript --app (uses App Router for better SSR and real-time support).
    - Install core dependencies: npm install @clerk/nextjs @supabase/supabase-js posthog-js react-icons tailwindcss postcss autoprefixer (for auth, DB, analytics, icons, styling).
    - Additional deps for features: npm install simple-peer webrtc-adapter @excalidraw/excalidraw openai deepl-node twilio googleapis @types/node (WebRTC for video; Excalidraw for whiteboard; OpenAI/DeepL for AI; Twilio for SMS; Google APIs for calendar).
    - Set up Clerk for authentication (user login/signup) – follow Clerk's Next.js quickstart for App Router integration with middleware.
    - Configure Supabase for the database (initial schema for users, meetings, files, participants, polls, reactions) – use Supabase's Next.js quickstart for real-time setup with @supabase/ssr .
    - Set up PostHog for product analytics – initialize in lib/posthog.ts with posthog-js ; track events like "mute_clicked" or "poll_created" for all new controls .
    - Plan the core features and prioritize them for the MVP, now including competitor integrations:
        - Must-have: Authentication, HD video calls (with mute/unmute, video toggle, audio/video source selection, views, pin/spotlight), real-time messaging (public/private chat, reactions, hand raise), file sharing (with stop share), recording (local/cloud, pause/resume, transcription/captions).
        - Nice-to-have: Whiteboard (with annotations, slide controls), timers (with clock display), AI-driven features (auto-summaries, translation/captions, clarifier for reactions), host controls (manage participants, waiting room, lock meeting, permissions), UI options (resize tiles, backgrounds/filters, self-view toggle, floating reactions), post-meeting (save transcripts, clips, docs export), engagement (polls/Q&A, attendance tracking, co-hosts), security (auto-mute on entry, end for all).
    - Environment setup: Add .env.local with keys (Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, Supabase: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, PostHog: NEXT_PUBLIC_POSTHOG_HOST/KEY, OpenAI: OPENAI_API_KEY, DeepL: DEEPL_AUTH_KEY, Twilio: TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER, Google: GOOGLE_CREDENTIALS JSON for Calendar API ).
    - Use Vercel for initial deployment: vercel --prod to test setup early [web:43 for PostHog on Vercel].
    - Mock data planning: Use static JSON for initial testing of controls (e.g., mock participants for pin/spotlight).

### 2. Authentication Setup (2-3 days)

- **Why First**: Authentication is foundational, as most features (e.g., meetings, host controls like remove participant) require user context and roles (host/co-host).
- **Tasks**:
    - Integrate Clerk for user authentication (email/password, social logins like Google for Calendar tie-in) – use Clerk's middleware in middleware.ts to protect routes ; add user roles (e.g., host) via Clerk metadata.
    - Create protected routes in Next.js (e.g., /dashboard, /meeting/[id]) using Clerk's <SignedIn> and redirectToSignIn() .
    - Set up a basic user profile page (app/profile/page.tsx) to verify authentication and display verified badges (tie to Upwork API later).
    - Store user data in Supabase (users table: ID, email, name, role) – use Supabase auth helpers for SSR ; integrate Clerk webhooks for sync .
    - Add initial security controls: In Clerk setup, enable session tokens for API routes to protect features like end meeting for all.
    - Test: Deploy to Vercel and ensure protected routes redirect unauthenticated users.
- **Database Connection**: Connect Supabase early (minimal schema: users table) via lib/supabase.ts [web:5 for real-time]. Use Row Level Security (RLS) for user-specific data (e.g., only hosts access participant management).
- **Tools**: Clerk’s Next.js SDK ; Supabase JS client ; Claude/Cursor AI to generate auth wrappers.

### 3. Frontend Development (10-14 days)

- **Why Frontend First**: Building UI early tests user experience for client-facing controls (e.g., mute button, chat pane). Use mock data to simulate backend (e.g., fake participants for testing pin/spotlight).
- **Tasks** (Grouped by category for clarity; use Tailwind for styling per PRD palette):
    - **Basic In-Meeting Controls**:
        - Enhance HD video: In components/VideoCall.tsx, add WebRTC-based mute/unmute audio button (prominent toggle with AI noise suppression via WebRTC adapter ); start/stop video button integrated with auto-optimize mode (one-click audio-first toggle ).
        - Add audio/video source selection: Pre-call quality check screen (components/QualityCheck.tsx) with dropdowns and JS test button (simulate via navigator.mediaDevices ).
        - Enhance share screen: Build on whiteboard/file sharing; add window-specific share button in toolbar with annotation overlay (components/ScreenShare.tsx using WebRTC getDisplayMedia ).
        - Add stop sharing: Dedicated red "Stop Share" button; auto-pause timer during shares.
        - Enhance chat: In components/ChatWindow.tsx, add public/private mode toggle (use Supabase Realtime channels for private ).
        - Add reactions/non-verbal feedback: components/Reactions.tsx with emoji buttons (thumbs up, raise hand) as floating overlays; tie to AI clarifier (OpenAI NLP for signals ).
        - Enhance recording: Add local/cloud toggle with pause/resume button in VideoCall.tsx (WebRTC recording ).
        - Add view switch: Toggle button for speaker/gallery view (default speaker for 1:1); use CSS grid for layout .
        - Add pin/spotlight: Right-click/context menu for personal pin; host button for spotlight (limit 1-4 participants via state management ).
    - **Advanced/Host/Co-Host Controls**:
        - Add manage participants: components/ParticipantPanel.tsx with mute-all button and individual toggles; auto-mute on entry (WebRTC events ).
        - Enhance remove/expel: "Remove" button tied to verified badges; log reasons in Supabase (disputes table).
        - Enhance invite: One-click link generation in dashboard; auto-email invites with agenda (use Nodemailer or Twilio ).
        - Add waiting room: Simple components/WaitingRoom.tsx with approve/reject buttons; SMS notify via Twilio .
        - Add lock meeting/screen permissions: Toggle buttons post-start; default host-only sharing (state in meeting object).
        - Enhance annotations: Add text/draw tools to whiteboard during screen share (components/Whiteboard.tsx with Excalidraw ).
        - Add polls/Q&A: components/Polls.tsx with simple poll button; AI-summarize results (OpenAI ).
        - Enhance slide control: Integrate PDF import in whiteboard; participant arrow controls (Excalidraw events ).
        - Enhance continuous chat: Add search across history in ChatWindow.tsx (Supabase full-text search ).
        - Add meeting wallpaper: Custom upload (<5MB) button tied to virtual backgrounds (components/Backgrounds.tsx).
        - Add show controls during share: Always-on floating toolbar (CSS fixed position).
        - Enhance calendar: Direct Google Calendar button in scheduling (components/Scheduler.tsx using googleapis ).
        - Enhance docs/whiteboard/clips: Merge with todos; add clip export from recordings (components/Clips.tsx with FFmpeg for trimming ).
    - **Security/Privacy Controls**:
        - Add waiting room toggle: In scheduling UI; auto-enable for new clients (Clerk metadata).
        - Enhance lock meeting: Auto-lock after 5 mins; manual button (API route flag).
        - Add chat permissions: Host-only private chat toggle in ChatWindow.tsx.
        - Add share permissions: Default host-only; co-host option (role check).
        - Add auto-mute/video-off on entry: Customizable in settings; enforce via WebRTC on join .
        - Add end for all: Prominent button with confirmation modal.
    - **UI/Layout/Display Options**:
        - Enhance resize/view modes: Add slider for tile resize; immersive mode for whiteboard (CSS transforms ).
        - Add pin/spotlight: As above.
        - Enhance virtual backgrounds: Add filter presets (e.g., "Office Blur") in Backgrounds.tsx (WebRTC filters ).
        - Enhance panels: Collapsible side panels for participants/chat; auto-hide in full-screen.
        - Add meeting info: Tooltip on hover (meeting ID, security).
        - Enhance clock: Integrate with timer; always-visible in toolbar.
        - Add self-view toggle: Button; default off for audio-first.
        - Add floating reactions: Overlay with fade-out animation (CSS transitions).
    - **Recording/Transcription/Post-Meeting**:
        - Enhance record: As above.
        - Enhance transcription/captions: Tie to AI translator; live captions in 10+ languages via DeepL .
        - Enhance save transcript: Auto-export with todos (CSV/PDF via jsPDF).
        - Enhance clips: Add trimmer from recordings (Clips.tsx ).
        - Enhance whiteboard: Persist post-call; export as asset (Excalidraw API ).
        - Add docs integration: One-click export to Google Docs (lib/google.ts ).
    - **Other/Misc/Engagement**:
        - Add hand raising: Button in Reactions.tsx; AI-notify host (OpenAI ).
        - Add share sound/optimize: Toggle during shares (WebRTC media settings ).
        - Enhance feedback/reactions: Log in AI summary for conversions.
        - Add host controls/disable actions: Granular toggles in ParticipantPanel.tsx.
        - Add invitee list: List with join status; export reports (Supabase query).
        - Add polls: As above; integrate with scope tracker.
        - Add attendance tracking: Auto-reports via email (Nodemailer); tie to late penalties (Twilio SMS ).
        - Enhance embedding/slides: Add slide embed in whiteboard (Excalidraw ).
        - Add co-hosts: Assign button in participant panel (role update via Clerk).
    - Build core UI: Landing page (app/page.tsx), dashboard (app/dashboard/page.tsx with meeting history), video call interface (app/meeting/[id]/page.tsx).
    - Implement real-time UI: Chat window, file drag-and-drop (components/FileUpload.tsx).
    - Set up PostHog: Track all button clicks (e.g., posthog.capture('mute_used')) .
- **Tools**: Claude/Cursor AI for React components/Tailwind [web:19 for collaborative UI]; dynamic imports for Excalidraw (next/dynamic ).
- **Database**: Mock data (static JSON) for UI testing (e.g., mock messages for chat).

### 4. Backend Development (10-14 days)

- **Why After Frontend**: UI prototypes guide backend logic for controls (e.g., API for polls).
- **Tasks**:
    - Set up API routes (app/api/):
        - Meetings: create.ts (with invite link, waiting room ); [id]/ts (update for lock, end for all).
        - Messages: send.ts (public/private, persistent with search ).
        - Files: upload.ts (Supabase Storage, <10MB limit).
        - New: participants/route.ts (manage, remove, co-host assign); polls/route.ts (create/summarize with OpenAI ); reactions/route.ts (log/store); recording/route.ts (cloud save, transcription via OpenAI Whisper ); attendance/route.ts (reports, SMS via Twilio ); calendar/route.ts (Google integration ).
    - Integrate WebRTC: In lib/webrtc.ts, use simple-peer for HD/low-latency (offer/answer/ICE ); handle source selection, backgrounds .
    - Expand Supabase schema: Add tables for meetings (with lock flag), participants (roles, mutes), polls (results), reactions (emojis), attendance (logs), clips (URLs) ; use Realtime for live updates (e.g., reactions ).
    - Implement AI: API calls for summaries (OpenAI ), translation/captions (DeepL ), scope alerts/clarifier.
    - Security: API auth with Clerk tokens; RLS for host-only actions (e.g., remove participant).
- **Tools**: Claude/Cursor AI for API routes/Supabase queries; Postman for testing [web:22 for OpenAI endpoints].

### 5. Real-Time Features and Integrations (7-10 days)

- **Objective**: Enable real-time for controls (e.g., live reactions, captions).
- **Tasks**:
    - WebRTC full impl: Video calls with all basic controls (mute, views, pin ); low-latency mode (ICE optimization ).
    - Supabase Realtime: For messaging (chat permissions ), participants (updates like mute-all), whiteboard sync (Excalidraw with Yjs for collab ).
    - Whiteboard: Integrate Excalidraw in Whiteboard.tsx (dynamic import, annotations/slide controls ).
    - File sharing: Supabase Storage with drag-drop; optimize sound during shares .
    - Timers: Client-side React state; integrate clock/self-view toggle.
    - Integrations: Twilio for waiting room SMS ; Google Calendar for invites/buffers ; DeepL for real-time captions (WebSocket polling ).
- **Database**: Full Supabase connection for real-time (e.g., subscribe to participant changes).

### 6. Additional Features (7-10 days)

- **Tasks**:
    - Teleprompter: Teleprompter.tsx (text overlay, scroll speed).
    - Todo maker: TodoList.tsx (AI extraction from transcripts ).
    - Fatigue alerts: FatigueAlert.tsx (JS analytics for call length).
    - Async video: Upload to Supabase; add clips trimmer .
    - AI polish: Auto-agendas/summaries (OpenAI ); translator (DeepL ).
    - Engagement: Polls with Q&A ; attendance reports (email/SMS ).
    - UI polish: Resize/immersive modes, floating reactions (animations ).
    - Post-meeting: Transcript saves, docs export .
- **Tools**: Claude/Cursor AI; test real-time with multiple browser tabs.

### 7. Testing and Deployment (4-6 days)

- **Tasks**:
    - End-to-end tests: Auth, video (all controls like mute, polls), messaging, sharing; use Jest/Cypress for units (e.g., reaction button ).
    - PostHog analysis: Track feature usage (e.g., 60% chat adoption); identify bottlenecks .
    - Security: Test permissions (e.g., non-hosts can't lock); compliance (GDPR via Supabase ).
    - Deploy to Vercel: Set env vars; preview deploys for WebRTC testing (note: WebSockets need config ).
    - Load test: Simulate 1-5 participants for low-latency (<500ms ).
- **Tools**: Vercel CLI; browser dev tools for WebRTC.

### 8. Iteration and Feedback (Ongoing)

- **Tasks**:
    - Gather feedback via PostHog surveys (e.g., satisfaction with new controls) .
    - Iterate: A/B test buttons (e.g., reaction styles); refine AI accuracy .
    - Scale: Monitor Supabase costs; add fallbacks (e.g., Agora for WebRTC if needed).
    - Future: White-label for agencies per roadmap.

### File System Structure (Updated)

meetsolis/
├── app/

│   ├── api/

│   │   ├── auth/

│   │   │   └── [...nextauth].ts   # Clerk webhooks
│   │   ├── meetings/

│   │   │   ├── create.ts         # Create with invite/waiting room
│   │   │   ├── [id].ts           # Update (lock, end for all)
│   │   │   └── participants/     # Manage, co-host, remove
│   │   ├── messages/

│   │   │   └── send.ts           # Public/private, search
│   │   ├── files/

│   │   │   └── upload.ts         # With stop share
│   │   ├── polls/                # Create/summarize
│   │   ├── reactions/            # Log/store
│   │   ├── recording/            # Save, transcribe/captions
│   │   ├── attendance/           # Reports, SMS
│   │   └── calendar/             # Google integration
│   ├── dashboard/

│   │   └── page.tsx              # With scheduler, history
│   ├── meeting/[id]/

│   │   └── page.tsx              # Video call with all controls
│   ├── profile/                  # User profile with badges
│   ├── components/

│   │   ├── VideoCall.tsx         # HD video, mute/video toggles, views, pin/spotlight
│   │   ├── ChatWindow.tsx        # Public/private, reactions, permissions
│   │   ├── Whiteboard.tsx        # Annotations, slides, persist
│   │   ├── Timer.tsx             # With clock
│   │   ├── FileUpload.tsx        # Drag-drop, share sound
│   │   ├── Teleprompter.tsx

│   │   ├── TodoList.tsx

│   │   ├── FatigueAlert.tsx

│   │   ├── ParticipantPanel.tsx  # Manage, co-host, disable actions
│   │   ├── WaitingRoom.tsx       # Approve/reject, SMS
│   │   ├── Polls.tsx             # Q&A, integrate scope
│   │   ├── Reactions.tsx         # Emoji, hand raise, floating
│   │   ├── QualityCheck.tsx      # Source selection, test
│   │   ├── ScreenShare.tsx       # Window share, stop, optimize
│   │   ├── Backgrounds.tsx       # Virtual, filters, wallpaper
│   │   ├── Clips.tsx             # Trimmer, export
│   │   └── Scheduler.tsx         # Google Calendar button
│   ├── layout.tsx                # Root with Clerk/PostHog
│   ├── page.tsx                  # Landing
│   └── globals.css

├── lib/

│   ├── clerk.ts

│   ├── supabase.ts               # Real-time setup
│   ├── posthog.ts                # Analytics init
│   ├── webrtc.ts                 # Video config, controls
│   ├── openai.ts                 # Summaries, clarifier
│   ├── deepl.ts                  # Translation/captions
│   ├── twilio.ts                 # SMS notifications
│   └── google.ts                 # Calendar API
├── public/

│   ├── favicon.ico
│   └── images/
├── types/

│   ├── user.ts

│   ├── meeting.ts                # With lock, participants
│   ├── message.ts

│   ├── file.ts

│   ├── poll.ts

│   ├── reaction.ts

│   └── attendance.ts

├── .env.local

├── next.config.js

├── tsconfig.json

├── tailwind.config.js

├── posthog.config.js

└── [README.md](http://readme.md/)

### Explanation

- **app/**: App Router for routes/APIs; new folders for features (e.g., polls).
- **api/**: Expanded for controls (e.g., participants for host actions).
- **components/**: New ones for all added buttons/controls (e.g., Reactions.tsx for non-verbal feedback).
- **lib/**: Utils for integrations (e.g., twilio.ts for SMS ; google.ts for calendar ).
- **types/**: TS defs for new entities (e.g., poll.ts).
- **Configuration**: Tailwind for UI; PostHog for tracking .

### Development Journey: Frontend, Backend, or Database First?

- **Frontend First (with Mock Data)**: As before, but now mock all controls (e.g., fake reactions array for testing overlays).
- **Backend and Database in Parallel**: Expand schema for new features (e.g., reactions table); integrate APIs like DeepL for captions .
- **Why Not Database First?**: Same; evolve schema with UI feedback.

### Key Considerations

- **Claude and Cursor AI**: Generate code for new components (e.g., WebRTC controls ); review for consistency.
- **Vercel Deployment**: Supports WebRTC but configure for real-time (e.g., edge functions ); PostHog on Vercel .
- **PostHog**: Track all new events (e.g., "waiting_room_approve") for success metrics .
- **Scalability**: Supabase Realtime scales to 1,000 users ; WebRTC P2P reduces server load .
- **AI Features**: Use OpenAI for summaries/polls ; DeepL for translations ; cap usage for costs.
- **Security**: End-to-end WebRTC encryption ; Clerk for roles in controls.