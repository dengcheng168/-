#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
RELEASE_ZIP="$SITE_ROOT/contact-mobile-map-20260916-01.zip"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/contact-mobile-map-before-$STAMP"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

cd "$SITE_ROOT"
test -f "$RELEASE_ZIP"

mkdir -p \
  "$BACKUP_DIR/frontend/src/app/(site)/contact" \
  "$BACKUP_DIR/frontend/src/app/es/contact"
cp -a 'frontend/src/app/(site)/contact/page.tsx' "$BACKUP_DIR/frontend/src/app/(site)/contact/page.tsx"
cp -a 'frontend/src/app/es/contact/page.tsx' "$BACKUP_DIR/frontend/src/app/es/contact/page.tsx"

unzip -oq "$RELEASE_ZIP" -d "$SITE_ROOT"
"${COMPOSE[@]}" up -d --build frontend
"${COMPOSE[@]}" restart nginx

"${COMPOSE[@]}" ps frontend nginx
test "$(curl -fsS -o /dev/null -w '%{http_code}' https://koigatetech.com/contact)" = "200"
test "$(curl -fsS -o /dev/null -w '%{http_code}' https://koigatetech.com/es/contact)" = "200"

curl -fsS https://koigatetech.com/contact | grep -Fq 'sm:hidden'
curl -fsS https://koigatetech.com/es/contact | grep -Fq 'sm:hidden'

printf 'DEPLOY_OK\nBACKUP_DIR=%s\n' "$BACKUP_DIR"
