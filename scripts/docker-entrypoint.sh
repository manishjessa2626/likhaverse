#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push 2>&1 && echo "Schema synced."

echo "Starting application..."
exec "$@"
