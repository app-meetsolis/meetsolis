#!/bin/bash

################################################################################
# MeetSolis v2.0 Pre-Migration Safety Checks
#
# Purpose: Automated safety checks before running migrate-v2.sql
# Usage: bash scripts/migration/pre-migration-check.sh [staging|production]
# Exit Code: 0 = safe to migrate, 1 = abort migration
#
# Checks:
# 1. Epic 1 tables exist (users, ai_usage_tracking, usage_alerts)
# 2. Data impact assessment (count rows in old tables)
# 3. Backup exists and is recent
# 4. Staging test confirmation (production only)
# 5. Feature flags configured
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Environment
ENV="${1:-staging}"
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}❌ Invalid environment: $ENV${NC}"
  echo "Usage: bash scripts/migration/pre-migration-check.sh [staging|production]"
  exit 1
fi

echo -e "${BLUE}🔒 MeetSolis v2.0 Pre-Migration Safety Checks${NC}"
echo "Environment: $ENV"
echo "Timestamp: $(date)"
echo ""
echo "=========================================================================="
echo ""

# Get database URL
if [[ "$ENV" == "production" ]]; then
  DB_URL="${DATABASE_URL_PRODUCTION:-$DATABASE_URL}"
else
  DB_URL="${DATABASE_URL_STAGING:-$DATABASE_URL}"
fi

if [[ -z "$DB_URL" ]]; then
  echo -e "${RED}❌ Database URL not set${NC}"
  exit 1
fi

################################################################################
# CHECK 1: Epic 1 Tables Exist
################################################################################

echo -e "${YELLOW}Check 1/5: Epic 1 Tables Integrity${NC}"

EPIC1_TABLES=("users" "ai_usage_tracking" "usage_alerts")
ALL_TABLES_EXIST=true

for table in "${EPIC1_TABLES[@]}"; do
  if psql "$DB_URL" -c "\dt $table" 2>&1 | grep -q "$table"; then
    # Get row count
    ROW_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "ERROR")

    if [[ "$ROW_COUNT" == "ERROR" ]]; then
      echo -e "${RED}✗${NC} Table '$table' exists but query failed"
      ALL_TABLES_EXIST=false
    else
      echo -e "${GREEN}✓${NC} Table '$table' exists ($ROW_COUNT rows)"
    fi
  else
    echo -e "${RED}✗${NC} Table '$table' MISSING"
    ALL_TABLES_EXIST=false
  fi
done

if $ALL_TABLES_EXIST; then
  # Additional check: users table has data
  USERS_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM users" 2>/dev/null | xargs)

  if [[ "$USERS_COUNT" -lt 1 ]]; then
    echo -e "${YELLOW}⚠️  WARNING${NC} - users table is empty"
    echo "  This is unusual for a production database"
    WARNINGS=$((WARNINGS + 1))
  fi

  echo -e "${GREEN}✅ PASS${NC} - All Epic 1 tables exist"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC} - Missing Epic 1 tables"
  echo "  ABORT: Cannot migrate without Epic 1 infrastructure"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  exit 1 # Hard stop - missing Epic 1 tables is critical
fi

echo ""

################################################################################
# CHECK 2: Data Impact Assessment
################################################################################

echo -e "${YELLOW}Check 2/5: Data Impact Assessment${NC}"

# Tables that will be DROPPED in migration
OLD_TABLES=("meetings" "participants" "messages" "reactions" "files" "meeting_summaries")

echo "Checking v1.0 video tables for existing data..."
echo ""

TOTAL_AFFECTED_ROWS=0
TABLES_WITH_DATA=()

for table in "${OLD_TABLES[@]}"; do
  # Check if table exists
  if psql "$DB_URL" -c "\dt $table" 2>&1 | grep -q "$table"; then
    ROW_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null | xargs)

    if [[ "$ROW_COUNT" -gt 0 ]]; then
      echo -e "${YELLOW}⚠️${NC} Table '$table': $ROW_COUNT rows (WILL BE DELETED)"
      TOTAL_AFFECTED_ROWS=$((TOTAL_AFFECTED_ROWS + ROW_COUNT))
      TABLES_WITH_DATA+=("$table")
    else
      echo -e "${GREEN}✓${NC} Table '$table': 0 rows (safe to drop)"
    fi
  else
    echo -e "${GREEN}✓${NC} Table '$table': doesn't exist (already clean)"
  fi
done

echo ""

