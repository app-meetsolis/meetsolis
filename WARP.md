# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

MeetSolis is a monorepo for a Next.js 14 App Router application that provides a Zoom-style video meeting platform optimized for freelancers and small agencies. The repo uses npm workspaces with a primary web app under `apps/web` plus shared packages under `packages/*`, and a rich set of architecture and product docs under `docs/`.

Key technologies:
- Frontend: Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind + Shadcn UI
- Backend: Next.js API routes / Vercel Edge-style handlers, Supabase (PostgreSQL, Realtime, Storage)
- Auth: Clerk
- Video: Stream Video SDK (current primary implementation, replacing earlier P2P WebRTC), with abstractions to support other providers
- AI & integrations: OpenAI, DeepL, Twilio, Google Calendar, payment providers (Paddle/Razorpay)

The project is heavily documented in `docs/` (architecture, PRD, front-end spec, migrations) and uses the BMad Method (see below) to structure work into stories and AI-assisted workflows.

## Common commands

All commands below assume you run them from the repo root (`meetsolis/`). Root scripts simply delegate into `apps/web`.

### Install and dev server

- Install dependencies for all workspaces:
  - `npm install`
- Start the main Next.js dev server (recommended default):
  - `npm run dev`
- Start only the web app dev server (same as above today):
  - `npm run dev:web`

### Build and production

- Build the web app for production:
  - `npm run build`
- Start the built app (from `apps/web` if you need to test locally after build):
  - `cd apps/web && npm run start`

### Linting, formatting, and types

These all operate on the `apps/web` project via root scripts:

- ESLint check:
  - `npm run lint`
- ESLint with autofix:
  - `npm run lint:fix`
- Prettier formatting of source files:
  - `npm run format`
- TypeScript type-check (no emit):
  - `npm run type-check`

### Tests (Jest and Cypress)

All Jest tests are configured in `apps/web/jest.config.js` and use the App Router layout plus custom setup files.

From repo root:

- Run all Jest tests:
  - `npm run test`
- Unit tests only (Jest, mostly under `apps/web/tests` and `src/**/__tests__`):
  - `npm run test:unit`
- E2E tests (Cypress, see `apps/web/cypress.config.ts`):
  - Headless run: `npm run test:e2e`
  - Open Cypress runner: `cd apps/web && npm run test:e2e:open`

#### Running a single Jest test / test suite

From repo root you can target specific files or patterns via Jest’s CLI passthrough:

- Single test file:
  - `npm run test -- apps/web/tests/components/dashboard/MeetingHistory.test.tsx`
- Pattern match by name:
  - `npm run test -- MeetingHistory`

If you prefer working inside `apps/web` directly:

- `cd apps/web && npm test -- tests/components/dashboard/MeetingHistory.test.tsx`

#### Database integration tests (Supabase)

Database integration tests live under `apps/web/tests/database` and are **ignored by default** via `jest.config.js`.

To run them you must:

1. Configure real Supabase credentials in `apps/web/.env.local` (see `docs/development/database-migrations.md` and `apps/web/tests/database/README.md`).
2. Enable database tests by setting the environment flag **for Jest**:
   - `cd apps/web`
   - `RUN_INTEGRATION_TESTS=true npm run test -- tests/database`

This will include the `tests/database` directory in the Jest run and execute tests that hit a live Supabase instance.

### Database migrations and seeding

Database schema is managed via SQL migrations under `apps/web/migrations` and documented in `docs/development/database-migrations.md`.

The npm scripts are stubs to remind you to use the Supabase CLI, but they are still a useful entry point:

- Migrate (delegates to Supabase tooling per docs):
  - `npm run db:migrate`
- Seed data:
  - `npm run db:seed`
- Reset DB (local/dev use only):
  - `npm run db:reset`

For real migration management (especially against Supabase projects) follow the Supabase CLI commands and workflows in `docs/development/database-migrations.md`.

## Code architecture and structure

### Monorepo layout

High-level structure (see `docs/architecture/unified-project-structure.md` and `docs/architecture.md` for the full picture):

- `apps/web/` – Next.js app (App Router) with both UI and API routes
- `packages/shared/` – Shared TypeScript types, constants, and utilities
- `packages/config/` – Shared configuration (ESLint, TypeScript, Jest presets)
- `docs/` – Architecture, PRD, UI/UX spec, QA and operations docs, and story files under `docs/stories/`

