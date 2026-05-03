# Tech Stack

**Version:** 3.2 (Post-Meeting Intelligence Platform for Executive Coaches)
**Last Updated:** April 11, 2026

### Technology Stack Table (Version-Locked)

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | ^5.3.3 | Type-safe development | PRD requirement for enhanced developer productivity |
| Frontend Framework | Next.js | ^14.1.0 | SSR/SSG and real-time capabilities | PRD specified App Router for modern capabilities |
| UI Component Library | Shadcn UI | ^0.8.0 | Core component system | PRD specified primary choice |
| Secondary UI Libraries | Origin UI ^1.0.0, Aceternity UI ^1.2.0 | 1.0.0, 1.2.0 | Layouts and animations | PRD specified for specialized needs |
| CSS Framework | Tailwind CSS | ^3.4.1 | Styling with navy/teal palette | PRD design system alignment |
| State Management | @tanstack/react-query | ^5.17.0 | Data fetching and caching | PRD specified optimization |
| Animation Library | Framer Motion | ^10.18.0 | Professional animations | PRD smooth transitions requirement |
| Backend Language | TypeScript | ^5.3.3 | Shared types with frontend | Monorepo type consistency |
| Backend Framework | @vercel/edge | ^1.1.1 | Serverless API layer | Free tier optimized |
| API Style | REST + tRPC patterns | tRPC ^10.45.0 | Type-safe APIs | Shared TypeScript interfaces |
| Database | Supabase PostgreSQL | ^2.38.0 | Primary data store with RLS | PRD multi-tenant security |
| Vector Extension | pgvector | ^0.5.1 | Vector embeddings for RAG | PRD AI assistant with semantic search |
| File Storage | @supabase/storage-js | ^2.5.1 | File uploads with signed URLs | Meeting recordings and transcripts |
| Authentication | @clerk/nextjs | ^4.29.1 | User auth with social logins | PRD role-based access |
| Transcription Service | Deepgram Nova-2 | Latest | Audio/video → transcript with speaker diarization | Session recordings → transcripts; 36% lower WER, built-in coach/client speaker labels |
| AI Embeddings | OpenAI Embeddings API | Latest | text-embedding-3-small | RAG semantic search |
| Frontend Testing | Jest ^29.7.0 + @testing-library/react ^14.1.2 | 29.7.0, 14.1.2 | Component and unit tests | PRD testing pyramid |
| Backend Testing | Jest ^29.7.0 + supertest ^6.3.3 | 29.7.0, 6.3.3 | API route testing | Edge function integration tests |
| E2E Testing | Cypress | ^13.6.2 | Full user flow testing | PRD comprehensive testing |
| Build Tool | Next.js built-in | 14.1.0 | Integrated build system | Optimal deployment integration |
| Bundler | Webpack (Next.js) | ^5.89.0 | Module bundling | Built into Next.js |
| Monorepo Tool | npm workspaces | ^10.2.4 | Package management | No additional tooling overhead |
| CI/CD | GitHub Actions | v4 | Automated deployment | Free tier Vercel integration |
| Monitoring | PostHog ^3.0.0 + @sentry/nextjs ^7.93.0 | 3.0.0, 7.93.0 | Analytics and error tracking | PRD monitoring requirements |
| AI Integration | @anthropic-ai/sdk + openai | Latest | AI summaries, action items, Solis Intelligence RAG | AI_PROVIDER env var abstracts provider (claude default, openai fallback) |
| Payment Processing | @stripe/stripe-js | ^2.3.0 | Subscription billing | PRD Pro tier monetization |
| Web Scraping | puppeteer | ^21.7.0 | Client website research | PRD public data collection |
| Input Sanitization | sanitize-html | ^2.11.0 | XSS prevention | PRD security requirement |
| Security Headers | next-helmet | ^2.2.3 | CSP and security headers | PRD security implementation |
| HTTP Requests | axios | ^1.6.5 | API communication | Consistent request handling |
| Form Handling | react-hook-form | ^7.48.2 | Form validation | Optimized form performance |
| Date Handling | date-fns | ^3.2.0 | Date manipulation | Lightweight alternative to moment |
| Environment Config | dotenv | ^16.3.1 | Environment management | Secure config handling |
| File Upload | react-dropzone | ^14.2.3 | Drag-and-drop file upload | Meeting recordings/transcripts upload |
