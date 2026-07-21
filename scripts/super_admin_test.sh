#!/bin/bash
# SUPER_ADMIN Test Script
set -e

NODE="$HOME/.local/bin/node"
BASE="http://localhost:3000"
PJ="/Users/jessamaesignar/Documents/New Project/likhaverse"
PASS="PASS"
FAIL="FAIL"
WARN="WARN"

echo "============================================"
echo "  SUPER_ADMIN TEST"
echo "  admin@likhaverse.com / Admin123!"
echo "============================================"

# ── Login (same cookie jar throughout) ──
CJ="/tmp/sa_cookies.txt"
rm -f "$CJ"
CSRF=$(/usr/bin/curl -s -c "$CJ" "$BASE/api/auth/csrf" | $NODE -e "process.stdin.on('data',d=>console.log(JSON.parse(d).csrfToken))")
/usr/bin/curl -s -c "$CJ" -b "$CJ" \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF}&email=admin@likhaverse.com&password=Admin123!" -o /dev/null

SESSION=$($NODE -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);console.log(j.user?.name+'|'+j.user?.role)}catch(e){console.log('null')}})" <<< "$(/usr/bin/curl -s -b "$CJ" "$BASE/api/auth/session")")
echo "  Logged in as: $SESSION"

echo ""
echo "════════════════════════════════════════════"
echo "  AUTHOR FEATURES (accessible via role)"
echo "════════════════════════════════════════════"

echo ""
echo "── [A1] Author Dashboard ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author")
grep -q "Author Dashboard" <<< "$BODY" && echo "  [$PASS] Dashboard title" || echo "  [$FAIL] Missing title"
grep -q "New Story" <<< "$BODY" && echo "  [$PASS] New Story button" || echo "  [$FAIL] Missing New Story"
grep -q "The Last Ember" <<< "$BODY" && echo "  [$PASS] Own stories listed" || echo "  [$FAIL] Missing own stories"

echo ""
echo "── [A2] Create New Story form ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/stories/new")
grep -q 'name="title"' <<< "$BODY" && echo "  [$PASS] New story form accessible" || echo "  [$FAIL] Missing form"

echo ""
echo "── [A3] Edit own story ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/stories/story-ember/edit")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Can edit own story" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A4] Create / Edit own chapters ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/stories/story-ember/chapters/new")
echo "  New chapter page: $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Can create chapters" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A5] Publish chapter (server action accessible) ──"
echo "  [NOTE] Server actions test via page render (new chapter form renders)"

echo ""
echo "── [A6] LikhaVerse Original badge ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/stories/story-ember")
grep -q "Original" <<< "$BODY" && echo "  [$PASS] LikhaVerse Original badge visible" || echo "  [$WARN] Original badge may not be visible"
grep -q "Founder" <<< "$BODY" && echo "  [$PASS] Founder crown badge visible" || echo "  [$WARN] Founder badge may not be visible"

echo ""
echo "── [A7] Premium chapter access (bypass lock) ──"
HTTP_FREE=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/stories/story-ember/chapter/ch-ember-1")
echo "  Free chapter (1): $HTTP_FREE"
HTTP_PREMIUM=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/stories/story-ember/chapter/ch-ember-20")
echo "  Premium chapter (20): $HTTP_PREMIUM"
[ "$HTTP_FREE" = "200" ] && echo "  [$PASS] Free chapter accessible" || echo "  [$FAIL] Free chapter failed"
[ "$HTTP_PREMIUM" = "200" ] && echo "  [$PASS] Premium chapter accessible (SUPER_ADMIN = author)" || echo "  [$FAIL] Premium chapter failed"

echo ""
echo "── [A8] AI Tools Hub ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/ai")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] AI Hub accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A9] AI Character Generator ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai/character")
grep -q 'name="name"' <<< "$BODY" && echo "  [$PASS] Character generator accessible" || echo "  [$FAIL] Missing form"

echo ""
echo "── [A10] AI Cover Generator ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai/cover")
grep -q "Fantasy" <<< "$BODY" && echo "  [$PASS] Cover generator accessible" || echo "  [$FAIL] Missing styles"

echo ""
echo "── [A11] AI History ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/ai/history")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] History accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A12] Seasons ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/seasons/story-ember")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Seasons accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A13] Studio Application (as Premium Creator proxy) ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/studio")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Studio application page accessible (SUPER_ADMIN passes requirePremiumCreator)" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [A14] Messages ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/messages")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Messages accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "════════════════════════════════════════════"
echo "  ADMIN FEATURES (accessible via role)"
echo "════════════════════════════════════════════"

echo ""
echo "── [B1] Admin Dashboard ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/admin")
grep -q "Super Admin" <<< "$BODY" && echo "  [$PASS] Shows 'Super Admin' title" || echo "  [$FAIL] Missing Super Admin title"
grep -q "AI Studio" <<< "$BODY" && echo "  [$PASS] AI Studio link visible" || echo "  [$FAIL] Missing AI Studio link"
grep -q "Originals" <<< "$BODY" && echo "  [$PASS] Originals link visible" || echo "  [$FAIL] Missing Originals link"
grep -q "Analytics" <<< "$BODY" && echo "  [$PASS] Analytics link visible" || echo "  [$FAIL] Missing Analytics"
grep -q "Write a Story" <<< "$BODY" && echo "  [$PASS] Write a Story button" || echo "  [$FAIL] Missing Write a Story"
grep -q "Users" <<< "$BODY" && echo "  [$PASS] User count visible" || echo "  [$FAIL] Missing user stats"
grep -q "Premium" <<< "$BODY" && echo "  [$PASS] Premium count visible" || echo "  [$FAIL] Missing premium stats"