The monorepo uses npm workspaces defined in the root `package.json`.

### Next.js app structure (`apps/web/src`)

Core directories (focus on conceptual responsibilities, not an exhaustive list):

- `app/`
  - App Router entrypoint and route groups.
  - Key route groups include `(auth)/`, `(dashboard)/`, `(marketing)/`, as well as `onboarding/`, `test-sentry/`, and the root `layout.tsx`/`global-error.tsx`.
  - API routes for backend logic live under `app/api/...` (pattern documented in `docs/architecture.md` under “Backend Architecture”), following a consistent error-handling and Zod-based validation pattern.

- `components/`
  - `meeting/` – All in-call UI and device controls: `StreamVideoCallManagerV2`, `StreamVideoProvider`, `StreamControlBar`, `StreamVideoTile`, `DeviceSettingsPanel`, `DeviceTestWizard`, layout previews, and meeting loading skeletons.
  - `dashboard/` – Authenticated user dashboard components (meeting creation, history, metrics, navigation, profile banner).
  - `marketing/` – Landing page and pricing/hero/CTA components.
  - `onboarding/` – UI for guided onboarding flows (progress, contextual help, compatibility banners, tutorial overlays).
  - `analytics/`, `debug/`, `admin/`, `common/`, `ui/` – Cross-cutting components, including Shadcn UI primitives under `ui/` and wrappers such as `ErrorBoundary` and `CookieConsent`.

- `contexts/`
  - `MeetingContext.tsx` – Central React context for meeting-related state and coordination between meeting components and services.

- `hooks/`
  - Meeting hooks (`hooks/meeting/*`) encapsulate audio/video controls, participant state, push-to-talk, etc.
  - Generic hooks (e.g., `useAuth`, `useMeetings`, `useMeetingRealtime`, `useConnectionQuality`, `useLayoutConfig`) bridge UI with the services and lib layers.

- `lib/`
  - `analytics/` – Integration shims for Sentry, PostHog, Mixpanel, Vercel analytics, web-vitals, and feature flags; used by both app and tests.
  - `auth/` – Role and auth configuration for Clerk.
  - `config/` – Environment/configuration plumbing (env parsing, service endpoints, cross-environment toggles).
  - `security/` – Security helpers: GDPR utilities, HTTP headers/CSP, rate limiting, sanitization; referenced by API routes and middleware.
  - `supabase/` – Supabase client setup for browser and server, realtime utilities, and helpers; this is the entrypoint for database access.
  - `stream/` – Stream Video SDK integration and helpers; used by video services and meeting components.
  - `service-factory.ts`, `services/base-service.ts`, `circuit-breaker.ts`, `performance/`, `monitoring/` – Cross-cutting infrastructure layer (service creation, resilience patterns, performance instrumentation).

- `services/`
  - Domain-level services that encapsulate business logic and remote calls:
    - `auth.ts` – Auth-related operations beyond simple Clerk hooks.
    - `meetings.ts` – Meeting creation/join/update orchestration, typically wrapping Supabase and API endpoints.
    - `video/` – Pluggable video service abstraction with `VideoServiceInterface`, `StreamVideoService`, and `LiveKitVideoService` plus a `VideoServiceFactory`. The meeting components talk to this abstraction rather than directly to a specific provider.

- `types/`
  - Frontend-facing TypeScript types (e.g., layout and onboarding types), with more fundamental/shared types expected to live in `packages/shared` per coding standards.

### Shared packages

- `packages/shared/`
  - Intended home for cross-cutting TypeScript types, constants, and utilities.
  - Referenced from the web app via the `@meetsolis/shared` path alias (see `apps/web/tsconfig.json` and `apps/web/jest.config.js` moduleNameMapper).

- `packages/config/`
  - Centralizes base config for ESLint, TypeScript, and Jest (see exported `eslint-config.js`, `typescript-config.json`, `jest-config.js`).
  - The idea is that `apps/web` and any future apps can share consistent linting and type-check rules.

### Testing structure (`apps/web/tests`)

The test suite follows the architecture/testing docs in `docs/architecture/testing-strategy.md` and the pyramid described in `docs/architecture.md`:

