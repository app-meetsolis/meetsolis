# App Router Rules

- Files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` — follow Next.js conventions exactly
- Server Actions: co-locate in `actions/` subdirectory next to the feature route
- API routes: `app/api/{kebab-case}/route.ts`
- Check existing `layout.tsx` before adding wrapper divs — avoid double-wrapping
- Never use `useRouter` in server components — it's client-only
- Route groups: `(dashboard)`, `(auth)`, `(marketing)` — parens are folder-only, not in URL
