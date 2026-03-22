# MeetSolis Development To-Do List

## Phase 1: Project Setup and Planning (1-2 days)

- [ ]  **Initialize Next.js Project**
    - Run `npx create-next-app@latest freelancervc --typescript --app` (uses App Router for SSR and real-time support).
    - Verify with `npm run dev` and ensure TypeScript is configured.
- [ ]  **Set Up Version Control**
    - Initialize Git (`git init`), create `.gitignore` (include `node_modules`, `.env.local`, Vercel previews).
    - Push to GitHub with initial commit.
- [ ]  **Install Core Dependencies**
    - Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer` and `npx tailwindcss init -p`.
    - Install Clerk: `npm install @clerk/nextjs`.
    - Install Supabase: `npm install @supabase/supabase-js @supabase/ssr` (for real-time and auth helpers).
    - Install PostHog: `npm install posthog-js`.
    - Install Shadcn UI: `npx shadcn-ui@latest init`.
    - Install Origin UI: `npm install @origin-ui/core` (or per docs).
    - Install Aceternity UI: `npm install aceternity-ui` (or per docs).
    - Install React-Toastify: `npm install react-toastify`.
    - Install Framer Motion: `npm install framer-motion`.
    - Install React-Hotkeys: `npm install react-hotkeys-hook`.
    - Install React Query: `npm install @tanstack/react-query`.
    - Install Sentry: `npm install @sentry/nextjs`.
    - Install ESLint and Prettier: `npm install -D eslint prettier eslint-config-next eslint-config-prettier eslint-plugin-prettier`.
    - Install Husky and Lint-Staged: `npm install -D husky lint-staged`.
    - Install Storybook: `npx storybook@latest init`.
    - **[SEC]** Install Next-Helmet: `npm install next-helmet`.
    - **[SEC]** Install Sanitize-HTML: `npm install sanitize-html`.
    - **New for Features**: Install WebRTC libs: `npm install simple-peer webrtc-adapter`.
    - **New for Features**: Install Whiteboard: `@excalidraw/excalidraw` (or `tldraw` for collab).
    - **New for Features**: Install AI/Integrations: `openai deepl-node twilio googleapis @types/node nodemailer`.
    - **New for Features**: Install Utilities: `next/dynamic jsPDF` (for exports, dynamic imports).
- [ ]  **Set Up Environment Variables**
    - Create `.env.local` with placeholders for Clerk, Supabase, PostHog, Sentry, Paddle, Razorpay, OpenAI (`OPENAI_API_KEY`), DeepL (`DEEPL_AUTH_KEY`), Twilio (`TWILIO_ACCOUNT_SID/AUTH_TOKEN/PHONE_NUMBER`), Google (`GOOGLE_CREDENTIALS` JSON).
    - **[SEC]** Restrict env var access (e.g., `NEXT_PUBLIC_` only for client-side keys); use Vercel env vars for production.
- [ ]  **Create File Structure**
    - Set up `app/`, `components/`, `components/ui/`, `lib/`, `types/`, `public/`, `stories/`.
    - Create initial files: `app/page.tsx` (landing), `app/layout.tsx` (with Clerk/PostHog wrappers), `globals.css` (Tailwind setup).
    - **New Folders/Files**: `app/api/meetings/participants/`, `app/api/polls/`, `app/api/reactions/`, `app/api/recording/`, `app/api/attendance/`, `app/api/calendar/`.
    - **New Components**: `components/ParticipantPanel.tsx`, `components/Polls.tsx`, `components/Reactions.tsx`, `components/QualityCheck.tsx`, `components/ScreenShare.tsx`, `components/Backgrounds.tsx`, `components/Clips.tsx`, `components/Scheduler.tsx`, `components/WaitingRoom.tsx`.
    - **New Libs**: `lib/webrtc.ts`, `lib/openai.ts`, `lib/deepl.ts`, `lib/twilio.ts`, `lib/google.ts`.
    - **New Types**: `types/poll.ts`, `types/reaction.ts`, `types/attendance.ts`.
- [ ]  **Plan Core Features**
    - Document MVP: Authentication (with roles for co-hosts), HD video calls (mute/unmute, video toggle, source selection, views, pin/spotlight, backgrounds/filters), real-time messaging (public/private, reactions/hand raise, permissions), file sharing (drag-drop, stop share, optimize sound), whiteboard (annotations, slide controls, persist), timers (with clock), recording (local/cloud, pause/resume, transcription/captions), host controls (manage participants, waiting room, lock, end for all), UI options (resize tiles, self-view, floating reactions), post-meeting (save transcripts/clips, docs export), engagement (polls/Q&A, attendance tracking), security (auto-mute on entry, chat/share permissions).
    - Prioritize: Teleprompter, todo list, AI features (summaries, translation, clarifier), calendar (Google integration), payments.
    - Update `README.md` with roadmap, security/privacy notes (e.g., WebRTC E2EE, RLS), and feature mappings from competitors.
- [ ]  **Configure UI Libraries**
    - Initialize Shadcn UI, verify Origin UI/Aceternity UI with Tailwind CSS (per PRD palette: navy/teal).
    - Test sample components (e.g., Button for mute, Card for participant panel) in Storybook.
    - **New**: Add Framer Motion for animations (e.g., floating reactions fade-out).
- [ ]  **Set Up Code Quality Tools**
    - Configure ESLint, Prettier, Husky, and Lint-Staged for pre-commit hooks (include TypeScript checks).
- [ ]  **Set Up Storybook**
    - Create stories for UI components (Shadcn UI buttons, Origin UI layouts, Aceternity UI animations, new ones like Reactions.tsx).
- [ ]  **[SEC] Configure Security Headers**
    - Use Next-Helmet in `app/layout.tsx` to set CSP, X-Frame-Options, etc.:
        
        ```tsx
        import { Helmet } from 'next-helmet';
        export default function RootLayout({ children }) {
          return (
            <html lang="en">
              <Helmet>
                <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://*.paddle.com https://*.razorpay.com https://*.openai.com https://*.deepl.com https://*.twilio.com;" />
                <meta httpEquiv="X-Frame-Options" content="DENY" />
                <meta httpEquiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains" />
              </Helmet>
              <body>{children}</body>
            </html>
          );
        }
        
        ```
        
    - Add middleware for Clerk auth protection.

## Phase 2: Authentication Setup (2-3 days)

- [ ]  **Configure Clerk Authentication**
    - Sign up for Clerk, add keys to `.env.local`.
    - Wrap app in `<ClerkProvider>` in `app/layout.tsx`.
    - Create `lib/clerk.ts` for Clerk client and utilities (e.g., getCurrentUser).
    - **New**: Add user roles (host/co-host) via Clerk metadata for participant management.
    - **[SEC]** Enable Clerk’s brute-force protection, session timeout (30 mins), and multi-factor auth.
- [ ]  **Implement Sign-In/Sign-Up Pages**
    - Use Clerk’s `<SignIn />`, `<SignUp />` in `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`.
    - Style with Shadcn UI and Tailwind CSS (navy/teal theme).
    - Add React-Toastify for login/signup feedback (e.g., "Welcome back!").
    - **[SEC]** Sanitize inputs with `sanitize-html` to prevent XSS; add CAPTCHA if needed.
- [ ]  **Set Up Protected Routes**
    - Use Clerk’s middleware (`middleware.ts`) for routes like `/dashboard`, `/meeting/[id]`.
    - Build dashboard (`app/dashboard/page.tsx`) with Shadcn UI Card, showing meeting history and scheduler preview.
    - **New**: Role-based access (e.g., co-hosts see assign button).
- [ ]  **Integrate Supabase for User Data**
    - Create `lib/supabase.ts` (client setup with auth helpers) and `users` table:
        
        ```sql
        create table users (
          id uuid primary key,
          email text not null,
          name text,
          role text default 'host',
          created_at timestamp with time zone default now()
        );
        
        ```
        
    - Enable RLS:
        
        ```sql
        alter table users enable row level security;
        create policy "Users can view own data" on users for select using (auth.uid() = id);
        create policy "Users can update own data" on users for update using (auth.uid() = id);
        
        ```
        
    - Sync Clerk data via webhooks (create `/api/auth/webhook` route).
    - **New**: Add `verified_badge` field for Upwork integration placeholder.
    - **[SEC]** Encrypt `name` field:
        
        ```sql
        create extension if not exists pgcrypto;
        alter table users alter column name type text using pgp_sym_encrypt(name, 'your-encryption-key');
        
        ```
        
    - Use Supabase auth for session management alongside Clerk.
- [ ]  **Test Authentication**
    - Verify signup, login, dashboard access, role assignment, and Supabase data sync (e.g., via PostHog event "user_logged_in").
    - **[SEC]** Test unauthorized access (e.g., non-logged-in to meeting), JWT validation, and session expiry.

## Phase 3: Frontend Development (10-14 days)

- [ ]  **Build Landing Page**
    - Use Shadcn UI Hero, Card, Button; Origin UI for feature cards (e.g., "HD Video with Controls"); Aceternity UI/Framer Motion for animations (e.g., pulse on hero).
    - Optimize with Next.js `<Image>` for hero visuals.
    - Add React-Hotkeys for navigation (e.g., 'G' for signup).
    - **New**: Highlight differentiators (e.g., "One-click Mute & Reactions" section).
    - **[SEC]** Add privacy notice (e.g., “E2EE Calls, GDPR-Compliant”) with Shadcn UI Alert and link to policy.
- [ ]  **Create Dashboard**
    - Build with Shadcn UI Table (for meetings), Origin UI layout, Aceternity UI animations (e.g., slide-in cards).
    - Use React Query for data fetching (mock initially).
    - **New**: Add scheduler preview (`Scheduler.tsx`), attendance reports card.
    - **[SEC]** Add analytics opt-out toggle with Shadcn UI Switch; track "dashboard_viewed" in PostHog.
- [ ]  **Develop Video Call UI**
    - Create `app/meeting/[id]/page.tsx` with Shadcn UI Card (for toolbar), Origin UI containers (video grid), Aceternity UI animations (e.g., fade-in participants).
    - Lazy load `VideoCall.tsx` (with WebRTC hooks), `Whiteboard.tsx`.
    - Add React-Hotkeys for controls (e.g., 'M' for mute, 'V' for video toggle, 'S' for share).
    - **New Basic Controls**: Mute/unmute (prominent toggle with noise suppression indicator), start/stop video (with audio-first toggle), source selection via `QualityCheck.tsx` (dropdowns/JS test), view switch (speaker/gallery toggle, default speaker), pin/spotlight (right-click/context menu), self-view toggle (default off), clock integration (always-visible).
    - **New UI Options**: Resize slider for tiles, immersive mode toggle, meeting info tooltip (ID/security), collapsible panels (participants/chat, auto-hide full-screen), floating reactions overlay (fade-out CSS).
    - **New Security**: "Call Encrypted" toast on join; auto-mute/video-off toggle in settings.
    - **[SEC]** Display secure indicators (e.g., lock icon for E2EE).
- [ ]  **Implement Whiteboard UI**
    - Create `components/Whiteboard.tsx` with `@excalidraw/excalidraw` (dynamic import) and Shadcn UI Card (controls).
    - **New**: Add annotations (text/draw during screen share), slide controls (PDF import, participant arrows), persist post-call (export button).
    - Add Storybook story with mock collab.
- [ ]  **Build Messaging UI**
    - Create `components/ChatWindow.tsx` with Shadcn UI Input, ScrollArea (for threads).
    - **New**: Public/private toggle, continuous chat search (across history), permissions toggle (host-only private).
    - Add React-Toastify for feedback (e.g., "Message sent").
    - **[SEC]** Sanitize message content with `sanitize-html`; RLS preview in UI.
- [ ]  **Create File Upload UI**
    - Build `components/FileUpload.tsx` with Shadcn UI Dropzone (drag-drop).
    - **New**: Stop share button (red, auto-pause timer), optimize sound toggle during shares, window-specific share (`ScreenShare.tsx`).
    - Optimize previews with Next.js `<Image>` (thumbnails).
    - **[SEC]** Frontend validation: Restrict types/size (10MB, PNG/JPG/PDF); signed URL previews.
- [ ]  **New: Build Participant & Host Controls UI**
    - `ParticipantPanel.tsx`: Mute-all/individual toggles, remove button (with reason modal), co-host assign, invitee list (join status), granular disables (video/audio/actions).
    - `WaitingRoom.tsx`: Approve/reject buttons, SMS notify (Twilio preview).
    - `Polls.tsx`: Simple poll creation (e.g., "Approve?"), Q&A input, AI summary button.
    - `Reactions.tsx`: Emoji buttons (thumbs up, raise hand), floating overlays, hand raise notify.
- [ ]  **New: Build Additional UI Elements**
    - `Backgrounds.tsx`: Virtual backgrounds/filters (presets like "Office Blur"), wallpaper upload (<5MB).
    - `Clips.tsx`: Highlight trimmer from recordings (timeline scrubber).
    - Integrate all with Framer Motion for smooth transitions (e.g., spotlight highlight).
- [ ]  **Set Up Analytics**
    - Initialize PostHog (in `lib/posthog.ts`), add Mixpanel/Hotjar/Sentry for errors.
    - **New**: Track all controls (e.g., "mute_clicked", "poll_created", "waiting_room_approve").
    - **[SEC]** Add consent modal for analytics with Shadcn UI Modal; anonymize IPs in PostHog.
- [ ]  **Ensure UI Consistency**
    - Verify UI library compatibility (e.g., Shadcn with Aceternity animations).
    - Test accessibility with `react-axe` (WCAG 2.1 for buttons like mute).
    - Monitor Web Vitals with Vercel Analytics; optimize lazy loads for WebRTC components.

## Phase 4: Backend Development (10-14 days)

- [ ]  **Set Up API Routes**
    - Create core: `app/api/meetings/create.ts` (with invite link, waiting room flag), `app/api/meetings/[id].ts` (update for lock/end for all), `app/api/messages/send.ts` (public/private), `app/api/files/upload.ts` (Storage).
    - **New**: `app/api/meetings/participants/route.ts` (manage, remove, co-host, disables), `app/api/polls/route.ts` (create/summarize with OpenAI), `app/api/reactions/route.ts` (log/store), `app/api/recording/route.ts` (save/transcribe/captions with DeepL), `app/api/attendance/route.ts` (reports/SMS via Twilio), `app/api/calendar/route.ts` (Google integration).
    - Add rate limiting with Upstash or built-in (e.g., 100 req/min per user).
    - **[SEC]** Validate Clerk JWTs in all routes:
        
        ```tsx
        import { auth } from '@clerk/nextjs';
        export async function POST(req) {
          const { userId } = auth();
          if (!userId) return new Response('Unauthorized', { status: 401 });
          // Role check: if (!isHost(userId, meetingId)) return 403;
          // Process request
        }
        
        ```
        
    - **[SEC]** Sanitize API inputs with `sanitize-html`; log errors to Sentry.
- [ ]  **Expand Supabase Schema**
    - Add `meetings` (with lock flag, participants array), `messages` (with search index), `files` (URLs).
    - **New**: `participants` (roles, mutes), `polls` (results), `reactions` (emojis, timestamps), `attendance` (logs, join status), `clips` (URLs).
    - Enable RLS for all:
        
        ```sql
        create table meetings (
          id uuid primary key,
          host_id uuid references users(id),
          title text,
          lock boolean default false,
          start_time timestamp with time zone,
          end_time timestamp with time zone,
          created_at timestamp with time zone default now()
        );
        alter table meetings enable row level security;
        create policy "Hosts manage own meetings" on meetings for all using (auth.uid() = host_id);
        create policy "Participants view joined meetings" on meetings for select using (auth.uid() = any(participants));
        
        ```
        
    - **[SEC]** Encrypt sensitive fields (e.g., `title` with `pgp_sym_encrypt`); add audit logs table for actions like remove participant.
- [ ]  **Integrate WebRTC**
    - Use `simple-peer` for encrypted video (DTLS/SRTP) in `lib/webrtc.ts` (signaling over HTTPS via API).
    - **New**: Handle controls (e.g., source selection, backgrounds via getUserMedia/transforms, views/pin via state).
    - Monitor errors with Sentry (e.g., ICE failures).
    - **[SEC]** Authenticated signaling (Clerk user IDs in SDP); restrict to verified users.
- [ ]  **Implement Real-Time Messaging**
    - Use Supabase Realtime (channels for private chat, subscribe to reactions/polls).
    - Cache queries with React Query (e.g., participant list).
    - **New**: Search across history (full-text index); permissions via channel auth.
    - **[SEC]** Restrict messages to meeting participants via RLS and channel policies.
- [ ]  **Enable File Uploads**
    - Use Supabase Storage with signed URLs (24-hour expiry for shares).
    - **New**: Validate during shares (types/size server-side); log optimizations.
    - **[SEC]** Restrict uploads to authenticated participants; virus scan placeholder (e.g., via Clerk metadata).

## Phase 5: Real-Time Features and Integrations (7-10 days)

- [ ]  **Finalize WebRTC**
    - Test multi-participant (1-4) calls with all controls (e.g., spotlight sync via Realtime).
    - Optimize low-latency (ICE/STUN/TURN config in `webrtc.ts`).
    - **New**: Real-time captions (DeepL polling), reactions overlays (broadcast via Realtime).
    - **[SEC]** Log unauthorized joins with Sentry; enforce auto-mute on entry.
- [ ]  **Enable Collaborative Whiteboard**
    - Use Excalidraw with Yjs/Supabase Realtime for sync (annotations/slide controls).
    - **New**: Persist state post-call (export to Supabase).
    - **[SEC]** Restrict access to meeting participants via Realtime auth.
- [ ]  **Implement Timers**
    - Create `components/Timer.tsx` with Shadcn UI (customizable intervals, clock display, auto-pause on share).
    - Sync via Realtime for shared view.
- [ ]  **Test Real-Time Messaging**
    - Verify instant delivery for chats/reactions/polls with RLS (e.g., private toggle blocks non-hosts).
    - **New**: Test waiting room approvals (Twilio SMS on approve).

## Phase 6: Additional Features (7-10 days)

- [ ]  **Build Teleprompter**
    - Create `components/Teleprompter.tsx` with React-Quill (text overlay, scroll speed slider).
    - **[SEC]** Sanitize rich text inputs with `sanitize-html`.
- [ ]  **Implement Todo List Maker**
    - Create `components/TodoList.tsx` with Shadcn UI List (AI extraction from transcripts via OpenAI).
    - Add `todos` table with RLS (link to meetings).
    - **New**: Export to Google Docs (`lib/google.ts`).
    - **[SEC]** Encrypt `content` field; anonymize for AI calls.
- [ ]  **Add Fatigue Alerts**
    - Create `components/FatigueAlert.tsx` with Shadcn UI Alert (JS analytics for >10hr/week, gentle banner).
- [ ]  **Implement Async Video Sharing**
    - Upload videos to Supabase Storage with signed URLs (30-day expiry).
    - **New**: Clips trimmer (`Clips.tsx` with FFmpeg.wasm or client-side).
- [ ]  **Integrate AI-Driven Features**
    - Use OpenAI (`lib/openai.ts`) for summaries/clarifier/polls; DeepL (`lib/deepl.ts`) for translation/captions (10+ languages).
    - **New**: Real-time clarifier for reactions, scope alerts in polls.
    - **[SEC]** Anonymize inputs (remove PII via regex); avoid storing raw transcripts (process in-memory).
- [ ]  **Add Calendar Integration**
    - Use Google Calendar API (`lib/google.ts`) with Shadcn UI Calendar; add direct button in `Scheduler.tsx` (buffers, invites).
    - **New**: Auto-agendas from emails (Gmail OAuth).
- [ ]  **Add Payment Integration**
    - Install Paddle (`@paddle/paddle-js`), Razorpay (`razorpay`).
    - Create `/api/paddle/webhook`, `/api/razorpay/order`, `/api/razorpay/verify`.
    - Route India to Razorpay, global to Paddle (geo-detect via IP).
    - Use Shadcn UI Modal for checkout ($12-15/month trial).
    - **[SEC]** Validate webhook signatures:
        
        ```tsx
        // app/api/paddle/webhook.ts
        import { verifySignature } from '@paddle/paddle-js';
        export async function POST(req) {
          const body = await req.json();
          if (!verifySignature(body, process.env.PADDLE_PUBLIC_KEY)) return new Response('Invalid signature', { status: 401 });
          // Process webhook (e.g., update user sub in Supabase)
        }
        
        ```
        
    - **[SEC]** Use Paddle’s client-side SDK to avoid card data; PCI compliance.

## Phase 7: Testing and Deployment (4-6 days)

- [ ]  **Unit and Integration Testing**
    - Use Jest for components/APIs (e.g., test mute toggle, poll creation).
    - Test new features: Reactions fade-out, waiting room SMS, AI summaries accuracy.
    - Test accessibility with `react-axe` (e.g., ARIA for video controls).
    - **[SEC]** Test RLS policies (mock users for host-only actions like lock), encryption (decrypt sample data), webhook validation.
- [ ]  **End-to-End Testing**
    - Use Cypress for full flow: Signup, create meeting, join via waiting room, use controls (mute, poll, share), payment, post-meeting export.
    - **New**: Test real-time (multi-browser: reactions sync, captions live).
    - **[SEC]** Test unauthorized scenarios (e.g., non-host end call, invalid share), error handling (e.g., WebRTC fallback).
- [ ]  **Configure Vercel Deployment**
    - Deploy with `vercel --prod`; set env vars and aliases.
    - Enable Vercel Analytics/Speed Insights.
    - **New**: Configure edge functions for low-latency API (e.g., signaling).
    - **[SEC]** Verify HTTPS enforcement, DDoS protection (Vercel built-in), and CSP in production.
- [ ]  **Monitor Analytics**
    - Check PostHog (e.g., control usage metrics), Mixpanel (funnels), Hotjar (heatmaps), Sentry (errors like WebRTC fails).
    - **[SEC]** Monitor suspicious activity (e.g., failed auths, high API rates) via Sentry alerts.

## Phase 8: Iteration and Feedback (Ongoing)

- [ ]  **Gather User Feedback**
    - Share beta with freelancers (e.g., Reddit/Product Hunt); track via PostHog surveys (e.g., "Rate new reactions feature").
    - **New**: A/B test controls (e.g., button styles for mute).
- [ ]  **Iterate Based on Feedback**
    - Fix bugs (e.g., Realtime sync issues), improve UI/UX (e.g., immersive mode), add refinements (e.g., more AI languages).
    - **[SEC]** Audit for new vulns (e.g., post-feedback RLS tweaks); add data deletion endpoint (`/api/user/delete` with GDPR compliance).
- [ ]  **Optimize Performance**
    - Optimize WebRTC (P2P for low latency), APIs (caching), animations (reduce Framer Motion overhead).
    - Monitor costs (Supabase/OpenAI quotas).
- [ ]  **Document the Project**
    - Update `README.md` with setup, feature usage (e.g., "Use /poll to create Q&A"), security/privacy details (E2EE, RLS, encryption keys rotation).
    - **[SEC]** Create privacy policy page (`app/privacy/page.tsx`) with details on data handling (e.g., 30-day deletion).

## Notes to Minimize Errors

- **TypeScript**: Define types for all (e.g., `types/meeting.ts` with lock: boolean); use for API responses.
- **Incremental Testing**: Test per phase (e.g., Phase 3: Mock backend for new UI controls; Phase 4: Unit test new APIs).
- **AI Code Review**: Verify Claude/Cursor AI code for security (e.g., sanitize in polls, auth in WebRTC signaling).
- **Security Best Practices**: HTTPS everywhere, RLS on all tables, JWT validation, sanitized inputs, E2EE via WebRTC, anonymized AI calls.
- **Backup**: Commit to GitHub frequently; use Vercel previews for PR testing.
- **Docs**: Refer to Clerk/Supabase/Paddle/Razorpay/OpenAI/DeepL/Twilio/Google APIs docs; track changes in GitHub issues.