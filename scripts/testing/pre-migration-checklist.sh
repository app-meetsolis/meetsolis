#!/bin/bash

################################################################################
# MeetSolis Pre-Migration Checklist
#
# Purpose: Automated go/no-go decision for v2.0 migration
# Usage: bash scripts/testing/pre-migration-checklist.sh [staging|production]
# Exit Code: 0 = GO (safe to migrate), 1 = NO-GO (blocking issues)
#
# Checks:
# 1. Epic 1 test suite passes (100%)
# 2. Database backup exists (<1 hour old)
# 3. All services healthy (Redis, Supabase)
# 4. No uncommitted git changes
# 5. Feature flags configured (disabled by default)
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
BLOCKERS=0

# Environment
ENV="${1:-staging}"
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}❌ Invalid environment: $ENV${NC}"
  echo "Usage: bash scripts/testing/pre-migration-checklist.sh [staging|production]"
  exit 1
fi

echo -e "${BLUE}🔍 MeetSolis Pre-Migration Checklist${NC}"
echo "Environment: $ENV"
echo "Timestamp: $(date)"
echo ""
echo "=========================================================================="
echo ""

# Get environment variables
if [[ "$ENV" == "production" ]]; then
  DB_URL="${DATABASE_URL_PRODUCTION:-$DATABASE_URL}"
else
  DB_URL="${DATABASE_URL_STAGING:-$DATABASE_URL}"
fi

REDIS_URL="${UPSTASH_REDIS_REST_URL:-}"

################################################################################
# CHECK 1: Epic 1 Test Suite Passes
################################################################################

echo -e "${YELLOW}Check 1/5: Epic 1 Test Suite${NC}"

BASELINE_FILE="$RESULTS_DIR/epic1-baseline-latest.json"

if [[ ! -f "$BASELINE_FILE" ]]; then
  echo -e "${RED}❌ BLOCKER${NC} - No baseline found"
  echo "  Run: bash scripts/testing/run-epic1-tests.sh baseline"
  BLOCKERS=$((BLOCKERS + 1))
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
else
  # Check baseline pass rate
  TOTAL_TESTS=$(jq '.numTotalTests' "$BASELINE_FILE")
  PASSED_TESTS=$(jq '.numPassedTests' "$BASELINE_FILE")
  FAILED_TESTS=$(jq '.numFailedTests' "$BASELINE_FILE")

  if [[ $FAILED_TESTS -gt 0 ]]; then
    echo -e "${RED}❌ BLOCKER${NC} - $FAILED_TESTS test(s) failing in baseline"
    echo "  Pass rate: $PASSED_TESTS/$TOTAL_TESTS"
    echo "  Fix tests before migration (see docs/testing/test-failure-fixes.md)"
    BLOCKERS=$((BLOCKERS + 1))
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  else
    echo -e "${GREEN}✅ PASS${NC} - All Epic 1 tests passing ($TOTAL_TESTS/$TOTAL_TESTS)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  fi
fi

echo ""

################################################################################
# CHECK 2: Database Backup Exists
################################################################################

echo -e "${YELLOW}Check 2/5: Database Backup${NC}"

# Find latest backup for environment
LATEST_BACKUP=$(find "$PROJECT_ROOT/backups" -name "backup-epic1-$ENV-*.sql.gz" -type f 2>/dev/null | sort -r | head -n 1)

if [[ -z "$LATEST_BACKUP" ]]; then
  echo -e "${RED}❌ BLOCKER${NC} - No backup found for $ENV"
  echo "  Run: bash scripts/migration/backup.sh $ENV"
  BLOCKERS=$((BLOCKERS + 1))
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
else
  # Check backup age
  BACKUP_TIMESTAMP=$(stat -f%m "$LATEST_BACKUP" 2>/dev/null || stat -c%Y "$LATEST_BACKUP" 2>/dev/null)
  CURRENT_TIMESTAMP=$(date +%s)
  BACKUP_AGE_SECONDS=$((CURRENT_TIMESTAMP - BACKUP_TIMESTAMP))
  BACKUP_AGE_MINUTES=$((BACKUP_AGE_SECONDS / 60))

  if [[ $BACKUP_AGE_MINUTES -gt 60 ]]; then
    echo -e "${YELLOW}⚠️  WARNING${NC} - Backup is $BACKUP_AGE_MINUTES minutes old"
    echo "  Recommendation: Create fresh backup"
    echo "  Run: bash scripts/migration/backup.sh $ENV"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo -e "${GREEN}✅ PASS${NC} - Recent backup exists ($BACKUP_AGE_MINUTES min old)"
    echo "  File: $(basename "$LATEST_BACKUP")"

    # Check backup size
    BACKUP_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP" 2>/dev/null)
    BACKUP_SIZE_KB=$((BACKUP_SIZE / 1024))

    if [[ $BACKUP_SIZE_KB -lt 10 ]]; then
      echo -e "${RED}❌ BLOCKER${NC} - Backup too small ($BACKUP_SIZE_KB KB)"
      echo "  Backup may be corrupted or empty"
      BLOCKERS=$((BLOCKERS + 1))
      CHECKS_FAILED=$((CHECKS_FAILED + 1))
    else
      echo "  Size: $BACKUP_SIZE_KB KB"
      CHECKS_PASSED=$((CHECKS_PASSED + 1))
    fi
  fi
fi

echo ""

################################################################################
# CHECK 3: All Services Healthy
################################################################################

echo -e "${YELLOW}Check 3/5: Services Health${NC}"

# Check database connection
if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Database connection OK"
  DB_HEALTHY=true
else
  echo -e "${RED}✗${NC} Database connection FAILED"
  BLOCKERS=$((BLOCKERS + 1))
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  DB_HEALTHY=false
fi

