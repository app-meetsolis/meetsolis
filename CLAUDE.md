In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of consision.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeetSolis is a Next.js 14 video conferencing platform designed as a Zoom alternative for freelancers and small agencies. This is a **greenfield project** following the BMad Method for AI-driven development. The project uses a comprehensive tech stack with TypeScript, Supabase, WebRTC, and various AI integrations.

## Key Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Vercel Edge Functions, Supabase PostgreSQL
- **Authentication**: Clerk
- **Real-time**: Supabase Realtime, WebRTC (simple-peer)
- **AI**: OpenAI GPT-4, DeepL Translation
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

## Development Commands

Since this is a **greenfield project** (no package.json yet), standard development commands are not yet established. Based on the architecture plan:

**When the project is initialized, these commands will be available:**
```bash
# Development
npm run dev              # Start development server
npm run dev:web         # Start frontend only

# Testing
npm run test            # Run all tests
npm run test:unit       # Unit tests only
npm run test:e2e        # End-to-end tests

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # Fix ESLint issues
npm run format          # Prettier formatting
npm run type-check      # TypeScript checking

# Database (Supabase)
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed test data
npm run db:reset        # Reset database
```

## Project Structure (Planned)

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

Based on the PRD, prioritize these core features:
1. **HD Video Calls** - WebRTC with simple-peer library
2. **Collaborative Whiteboard** - Using Excalidraw integration
3. **AI-Powered Summaries** - OpenAI GPT-4 integration
4. **Real-time Translation** - DeepL API integration
5. **Calendar Integration** - Google Calendar API
6. **File Sharing** - Supabase Storage with auto-expiration

## Testing Strategy

Follow the testing pyramid approach:
- **Unit Tests**: Jest + Testing Library for components and utilities
- **Integration Tests**: API route testing with supertest
- **E2E Tests**: Cypress for full user workflows

## Important Notes

- This is a **cost-optimized project** targeting free tiers (Vercel, Supabase)
- **Performance targets**: <200ms API response, <1% call failure rate
- **AI Usage Monitoring**: Implement usage tracking to stay within budget limits
- **WebRTC Fallback**: Include TURN server fallback for network connectivity
- **Bundle Size**: Keep initial bundle <300KB, total <1MB

## Getting Help

When working with this codebase:
1. **For implementation tasks**: Use `@dev` agent with BMad commands
2. **For architecture questions**: Reference `docs/architecture.md`
3. **For requirements clarification**: Check `docs/prd.md`
4. **For UI/UX guidance**: Reference `docs/front-end-spec.md`

## Current Status

This is a **greenfield project** in the planning phase. Before implementing:
1. Ensure all architecture documents are reviewed
2. Set up the Next.js project structure as defined in the architecture
3. Configure Supabase, Clerk, and other external services
4. Follow the BMad Method workflow for systematic development
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of consision
- At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision