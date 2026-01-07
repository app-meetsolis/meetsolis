#!/bin/bash

################################################################################
# MeetSolis Epic 1 Test Runner
#
# Purpose: Automated test execution for Epic 1 regression testing
# Usage: bash scripts/testing/run-epic1-tests.sh [baseline|verify|integration]
# Output: test-results/epic1-{MODE}-{TIMESTAMP}.json
#
# Modes:
# - baseline: Establish pre-migration baseline (save results)
# - verify: Post-migration verification (compare against baseline)
# - integration: Epic 1 ↔ Epic 2 integration tests
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Mode selection
MODE="${1:-baseline}"
if [[ "$MODE" != "baseline" && "$MODE" != "verify" && "$MODE" != "integration" ]]; then
  echo -e "${RED}❌ Invalid mode: $MODE${NC}"
  echo "Usage: bash scripts/testing/run-epic1-tests.sh [baseline|verify|integration]"
  exit 1
fi

echo -e "${BLUE}🧪 MeetSolis Epic 1 Test Runner${NC}"
echo "Mode: $MODE"
echo "Timestamp: $TIMESTAMP"
echo ""
echo "=========================================================================="
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Output files
RESULTS_FILE="$RESULTS_DIR/epic1-$MODE-$TIMESTAMP.json"
BASELINE_FILE="$RESULTS_DIR/epic1-baseline-latest.json"

################################################################################
# MODE: BASELINE
################################################################################