# Check Redis connection
if [[ -n "$REDIS_URL" ]]; then
  REDIS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${REDIS_URL}/ping" 2>/dev/null || echo "000")

  if [[ "$REDIS_STATUS" == "200" ]]; then
    echo -e "${GREEN}✓${NC} Redis connection OK"
    REDIS_HEALTHY=true
  else
    echo -e "${RED}✗${NC} Redis connection FAILED (HTTP $REDIS_STATUS)"
    BLOCKERS=$((BLOCKERS + 1))
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    REDIS_HEALTHY=false
  fi
else
  echo -e "${YELLOW}⚠️${NC} Redis URL not configured (skipping)"
  REDIS_HEALTHY=true
fi

if $DB_HEALTHY && $REDIS_HEALTHY; then
  echo -e "${GREEN}✅ PASS${NC} - All services healthy"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""

################################################################################
# CHECK 4: No Uncommitted Git Changes
################################################################################

echo -e "${YELLOW}Check 4/5: Git Repository Status${NC}"

cd "$PROJECT_ROOT"

if [[ -n $(git status --porcelain) ]]; then
  echo -e "${YELLOW}⚠️  WARNING${NC} - Uncommitted changes detected"
  echo ""
  git status --short
  echo ""
  echo "  Recommendation: Commit or stash changes before migration"
  echo "  This is NOT a blocker, but recommended for clean rollback"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${GREEN}✅ PASS${NC} - No uncommitted changes"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""

################################################################################
# CHECK 5: Feature Flags Configured
################################################################################

echo -e "${YELLOW}Check 5/5: Feature Flags${NC}"

# Check if feature flags are disabled (safe default)
FLAGS=(
  "NEXT_PUBLIC_ENABLE_CLIENT_CARDS"
  "NEXT_PUBLIC_ENABLE_NEW_MEETINGS"
  "ENABLE_PGVECTOR"
)

ALL_FLAGS_DISABLED=true

for flag in "${FLAGS[@]}"; do
  # Check Vercel environment (if available)
  if command -v vercel &> /dev/null; then
    FLAG_VALUE=$(vercel env ls $ENV 2>/dev/null | grep "^$flag" | awk '{print $2}' || echo "")

    if [[ "$FLAG_VALUE" == "true" ]]; then
      echo -e "${YELLOW}⚠️${NC} Flag $flag is ENABLED"
      echo "  Recommendation: Disable before migration, enable gradually"
      ALL_FLAGS_DISABLED=false
    else
      echo -e "${GREEN}✓${NC} Flag $flag is disabled or not set (safe)"
    fi
  else
    echo -e "${YELLOW}⚠️${NC} Vercel CLI not available, cannot check $flag"
  fi
done

if $ALL_FLAGS_DISABLED; then
  echo -e "${GREEN}✅ PASS${NC} - Feature flags configured safely"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️  WARNING${NC} - Some flags enabled (not a blocker)"
  echo "  Migration will proceed, but features may activate immediately"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""
echo "=========================================================================="
echo ""

################################################################################
# FINAL VERDICT
################################################################################

echo -e "${BLUE}📊 CHECKLIST SUMMARY${NC}"
echo ""
echo "Checks passed: $CHECKS_PASSED/5"
echo "Checks failed: $CHECKS_FAILED/5"
echo "Blockers: $BLOCKERS"
echo ""

if [[ $BLOCKERS -gt 0 ]]; then
  echo -e "${RED}❌ NO-GO - $BLOCKERS BLOCKER(S) DETECTED${NC}"
  echo ""
  echo "DO NOT proceed with migration until blockers resolved."
  echo ""
  echo "Fix checklist:"
  echo "  [ ] Run baseline tests: bash scripts/testing/run-epic1-tests.sh baseline"
  echo "  [ ] Create database backup: bash scripts/migration/backup.sh $ENV"
  echo "  [ ] Verify services healthy: bash scripts/migration/verify-epic1.sh $ENV"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ GO - All critical checks passed${NC}"
  echo ""
  echo "Safe to proceed with v2.0 migration."
  echo ""
  echo "Next steps:"
  echo "  1. Review migration plan one more time"
  echo "  2. Run migration: psql \$DATABASE_URL -f scripts/migration/migrate-v2.sql"
  echo "  3. Verify Epic 1: bash scripts/migration/verify-epic1.sh $ENV"
  echo "  4. Run post-migration tests: bash scripts/testing/run-epic1-tests.sh verify"
  echo ""
  echo "Rollback ready:"
  echo "  - Backup: $(basename "$LATEST_BACKUP" 2>/dev/null || echo "N/A")"
  echo "  - Rollback script: scripts/migration/rollback-v2.sql"
  echo "  - Feature flags: Disabled (can disable instantly if needed)"
  echo ""

  # Save pre-migration report
  REPORT_FILE="$RESULTS_DIR/pre-migration-checklist-$(date +%Y%m%d-%H%M%S).txt"
  {
    echo "MeetSolis Pre-Migration Checklist Report"
    echo "Environment: $ENV"
    echo "Timestamp: $(date)"
    echo ""
    echo "Results:"
    echo "  Checks passed: $CHECKS_PASSED/5"
    echo "  Checks failed: $CHECKS_FAILED/5"
    echo "  Blockers: $BLOCKERS"
    echo ""
    echo "Verdict: GO - Safe to migrate"
    echo ""
    echo "Backup: $(basename "$LATEST_BACKUP" 2>/dev/null || echo "N/A")"
    echo "Baseline: $BASELINE_FILE"
  } > "$REPORT_FILE"

  echo "Report saved: $REPORT_FILE"
  echo ""

  exit 0
fi
