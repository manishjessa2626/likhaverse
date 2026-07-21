# LikhaVerse — Backup & Recovery

---

## Automatic Backups

**Script:** `scripts/backup.sh`
**Restore:** `scripts/restore.sh`
**Retention:** 30 days (configurable via `BACKUP_RETENTION_DAYS`)
**Directory:** `./backups/` (configurable via `BACKUP_DIR`)

### What Gets Backed Up
- **SQLite (dev)**: Full copy of `prisma/dev.db` → `gzip` compressed
- **PostgreSQL (prod)**: `pg_dump` → custom format → `gzip` compressed
- Auto-detects database type from `DATABASE_URL`

### Backup File Naming
```
likhaverse_db_20260707_143022.db.gz   (SQLite)
likhaverse_db_20260707_143022.sql.gz  (PostgreSQL)
latest.sql.gz                          (symlink to latest)
```

### Running Backups
```bash
# Manual
npm run backup

# Automatic (via cron — add to crontab)
0 3 * * * cd /path/to/likhaverse && npm run backup >> /var/log/likhaverse-backup.log 2>&1

# Pre-deploy hook (CI/CD pipeline)
# Backup runs automatically before deploy in .github/workflows/deploy.yml
```

### Restore
```bash
# List available backups
ls -la backups/

# Restore latest
npm run restore                 # uses latest.sql.gz symlink

# Restore specific backup
BACKUP_FILE=backups/likhaverse_db_20260707.db.gz npm run restore
```

---

## Database Backup Strategy

| Environment | Method | Frequency | Retention |
|-------------|--------|-----------|-----------|
| Dev (SQLite) | File copy + gzip | Daily | 30 days |
| Staging (PostgreSQL) | pg_dump | Daily | 7 days |
| Production (PostgreSQL) | pg_dump + WAL archiving | Hourly + Daily | 30 days + PITR |

### For Production (PostgreSQL)
1. **Daily full backup**: `pg_dump --format=custom --compress=9`
2. **Continuous WAL archiving**: For point-in-time recovery (PITR)
3. **Streaming replica**: Read replica for failover
4. **Backup verification**: Weekly restore test to staging

---

## Restore Script (`scripts/restore.sh`)

Detects whether backup is SQLite or PostgreSQL:

```bash
# SQLite restore:
gunzip -c backup.sql.gz > prisma/dev.db

# PostgreSQL restore:
pg_restore --no-owner --no-acl --dbname=postgresql://... backup.sql.gz
```

---

## Recovery Scenarios

| Scenario | Action | RPO | RTO |
|----------|--------|-----|-----|
| Accidental data loss | Restore latest backup | ~24h | ~30min |
| Database corruption | Restore latest backup + WAL replay | ~1h | ~1h |
| Full server failure | Spin up new instance, restore from backup | ~24h | ~2h |
| Schema migration failure | Rollback migration + restore pre-migration backup | ~1h | ~15min |
| User error (row delete) | Restore from backup, extract specific row | ~24h | ~2h |

---

## What's NOT Backed Up (Separate Strategy Needed)

| Asset | Storage | Backup Method |
|-------|---------|--------------|
| Uploaded images | `public/uploads/` | Sync to S3/Cloudinary (Phase 5) |
| AI-generated images | External URLs (OpenAI/Replicate) | URLs stored in DB are backed up |
| Sentry events | Sentry servers | Retained by Sentry |
| Logs | Filesystem | Docker log driver (`json-file`, max 10MB × 3) |

---

## Disaster Recovery Checklist

- [ ] Backups run daily via cron
- [ ] Backup retention ≥ 30 days
- [ ] Latest backup verified as restorable
- [ ] `.env.production` with all secrets stored securely (not in git)
- [ ] Docker images pushed to registry (reusable for rollback)
- [ ] PostgreSQL WAL archiving configured
- [ ] Staging environment for restore tests
- [ ] Runbook documented for full server rebuild
