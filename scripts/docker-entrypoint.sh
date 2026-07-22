#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

if [ -f "/app/schema.sql" ]; then
  echo "--- Applying database schema ---"
  node -e "
    const { Pool } = require('pg');
    const fs = require('fs');
    const p = new Pool({ connectionString: process.env.DATABASE_URL });
    const sql = fs.readFileSync('/app/schema.sql', 'utf8');
    const stmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    (async () => {
      for (const s of stmts) {
        try { await p.query(s + ';') } catch {}
      }
      await p.end();
      console.log('Schema applied');
    })().then(() => process.exit(0)).catch(() => process.exit(0));
  " || echo "Schema apply had errors (non-fatal)"
fi

echo "--- Starting application ---"
exec "$@"
