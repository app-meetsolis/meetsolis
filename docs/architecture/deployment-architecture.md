# Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (Free Tier)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network with global caching

**Backend Deployment:**
- **Platform:** Vercel Edge Functions
- **Build Command:** Automatic (Next.js API routes)
- **Deployment Method:** Git-based continuous deployment

**Database Deployment:**
- **Platform:** Supabase (Free Tier)
- **Regions:** US-East-1 (primary)
- **Backup Strategy:** Automatic daily backups

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:unit

      - name: Bundle analysis
        run: npm run build:analyze

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://staging.meetsolis.com | https://staging.meetsolis.com/api | Pre-production testing |
| Production | https://meetsolis.com | https://meetsolis.com/api | Live environment |
