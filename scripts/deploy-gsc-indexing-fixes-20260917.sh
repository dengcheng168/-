#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
RELEASE_ZIP="$SITE_ROOT/gsc-indexing-fixes-20260917.zip"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/gsc-indexing-fixes-before-$STAMP"

cd "$SITE_ROOT"
test -f "$RELEASE_ZIP"

mkdir -p \
  "$BACKUP_DIR/frontend" \
  "$BACKUP_DIR/backend/src/modules/redirects" \
  "$BACKUP_DIR/backend/src/modules/blog-categories" \
  "$BACKUP_DIR/frontend/src/app/(site)/blog/category/[categorySlug]" \
  "$BACKUP_DIR/frontend/src/app/es/blog/category/[categorySlug]"

cp -a frontend/next.config.ts "$BACKUP_DIR/frontend/next.config.ts"
cp -a backend/src/modules/redirects/redirects.service.ts "$BACKUP_DIR/backend/src/modules/redirects/redirects.service.ts"
cp -a backend/src/modules/blog-categories/blog-categories.service.ts "$BACKUP_DIR/backend/src/modules/blog-categories/blog-categories.service.ts"
cp -a 'frontend/src/app/(site)/blog/category/[categorySlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/(site)/blog/category/[categorySlug]/page.tsx"
cp -a 'frontend/src/app/es/blog/category/[categorySlug]/page.tsx' "$BACKUP_DIR/frontend/src/app/es/blog/category/[categorySlug]/page.tsx"

unzip -oq "$RELEASE_ZIP" -d "$SITE_ROOT"

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

for path in / /es /products /es/products /robots.txt /sitemap.xml; do
  code="$(curl -fsS -o /dev/null -w '%{http_code}' "https://koigatetech.com${path}")"
  test "$code" = "200"
done

for path in \
  /products/qw-ro-600g-k01 \
  /products/qw-ro-100g-k01 \
  /es/products/qw-ro-600g-k01 \
  /es/products/qw-ro-100g-k01 \
  /es/blog/category/company-news; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "https://koigatetech.com${path}")"
  test "$code" = "404"
done

docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
printf 'DEPLOY_OK\nBACKUP_DIR=%s\n' "$BACKUP_DIR"
