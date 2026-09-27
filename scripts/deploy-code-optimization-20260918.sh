#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/code-optimization-before-$STAMP"

cd "$SITE_ROOT"
mkdir -p "$BACKUP_DIR"

FILES=(
  "frontend/src/components/home/InquirySection.tsx"
  "frontend/src/components/home/LiteYoutubeEmbed.tsx"
  "frontend/src/components/product/ProductGallery.tsx"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp -a "$file" "$BACKUP_DIR/$file"
  fi
done

unzip -oq code-optimization-20260918.zip -d "$SITE_ROOT"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend

for attempt in $(seq 1 30); do
  if curl -fsS --max-time 10 https://koigatetech.com/ >/dev/null; then
    break
  fi
  if [[ "$attempt" == "30" ]]; then
    echo "Homepage health check failed" >&2
    exit 1
  fi
  sleep 2
done

for path in / /es /products /es/products /robots.txt /sitemap.xml; do
  status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://koigatetech.com$path")"
  [[ "$status" == "200" ]] || { echo "Unexpected $status for $path" >&2; exit 1; }
done

homepage="$(curl -fsS --max-time 20 https://koigatetech.com/)"
grep -Fq "i.ytimg.com/vi/" <<<"$homepage"
if grep -Fq "youtube.com/embed/" <<<"$homepage"; then
  echo "Homepage still renders an eager YouTube iframe" >&2
  exit 1
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml ps frontend
echo "DEPLOY_OK"
echo "BACKUP_DIR=$BACKUP_DIR"
