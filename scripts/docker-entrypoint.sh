#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Syncing database schema ---"
echo "Current dir: $(pwd)"
PRISMA_BIN="/app/node_modules/prisma/build/index.js"
if [ -f "$PRISMA_BIN" ]; then
  echo "Using prisma at $PRISMA_BIN"
  node "$PRISMA_BIN" db push --accept-data-loss 2>&1 || echo "Schema push failed with exit code $?"
  echo "Prisma db push completed"
else
  echo "Prisma CLI not found at $PRISMA_BIN, trying npx..."
  which npx && npx --version
  npx --yes prisma db push --accept-data-loss 2>&1 || echo "Schema push (npx) failed with exit code $?"
fi

echo "--- Starting application ---"
exec "$@"
