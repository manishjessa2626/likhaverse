#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Applying database schema ---"
SCHEMA_SQL="/app/schema.sql"
if [ -f "$SCHEMA_SQL" ]; then
  echo "Found schema.sql ($(wc -c < "$SCHEMA_SQL") bytes), applying via pg..."
  node -e "
    const { Pool } = require('pg');
    const fs = require('fs');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const sql = fs.readFileSync('$SCHEMA_SQL', 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    async function apply() {
      for (const stmt of statements) {
        try {
          await pool.query(stmt + ';');
        } catch (e) {
          console.error('Stmt failed (non-fatal):', e.message.substring(0, 100));
        }
      }
      console.log('Schema statements processed');
      await pool.end();
    }
    apply().then(() => process.exit(0)).catch((e) => {
      console.error('Schema apply error:', e.message);
      process.exit(0);
    });
  " || echo "Schema apply had errors (non-fatal)"
else
  echo "schema.sql not found at $SCHEMA_SQL"
fi

echo "--- Starting application ---"
exec "$@"
