# Library Quirks & Gotchas

## Auth (Clerk)
- Use `useAuth()` hook — NOT `useUser()`
- Sign out: `useClerk().signOut()`
- All protected routes require Clerk JWT validation
- Never access `process.env` directly — use config objects

## Toast Notifications
- ONLY use `sonner` — never `react-toastify` or other toast libraries

## Database (Supabase)
- Use service role key — bypasses RLS (intentional for server-side ops)
- `notes` column on clients table must be explicitly present (wasn't in original migration)
- Migration 015: adds `goal`, `start_date`, `notes`, `last_session_at`; drops `phone`, `email`, `linkedin_url`, `tags`, `status`
- Use Zod schemas for all API inputs before touching DB

## Routing (Next.js App Router)
- Route group `(dashboard)` → URLs are `/clients`, `/intelligence`, `/settings` — NO `/dashboard/` prefix
- Server components by default; add `"use client"` only when needed
- API routes: kebab-case filenames e.g. `/api/user-profile`

## TypeScript
- Never use `any` — use proper type definitions
- Define shared types in `packages/shared` and import from there
- Strict mode throughout

## State Management
- Use `@tanstack/react-query` for data fetching/caching — not raw fetch in useEffect
- NEVER mutate state directly

## API Layer
- NEVER make direct HTTP calls from components — use the service layer
- All API routes must use the standard error handler

## Well-Known Packages (prefer these)
- Next.js App Router (not Pages Router)
- Zod for validation
- Tailwind CSS + Shadcn UI
- @tanstack/react-query for data fetching
- `sanitize-html` for XSS prevention

## JSON Parsing in Scripts
- `jq` is NOT installed on this machine
- Use `node -e "..."` for JSON parsing in bash scripts
