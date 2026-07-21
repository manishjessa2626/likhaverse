#!/bin/sh
set -euo pipefail

usage() {
  echo "Usage: $0 [backup-file]"
  echo "  If no backup file is specified, restores from the latest backup."
  exit 1
}

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  BACKUP_FILE="./backups/latest.sql.gz"
  if [ ! -f "$BACKUP_FILE" ] && [ ! -L "$BACKUP_FILE" ]; then
    echo "No backup file specified and no latest backup found at $BACKUP_FILE."
    usage
  fi
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will OVERWRITE all existing data with the backup."
echo "Source: $BACKUP_FILE"
printf "Are you sure? Type 'yes' to continue: "
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

DB_URL="${DATABASE_URL:-}"

if echo "$DB_URL" | grep -q "^postgres"; then
  pg_restore \
    -h "${POSTGRES_HOST:-localhost}" \
    -U "${POSTGRES_USER:-likhaverse}" \
    -d "${POSTGRES_DB:-likhaverse}" \
    --clean --if-exists --no-owner --no-acl --verbose \
    "$BACKUP_FILE"
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] PostgreSQL restore complete from: $BACKUP_FILE"
else
  DB_PATH="prisma/dev.db"
  if echo "$BACKUP_FILE" | grep -q "\.gz$"; then
    gunzip -c "$BACKUP_FILE" > "$DB_PATH"
  else
    cp "$BACKUP_FILE" "$DB_PATH"
  fi
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] SQLite restore complete from: $BACKUP_FILE → $DB_PATH"
fi
