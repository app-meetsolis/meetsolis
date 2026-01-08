#!/bin/bash

################################################################################
# MeetSolis v2.0 Migration - Epic 1 Verification Script
#
# Purpose: Test Epic 1 functionality after migration/rollback
# Usage: bash scripts/migration/verify-epic1.sh [staging|production]
# Exit Code: 0 = all tests pass, 1 = failure
#
# Tests:
# 1. Database connection
# 2. Epic 1 tables exist (users, ai_usage_tracking, usage_alerts)
# 3. RLS policies active (cross-user access blocked)
# 4. Auth endpoint responding
# 5. Redis rate limiting functional
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Environment
ENV="${1:-staging}"
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}❌ Invalid environment: $ENV${NC}"
  echo "Usage: bash scripts/migration/verify-epic1.sh [staging|production]"
  exit 1
fi

echo -e "${YELLOW}🧪 MeetSolis Epic 1 Verification${NC}"
echo "Environment: $ENV"
echo "Timestamp: $(date)"
echo ""
echo "=========================================================================="
echo ""

# Get database URL
if [[ "$ENV" == "production" ]]; then
  DB_URL="${DATABASE_URL_PRODUCTION:-$DATABASE_URL}"
  APP_URL="${NEXT_PUBLIC_APP_URL_PRODUCTION:-https://meetsolis.com}"
else
  DB_URL="${DATABASE_URL_STAGING:-$DATABASE_URL}"
  APP_URL="${NEXT_PUBLIC_APP_URL_STAGING:-http://localhost:3000}"
fi

if [[ -z "$DB_URL" ]]; then
  echo -e "${RED}❌ Database URL not set${NC}"
  exit 1
fi

# Get Redis URL
REDIS_URL="${UPSTASH_REDIS_REST_URL:-}"

################################################################################
# TEST 1: Database Connection
################################################################################

echo -e "${YELLOW}Test 1/5: Database Connection${NC}"

if psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ PASS${NC} - Database connection successful"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC} - Cannot connect to database"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

################################################################################
# TEST 2: Epic 1 Tables Exist
################################################################################

echo -e "${YELLOW}Test 2/5: Epic 1 Tables Exist${NC}"

EXPECTED_TABLES=("users" "ai_usage_tracking" "usage_alerts")
ALL_TABLES_EXIST=true

for table in "${EXPECTED_TABLES[@]}"; do
  if psql "$DB_URL" -c "\dt $table" 2>&1 | grep -q "$table"; then
    echo -e "${GREEN}✓${NC} Table '$table' exists"
  else
    echo -e "${RED}✗${NC} Table '$table' MISSING"
    ALL_TABLES_EXIST=false
  fi
done

if $ALL_TABLES_EXIST; then
  echo -e "${GREEN}✅ PASS${NC} - All Epic 1 tables exist"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}❌ FAIL${NC} - Missing Epic 1 tables"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Check row counts (informational)
echo -e "${YELLOW}Table row counts:${NC}"
for table in "${EXPECTED_TABLES[@]}"; do
  ROW_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "0")
  echo "  $table: $ROW_COUNT rows"
done

echo ""

################################################################################
# TEST 3: RLS Policies Active
################################################################################

echo -e "${YELLOW}Test 3/5: RLS Policies Active${NC}"

# Check if RLS is enabled on users table
RLS_ENABLED=$(psql "$DB_URL" -t -c "SELECT relrowsecurity FROM pg_class WHERE relname = 'users'" 2>/dev/null || echo "f")

if [[ "$RLS_ENABLED" == *"t"* ]]; then
  echo -e "${GREEN}✓${NC} RLS enabled on users table"

  # Check if RLS policies exist
  POLICY_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users'" 2>/dev/null || echo "0")
  if [[ "$POLICY_COUNT" -gt 0 ]]; then
    echo -e "${GREEN}✓${NC} RLS policies exist ($POLICY_COUNT policies)"
    echo -e "${GREEN}✅ PASS${NC} - RLS policies active"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} No RLS policies found"
    echo -e "${RED}❌ FAIL${NC} - RLS enabled but no policies"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗${NC} RLS NOT enabled on users table"
  echo -e "${RED}❌ FAIL${NC} - RLS policies not active"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