- `components/` – React component tests using Testing Library.
- `hooks/` – Hook-level unit tests.
- `lib/` – Tests for analytics, security, and other shared libs.
- `api/` – Tests targeting API routes (Edge handlers) using `supertest`/`node-mocks-http` patterns.
- `auth/`, `security/`, `webrtc/` – Targeted test groups for middleware, security helpers, and WebRTC behavior.
- `integration/` – End-to-end-ish integration tests for flows like onboarding and service connectivity.
- `database/` – Supabase integration tests hitting a real database, discussed above.
- `e2e/` – Cypress configuration, support files, and E2E specs (spec paths configured in `cypress.config.ts`).

There is also `tests/jest.d.ts` for custom Jest typings and setup.

### Architecture and product documentation

For deeper architectural context, these documents are the canonical references:

- `docs/architecture.md` and `docs/architecture/index.md` – Full-system architecture: high-level diagrams, tech stack, backend and frontend architecture, API spec, database schema, security/performance, testing, and deployment.
- `docs/architecture/frontend-architecture.md` and `docs/architecture/high-level-architecture.md` – Focused views on frontend structure and system diagram.
- `docs/architecture/unified-project-structure.md` – Intended project layout; the current repo closely follows this.
- `docs/front-end-spec.md` – Detailed UI/UX and flow spec (navigation, key flows like onboarding and core call, layout expectations).
- `docs/prd.md` – Master product requirements (functional + non-functional) and epic list.
- `docs/development/database-migrations.md` – Canonical migration and seeding workflow for Supabase.
- `docs/stories/*.story.md` – BMad-style story files representing units of work, plus QA and test design documents in nearby subfolders.

When making non-trivial changes, especially around meetings, video, or AI features, it is worth cross-checking relevant sections in these docs.

## BMad Method and AI-agent workflows

This repo is designed to work with the BMad Method and multiple AI personas (Claude, Cursor, etc.). Warp agents don’t need to emulate those personas, but should be aware of the workflow and constraints it encodes:

- The BMad system is configured via `.bmad-core/` (not shown here) and driven by story files under `docs/stories/` and tasks/templates/checklists under `.bmad-core/...`.
- `CLAUDE.md` describes the high-level vision, tech stack, and critical coding standards; these apply regardless of which AI/IDE you use.
- `.cursor/rules/bmad/*.mdc` define persona-specific rules like `@dev` and `@bmad-master`. They emphasize:
  - Treating the architecture and PRD docs in `docs/` as the source of truth.
  - Executing work story-by-story with explicit checklists and validations.
  - Only loading heavy reference docs when needed, to keep context manageable.

For Warp, the key takeaway is: respect the architecture/PRD documents, keep changes aligned with existing stories/epics when possible, and avoid introducing ad-hoc patterns that contradict the documented system.

## Cross-cutting coding standards (high-impact rules)

These standards are reinforced across `CLAUDE.md` and the architecture docs and are important for future Warp work:

- **Type safety and shared types**
  - Use strict TypeScript; avoid `any`.
  - Prefer defining reusable domain types in `packages/shared` and importing them across `apps/web`.

- **Service and API layer
  - Do not sprinkle raw `fetch`/`axios` calls throughout components; route external and backend calls through the established service/lib layers (`lib/api-client.ts`, `services/*`, `lib/supabase/*`, `lib/stream/*`).
  - API routes should validate inputs with Zod and return a consistent error shape (see examples in `docs/architecture.md`).

- **Environment configuration and security**
  - Access environment variables via dedicated config modules (e.g., `lib/config/env.ts`) rather than ad hoc `process.env` reads in random files.
  - Sanitize any user-supplied HTML with `sanitize-html` and honor the CSP/headers defined in the security docs and `lib/security/*`.
  - Authentication/authorization flows should rely on Clerk + Supabase RLS patterns already laid out in the architecture.

- **State management and data fetching**
  - Use React Query (`@tanstack/react-query`) for remote data and caching where appropriate, following the patterns in the architecture docs.
  - Avoid direct state mutation; prefer immutable updates and context/hooks designed for each domain.

- **Naming conventions (selected examples)**
  - Components: `PascalCase`, e.g. `StreamVideoCallManagerV2.tsx`.
  - Hooks: `camelCase` starting with `use`, e.g. `useMeetingRealtime.ts`.
  - API routes: kebab-case URL segments under `app/api/...`.
  - Database tables: `snake_case` as per the schema in the architecture docs.

Staying within these boundaries will make it much easier for future Warp sessions (and other AI agents) to collaborate safely on this codebase.