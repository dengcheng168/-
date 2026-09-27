#!/usr/bin/env bash
# Record the exact source and container images that are serving this release.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="release-records"
OUT_FILE="$OUT_DIR/release-$STAMP.txt"
mkdir -p "$OUT_DIR"

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  COMMIT_SHA="$(git rev-parse HEAD)"
  if [ -n "$(git status --porcelain)" ]; then SOURCE_STATE=dirty; else SOURCE_STATE=clean; fi
else
  COMMIT_SHA=unavailable
  SOURCE_STATE=not-a-git-worktree
fi

{
  echo "released_at_utc=$STAMP"
  echo "commit_sha=$COMMIT_SHA"
  echo "source_state=$SOURCE_STATE"
  echo "site_url=${SITE_URL:-unset}"
  echo
  echo "[compose-images]"
  "${COMPOSE[@]}" images --format json
  echo
  echo "[running-containers]"
  "${COMPOSE[@]}" ps --format json
  echo
  echo "[image-ids]"
  for service in backend frontend nginx; do
    container_id="$("${COMPOSE[@]}" ps -q "$service")"
    image_id="$(docker inspect --format '{{.Image}}' "$container_id")"
    echo "$service=$image_id"
  done
  echo
  echo "[database-migrations]"
  "${COMPOSE[@]}" exec -T backend npm run prisma:migrate:deploy
} > "$OUT_FILE"

ln -sfn "$(basename "$OUT_FILE")" "$OUT_DIR/latest.txt"
echo "发布证据已写入 $OUT_FILE"
