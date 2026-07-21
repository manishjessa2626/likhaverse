#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Syncing database schema ---"
PRISMA_BIN="./node_modules/prisma/build/index.js"
if [ -f "$PRISMA_BIN" ]; then
  node "$PRISMA_BIN" db push --accept-data-loss --skip-generate 2>&1 || echo "Schema sync had errors (non-fatal)"
else
  echo "WARNING: Prisma CLI not found at $PRISMA_BIN"
  npx prisma db push --accept-data-loss --skip-generate 2>&1 || echo "Schema sync had errors (non-fatal)"
fi

echo "--- Starting application ---"
exec "$@"
