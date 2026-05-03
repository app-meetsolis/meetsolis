In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of consision.

# File Size Rule
No file should exceed 500 lines. If a file approaches this, split it by concern before adding more code.

# Context Window Target
Optimal context: 0-50%. Above 50% — start new session. Above 70% — agent quality degrades significantly.

# Subagent Strategy
- Always and aggressively offload online research (eg, docs), codebase exploration, and log analysis to subagents.
- When you're about to check logs, defer that to a haiku subagent.
- For complex problems you're going around in circles with, get a fresh perspective by asking subagents.
- When spawning a subagent, include a "Why" in the subagent's system prompt because it will help it filter the signal from the noise.|
  

# Context Awareness
Your context window will be automatically compacted as it approaches its limit, allowing you to
continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token
budget concerns. As you approach your token budget limit, save your current progress and state to
memory before the context window refreshes. Always be as persistent and autonomous as possible and
complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task
early regardless of the context remaining.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeetSolis is a **post-meeting intelligence platform** built exclusively for executive coaches. Coaches manage 10–25 active clients; MeetSolis solves the core problem of forgetting client context between sessions. This is a **greenfield project** following the BMad Method for AI-driven development.

**Tagline:** *"Never forget a client's breakthrough moment again."*

**What MeetSolis IS:** Post-meeting intelligence, client memory layer, coach's AI second brain.
**What MeetSolis IS NOT:** Video conferencing, real-time meeting assistant, CRM, project management tool.

## Key Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Vercel Edge Functions, Supabase PostgreSQL
- **Authentication**: Clerk
- **AI**: Claude Sonnet 4.5 (default) or OpenAI GPT-4o-mini, switchable via `AI_PROVIDER` env var
- **Transcription**: Deepgram Nova-2 (default) or OpenAI Whisper, switchable via `TRANSCRIPTION_PROVIDER` env var
- **Vector Search**: pgvector (hybrid RAG for Solis Intelligence)
- **Testing**: Jest, Cypress, Testing Library
- **Development Workflow**: BMad Method with specialized agents

## BMad Method Development System

This project uses the **BMad Method** - an AI-driven planning and development framework:

### Available BMad Agents
- **@dev** - Full Stack Developer (use for implementation tasks)
- **@architect** - System Architect (use for architecture decisions)
- **@pm** - Product Manager (use for requirements and planning)
- **@qa** - Quality Assurance (use for testing strategies)
- **@analyst** - Business Analyst (use for research and analysis)

### BMad Commands
Access BMad functionality through the `.claude/commands/BMad/` directory. Key commands include:
- Use `*help` to see available commands when in agent mode
- Tasks are located in `.bmad-core/tasks/`
- Templates are in `.bmad-core/templates/`

### BMad Configuration
- Core config: `.bmad-core/core-config.yaml`
- Always load files from `devLoadAlwaysFiles` when in development mode:
  - `docs/architecture/coding-standards.md`
  - `docs/architecture/tech-stack.md`
  - `docs/architecture/source-tree.md`

## Architecture Documentation

The project has comprehensive architecture documentation in `docs/`:
- **Main Architecture**: `docs/architecture.md` - Complete technical architecture
- **PRD**: `docs/prd.md` - Product requirements and functional specifications
- **Frontend Spec**: `docs/front-end-spec.md` - UI/UX specifications
- **Tech Stack**: `docs/architecture/tech-stack.md` - Detailed technology decisions

## Project Structure

```
meetsolis/
├── apps/web/                    # Next.js application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client services
│   │   ├── lib/                # Utility libraries
│   │   └── types/              # TypeScript definitions
│   └── tests/                  # Frontend tests
├── packages/shared/            # Shared types and utilities
├── .bmad-core/                 # BMad Method framework
└── docs/                       # Project documentation
```

## Critical Coding Standards

### Type Safety
- **ALWAYS** define types in `packages/shared` and import from there
- Use TypeScript strict mode throughout
- Never use `any` - use proper type definitions

### API Development
- **NEVER** make direct HTTP calls - use the service layer
- Access environment variables only through config objects, never `process.env` directly
- All API routes must use the standard error handler

### State Management
- **NEVER** mutate state directly - use proper state management patterns
- Use @tanstack/react-query for data fetching and caching
- Follow React best practices for state updates

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | `useAuth.ts` |
| API Routes | kebab-case | `/api/user-profile` |
| Database Tables | snake_case | `user_profiles` |

