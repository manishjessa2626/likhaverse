#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Syncing database schema ---"
cd /app
node -e "
  const { execSync } = require('child_process');
  try {
    const out = execSync('npx prisma db push --accept-data-loss 2>&1', { cwd: '/app', env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } });
    console.log(out.toString());
    process.exit(0);
  } catch (e) {
    console.error(e.stderr?.toString() || e.message);
    process.exit(1);
  }
" || echo "prisma db push failed — trying schema.sql fallback"

if [ -f "/app/schema.sql" ]; then
  echo "--- Applying schema.sql fallback ---"
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
      console.log('Schema applied via fallback');
    })().then(() => process.exit(0)).catch(() => process.exit(0));
  " || echo "Schema fallback had errors"
fi

echo "--- Starting application ---"
exec "$@"
