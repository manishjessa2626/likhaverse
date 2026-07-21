#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy 2>&1 || echo "Migration failed (DB may not be ready yet)"

echo "Starting application..."
exec "$@"
