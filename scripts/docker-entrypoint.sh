#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Prisma version: $(npx prisma --version 2>&1 | head -3)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Syncing database schema ---"
npx prisma db push --accept-data-loss --skip-generate 2>&1 || true

echo "--- Starting application ---"
exec "$@"
