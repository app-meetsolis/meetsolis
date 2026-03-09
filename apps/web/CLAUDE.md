# Frontend (apps/web)

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS, Shadcn UI
- Auth: Clerk — use `useAuth()` hook, `useClerk().signOut()`. Never `useUser()` for auth checks.
- Data fetching: `@tanstack/react-query` — never fetch in useEffect
- Toast: `sonner` ONLY — never react-toastify. Import `Toaster` from `sonner`, place in page root.
- DB access via API routes (service role key bypasses RLS)

## Route Groups

- `(dashboard)` group — URLs are `/clients`, `/intelligence`, `/settings` (NO `/dashboard/` prefix)
- `(auth)` group — login/signup flows
- `(marketing)` group — public pages

## Components

- PascalCase files: `ClientCard.tsx`, `NotesEditor.tsx`
- Location: `src/components/{feature}/ComponentName.tsx`
- Feature folders: `clients/`, `ai/`, `common/`, `ui/` (Shadcn), `dashboard/`, etc.
- Server components by default — add `"use client"` only when using hooks, events, or browser APIs
- Max 500 lines per file — split by concern before adding more

## Import Aliases

```
@/components   → src/components
@/lib          → src/lib
@/hooks        → src/hooks
@/services     → src/services
```

Shared types: `@meetsolis/shared`

## Hooks (src/hooks/)

- camelCase with `use` prefix: `useAuth.ts`, `useMeetings.ts`
- Custom hooks for data fetching wrap react-query

## Styling

- Tailwind only — no inline styles, no CSS modules
- Design tokens: `bg-[#E8E4DD]` (page bg), `text-[#1A1A1A]` (primary), `text-[#6B7280]` (muted)

## Patterns

- Pages with client interactivity: export default server wrapper → inner `"use client"` component, wrap in `<Suspense>`
- Skeleton components for every data-fetched section (e.g. `ClientGridSkeleton`)
- Error/empty states as separate components (e.g. `ClientErrorState`, `ClientEmptyState`)
