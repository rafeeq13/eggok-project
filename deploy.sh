#!/bin/bash
# ═══════════════════════════════════════
# EGGS OK - Deploy to Production
# Run: bash deploy.sh
# ═══════════════════════════════════════

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
KEY="/tmp/eggok_deploy_key"
SERVER="u966025995@147.93.42.43"
PORT=65002
DEST="~/domains/fooddeliveryaudit.com/nodejs"

echo "══════════════════════════════════"
echo "  EGGS OK - Production Deploy"
echo "══════════════════════════════════"
echo ""

# Step 1: Build Website
echo "[1/6] Building website..."
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
# Restore local config
cat > "$ROOT/website/next.config.ts" << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
EOF
echo "    Website build done ✓"

# Step 2: Build Admin
echo "[2/6] Building admin..."
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
# Restore local config
cat > "$ROOT/admin/next.config.ts" << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
EOF
echo "    Admin build done ✓"

# Step 3: Build Backend
echo "[3/6] Building backend..."
cd "$ROOT/backend"
npx nest build > /dev/null 2>&1
tar czf /tmp/backend-deploy.tar.gz dist/
echo "    Backend build done ✓"

# Step 4: Upload to server
echo "[4/6] Uploading to server..."
scp -o StrictHostKeyChecking=no -i "$KEY" -P $PORT \
  /tmp/website-deploy.tar.gz \
  /tmp/admin-deploy.tar.gz \
  /tmp/backend-deploy.tar.gz \
  $SERVER:/tmp/ > /dev/null 2>&1
echo "    Upload done ✓"

# Step 5: Deploy on server
echo "[5/6] Deploying on server..."
ssh -o StrictHostKeyChecking=no -i "$KEY" -p $PORT $SERVER "
  DEST=$DEST

  # Website
  rm -rf \$DEST/website/.next/standalone/*
  cd \$DEST/website/.next/standalone && tar xzf /tmp/website-deploy.tar.gz

  # Admin
  rm -rf \$DEST/admin/.next/standalone/*
  cd \$DEST/admin/.next/standalone && tar xzf /tmp/admin-deploy.tar.gz

  # Backend
  rm -rf \$DEST/backend/dist
  cd \$DEST/backend && tar xzf /tmp/backend-deploy.tar.gz

  # Clear Next.js cache
  rm -rf \$DEST/website/.next/standalone/.next/cache/* 2>/dev/null

  # Restart
  touch \$DEST/tmp/restart.txt

  # Cleanup
  rm -f /tmp/website-deploy.tar.gz /tmp/admin-deploy.tar.gz /tmp/backend-deploy.tar.gz
" > /dev/null 2>&1
echo "    Deploy done ✓"

# Step 6: Verify
echo "[6/6] Verifying..."
sleep 10
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://fooddeliveryaudit.com/?t=$(date +%s)")
if [ "$STATUS" = "200" ]; then
  echo "    Site is LIVE ✓"
else
  echo "    Warning: Site returned $STATUS (may need a moment to start)"
fi

# Cleanup local
rm -f /tmp/website-deploy.tar.gz /tmp/admin-deploy.tar.gz /tmp/backend-deploy.tar.gz

echo ""
echo "══════════════════════════════════"
echo "  Deploy Complete!"
echo "  https://fooddeliveryaudit.com"
echo "══════════════════════════════════"
