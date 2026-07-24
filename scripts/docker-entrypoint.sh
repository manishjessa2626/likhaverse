#!/bin/sh
set -e

echo "=== LikhaVerse Startup ==="
echo "Node version: $(node --version)"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Syncing database schema ---"
cd /app

node -e "
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  // Prisma binary: Docker COPY resolves symlinks, so .bin/prisma becomes a
  // JS file with broken relative requires. Use the real path instead.
  const prismaBin = '/app/node_modules/prisma/build/index.js';

  if (!fs.existsSync(prismaBin)) {
    console.error('Prisma CLI not found at', prismaBin);
    process.exit(1);
  }
  console.log('Using prisma:', prismaBin);

  try {
    const cmd = 'node ' + prismaBin + ' db push --accept-data-loss --schema=/app/prisma/schema.prisma --config=/app/prisma.config.ts';
    console.log('Running:', cmd);
    const out = execSync(cmd, {
      cwd: '/app',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      encoding: 'utf8',
      timeout: 120000,
    });
    console.log(out.toString());
    console.log('Database schema created successfully');
    process.exit(0);
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    const stdout = e.stdout?.toString() || '';
    const msg = e.message || String(e);
    console.error('prisma db push failed:');
    console.error('STDOUT:', stdout.slice(0, 1000));
    console.error('STDERR:', stderr.slice(0, 1000));
    console.error('ERROR:', msg);
    process.exit(1);
  }
" && echo "Schema sync complete" || echo "prisma db push failed — trying raw SQL fallback"

if [ -f "/app/schema.sql" ]; then
  echo "--- Applying schema.sql via pg ---"
  node -e "
    const { Pool } = require('pg');
    const fs = require('fs');
    async function run() {
      const p = new Pool({ connectionString: process.env.DATABASE_URL });
      const sql = fs.readFileSync('/app/schema.sql', 'utf8');
      const stmts = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
      console.log('Found ' + stmts.length + ' statements to execute');
      let ok = 0, fail = 0;
      for (const s of stmts) {
        try {
          await p.query(s + ';');
          ok++;
        } catch (err) {
          fail++;
          if (fail <= 3) console.error('FAILED:', err.message?.slice(0, 200));
        }
      }
      await p.end();
      console.log('Statements: ' + ok + ' ok, ' + fail + ' failed');
      process.exit(0);
    }
    run();
  " || echo "Schema fallback also failed"
fi

echo "--- Starting application ---"
exec "$@"
