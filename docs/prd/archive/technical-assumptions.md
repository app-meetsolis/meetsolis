# Technical Assumptions

### Repository Structure: Monorepo
Single Next.js repository using App Router for modern SSR/SSG capabilities and optimized real-time support. Enables atomic commits across frontend, backend API routes, and shared utilities while maintaining development simplicity for solo founder/small team workflow.

### Service Architecture
**Next.js Monolith with Microservice-Ready Components**: Unified full-stack application deployed on Vercel with modular internal architecture. Core services include WebRTC video processing, AI integrations (OpenAI/DeepL), real-time messaging (Supabase), file storage, and third-party integrations (Twilio, Google Calendar, Stripe).

### Testing Requirements
**Comprehensive Testing Pyramid**: Unit testing with Jest + React Testing Library for components and API routes, integration testing for real-time features and WebRTC functionality, end-to-end testing with Cypress for full user flows, and accessibility testing with react-axe for WCAG 2.1 AA compliance.

### Additional Technical Assumptions and Requests

**Frontend Framework & UI Stack:**
- Next.js 14+ with App Router for SSR/SSG and optimized real-time capabilities
- TypeScript for type safety and enhanced developer productivity
- UI Component Libraries: Shadcn UI (primary), Origin UI (layouts), Aceternity UI (animations)
- Tailwind CSS aligned with design system (navy/teal palette)
- Framer Motion for professional animations and transitions
- React Query (@tanstack/react-query) for data fetching, caching, and state management

**Real-time Communication & Video:**
- WebRTC with simple-peer for encrypted P2P video calls (DTLS/SRTP)
- webrtc-adapter for cross-browser compatibility
- Excalidraw for collaborative whiteboard with real-time synchronization
- Supabase Realtime for messaging, participant management, and live features

**Backend & Database:**
- Supabase PostgreSQL with Row-Level Security (RLS) for multi-tenant data isolation
- Supabase Storage for file uploads with signed URLs and automatic expiration
- Supabase Realtime for WebSocket connections and live collaboration
- Database encryption for sensitive fields using pgcrypto extension

**Authentication & Security:**
- Clerk for user authentication with social logins and role-based access
- JWT validation for API route protection
- next-helmet for security headers (CSP, XSS protection)
- sanitize-html for input sanitization and XSS prevention
- Rate limiting with express-rate-limit for API protection
- End-to-end encryption via WebRTC for video communications

**AI & Language Processing:**
- OpenAI GPT-4 for meeting summaries, agenda generation, and todo extraction
- DeepL API for high-quality real-time translation (10+ languages)
- OpenAI Whisper for transcription and live captions
- AI input anonymization to protect user privacy

**Third-party Integrations:**
- Google Calendar API (googleapis) for scheduling and calendar synchronization
- Twilio for SMS notifications (waiting room, late penalties)
- Stripe for global payments and subscription management
- Multiple payment providers: Paddle (global), Razorpay (India) based on geo-detection

**Development & Code Quality:**
- ESLint + Prettier with pre-commit hooks via Husky and lint-staged
- Storybook for component documentation and isolated development
- TypeScript strict mode with comprehensive type definitions
- Dynamic imports (next/dynamic) for performance optimization

**Analytics & Monitoring:**
- PostHog for product analytics and feature usage tracking
- Mixpanel for advanced funnel analysis and user retention
- Hotjar for heatmaps and session recordings
- Sentry for error tracking and performance monitoring
- Vercel Analytics for Core Web Vitals and performance metrics

**Performance & Optimization:**
- Lazy loading for heavy components (video UI, whiteboard)
- Next.js Image optimization for all visual assets
- React Query caching for API responses and real-time data
- Web Vitals monitoring for performance tracking
- Progressive Web App (PWA) capabilities for offline functionality

**Hosting & Infrastructure:**
- Vercel for hosting with edge functions for low-latency API routes
- CloudFlare for CDN and DDoS protection (free tier)
- GitHub Actions for CI/CD pipeline automation
- Environment-specific configurations for development, staging, and production

**Accessibility & User Experience:**
- WCAG 2.1 AA compliance with react-axe testing
- React-Hotkeys for keyboard shortcuts and power user productivity
- React-Toastify for user feedback and notifications
- axe-core for automated accessibility auditing

**Cost Management & Scalability:**
- Target monthly operating costs: ~$185 for 1,000 users
- API usage monitoring and caps to prevent cost overruns
- Scalable architecture supporting growth without infrastructure rewrites
- Efficient resource utilization through P2P WebRTC and edge computing
