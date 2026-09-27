#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT=/www/wwwroot/koigatetech.com
RELEASE_ZIP="$SITE_ROOT/seo-geo-nonvisual-20260913.zip"
BACKUP_DIR="$SITE_ROOT/backups/seo-geo-nonvisual-before-20260913-$(date +%H%M%S)"

cd "$SITE_ROOT"
test -f "$RELEASE_ZIP"
mkdir -p "$BACKUP_DIR/frontend/src/app/llms.txt" \
  "$BACKUP_DIR/frontend/src/app/llms-full.txt" \
  "$BACKUP_DIR/frontend/src/lib/seo" \
  "$BACKUP_DIR/frontend/src/app/(site)/products/[productSlug]" \
  "$BACKUP_DIR/frontend/src/app/es/products/[productSlug]"

cp frontend/src/app/llms.txt/route.ts "$BACKUP_DIR/frontend/src/app/llms.txt/route.ts"
if [ -f frontend/src/app/llms-full.txt/route.ts ]; then
  cp frontend/src/app/llms-full.txt/route.ts "$BACKUP_DIR/frontend/src/app/llms-full.txt/route.ts"
fi
cp frontend/src/lib/seo/jsonld.ts "$BACKUP_DIR/frontend/src/lib/seo/jsonld.ts"
cp 'frontend/src/app/(site)/products/[productSlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/(site)/products/[productSlug]/page.tsx"
cp 'frontend/src/app/es/products/[productSlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/es/products/[productSlug]/page.tsx"

unzip -oq "$RELEASE_ZIP" -d "$SITE_ROOT"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

for path in / /es /products /es/products /llms.txt /llms-full.txt; do
  code=$(curl -fsS -o /dev/null -w '%{http_code}' "https://koigatetech.com$path")
  test "$code" = "200"
done

curl -fsS https://koigatetech.com/llms.txt | grep -F 'Complete public knowledge file'
curl -fsS https://koigatetech.com/llms-full.txt | grep -F 'Complete Public Knowledge File'
curl -fsS https://koigatetech.com/ | grep -F '"@type":"ContactPoint"'

printf 'DEPLOY_OK\nBACKUP_DIR=%s\n' "$BACKUP_DIR"
