#!/bin/sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Detect database type from DATABASE_URL
DB_URL="${DATABASE_URL:-}"
if echo "$DB_URL" | grep -q "^postgres"; then
  # PostgreSQL backup
  FILENAME="likhaverse_db_${TIMESTAMP}.sql.gz"
  pg_dump \
    -h "${POSTGRES_HOST:-localhost}" \
    -U "${POSTGRES_USER:-likhaverse}" \
    -d "${POSTGRES_DB:-likhaverse}" \
    --no-owner --no-acl --format=custom --compress=9 \
    --file="${BACKUP_DIR}/${FILENAME}"
  ln -sf "${BACKUP_DIR}/${FILENAME}" "${BACKUP_DIR}/latest.sql.gz"
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] PostgreSQL backup: ${FILENAME} ($(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1))"
elif echo "$DB_URL" | grep -q "^file:" || [ -f "${DB_URL#file:}" ] || [ -f "prisma/dev.db" ]; then
  # SQLite backup
  DB_PATH="${DB_URL#file:}"
  DB_PATH="${DB_PATH:-prisma/dev.db}"
  FILENAME="likhaverse_db_${TIMESTAMP}.db"
  cp "$DB_PATH" "${BACKUP_DIR}/${FILENAME}"
  gzip -f "${BACKUP_DIR}/${FILENAME}"
  ln -sf "${BACKUP_DIR}/${FILENAME}.gz" "${BACKUP_DIR}/latest.sql.gz"
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] SQLite backup: ${FILENAME}.gz ($(du -h "${BACKUP_DIR}/${FILENAME}.gz" | cut -f1))"
else
  echo "No database found at ${DB_PATH:-prisma/dev.db}. Skipping backup."
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "likhaverse_db_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "likhaverse_db_*.db.gz" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