echo ""
echo "── [B2] Admin Analytics ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/analytics")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Analytics accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [B3] Admin Premium Management ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/premium")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Premium mgmt accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [B4] Admin Originals ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/originals")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Originals mgmt accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [B5] Admin Studio (review applications) ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/studio")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Studio review page accessible (SUPER_ADMIN)" || echo "  [$FAIL] Expected 200"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/admin/studio")
grep -q "LikhaVerse Studios" <<< "$BODY" && echo "  [$PASS] Studio review title" || echo "  [$FAIL] Missing title"
grep -q "Pending Review" <<< "$BODY" && echo "  [$PASS] Pending Review tab" || echo "  [$FAIL] Missing tabs"
grep -q "All Applications" <<< "$BODY" && echo "  [$PASS] All Applications tab" || echo "  [$FAIL] Missing All tab"

echo ""
echo "════════════════════════════════════════════"
echo "  AI STUDIO (SUPER_ADMIN exclusive)"
echo "════════════════════════════════════════════"

echo ""
echo "── [C1] AI Studio Hub ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/ai-studio")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] AI Studio hub accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [C2] AI Studio tools (all SUPER_ADMIN only) ──"
for tool in "analyze/story-ember" "characters/story-ember" "world/story-ember" \
            "environment/story-ember" "storyboard/story-ember" \
            "trailer/story-ember" "production/story-ember"; do
  C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/admin/ai-studio/$tool")
  echo "  /admin/ai-studio/$tool -> $C"
  [ "$C" = "200" ] && echo "  [$PASS] Accessible" || echo "  [$FAIL] Expected 200"
done

echo ""
echo "════════════════════════════════════════════"
echo "  UNLIMITED PERMISSIONS"
echo "════════════════════════════════════════════"

echo ""
echo "── [D1] AI unlimited generations (bypass limit) ──"
cd "$PJ"
npx tsx -e "
const { bypassesAllLimits } = require('./src/lib/permissions');
console.log('  Bypasses AI limits (SUPER_ADMIN): ' + bypassesAllLimits('SUPER_ADMIN'));
"
echo "  [NOTE] AI Hub should show 'Unlimited' instead of a number"

# Check the AI hub page content
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai")
grep -q "Unlimited" <<< "$BODY" && echo "  [$PASS] AI Hub shows Unlimited credits" || echo "  [$WARN] May not show 'Unlimited' text"

echo ""
echo "── [D2] Access all stories on /stories ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/stories")
echo "  HTTP $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Browse stories accessible" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [D3] View other author's stories ──"
HTTP=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/stories/story-ongoing")
echo "  Other author's story: $HTTP"
[ "$HTTP" = "200" ] && echo "  [$PASS] Can view other authors' stories" || echo "  [$FAIL] Expected 200"

echo ""
echo "── [D4] Premium-exclusive story access ──"
# Read a premium chapter of "The Last Ember" (authored by SUPER_ADMIN)
# Also try another author's story premium chapter
# Let's check if SUPER_ADMIN can access premium content of their own story
echo "  [NOTE] SUPER_ADMIN is author of The Last Ember, so all chapters accessible via isAuthor"
echo "  [NOTE] Premium bypass for other authors' stories requires premium:true on user record"

echo ""
echo "════════════════════════════════════════════"
echo "  DATABASE VERIFICATION"
echo "════════════════════════════════════════════"

echo ""
echo "── [E1] DB state ──"
npx tsx -e "
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const p = new PrismaClient({ adapter });
async function main() {
  const u = await p.user.findUnique({ where: { email: 'admin@likhaverse.com' } });
  if (!u) { console.log('  [FAIL] Admin not found'); await p.\$disconnect(); return; }
  console.log('  User: ' + u.name + ' | Role: ' + u.role + ' | Premium: ' + u.premium);
  console.log('  AI Gen Count: ' + (u.aiGenerationCount ?? 0));
  
  const stories = await p.story.findMany({ where: { authorId: u.id }, include: { _count: { select: { chapters: true } } } });
  console.log('  Own stories: ' + stories.length);
  for (const s of stories) console.log('    \"' + s.title + '\" [' + s.status + '] ' + s._count.chapters + ' ch, original=' + s.original + ', studioBadge=' + s.studioBadge);
  
  const allStories = await p.story.count();
  const allChapters = await p.chapter.count();
  const allUsers = await p.user.count();
  const allApps = await p.studioApplication.count();
  console.log('  Total stories: ' + allStories);
  console.log('  Total chapters: ' + allChapters);
  console.log('  Total users: ' + allUsers);
  console.log('  Studio applications: ' + allApps);
  
  const { bypassesAllLimits } = await import('./src/lib/permissions');
  const { getGenerationLimit } = await import('./src/lib/ai/types');
  console.log('  AI: bypassesAllLimits=' + bypassesAllLimits('SUPER_ADMIN') + ', limit=' + getGenerationLimit('SUPER_ADMIN'));
  
  await p.\$disconnect();
}
main();
" 2>&1 | while IFS= read -r line; do echo "  $line"; done

echo ""
echo "============================================"
echo "  SUPER_ADMIN TEST COMPLETE"
echo "============================================"
