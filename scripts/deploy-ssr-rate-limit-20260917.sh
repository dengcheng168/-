#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
RELEASE_ZIP="$SITE_ROOT/ssr-rate-limit-p1-20260917.zip"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/ssr-rate-limit-before-$STAMP"
COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

cd "$SITE_ROOT"
test -f "$RELEASE_ZIP"

mkdir -p \
  "$BACKUP_DIR/backend/src/plugins" \
  "$BACKUP_DIR/frontend/src/lib/api"
cp -a backend/src/plugins/rate-limit.ts "$BACKUP_DIR/backend/src/plugins/rate-limit.ts"
cp -a backend/src/plugins/error-handler.ts "$BACKUP_DIR/backend/src/plugins/error-handler.ts"
cp -a frontend/src/lib/api/blog.ts "$BACKUP_DIR/frontend/src/lib/api/blog.ts"

unzip -oq "$RELEASE_ZIP" -d "$SITE_ROOT"

"${COMPOSE[@]}" up -d --build backend frontend
"${COMPOSE[@]}" restart nginx

"${COMPOSE[@]}" ps backend frontend nginx
"${COMPOSE[@]}" exec -T nginx nginx -t

for attempt in $(seq 1 30); do
  if curl -fsS https://koigatetech.com/api/health >/dev/null; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "Production health check timed out" >&2
    exit 1
  fi
  sleep 2
done

"${COMPOSE[@]}" exec -T frontend node - <<'NODE'
const target = 'http://backend:4000/api/health';
for (let index = 0; index < 320; index += 1) {
  const response = await fetch(target);
  if (response.status !== 200) {
    throw new Error(`SSR read ${index + 1} returned ${response.status}`);
  }
}
console.log('SSR_INTERNAL_READS_OK=320');
NODE

for path in / /products /blog /es/products /es/blog; do
  code="$(curl -L -sS -o /tmp/koigate-ssr-check.html -w '%{http_code}' "https://koigatetech.com$path")"
  test "$code" = "200"
  if grep -Eiq '<meta[^>]+name=.robots[^>]+content=[^>]*noindex' /tmp/koigate-ssr-check.html; then
    echo "Unexpected noindex on $path" >&2
    exit 1
  fi
done

printf 'DEPLOY_OK\nBACKUP_DIR=%s\n' "$BACKUP_DIR"
