#!/bin/bash
# Premium Creator Test Script
set -e

NODE="$HOME/.local/bin/node"
BASE="http://localhost:3000"
PJ="/Users/jessamaesignar/Documents/New Project/likhaverse"
PASS="PASS"
FAIL="FAIL"
WARN="WARN"

echo "============================================"
echo "  PREMIUM CREATOR TEST"
echo "  premium@likhaverse.com / Creator123!"
echo "============================================"

# ── Login (same cookie jar throughout) ──
CJ="/tmp/prem_cookies.txt"
rm -f "$CJ"

CSRF=$(/usr/bin/curl -s -c "$CJ" "$BASE/api/auth/csrf" | $NODE -e "process.stdin.on('data',d=>console.log(JSON.parse(d).csrfToken))")
/usr/bin/curl -s -c "$CJ" -b "$CJ" \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=${CSRF}&email=premium@likhaverse.com&password=Creator123!" -o /dev/null

SESSION=$($NODE -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);console.log(j.user?.name+'|'+j.user?.role)}catch(e){console.log('null')}})" <<< "$(/usr/bin/curl -s -b "$CJ" "$BASE/api/auth/session")")
echo "  Logged in as: $SESSION"

# ── 1. Dashboard ──
echo ""
echo "── [1] Author Dashboard — Premium badge ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author")
grep -q "Author Dashboard" <<< "$BODY" && echo "  [$PASS] Dashboard title" || echo "  [$FAIL] Missing title"
grep -q "Premium" <<< "$BODY" && echo "  [$PASS] Premium badge visible" || echo "  [$FAIL] Missing Premium badge"
grep -q "New Story" <<< "$BODY" && echo "  [$PASS] New Story button" || echo "  [$FAIL] Missing New Story"
grep -q "AI Tools" <<< "$BODY" && echo "  [$PASS] AI Tools link" || echo "  [$FAIL] Missing AI Tools"
grep -q "Cinematic Studio" <<< "$BODY" && echo "  [$PASS] Cinematic Studio link" || echo "  [$FAIL] Missing Cinematic Studio"

# ── 2. AI Hub ──
echo ""
echo "── [2] AI Hub — Credits ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai")
grep -q "Generation Credits" <<< "$BODY" && echo "  [$PASS] Credits section visible" || echo "  [$FAIL] Missing credits"
grep -q "50" <<< "$BODY" && echo "  [$PASS] Shows 50 generation limit" || echo "  [$WARN] No '50' text (may show '0 / 50')"

# ── 3. AI Character ──
echo ""
echo "── [3] AI Character Generator ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai/character")
grep -q 'name="name"' <<< "$BODY" && echo "  [$PASS] Form with name field" || echo "  [$FAIL] Missing form"
grep -q 'name="artStyle"' <<< "$BODY" && echo "  [$PASS] Art style selector" || echo "  [$FAIL] Missing art style"

# ── 4. AI Cover ──
echo ""
echo "── [4] AI Cover Generator ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/ai/cover")
grep -q "Fantasy" <<< "$BODY" && echo "  [$PASS] Fantasy style" || echo "  [$FAIL] Missing Fantasy"
grep -q "Romance" <<< "$BODY" && echo "  [$PASS] Romance style" || echo "  [$FAIL] Missing Romance"
grep -q "Sci-Fi" <<< "$BODY" && echo "  [$PASS] Sci-Fi style" || echo "  [$FAIL] Missing Sci-Fi"
grep -q 'name="prompt"' <<< "$BODY" && echo "  [$PASS] Prompt field" || echo "  [$FAIL] Missing prompt"

# ── 5. AI History ──
echo ""
echo "── [5] AI History ──"
C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/ai/history")
echo "  HTTP $C"
[ "$C" = "200" ] && echo "  [$PASS] Accessible" || echo "  [$FAIL] Expected 200"

# ── 6. Studio Page ──
echo ""
echo "── [6] Studio Application page ──"
BODY=$(/usr/bin/curl -s -b "$CJ" "$BASE/author/studio")
grep -q "LikhaVerse Studios" <<< "$BODY" && echo "  [$PASS] Studio title" || echo "  [$FAIL] Missing title"
grep -q "Submit Application" <<< "$BODY" && echo "  [$PASS] Submit form visible" || echo "  [$FAIL] Missing form"
grep -q "Visual Style" <<< "$BODY" && echo "  [$PASS] Visual style field" || echo "  [$FAIL] Missing visual style"

# ── 7. Story Detail (premium story) ──
echo ""
echo "── [7] Premium story detail ──"
C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/stories/story-ongoing")
echo "  HTTP $C"
[ "$C" = "200" ] && echo "  [$PASS] Story accessible" || echo "  [$FAIL] Expected 200"

# ── 8. Seasons ──
echo ""
echo "── [8] Seasons Management ──"
C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/author/seasons/story-ongoing")
echo "  HTTP $C"
[ "$C" = "200" ] && echo "  [$PASS] Accessible" || echo "  [$FAIL] Expected 200"

# ── 9. Admin pages blocked ──
echo ""
echo "── [9] Admin pages blocked ──"
for p in "admin" "admin/ai-studio" "admin/studio"; do
  C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/$p")
  echo "  GET /$p -> $C"
  [ "$C" = "307" ] && echo "  [$PASS] Blocked" || echo "  [$FAIL] Not blocked"
done

# ── 10. SUPER_ADMIN only features blocked ──
echo ""
echo "── [10] SUPER_ADMIN only features blocked ──"
for p in "admin/ai-studio/analyze" "admin/ai-studio/character-sheets" "admin/ai-studio/world-builder" "admin/ai-studio/environment" "admin/ai-studio/storyboard" "admin/ai-studio/trailer" "admin/ai-studio/production"; do
  C=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" -b "$CJ" "$BASE/$p")
  echo "  GET /$p -> $C"
done

# ── 11. DB verification ──
echo ""
echo "── [11] Database state ──"
cd "$PJ"
npx tsx scripts/premium_db_check.mts 2>&1

echo ""
echo "============================================"
echo "  PREMIUM CREATOR TEST COMPLETE"
echo "============================================"
