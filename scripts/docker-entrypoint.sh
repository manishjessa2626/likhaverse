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

    async function run() {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const sql = fs.readFileSync('/app/schema.sql', 'utf8');

      // Split by semicolons but keep the semicolons in the statements
      const stmts = [];
      let current = '';
      for (const line of sql.split('\n')) {
        if (line.trim().startsWith('--') || line.trim() === '') {
          continue;
        }
        current += line + '\n';
        if (line.trim().endsWith(';')) {
          stmts.push(current.trim());
          current = '';
        }
      }
      if (current.trim()) stmts.push(current.trim());

      console.log('Found ' + stmts.length + ' statements to execute');
      let ok = 0, fail = 0;
      for (const s of stmts) {
        try {
          await pool.query(s);
          ok++;
        } catch (err) {
          // Table already exists errors are OK
          if (err.code === '42P07' || err.code === '42710') {
            ok++;
          } else {
            fail++;
            if (fail <= 5) console.error('  FAIL:', err.message?.slice(0, 200));
          }
        }
      }
      await pool.end();
      console.log('Statements: ' + ok + ' ok, ' + fail + ' failed');
      if (fail > 0) process.exit(1);
    }
    run().catch(e => { console.error(e.message); process.exit(1); });
  " && echo "Schema applied successfully" || echo "Schema application had errors"
else
  echo "No schema.sql found at /app/schema.sql — skipping schema setup"
fi

echo "--- Starting application ---"
exec "$@"
