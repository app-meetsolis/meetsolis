# Database Backup and Recovery Procedures

## Overview

This document outlines the backup and recovery procedures for the MeetSolis Supabase PostgreSQL database.

## Automated Backups (Supabase Managed)

Supabase provides automated daily backups for all projects:

- **Free Tier**: 7 days of daily backups
- **Pro Tier**: 14 days of daily backups + Point-in-Time Recovery (PITR)
- **Backups Location**: Managed by Supabase infrastructure
- **Backup Schedule**: Daily at 00:00 UTC

### Accessing Backups

1. Navigate to Supabase Dashboard → Database → Backups
2. View available backup snapshots
3. Download backups as SQL dumps for local storage

## Manual Backup Procedures

### Full Database Backup

```bash
# Using Supabase CLI
npx supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Or using pg_dump directly (requires database connection string)
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Schema-Only Backup

```bash
# Backup schema without data
npx supabase db dump --schema-only -f schema_backup.sql
```

### Data-Only Backup

```bash
# Backup data without schema
npx supabase db dump --data-only -f data_backup.sql
```

### Specific Table Backup

```bash
# Backup specific tables
pg_dump -h db.your-project.supabase.co -U postgres -d postgres -t users -t meetings > tables_backup.sql
```

## Recovery Procedures

### Full Database Restore

```bash
# Restore from SQL dump
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql

# Or using Supabase CLI
npx supabase db reset --db-url "postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres"
```

### Point-in-Time Recovery (Pro Tier Only)

1. Navigate to Supabase Dashboard → Database → Backups
2. Select "Point-in-Time Recovery"
3. Choose specific timestamp to restore to
4. Confirm restoration (creates new database)

### Migration-Based Recovery

```bash
# Reset database and re-run all migrations
npx supabase db reset

# Or manually run migrations
npx supabase db push
```

## Backup Best Practices

### Recommended Backup Schedule

- **Daily**: Automated Supabase backups (managed)
- **Weekly**: Manual full database backup downloaded locally
- **Before Major Changes**: Manual backup before schema changes or data migrations
- **Pre-Deployment**: Backup before deploying new migrations

### Storage Recommendations

- Store backups in multiple locations (local + cloud)
- Use encrypted storage for sensitive data backups
- Maintain at least 30 days of backup history locally
- Test restore procedures monthly

### Backup Testing

```bash
# Test backup integrity (quarterly)
1. Create test Supabase project
2. Restore backup to test project
3. Verify data integrity
4. Run application tests against restored data
5. Document any issues
```

## Disaster Recovery Plan

### Recovery Time Objective (RTO): 4 hours

### Recovery Point Objective (RPO): 24 hours

### Recovery Steps

1. **Assess Situation**
   - Identify scope of data loss or corruption
   - Determine last known good state

2. **Communication**
   - Notify stakeholders of incident
   - Estimate recovery time

3. **Restore Database**
   - Use most recent backup before incident
   - Verify backup integrity before restore
   - Restore to staging environment first

4. **Verify Data Integrity**
   - Run database integrity checks
   - Verify critical tables (users, meetings)
   - Test application functionality

5. **Resume Operations**
   - Switch production to restored database
   - Monitor for issues
   - Document incident for post-mortem

## Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Database Administrator**: [TBD]
- **DevOps Team**: [TBD]

## Monitoring and Alerts

### Database Health Checks

- Monitor database size growth
- Track backup success/failure
- Alert on backup age > 48 hours
- Monitor replication lag (if applicable)

### Alerts Configuration

```typescript
// Usage alerts table stores critical database events
INSERT INTO usage_alerts (
  alert_type,
  message,
  severity
) VALUES (
  'backup_failure',
  'Database backup failed',
  'critical'
);
```

## Data Retention Policy

- **User Data**: Retained indefinitely while account active
- **Meeting Data**: Retained for 90 days after meeting end
- **Files**: Auto-expire after 7 days (configurable)
- **Logs**: Retained for 30 days
- **Backups**: Minimum 30 days, maximum 90 days

## Compliance Notes

- GDPR: Support user data deletion requests within 30 days
- Data Encryption: All backups encrypted at rest
- Access Control: Backup access limited to database administrators
- Audit Trail: All backup/restore operations logged

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-01 | 1.0 | Initial backup and recovery procedures | Dev Agent |
