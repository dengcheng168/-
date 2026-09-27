#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
RELEASE_ZIP="$SITE_ROOT/seo-geo-nonvisual-20260913-193711.zip"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/seo-geo-nonvisual-before-$STAMP"

cd "$SITE_ROOT"
test -f "$RELEASE_ZIP"

mkdir -p "$BACKUP_DIR/frontend/src/lib/seo"
mkdir -p "$BACKUP_DIR/frontend/src/app/(site)/products/[productSlug]"
mkdir -p "$BACKUP_DIR/frontend/src/app/es/products/[productSlug]"
mkdir -p "$BACKUP_DIR/frontend/src/app/llms.txt"

cp -a frontend/src/lib/seo/jsonld.ts "$BACKUP_DIR/frontend/src/lib/seo/jsonld.ts"
cp -a 'frontend/src/app/(site)/products/[productSlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/(site)/products/[productSlug]/page.tsx"
cp -a 'frontend/src/app/es/products/[productSlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/es/products/[productSlug]/page.tsx"
cp -a frontend/src/app/llms.txt/route.ts "$BACKUP_DIR/frontend/src/app/llms.txt/route.ts"
if [ -f frontend/src/app/llms-full.txt/route.ts ]; then
  mkdir -p "$BACKUP_DIR/frontend/src/app/llms-full.txt"
  cp -a frontend/src/app/llms-full.txt/route.ts "$BACKUP_DIR/frontend/src/app/llms-full.txt/route.ts"
fi

unzip -oq "$RELEASE_ZIP" -d "$SITE_ROOT"

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend nginx

for path in / /es /products /es/products /llms.txt /llms-full.txt; do
  code="$(curl -L -sS -o /tmp/koigate-deploy-check.txt -w '%{http_code}' "https://koigatetech.com${path}")"
  if [ "$code" != "200" ]; then
    echo "VERIFY_FAILED ${path} HTTP ${code}" >&2
    exit 1
  fi
done

curl -fsSL https://koigatetech.com/llms-full.txt | grep -q 'Complete Product Catalog'
curl -fsSL https://koigatetech.com/llms.txt | grep -q 'llms-full.txt'
curl -fsSL https://koigatetech.com/ | grep -q 'ContactPoint'

echo "DEPLOY_OK"
echo "BACKUP_DIR=$BACKUP_DIR"
