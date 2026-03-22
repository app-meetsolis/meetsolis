# Development Workflow Guide

**Last Updated:** 2025-11-28
**Project:** MeetSolis
**CI/CD Status:** ✅ Fully Operational

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Complete Workflow](#complete-workflow)
4. [Branch Strategy](#branch-strategy)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Deployment Process](#deployment-process)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Overview

MeetSolis uses an automated CI/CD pipeline that deploys code through:
- **GitHub Actions** - Automated quality checks and builds
- **Vercel** - Preview and production deployments
- **Branch Protection** - Enforces PR workflow

### Key Principles

✅ **Always use feature branches** - Never commit directly to `main`
✅ **Test on preview deployments** - Verify before merging
✅ **All checks must pass** - CI validates quality before merge
✅ **Production deploys automatically** - On merge to `main`

---

## Quick Start

### For a New Feature:

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b story-X.X-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: Add feature description"

# 4. Push to GitHub (triggers preview)
git push origin story-X.X-feature-name

# 5. Create PR on GitHub
# 6. Wait for checks to pass
# 7. Merge PR (triggers production deployment)

# 8. Clean up
git checkout main
git pull origin main
git branch -d story-X.X-feature-name
```

---

## Complete Workflow

### Phase 1: Start New Feature

#### Step 1: Update Local Main Branch

```bash
git checkout main
git pull origin main
```

**Why:** Ensures you start from the latest code

#### Step 2: Create Feature Branch

```bash
git checkout -b story-2.3-feature-name
```

**Branch Naming Convention:**
```
story-X.X-brief-description
  │    │   └─ Kebab-case description
  │    └───── Story number from docs/stories/
  └────────── Always prefix with "story-"

Examples:
✅ story-2.3-add-screen-sharing
✅ story-2.4-user-profile-settings
❌ feature/add-chat (wrong format)
❌ 2.3-chat (missing prefix)
```

---

### Phase 2: Development

#### Step 3: Develop Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Make changes, test locally
```

**Local Testing Checklist:**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] UI looks correct
- [ ] No TypeScript errors (run `npm run type-check`)

#### Step 4: Commit Changes

```bash
git add .
git commit -m "feat: Add feature description"
```

**Commit Message Format:**
```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Formatting, no code change
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance tasks

Examples:
✅ feat: Add video chat feature
✅ fix: Resolve camera permission issue
✅ docs: Update README with setup instructions
```

**What Happens:**
- 🪝 Husky pre-commit hook runs
- 🔍 Lint-staged checks staged files
- ✨ ESLint and Prettier auto-fix issues
- ✅ Commit succeeds if checks pass

---

### Phase 3: Push and Create Preview

#### Step 5: Push to GitHub

```bash
git push origin story-2.3-feature-name
```

**What Happens Automatically:**

**1. Vercel Starts Building (2-5 minutes):**
```
🚀 Preview deployment starting...
📦 Installing dependencies
🔨 Building application
✅ Preview ready!

URL: meetsolis-git-story-23-feature-name.vercel.app
```

**2. GitHub Actions Runs (3-4 minutes):**
```
🔍 quality-checks job:
   ✓ ESLint checks
   ✓ TypeScript validation
   ✓ Tests (if available)

🏗️ build job:
   ✓ Next.js build
   ✓ Sentry source maps upload
```

#### Step 6: Test Preview Deployment

1. Wait for Vercel preview URL (check Vercel dashboard)
2. Open preview URL in browser
3. Test your feature thoroughly:
   - ✅ Feature works correctly
   - ✅ No errors in console
   - ✅ Test on multiple devices (if applicable)
   - ✅ Test with multiple users (for real-time features)

**If you find bugs:**
```bash
# Fix the issue locally
git add .
git commit -m "fix: Address preview feedback"
git push origin story-2.3-feature-name

# Preview URL updates automatically (same URL)
# Test again
```

---

### Phase 4: Pull Request

#### Step 7: Create Pull Request

**Go to:** https://github.com/app-meetsolis/meetsolis/pulls

**Click:** "New pull request"

**Fill out PR template:**

```markdown
Title: feat: Add screen sharing feature

## Description
Brief description of what this PR does.

## Changes Made
- Added screen sharing button to meeting controls
- Implemented WebRTC screen capture
- Added permission handling

## Testing Completed
- [x] Tested on preview deployment
- [x] Tested on Chrome, Firefox, Safari
- [x] Tested screen sharing between 2 users
- [x] No console errors

## Screenshots
(Add if UI changes)

## Related Story
docs/stories/2.3.story.md
```

**Click:** "Create pull request"

---

### Phase 5: Review and Checks

#### Step 8: Wait for Checks

**On the PR page, you'll see:**

```
🟡 Some checks haven't completed yet

Checks running:
🟡 quality-checks - In progress
🟡 build - Queued
🟡 vercel - Building preview
```

**After 3-5 minutes:**

```
✅ All checks have passed

✅ quality-checks - Successful in 1m 30s
✅ build - Successful in 2m 15s
✅ vercel - Preview deployment ready
```

**If checks fail:**
1. Click on the failed check to see details
2. Fix the issue locally
3. Commit and push again
4. Checks run automatically on new push

**Common Failures:**
- ❌ ESLint errors → Fix code quality issues
- ❌ TypeScript errors → Fix type issues
- ❌ Build errors → Fix import/syntax errors
- ❌ Test failures → Fix failing tests

---

### Phase 6: Merge

#### Step 9: Merge Pull Request

**When all checks pass:**

1. Review the "Files changed" tab
2. Verify all changes are correct
3. Click: **"Merge pull request"**
4. Confirm: **"Confirm merge"**
5. Click: **"Delete branch"** (recommended)

**What Happens Automatically:**

```
1. Code merges to main ✅
2. GitHub Actions runs on main
3. Vercel deploys to PRODUCTION 🚀
4. Production URL updates (3-5 minutes)
5. Old preview deployment archived
```

**Monitor Production Deployment:**
- Vercel dashboard: https://vercel.com/[team]/meetsolis/deployments
- Check for green "Ready" status
- Visit production URL to verify

---

### Phase 7: Clean Up

#### Step 10: Update Local Repository

```bash
# Switch back to main
git checkout main

# Pull merged changes
git pull origin main

# Delete local feature branch
git branch -d story-2.3-feature-name

# Optional: Delete remote branch (if not deleted on GitHub)
git push origin --delete story-2.3-feature-name
```

---

## Branch Strategy

### Main Branch (`main`)

- **Purpose:** Production code
- **Protected:** Yes
- **Direct pushes:** ❌ Blocked
- **Merges via:** Pull requests only
- **Auto-deploys to:** Production (Vercel)

### Feature Branches (`story-*`)

- **Purpose:** Development of new features/fixes
- **Naming:** `story-X.X-description`
- **Created from:** `main`
- **Merged to:** `main` via PR
- **Auto-deploys to:** Preview (Vercel)

### Branch Protection Rules

```yaml
main branch:
  ✅ Require pull request before merging
  ✅ Require status checks to pass
     - quality-checks (required)
     - build (required)
  ✅ Require branches up to date
  ❌ Allow force pushes (disabled)
  ❌ Allow deletions (disabled)
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

#### 1. quality-checks (~1-2 minutes)

```yaml
Steps:
✓ Checkout code
✓ Setup Node.js 20
✓ Install dependencies
✓ Run ESLint (continue on error)
✓ Run TypeScript check
✓ Run tests (continue on error)
```

#### 2. build (~2-3 minutes)

```yaml
Steps:
✓ Checkout code
✓ Setup Node.js 20
✓ Install dependencies
✓ Build Next.js app
✓ Upload Sentry source maps

Environment Variables:
- All secrets from GitHub repository secrets
- NODE_ENV=production
- USE_MOCK_SERVICES=false
```

**Total Time:** ~3-5 minutes

---

### Vercel Deployment

**Automatic Deployments:**

| Trigger | Deployment Type | URL Pattern |
|---------|----------------|-------------|
| Push to feature branch | Preview | `meetsolis-git-[branch]-[team].vercel.app` |
| Merge to main | Production | `meetsolis.vercel.app` |
| Push to main | Production | `meetsolis.vercel.app` |

**Build Configuration:**
- **Framework:** Next.js
- **Build command:** `cd apps/web && npm run build`
- **Output directory:** `apps/web/.next`
- **Install command:** `npm install`
- **Node version:** 20.x

**Environment Variables:**
- Managed in Vercel dashboard
- Applied to all environments (Production, Preview, Development)
- Includes: Clerk, Supabase, Sentry, etc.

---

## Deployment Process

### Preview Deployments (Feature Branches)

**When:** Every push to a feature branch

**Process:**
```
1. Push code to feature branch
2. Vercel detects push
3. Runs build with preview settings
4. Deploys to unique URL
5. Comments on PR with preview URL
```

**Preview URL Example:**
```
https://meetsolis-git-story-23-add-chat-app-meetsolis.vercel.app
```

**Features:**
- Unique URL per branch
- Automatically updates on new commits
- Same URL throughout PR lifecycle
- Archived after branch deletion

---

### Production Deployments (Main Branch)

**When:** Merge to `main` or push to `main`

**Process:**
```
1. PR merged to main
2. GitHub Actions runs
3. Vercel detects main branch update
4. Runs production build
5. Deploys to production URL
6. Previous version kept as rollback option
```

**Production URL:**
```
https://meetsolis.vercel.app
```

**Features:**
- Automatic deployment on merge
- Zero-downtime deployment
- Instant rollback capability
- CDN cache invalidation

---

## Troubleshooting

### GitHub Actions Failing

#### ESLint Errors

**Symptom:** `quality-checks` job fails

**Solution:**
```bash
# Check errors locally
npm run lint

# Auto-fix where possible
npm run lint:fix

# Commit fixes
git add .
git commit -m "fix: Resolve ESLint errors"
git push
```

#### TypeScript Errors

**Symptom:** `quality-checks` job fails on type-check

**Solution:**
```bash
# Check errors locally
npm run type-check

# Fix the type issues in your code
# Commit and push
```

#### Build Errors

**Symptom:** `build` job fails

**Solution:**
```bash
# Test build locally
npm run build

# Check error output
# Fix the issue
# Commit and push
```

---

### Vercel Deployment Failing

#### Build Failed

**Symptom:** Vercel shows "Build failed"

**Solution:**
1. Click "View Build Logs" on Vercel
2. Find the error in logs
3. Common issues:
   - Missing environment variables
   - Import errors
   - Build-time errors
4. Fix locally, commit, push

#### Environment Variable Issues

**Symptom:** Build succeeds but app doesn't work

**Solution:**
1. Check Vercel → Settings → Environment Variables
2. Verify all required variables are set
3. Verify no extra spaces or line breaks
4. Trigger redeploy

---

### Merge Button Greyed Out

**Symptom:** Can't merge PR despite passing checks

**Possible Causes:**

**1. Checks haven't completed**
- Wait for all checks to finish

**2. Branch not up to date**
```bash
git checkout story-2.3-feature
git merge main
git push origin story-2.3-feature
```

**3. Review required**
- Approve your own PR (if solo dev)
- Or update branch protection rules

**4. Conflicts exist**
- Resolve conflicts locally
- Push resolved version

---

## Best Practices

### DO ✅

#### Code Quality
- ✅ Run `npm run lint` before committing
- ✅ Run `npm run type-check` before committing
- ✅ Test locally before pushing
- ✅ Write clear commit messages
- ✅ Keep commits focused and atomic

#### Workflow
- ✅ Always create feature branches
- ✅ Test on preview before merging
- ✅ Write descriptive PR descriptions
- ✅ Delete branches after merging
- ✅ Pull main before creating new branches

#### Testing
- ✅ Test on multiple devices for UI changes
- ✅ Test with multiple users for real-time features
- ✅ Check browser console for errors
- ✅ Verify preview deployment before merging

---

### DON'T ❌

#### Code
- ❌ Commit directly to main
- ❌ Push code that doesn't run locally
- ❌ Ignore ESLint/TypeScript errors
- ❌ Commit sensitive data (API keys, secrets)
- ❌ Commit large files (videos, binaries)

#### Workflow
- ❌ Merge without testing preview
- ❌ Merge with failing checks
- ❌ Skip PR process
- ❌ Force push to main
- ❌ Delete main branch

#### Deployment
- ❌ Bypass checks without good reason
- ❌ Merge broken code
- ❌ Deploy without testing
- ❌ Ignore deployment errors

---

## Environment Variables

### Required Variables

**GitHub Secrets:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

**Vercel Environment Variables:**
- Same as GitHub Secrets
- Plus any additional service-specific variables

**Local Development (.env.local):**
- Copy from `.env.example`
- Never commit to git
- Update as needed

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Run production build

# Code Quality
npm run lint            # Check linting
npm run lint:fix        # Auto-fix lint issues
npm run type-check      # Check TypeScript
npm run format          # Format with Prettier

# Testing
npm run test            # Run all tests
npm run test:unit       # Run unit tests
npm run test:e2e        # Run E2E tests

# Git Workflow
git checkout main && git pull                    # Update main
git checkout -b story-X.X-feature               # New branch
git add . && git commit -m "feat: description"  # Commit
git push origin story-X.X-feature               # Push
git checkout main && git pull && git branch -d  # Cleanup
```

---

### Important Links

**Repository:**
- GitHub: https://github.com/app-meetsolis/meetsolis
- Actions: https://github.com/app-meetsolis/meetsolis/actions
- PRs: https://github.com/app-meetsolis/meetsolis/pulls

**Deployments:**
- Vercel Dashboard: https://vercel.com/[team]/meetsolis
- Production: https://meetsolis.vercel.app
- Deployments: https://vercel.com/[team]/meetsolis/deployments

**Settings:**
- Branch Protection: https://github.com/app-meetsolis/meetsolis/settings/branches
- GitHub Secrets: https://github.com/app-meetsolis/meetsolis/settings/secrets/actions
- Vercel Env Vars: https://vercel.com/[team]/meetsolis/settings/environment-variables

**Monitoring:**
- Sentry: https://app-meetsolis.sentry.io/issues/
- Vercel Analytics: https://vercel.com/[team]/meetsolis/analytics

---

## CI/CD Status

✅ **GitHub Actions:** Operational
✅ **Vercel Deployments:** Operational
✅ **Branch Protection:** Enabled
✅ **Automated Testing:** Enabled
✅ **Source Maps:** Uploading

**Last Verified:** 2025-11-28
**Workflow Version:** 1.0
**Next Review:** When adding new services or major changes

---

## Getting Help

**Issues with this workflow?**
1. Check the troubleshooting section above
2. Review recent GitHub Actions logs
3. Check Vercel deployment logs
4. Review this document for missed steps

**Need to update this workflow?**
1. Test changes on a feature branch first
2. Update this documentation
3. Update `.github/workflows/ci.yml` if needed
4. Test end-to-end before merging

---

## Changelog

### Version 1.0 (2025-11-28)
- ✅ Initial workflow documentation
- ✅ GitHub Actions CI/CD configured
- ✅ Vercel auto-deployment working
- ✅ Branch protection enabled
- ✅ ESLint with continue-on-error
- ✅ TypeScript validation
- ✅ Sentry source map uploads

---

**Document Maintained By:** Development Team
**Last Updated:** 2025-11-28
**Status:** Active and current