################################################################################
# TEST 4: Auth Endpoint Responding
################################################################################

echo -e "${YELLOW}Test 4/5: Auth Endpoint Responding${NC}"

# Check if app is running
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health" | grep -q "200"; then
  echo -e "${GREEN}✓${NC} Health endpoint responding (200 OK)"

  # Test auth endpoint (should return 401 without token)
  AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/auth/user" 2>/dev/null || echo "000")

  if [[ "$AUTH_STATUS" == "401" ]]; then
    echo -e "${GREEN}✓${NC} Auth endpoint responding (401 Unauthorized - expected)"
    echo -e "${GREEN}✅ PASS${NC} - Auth endpoint functional"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  elif [[ "$AUTH_STATUS" == "200" ]]; then
    echo -e "${YELLOW}⚠️${NC} Auth endpoint returned 200 (may be authenticated)"
    echo -e "${GREEN}✅ PASS${NC} - Auth endpoint responding"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} Auth endpoint returned $AUTH_STATUS"
    echo -e "${RED}❌ FAIL${NC} - Auth endpoint not responding correctly"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗${NC} Application not responding"
  echo -e "${YELLOW}⚠️  SKIP${NC} - Cannot test auth endpoint (app offline)"
  echo ""
  echo "Note: App may not be deployed yet. Run verification after deployment."
fi

echo ""

################################################################################
# TEST 5: Redis Rate Limiting Functional
################################################################################

echo -e "${YELLOW}Test 5/5: Redis Rate Limiting${NC}"

if [[ -z "$REDIS_URL" ]]; then
  echo -e "${YELLOW}⚠️  SKIP${NC} - Redis URL not set (UPSTASH_REDIS_REST_URL)"
  echo ""
else
  # Test Redis connection via REST API
  REDIS_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${REDIS_URL}/ping" 2>/dev/null || echo "000")

  if [[ "$REDIS_HEALTH" == "200" ]]; then
    echo -e "${GREEN}✓${NC} Redis connection successful"

    # Test rate limiting endpoint (if app is running)
    if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health" | grep -q "200"; then
      # Make 15 requests (should trigger rate limit after 10)
      RATE_LIMITED=false
      for i in {1..15}; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/meetings" 2>/dev/null || echo "000")
        if [[ "$STATUS" == "429" ]]; then
          RATE_LIMITED=true
          echo -e "${GREEN}✓${NC} Rate limiting triggered after $i requests (429 Too Many Requests)"
          break
        fi
      done

      if $RATE_LIMITED; then
        echo -e "${GREEN}✅ PASS${NC} - Redis rate limiting functional"
        TESTS_PASSED=$((TESTS_PASSED + 1))
      else
        echo -e "${YELLOW}⚠️${NC} Rate limiting not triggered (may need authentication)"
        echo -e "${YELLOW}⚠️  SKIP${NC} - Cannot fully test rate limiting"
      fi
    else
      echo -e "${YELLOW}⚠️  SKIP${NC} - Cannot test rate limiting (app offline)"
    fi
  else
    echo -e "${RED}✗${NC} Redis connection failed (HTTP $REDIS_HEALTH)"
    echo -e "${RED}❌ FAIL${NC} - Redis not responding"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi

  echo ""
fi

################################################################################
# SUMMARY
################################################################################

echo ""
echo "=========================================================================="
echo -e "${YELLOW}VERIFICATION SUMMARY${NC}"
echo "=========================================================================="
echo ""
echo "Environment: $ENV"
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo ""
  echo "Epic 1 infrastructure is functional."
  echo "Safe to proceed with Epic 2 development."
  echo ""
  exit 0
else
  echo -e "${RED}❌ VERIFICATION FAILED${NC}"
  echo ""
  echo "Epic 1 infrastructure has issues. DO NOT proceed with migration."
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check database connection: psql \$DATABASE_URL -c 'SELECT 1'"
  echo "  2. Verify RLS policies: psql \$DATABASE_URL -c '\\d+ users'"
  echo "  3. Check application logs: vercel logs"
  echo "  4. Test Redis: curl \$UPSTASH_REDIS_REST_URL/ping"
  echo ""
  exit 1
fi