if [[ "$MODE" == "baseline" ]]; then
  echo -e "${YELLOW}📊 Establishing Pre-Migration Baseline${NC}"
  echo ""

  echo -e "${YELLOW}Step 1/3: Running Epic 1 test suite...${NC}"

  # Run all Epic 1 tests
  npm run test:integration -- \
    --testPathPattern="tests/integration/(auth|database|realtime|rate-limiting|security)" \
    --json \
    --outputFile="$RESULTS_FILE" \
    --silent

  TEST_EXIT_CODE=$?

  echo ""

  if [[ $TEST_EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
  else
    echo -e "${RED}❌ Some tests failed (exit code: $TEST_EXIT_CODE)${NC}"
  fi

  echo ""
  echo -e "${YELLOW}Step 2/3: Analyzing results...${NC}"

  # Parse test results
  TOTAL_TESTS=$(jq '.numTotalTests' "$RESULTS_FILE")
  PASSED_TESTS=$(jq '.numPassedTests' "$RESULTS_FILE")
  FAILED_TESTS=$(jq '.numFailedTests' "$RESULTS_FILE")

  echo "  Total tests: $TOTAL_TESTS"
  echo "  Passed: $PASSED_TESTS"
  echo "  Failed: $FAILED_TESTS"
  echo ""

  # Check for 100% pass rate
  if [[ $FAILED_TESTS -gt 0 ]]; then
    echo -e "${RED}❌ BASELINE FAILED${NC}"
    echo ""
    echo "Cannot establish baseline with failing tests."
    echo "Fix failing tests before migration:"
    echo ""

    # Show failed test names
    jq -r '.testResults[] | select(.status == "failed") | .name' "$RESULTS_FILE" | while read -r test; do
      echo "  - $test"
    done

    echo ""
    echo "See: docs/testing/test-failure-fixes.md"
    exit 1
  fi

  echo -e "${YELLOW}Step 3/3: Saving baseline...${NC}"

  # Save as latest baseline
  cp "$RESULTS_FILE" "$BASELINE_FILE"

  echo -e "${GREEN}✓${NC} Baseline saved: $BASELINE_FILE"
  echo ""

  echo -e "${GREEN}✅ BASELINE ESTABLISHED${NC}"
  echo ""
  echo "Summary:"
  echo "  Tests run: $TOTAL_TESTS"
  echo "  Pass rate: 100%"
  echo "  Baseline file: $BASELINE_FILE"
  echo ""
  echo "Next steps:"
  echo "  1. Review test coverage: cat $RESULTS_FILE | jq '.'"
  echo "  2. Run migration: psql \$DATABASE_URL -f scripts/migration/migrate-v2.sql"
  echo "  3. Verify Epic 1: bash scripts/testing/run-epic1-tests.sh verify"
  echo ""

  exit 0
fi

################################################################################
# MODE: VERIFY
################################################################################

if [[ "$MODE" == "verify" ]]; then
  echo -e "${YELLOW}🔍 Post-Migration Verification${NC}"
  echo ""

  # Check baseline exists
  if [[ ! -f "$BASELINE_FILE" ]]; then
    echo -e "${RED}❌ Baseline file not found${NC}"
    echo "Run baseline first: bash scripts/testing/run-epic1-tests.sh baseline"
    exit 1
  fi

  echo -e "${YELLOW}Step 1/4: Running Epic 1 test suite...${NC}"

  # Run same tests as baseline
  npm run test:integration -- \
    --testPathPattern="tests/integration/(auth|database|realtime|rate-limiting|security)" \
    --json \
    --outputFile="$RESULTS_FILE" \
    --silent

  TEST_EXIT_CODE=$?

  echo ""

  echo -e "${YELLOW}Step 2/4: Comparing with baseline...${NC}"

  # Parse results
  BASELINE_TOTAL=$(jq '.numTotalTests' "$BASELINE_FILE")
  BASELINE_PASSED=$(jq '.numPassedTests' "$BASELINE_FILE")

  VERIFY_TOTAL=$(jq '.numTotalTests' "$RESULTS_FILE")
  VERIFY_PASSED=$(jq '.numPassedTests' "$RESULTS_FILE")
  VERIFY_FAILED=$(jq '.numFailedTests' "$RESULTS_FILE")

  echo ""
  echo "Baseline: $BASELINE_PASSED/$BASELINE_TOTAL passed"
  echo "Verify:   $VERIFY_PASSED/$VERIFY_TOTAL passed"
  echo ""

  # Detect regressions
  if [[ $VERIFY_PASSED -lt $BASELINE_PASSED ]]; then
    REGRESSIONS=$((BASELINE_PASSED - VERIFY_PASSED))
    echo -e "${RED}❌ REGRESSIONS DETECTED: $REGRESSIONS test(s)${NC}"
    echo ""

    # Find which tests regressed
    echo "Regressed tests:"
    jq -r '.testResults[] | select(.status == "failed") | .name' "$RESULTS_FILE" | while read -r test; do
      # Check if this test passed in baseline
      BASELINE_STATUS=$(jq -r --arg test "$test" '.testResults[] | select(.name == $test) | .status' "$BASELINE_FILE")
      if [[ "$BASELINE_STATUS" == "passed" ]]; then
        echo -e "${RED}  - $test${NC} (was passing in baseline)"
      fi
    done

    echo ""
    echo -e "${RED}🚨 MIGRATION BROKE EPIC 1 - ROLLBACK REQUIRED${NC}"
    echo ""
    echo "Immediate actions:"
    echo "  1. Disable v2.0 features: vercel env rm NEXT_PUBLIC_ENABLE_CLIENT_CARDS production"
    echo "  2. Run rollback: psql \$DATABASE_URL -f scripts/migration/rollback-v2.sql"
    echo "  3. Verify Epic 1: bash scripts/migration/verify-epic1.sh"
    echo ""

    exit 1
  fi

  echo -e "${YELLOW}Step 3/4: Checking for new failures...${NC}"

  # Check if any NEW tests are failing (not in baseline)
  NEW_FAILURES=0
  jq -r '.testResults[] | select(.status == "failed") | .name' "$RESULTS_FILE" | while read -r test; do
    if ! jq -e --arg test "$test" '.testResults[] | select(.name == $test)' "$BASELINE_FILE" > /dev/null; then
      echo -e "${YELLOW}⚠️  New test failure: $test${NC}"
      NEW_FAILURES=$((NEW_FAILURES + 1))
    fi
  done

  if [[ $NEW_FAILURES -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  $NEW_FAILURES new test(s) failing (not in baseline)${NC}"
    echo "This may indicate incomplete test coverage in baseline."
  fi

  echo ""
  echo -e "${YELLOW}Step 4/4: Generating comparison report...${NC}"

  # Create comparison report
  REPORT_FILE="$RESULTS_DIR/epic1-comparison-$TIMESTAMP.md"

  cat > "$REPORT_FILE" <<EOF
# Epic 1 Post-Migration Verification Report

**Date:** $(date)
**Mode:** Verify
**Status:** $(if [[ $VERIFY_FAILED -eq 0 ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## Summary

| Metric | Baseline | Verify | Change |
|--------|----------|--------|--------|
| Total Tests | $BASELINE_TOTAL | $VERIFY_TOTAL | $(($VERIFY_TOTAL - $BASELINE_TOTAL)) |
| Passed | $BASELINE_PASSED | $VERIFY_PASSED | $(($VERIFY_PASSED - $BASELINE_PASSED)) |
| Failed | $((BASELINE_TOTAL - BASELINE_PASSED)) | $VERIFY_FAILED | - |

## Test Categories

EOF

  # Add category breakdown
  for category in auth database realtime rate-limiting security; do
    BASELINE_CAT=$(jq --arg cat "$category" '[.testResults[] | select(.name | contains($cat))] | length' "$BASELINE_FILE")
    VERIFY_CAT=$(jq --arg cat "$category" '[.testResults[] | select(.name | contains($cat)) | select(.status == "passed")] | length' "$RESULTS_FILE")

    echo "- **$category**: $VERIFY_CAT/$BASELINE_CAT passed" >> "$REPORT_FILE"
  done

  cat >> "$REPORT_FILE" <<EOF

## Files

- Baseline: $BASELINE_FILE
- Verify: $RESULTS_FILE

## Next Steps

EOF

  if [[ $VERIFY_FAILED -eq 0 ]]; then
    cat >> "$REPORT_FILE" <<EOF
✅ All Epic 1 tests passing - safe to proceed with Epic 2 development.

Recommended actions:
1. Run integration tests: bash scripts/testing/run-epic1-tests.sh integration
2. Enable v2.0 features gradually (see feature flag docs)
3. Monitor production for 24 hours
EOF
  else
    cat >> "$REPORT_FILE" <<EOF
❌ Epic 1 regressions detected - DO NOT proceed.

Required actions:
1. Disable v2.0 features immediately
2. Rollback database if needed
3. Fix regressed tests before retry
EOF
  fi

  echo -e "${GREEN}✓${NC} Report saved: $REPORT_FILE"
  echo ""

  # Final verdict
  if [[ $VERIFY_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ VERIFICATION PASSED${NC}"
    echo ""
    echo "No Epic 1 regressions detected."
    echo "Safe to proceed with Epic 2 development."
    echo ""
    exit 0
  else
    echo -e "${RED}❌ VERIFICATION FAILED${NC}"
    echo ""
    echo "See report: $REPORT_FILE"
    exit 1
  fi
fi

################################################################################
# MODE: INTEGRATION
################################################################################

if [[ "$MODE" == "integration" ]]; then
  echo -e "${YELLOW}🔗 Epic 1 ↔ Epic 2 Integration Tests${NC}"
  echo ""

  echo -e "${YELLOW}Step 1/2: Running integration test suite...${NC}"

  # Run Epic 1 ↔ Epic 2 integration tests
  npm run test:integration -- \
    --testPathPattern="tests/integration/epic1-epic2" \
    --json \
    --outputFile="$RESULTS_FILE" \
    --silent

  TEST_EXIT_CODE=$?

  echo ""

  # Parse results
  TOTAL_TESTS=$(jq '.numTotalTests' "$RESULTS_FILE")
  PASSED_TESTS=$(jq '.numPassedTests' "$RESULTS_FILE")
  FAILED_TESTS=$(jq '.numFailedTests' "$RESULTS_FILE")

  echo "  Total tests: $TOTAL_TESTS"
  echo "  Passed: $PASSED_TESTS"
  echo "  Failed: $FAILED_TESTS"
  echo ""

  echo -e "${YELLOW}Step 2/2: Generating report...${NC}"

  # Create report
  REPORT_FILE="$RESULTS_DIR/epic1-integration-$TIMESTAMP.md"

  cat > "$REPORT_FILE" <<EOF
# Epic 1 ↔ Epic 2 Integration Test Report

**Date:** $(date)
**Status:** $(if [[ $FAILED_TESTS -eq 0 ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## Summary

- Total Tests: $TOTAL_TESTS
- Passed: $PASSED_TESTS
- Failed: $FAILED_TESTS
- Pass Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS / $TOTAL_TESTS * 100)}")%

## Test Coverage

- Auth → Client Creation
- RLS on Epic 2 Tables
- AI Usage Tracking for Epic 2 Features

## Files

- Results: $RESULTS_FILE

EOF

  if [[ $FAILED_TESTS -gt 0 ]]; then
    cat >> "$REPORT_FILE" <<EOF
## Failed Tests

EOF
    jq -r '.testResults[] | select(.status == "failed") | "- " + .name' "$RESULTS_FILE" >> "$REPORT_FILE"
  fi

  echo -e "${GREEN}✓${NC} Report saved: $REPORT_FILE"
  echo ""

  # Final verdict
  if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}✅ INTEGRATION TESTS PASSED${NC}"
    echo ""
    echo "Epic 1 and Epic 2 integrate correctly."
    echo ""
    exit 0
  else
    echo -e "${RED}❌ INTEGRATION TESTS FAILED${NC}"
    echo ""
    echo "Epic 1 ↔ Epic 2 integration issues detected."
    echo "Fix issues before enabling v2.0 features."
    echo ""
    exit 1
  fi
fi
