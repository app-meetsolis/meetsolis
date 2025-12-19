# Tech Stack

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
| Real-time Engine | @supabase/realtime-js | ^2.9.3 | WebSocket connections | PRD live collaboration |
| File Storage | @supabase/storage-js | ^2.5.1 | File uploads with signed URLs | PRD automatic expiration |
| Authentication | @clerk/nextjs | ^4.29.1 | User auth with social logins | PRD role-based access |
| Video SDK | @stream-io/video-react-sdk | Latest | Real-time video communication | PRD encrypted video calls and browser compatibility |
| Whiteboard | @excalidraw/excalidraw | ^0.17.0 | Collaborative whiteboard | PRD real-time synchronization |
| Frontend Testing | Jest ^29.7.0 + @testing-library/react ^14.1.2 | 29.7.0, 14.1.2 | Component and unit tests | PRD testing pyramid |
| Backend Testing | Jest ^29.7.0 + supertest ^6.3.3 | 29.7.0, 6.3.3 | API route testing | Edge function integration tests |
| E2E Testing | Cypress | ^13.6.2 | Full user flow testing | PRD comprehensive testing |
| Build Tool | Next.js built-in | 14.1.0 | Integrated build system | Optimal deployment integration |
| Bundler | Webpack (Next.js) | ^5.89.0 | Module bundling | Built into Next.js |
| Monorepo Tool | npm workspaces | ^10.2.4 | Package management | No additional tooling overhead |
| CI/CD | GitHub Actions | v4 | Automated deployment | Free tier Vercel integration |
| Monitoring | PostHog ^3.0.0 + @sentry/nextjs ^7.93.0 | 3.0.0, 7.93.0 | Analytics and error tracking | PRD monitoring requirements |
| AI Integration | openai | ^4.24.1 | Meeting summaries and analysis | PRD productivity features |
| Translation | deepl-node | ^1.12.0 | Real-time translation | PRD 10+ languages support |
| SMS Service | twilio | ^4.19.3 | Waiting room notifications | PRD SMS alerts |
| Calendar Integration | googleapis | ^128.0.0 | Scheduling integration | PRD calendar sync |
| Input Sanitization | sanitize-html | ^2.11.0 | XSS prevention | PRD security requirement |
| Security Headers | next-helmet | ^2.2.3 | CSP and security headers | PRD security implementation |
| HTTP Requests | axios | ^1.6.5 | API communication | Consistent request handling |
| Form Handling | react-hook-form | ^7.48.2 | Form validation | Optimized form performance |
| Date Handling | date-fns | ^3.2.0 | Date manipulation | Lightweight alternative to moment |
| Environment Config | dotenv | ^16.3.1 | Environment management | Secure config handling |
| Drag & Drop | react-draggable | ^4.4.6 | Self-view dragging | AC 9 requirement for draggable self-view |
