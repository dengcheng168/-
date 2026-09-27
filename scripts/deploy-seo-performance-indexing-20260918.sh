#!/usr/bin/env bash
set -euo pipefail

SITE_ROOT="/www/wwwroot/koigatetech.com"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$SITE_ROOT/backups/seo-performance-indexing-before-$STAMP"

cd "$SITE_ROOT"
mkdir -p "$BACKUP_DIR"

FILES=(
  "frontend/src/components/site/ResponsiveHeroImage.tsx"
  "frontend/src/components/analytics/GooglePixel.tsx"
  "frontend/src/components/analytics/MetaPixel.tsx"
  "frontend/src/components/analytics/TikTokPixel.tsx"
  "frontend/src/components/analytics/PageViewTracker.tsx"
  "frontend/src/components/product/ProductBuyerChecklist.tsx"
  "frontend/src/app/(site)/products/[productSlug]/page.tsx"
  "frontend/src/app/es/products/[productSlug]/page.tsx"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp -a "$file" "$BACKUP_DIR/$file"
  fi
done

unzip -oq seo-performance-indexing-20260918.zip -d "$SITE_ROOT"

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

product_url="https://koigatetech.com/products/100-gpd-5-stage-under-sink-ro-water-purifier"
curl -fsS --max-time 20 "$product_url" | grep -Fq "Quote Checklist for This Model"

docker compose -f docker-compose.yml -f docker-compose.prod.yml ps frontend
echo "DEPLOY_OK"
echo "BACKUP_DIR=$BACKUP_DIR"