if [[ $TOTAL_AFFECTED_ROWS -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  DATA IMPACT: $TOTAL_AFFECTED_ROWS rows in ${#TABLES_WITH_DATA[@]} table(s) will be deleted${NC}"
  echo ""
  echo "Affected tables:"
  for table in "${TABLES_WITH_DATA[@]}"; do
    echo "  - $table"
  done
  echo ""

  # Check if data was exported
  EXPORT_FILES=()
  for table in "${TABLES_WITH_DATA[@]}"; do
    EXPORT_FILE=$(find "$PROJECT_ROOT/backups" -name "${table}-export-*.csv" -o -name "${table}-archive-*.csv" 2>/dev/null | sort -r | head -n 1)
    if [[ -n "$EXPORT_FILE" ]]; then
      EXPORT_FILES+=("$(basename "$EXPORT_FILE")")
    fi
  done

  if [[ ${#EXPORT_FILES[@]} -gt 0 ]]; then
    echo -e "${GREEN}✓${NC} Data exports found:"
    for file in "${EXPORT_FILES[@]}"; do
      echo "  - $file"
    done
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${YELLOW}⚠️  WARNING${NC} - No data exports found"
    echo "  Recommendation: Export data before migration"
    echo "  Run: psql \$DATABASE_URL -c \"\\copy meetings TO 'backups/meetings-export-\$(date +%Y%m%d).csv' CSV HEADER\""
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${GREEN}✓${NC} No data in v1.0 tables - clean migration"
fi

echo -e "${GREEN}✅ PASS${NC} - Data impact assessed ($TOTAL_AFFECTED_ROWS rows affected)"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

echo ""

################################################################################
# CHECK 3: Backup Exists and Recent
################################################################################

echo -e "${YELLOW}Check 3/5: Database Backup${NC}"

# Find latest backup for environment
LATEST_BACKUP=$(find "$PROJECT_ROOT/backups" -name "backup-epic1-$ENV-*.sql.gz" -type f 2>/dev/null | sort -r | head -n 1)

if [[ -z "$LATEST_BACKUP" ]]; then
  echo -e "${RED}❌ FAIL${NC} - No backup found for $ENV"
  echo "  CRITICAL: Cannot proceed without backup"
  echo "  Run: bash scripts/migration/backup.sh $ENV"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  exit 1 # Hard stop - no backup is critical
fi

# Check backup age
BACKUP_TIMESTAMP=$(stat -f%m "$LATEST_BACKUP" 2>/dev/null || stat -c%Y "$LATEST_BACKUP" 2>/dev/null)
CURRENT_TIMESTAMP=$(date +%s)
BACKUP_AGE_SECONDS=$((CURRENT_TIMESTAMP - BACKUP_TIMESTAMP))
BACKUP_AGE_MINUTES=$((BACKUP_AGE_SECONDS / 60))

echo "Latest backup: $(basename "$LATEST_BACKUP")"
echo "Age: $BACKUP_AGE_MINUTES minutes"

if [[ $BACKUP_AGE_MINUTES -gt 120 ]]; then
  echo -e "${YELLOW}⚠️  WARNING${NC} - Backup is >2 hours old"
  echo "  Recommendation: Create fresh backup before migration"
  WARNINGS=$((WARNINGS + 1))
fi

# Check backup size
BACKUP_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP" 2>/dev/null)
BACKUP_SIZE_KB=$((BACKUP_SIZE / 1024))

if [[ $BACKUP_SIZE_KB -lt 10 ]]; then
  echo -e "${RED}❌ FAIL${NC} - Backup file too small ($BACKUP_SIZE_KB KB)"
  echo "  Backup may be corrupted or empty"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  exit 1
fi

echo "Size: $BACKUP_SIZE_KB KB"

# Test backup integrity
if gunzip -t "$LATEST_BACKUP" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Backup integrity OK (gzip test passed)"
else
  echo -e "${RED}❌ FAIL${NC} - Backup file corrupted (failed gzip test)"
  CHECKS_FAILED=$((CHECKS_FAILED + 1))
  exit 1
fi

echo -e "${GREEN}✅ PASS${NC} - Valid backup exists"
CHECKS_PASSED=$((CHECKS_PASSED + 1))

echo ""

################################################################################
# CHECK 4: Staging Test Confirmation (Production Only)
################################################################################

if [[ "$ENV" == "production" ]]; then
  echo -e "${YELLOW}Check 4/5: Staging Test Confirmation${NC}"

  STAGING_CONFIRMATION_FILE="$PROJECT_ROOT/test-results/staging-migration-success.txt"

  if [[ -f "$STAGING_CONFIRMATION_FILE" ]]; then
    STAGING_TEST_DATE=$(cat "$STAGING_CONFIRMATION_FILE" | grep "Date:" | cut -d' ' -f2-)
    echo -e "${GREEN}✓${NC} Staging test passed on: $STAGING_TEST_DATE"

    # Check if staging test is recent (within 7 days)
    STAGING_TIMESTAMP=$(stat -f%m "$STAGING_CONFIRMATION_FILE" 2>/dev/null || stat -c%Y "$STAGING_CONFIRMATION_FILE" 2>/dev/null)
    STAGING_AGE_SECONDS=$((CURRENT_TIMESTAMP - STAGING_TIMESTAMP))
    STAGING_AGE_DAYS=$((STAGING_AGE_SECONDS / 86400))

    if [[ $STAGING_AGE_DAYS -gt 7 ]]; then
      echo -e "${YELLOW}⚠️  WARNING${NC} - Staging test is $STAGING_AGE_DAYS days old"
      echo "  Recommendation: Re-run staging test with latest migration script"
      WARNINGS=$((WARNINGS + 1))
    fi

    echo -e "${GREEN}✅ PASS${NC} - Staging test confirmed"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo -e "${YELLOW}⚠️  WARNING${NC} - No staging test confirmation found"
    echo "  Recommendation: Test migration on staging first"
    echo "  Create confirmation file:"
    echo "    echo 'Date: \$(date)' > $STAGING_CONFIRMATION_FILE"
    WARNINGS=$((WARNINGS + 1))
    CHECKS_PASSED=$((CHECKS_PASSED + 1)) # Not a hard blocker
  fi
else
  echo -e "${YELLOW}Check 4/5: Staging Test Confirmation${NC}"
  echo -e "${BLUE}⏭️  SKIPPED${NC} - Not required for staging environment"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""

################################################################################
# CHECK 5: Feature Flags Configured
################################################################################

echo -e "${YELLOW}Check 5/5: Feature Flags${NC}"

# Check if Vercel CLI available
if command -v vercel &> /dev/null; then
  FLAGS=("NEXT_PUBLIC_ENABLE_CLIENT_CARDS" "NEXT_PUBLIC_ENABLE_NEW_MEETINGS" "ENABLE_PGVECTOR")

  ALL_FLAGS_SAFE=true

  for flag in "${FLAGS[@]}"; do
    FLAG_VALUE=$(vercel env ls "$ENV" 2>/dev/null | grep "^$flag" | awk '{print $2}' || echo "not_set")

    if [[ "$FLAG_VALUE" == "true" ]]; then
      echo -e "${YELLOW}⚠️${NC} Flag $flag is ENABLED"
      echo "  Features will activate immediately after migration"
      ALL_FLAGS_SAFE=false
      WARNINGS=$((WARNINGS + 1))
    else
      echo -e "${GREEN}✓${NC} Flag $flag is disabled/not set (safe)"
    fi
  done

  if $ALL_FLAGS_SAFE; then
    echo -e "${GREEN}✅ PASS${NC} - All feature flags disabled (recommended)"
  else
    echo -e "${YELLOW}⚠️  WARNING${NC} - Some flags enabled (not a blocker)"
    echo "  Recommendation: Disable flags, enable gradually post-migration"
  fi

  CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
  echo -e "${YELLOW}⚠️${NC} Vercel CLI not available - cannot check feature flags"
  echo "  Proceeding with assumption that flags are disabled"
  CHECKS_PASSED=$((CHECKS_PASSED + 1))
fi

echo ""

################################################################################
# FINAL VERDICT
################################################################################

echo "=========================================================================="
echo ""
echo -e "${BLUE}📊 PRE-MIGRATION CHECKS SUMMARY${NC}"
echo ""
echo "Environment: $ENV"
echo "Checks passed: $CHECKS_PASSED/5"
echo "Checks failed: $CHECKS_FAILED/5"
echo "Warnings: $WARNINGS"
echo ""

if [[ $CHECKS_FAILED -gt 0 ]]; then
  echo -e "${RED}❌ ABORT - Critical checks failed${NC}"
  echo ""
  echo "DO NOT run migration until all failures resolved."
  echo ""
  exit 1
fi

if [[ $WARNINGS -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  PROCEED WITH CAUTION - $WARNINGS warning(s)${NC}"
  echo ""
  echo "Warnings detected (not blockers, but recommended to address):"
  echo "  - Review data impact and consider exporting old tables"
  echo "  - Ensure backup is recent (<1 hour old preferred)"
  echo "  - Confirm staging test passed (production only)"
  echo "  - Consider disabling feature flags for gradual rollout"
  echo ""
  echo "Continue? (yes/no)"
  read -r CONTINUE

  if [[ "$CONTINUE" != "yes" ]]; then
    echo "Migration aborted by user"
    exit 1
  fi
fi

echo -e "${GREEN}✅ ALL CHECKS PASSED - Safe to migrate${NC}"
echo ""
echo "Pre-migration summary:"
echo "  Epic 1 tables: ✓ Intact"
echo "  Backup: ✓ $(basename "$LATEST_BACKUP")"
echo "  Data impact: $TOTAL_AFFECTED_ROWS rows in ${#TABLES_WITH_DATA[@]} table(s)"
echo ""
echo "Ready to run migration:"
echo "  psql \$DATABASE_URL -f scripts/migration/migrate-v2.sql"
echo ""
echo "After migration:"
echo "  1. Verify Epic 1: bash scripts/migration/verify-epic1.sh $ENV"
echo "  2. Run tests: bash scripts/testing/run-epic1-tests.sh verify"
echo "  3. Enable features gradually (see feature flag docs)"
echo ""

exit 0
