#!/bin/bash
# ═══════════════════════════════════════
# EGGS OK - Smart Deploy
#
# Usage:
#   bash deploy.sh              # Deploy only changed parts
#   bash deploy.sh website      # Deploy only website
#   bash deploy.sh admin        # Deploy only admin
#   bash deploy.sh backend      # Deploy only backend
#   bash deploy.sh all          # Deploy everything
# ═══════════════════════════════════════

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
KEY="/tmp/eggok_deploy_key"
SERVER="u966025995@147.93.42.43"
PORT=65002
DEST="~/domains/fooddeliveryaudit.com/nodejs"

DEPLOY_WEBSITE=false
DEPLOY_ADMIN=false
DEPLOY_BACKEND=false

# Check what to deploy
if [ "$1" = "website" ]; then
  DEPLOY_WEBSITE=true
elif [ "$1" = "admin" ]; then
  DEPLOY_ADMIN=true
elif [ "$1" = "backend" ]; then
  DEPLOY_BACKEND=true
elif [ "$1" = "all" ]; then
  DEPLOY_WEBSITE=true
  DEPLOY_ADMIN=true
  DEPLOY_BACKEND=true
else
  # Auto-detect: check git for changed files
  CHANGED=$(git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null)
  if echo "$CHANGED" | grep -q "^website/"; then DEPLOY_WEBSITE=true; fi
  if echo "$CHANGED" | grep -q "^admin/"; then DEPLOY_ADMIN=true; fi
  if echo "$CHANGED" | grep -q "^backend/"; then DEPLOY_BACKEND=true; fi

  # If nothing detected, ask
  if [ "$DEPLOY_WEBSITE" = false ] && [ "$DEPLOY_ADMIN" = false ] && [ "$DEPLOY_BACKEND" = false ]; then
    echo "No changes detected. What to deploy?"
    echo "  bash deploy.sh website"
    echo "  bash deploy.sh admin"
    echo "  bash deploy.sh backend"
    echo "  bash deploy.sh all"
    exit 0
  fi
fi

echo "══════════════════════════════════"
echo "  EGGS OK - Smart Deploy"
echo "══════════════════════════════════"
echo ""
echo "  Website: $DEPLOY_WEBSITE"
echo "  Admin:   $DEPLOY_ADMIN"
echo "  Backend: $DEPLOY_BACKEND"
echo ""

FILES_TO_UPLOAD=""

# ── Website ──
if [ "$DEPLOY_WEBSITE" = true ]; then
  echo "[BUILD] Website..."
  cd "$ROOT/website"
  cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: 'standalone' };
export default nextConfig;
EOF
  rm -rf .next
  NEXT_PUBLIC_API_URL=https://fooddeliveryaudit.com/api npm run build > /dev/null 2>&1
  cp -r .next/static .next/standalone/.next/static
  cp -r public .next/standalone/public
  cd .next/standalone && tar czf /tmp/website-deploy.tar.gz .
  cat > "$ROOT/website/next.config.ts" << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
EOF
  FILES_TO_UPLOAD="$FILES_TO_UPLOAD /tmp/website-deploy.tar.gz"
  echo "  Website build done ✓"
fi

# ── Admin ──
if [ "$DEPLOY_ADMIN" = true ]; then
  echo "[BUILD] Admin..."
  cd "$ROOT/admin"
  cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/admin',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
EOF
  rm -rf .next
  NEXT_PUBLIC_API_URL=https://fooddeliveryaudit.com/api npm run build > /dev/null 2>&1
  cp -r .next/static .next/standalone/.next/static
  cp -r public .next/standalone/public
  cd .next/standalone && tar czf /tmp/admin-deploy.tar.gz .
  cat > "$ROOT/admin/next.config.ts" << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
EOF
  FILES_TO_UPLOAD="$FILES_TO_UPLOAD /tmp/admin-deploy.tar.gz"
  echo "  Admin build done ✓"
fi

# ── Backend ──
if [ "$DEPLOY_BACKEND" = true ]; then
  echo "[BUILD] Backend..."
  cd "$ROOT/backend"
  npx nest build > /dev/null 2>&1
  tar czf /tmp/backend-deploy.tar.gz dist/
  FILES_TO_UPLOAD="$FILES_TO_UPLOAD /tmp/backend-deploy.tar.gz"
  echo "  Backend build done ✓"
fi

# ── Upload ──
echo "[UPLOAD] Uploading to server..."
scp -o StrictHostKeyChecking=no -i "$KEY" -P $PORT $FILES_TO_UPLOAD $SERVER:/tmp/ > /dev/null 2>&1
echo "  Upload done ✓"

# ── Deploy on server ──
echo "[DEPLOY] Deploying..."
REMOTE_CMD="DEST=$DEST;"

if [ "$DEPLOY_WEBSITE" = true ]; then
  REMOTE_CMD="$REMOTE_CMD rm -rf \$DEST/website/.next/standalone/*; cd \$DEST/website/.next/standalone && tar xzf /tmp/website-deploy.tar.gz; rm -rf \$DEST/website/.next/standalone/.next/cache/*; rm -f /tmp/website-deploy.tar.gz;"
fi

if [ "$DEPLOY_ADMIN" = true ]; then
  REMOTE_CMD="$REMOTE_CMD rm -rf \$DEST/admin/.next/standalone/*; cd \$DEST/admin/.next/standalone && tar xzf /tmp/admin-deploy.tar.gz; rm -f /tmp/admin-deploy.tar.gz;"
fi

if [ "$DEPLOY_BACKEND" = true ]; then
  REMOTE_CMD="$REMOTE_CMD rm -rf \$DEST/backend/dist; cd \$DEST/backend && tar xzf /tmp/backend-deploy.tar.gz; rm -f /tmp/backend-deploy.tar.gz;"
fi

REMOTE_CMD="$REMOTE_CMD touch \$DEST/tmp/restart.txt; echo done"

ssh -o StrictHostKeyChecking=no -i "$KEY" -p $PORT $SERVER "$REMOTE_CMD" > /dev/null 2>&1
echo "  Deploy done ✓"

# ── Verify ──
echo "[VERIFY] Checking site..."
sleep 10
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://fooddeliveryaudit.com/?t=$(date +%s)")
if [ "$STATUS" = "200" ]; then
  echo "  Site is LIVE ✓"
else
  echo "  Warning: Site returned $STATUS (may need a moment)"
fi

# Cleanup
rm -f /tmp/website-deploy.tar.gz /tmp/admin-deploy.tar.gz /tmp/backend-deploy.tar.gz

echo ""
echo "══════════════════════════════════"
echo "  Deploy Complete!"
echo "  https://fooddeliveryaudit.com"
echo "══════════════════════════════════"
