#!/bin/bash

################################################################################
# MeetSolis v2.0 Migration - Database Backup Script
#
# Purpose: Automated backup of Epic 1 tables before migration
# Usage: bash scripts/migration/backup.sh [staging|production]
# Output: backups/backup-epic1-{ENV}-{TIMESTAMP}.sql.gz
#
# Features:
# - Backs up Epic 1 tables only (users, ai_usage_tracking, usage_alerts)
# - Compresses with gzip
# - Verifies backup integrity
# - Optionally uploads to Supabase Storage
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Environment selection
ENV="${1:-staging}"
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}❌ Invalid environment: $ENV${NC}"
  echo "Usage: bash scripts/migration/backup.sh [staging|production]"
  exit 1
fi

echo -e "${YELLOW}📦 Starting MeetSolis Epic 1 backup...${NC}"
echo "Environment: $ENV"
echo "Timestamp: $TIMESTAMP"
echo ""

# Get database URL from environment
if [[ "$ENV" == "production" ]]; then
  DB_URL="${DATABASE_URL_PRODUCTION:-$DATABASE_URL}"
else
  DB_URL="${DATABASE_URL_STAGING:-$DATABASE_URL}"
fi

if [[ -z "$DB_URL" ]]; then
  echo -e "${RED}❌ Database URL not set${NC}"
  echo "Set DATABASE_URL_${ENV^^} or DATABASE_URL environment variable"
  exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Output files
BACKUP_FILE="$BACKUP_DIR/backup-epic1-$ENV-$TIMESTAMP.sql"
BACKUP_COMPRESSED="$BACKUP_FILE.gz"

echo -e "${YELLOW}🔍 Verifying Epic 1 tables exist...${NC}"

# Check tables exist
TABLES=("users" "ai_usage_tracking" "usage_alerts")
for table in "${TABLES[@]}"; do
  if psql "$DB_URL" -c "\dt $table" 2>&1 | grep -q "$table"; then
    echo -e "${GREEN}✓${NC} Table '$table' exists"
  else
    echo -e "${RED}❌ Table '$table' not found${NC}"
    exit 1
  fi
done

echo ""
echo -e "${YELLOW}💾 Dumping database...${NC}"

# Backup Epic 1 tables with full schema
pg_dump "$DB_URL" \
  --format=plain \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --table=users \
  --table=ai_usage_tracking \
  --table=usage_alerts \
  > "$BACKUP_FILE"

if [[ $? -ne 0 ]]; then
  echo -e "${RED}❌ Database dump failed${NC}"
  exit 1
fi

BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
echo -e "${GREEN}✓${NC} Dump complete: $((BACKUP_SIZE / 1024)) KB"

echo ""
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"

# Compress with gzip
gzip -9 "$BACKUP_FILE"

if [[ $? -ne 0 ]]; then
  echo -e "${RED}❌ Compression failed${NC}"
  exit 1
fi

COMPRESSED_SIZE=$(stat -f%z "$BACKUP_COMPRESSED" 2>/dev/null || stat -c%s "$BACKUP_COMPRESSED" 2>/dev/null)
COMPRESSION_RATIO=$(awk "BEGIN {printf \"%.1f\", 100 - ($COMPRESSED_SIZE / $BACKUP_SIZE * 100)}")
echo -e "${GREEN}✓${NC} Compressed: $((COMPRESSED_SIZE / 1024)) KB (${COMPRESSION_RATIO}% reduction)"

echo ""
echo -e "${YELLOW}🔬 Verifying backup integrity...${NC}"

# Verify backup can be decompressed
gunzip -t "$BACKUP_COMPRESSED"
if [[ $? -ne 0 ]]; then
  echo -e "${RED}❌ Backup integrity check failed${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Backup integrity OK"

# Count tables in backup
TABLE_COUNT=$(gunzip -c "$BACKUP_COMPRESSED" | grep -c "CREATE TABLE")
if [[ $TABLE_COUNT -lt 3 ]]; then
  echo -e "${RED}❌ Expected 3 tables, found $TABLE_COUNT${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Table count: $TABLE_COUNT (expected: 3)"

# Check backup is not empty
if [[ $COMPRESSED_SIZE -lt 1024 ]]; then
  echo -e "${RED}❌ Backup too small (<1KB), likely empty${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Backup size OK (>1KB)"

echo ""
echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo ""
echo "📁 Backup file:"
echo "   $BACKUP_COMPRESSED"
echo ""
echo "📊 Backup details:"
echo "   Environment: $ENV"
echo "   Tables: users, ai_usage_tracking, usage_alerts"
echo "   Size: $((COMPRESSED_SIZE / 1024)) KB"
echo "   Created: $(date)"
echo ""

# Optional: Upload to Supabase Storage
if [[ "${UPLOAD_TO_SUPABASE:-false}" == "true" ]]; then
  echo -e "${YELLOW}☁️  Uploading to Supabase Storage...${NC}"

  # Supabase storage upload using REST API
  SUPABASE_URL="${SUPABASE_URL:-}"
  SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

  if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_KEY" ]]; then
    echo -e "${YELLOW}⚠️  Supabase credentials not set, skipping upload${NC}"
  else
    STORAGE_PATH="backups/backup-epic1-$ENV-$TIMESTAMP.sql.gz"

    curl -X POST \
      "$SUPABASE_URL/storage/v1/object/meetsolis-backups/$STORAGE_PATH" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
      -H "Content-Type: application/gzip" \
      --data-binary "@$BACKUP_COMPRESSED"

    if [[ $? -eq 0 ]]; then
      echo -e "${GREEN}✓${NC} Uploaded to Supabase Storage"
      echo "   Path: $STORAGE_PATH"
    else
      echo -e "${YELLOW}⚠️  Upload failed (non-critical)${NC}"
    fi
  fi
  echo ""
fi

# Cleanup old backups (keep last 10)
echo -e "${YELLOW}🧹 Cleaning old backups...${NC}"
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "backup-epic1-$ENV-*.sql.gz" -type f | sort -r | tail -n +11)
if [[ -n "$OLD_BACKUPS" ]]; then
  echo "$OLD_BACKUPS" | while read -r old_backup; do
    rm -f "$old_backup"
    echo -e "${GREEN}✓${NC} Deleted old backup: $(basename "$old_backup")"
  done
else
  echo -e "${GREEN}✓${NC} No old backups to clean"
fi

echo ""
echo -e "${GREEN}🎉 Backup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify backup: gunzip -c $BACKUP_COMPRESSED | less"
echo "  2. Run pre-migration checks: bash scripts/migration/pre-migration-check.sh"
echo "  3. Run migration: psql \$DATABASE_URL -f scripts/migration/migrate-v2.sql"
echo ""

# Output backup path for automation
echo "BACKUP_PATH=$BACKUP_COMPRESSED"
