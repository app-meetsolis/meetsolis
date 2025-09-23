# Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Required software versions
node --version  # v18.17.0 or higher
npm --version   # v9.6.7 or higher
git --version   # v2.34.0 or higher

# Install global dependencies
npm install -g @vercel/cli
npm install -g supabase-cli
```

#### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/meetsolis.git
cd meetsolis

# Install dependencies for all packages
npm install

# Copy environment template
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local

# Setup Supabase local development
supabase start
supabase db reset

# Initialize database schema
npm run db:migrate
npm run db:seed

# Verify installation
npm run test
npm run lint
```

#### Development Commands

```bash
# Start all services (recommended)
npm run dev

# Start frontend only
npm run dev:web

# Run tests
npm run test          # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only

# Linting and formatting
npm run lint          # ESLint check
npm run lint:fix      # ESLint fix
npm run format        # Prettier format

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
npm run db:reset      # Reset database
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend (.env)
CLERK_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# AI Services
OPENAI_API_KEY=sk-...
DEEPL_AUTH_KEY=...

# External Services
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Google Services
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Payment (choose one set)
# Paddle
PADDLE_VENDOR_ID=...
PADDLE_VENDOR_AUTH_CODE=...

# Razorpay (for India)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# WebRTC TURN Server Configuration (optional)
NEXT_PUBLIC_TURN_URL=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=your-username
NEXT_PUBLIC_TURN_CREDENTIAL=your-credential
```
