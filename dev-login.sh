#!/bin/bash
# Quick dev login - bypasses email authentication
# Usage: ./dev-login.sh [email]

EMAIL="${1:-sofia.martinez@test.com}"
API_URL="${API_URL:-http://localhost:8000}"

# Get spice from database
SPICE=$(cd ~/Repos/EdgeOS_API && docker compose exec -T postgres psql -U myuser -d edgeos_db -tAc "SELECT spice FROM humans WHERE primary_email='$EMAIL';" 2>/dev/null | tr -d '[:space:]')

if [ -z "$SPICE" ]; then
    echo "❌ User not found: $EMAIL"
    echo ""
    echo "Available users:"
    cd ~/Repos/EdgeOS_API && docker compose exec -T postgres psql -U myuser -d edgeos_db -c "SELECT primary_email FROM humans LIMIT 10;" 2>/dev/null
    exit 1
fi

echo "🔐 Logging in as: $EMAIL"
echo ""

# Get JWT token
ENCODED_EMAIL=$(echo "$EMAIL" | sed 's/@/%40/g')
RESPONSE=$(curl -s -X POST "$API_URL/citizens/login?email=$ENCODED_EMAIL&spice=$SPICE")
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed. Response: $RESPONSE"
    exit 1
fi

echo "✅ SUCCESS!"
echo ""
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Run this in browser console at $FRONTEND_URL:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "localStorage.setItem('token', '$TOKEN'); location.reload()"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copy to clipboard if pbcopy is available (macOS)
if command -v pbcopy &> /dev/null; then
    echo "localStorage.setItem('token', '$TOKEN'); location.reload()" | pbcopy
    echo "📋 Copied to clipboard! Just paste in browser console."
fi

# Option to open browser automatically
if [ "$OPEN_BROWSER" = "1" ]; then
    open "$FRONTEND_URL"
fi