## Security Requirements

- **Input Validation**: Use Zod schemas for all API inputs
- **XSS Prevention**: Sanitize all user inputs with `sanitize-html`
- **Authentication**: All protected routes require Clerk JWT validation
- **Database**: Use Supabase Row Level Security (RLS) for multi-tenant access
- **Content Security Policy**: Implement CSP headers as defined in architecture

## Key Features to Implement

Based on PRD v3 (source of truth: `archive/MeetSolis_PRD_v3_FINAL.md`):
1. **Client Cards** - Persistent containers for each coach's clients (name, goal, company, start date, notes)
2. **Transcript Upload** - Manual (.txt/.docx) or auto-transcribe audio/video via Deepgram Nova-2
3. **AI Summary Generation** - Auto-generates session summary, action items, key topics, session title
4. **Solis Intelligence** - Conversational AI answering questions about any client's history (hybrid RAG: pgvector + 3 recent sessions)
5. **Session Timeline** - Chronological view of client coaching journey

## Testing Strategy

Follow the testing pyramid approach:
- **Unit Tests**: Jest + Testing Library for components and utilities
- **Integration Tests**: API route testing with supertest
- **E2E Tests**: Cypress for full user workflows

## Important Notes

- **Pricing**: Free (3 clients, 5 lifetime transcripts, 75 queries) / Pro $99/mo or $948/yr (unlimited clients, 25 transcripts/mo, 2000 queries)
- **ICP**: Executive coaches, 10–25 active clients, $200–500/hr, solo practitioners
- **Infra cost**: ~$100/mo baseline (Vercel Pro + Supabase Pro + Resend + misc)
- **COGS**: ~$9/user/mo (Deepgram $6.50 is the main cost)
- **AI Usage Monitoring**: Track lifetime counters with reset timestamps (not month-based)
- **Bundle Size**: Keep initial bundle <300KB, total <1MB
- **Privacy-First**: Never train AI on user data; client conversations are deeply personal

## Getting Help

When working with this codebase:
1. **For implementation tasks**: Use `@dev` agent with BMad commands
2. **For architecture questions**: Reference `docs/architecture.md`
3. **For requirements clarification**: Check `docs/prd.md`
4. **For UI/UX guidance**: Reference `docs/front-end-spec.md`

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of consision
- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision

## Notion Logging (Proactive — via MCP)

When a bug is found and fixed → say: "Want me to log this to Notion Bugs DB?"
When an architectural/product decision is made → say: "Should I log this decision to Notion?"
When a story is completed → say: "Should I mark story [X] as Done in Notion?"
When starting a story → offer to update status to In Progress.

### Notion MCP — Direct IDs (use these, never search from scratch)

**MeetSolis project page:** `2dfdc800-c36f-805b-b6ad-fab510f60527`

| DB | Database ID | Data Source ID (use for create/query) |
|----|-------------|---------------------------------------|
| Stories | `320dc800-c36f-8195-8b9b-fc520800ac79` | `320dc800-c36f-81b6-973f-000bfad86009` |
| Bugs | `320dc800-c36f-81fd-b9b6-d5108ffe3fa1` | `320dc800-c36f-819c-bdcf-000b3403c0ff` |
| Decisions | `320dc800-c36f-8188-88d5-dd1a32629bc5` | `320dc800-c36f-816b-b986-000b3dfa297d` |

**CRITICAL — MCP tool rules:**
- Use `mcp__claude_ai_Notion__*` tools ONLY — `mcp__notion__*` tools return 401 (wrong token)
- To **create** a story/bug/decision: use `notion-create-pages` with `parent.data_source_id` = the Data Source ID above
- To **update** a page: use `notion-update-page` with the page's UUID (from create result or prior fetch)
- To **search**: use `notion-search` — but if not found, the page likely doesn't exist yet → create it
- Never use `notion-fetch` on the DB to find rows — it returns schema only, not rows

**Stories schema fields:** `Story ID` (title), `Status` (Backlog/In Progress/QA/Done), `Epic` (Epic 1–5), `Branch`, `PR Link`, `Notes`, `Files Touched`, `Completed Date`

Log format — Bug: title, severity (Critical/High/Medium/Low), root cause, solution applied, story reference
Log format — Decision: what was decided, why, alternatives considered, impact area (Architecture/UX/Performance/Security/Product)
Log format — Story: story ID (e.g. "2.6"), status update, completed date if Done