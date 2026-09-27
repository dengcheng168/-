#!/usr/bin/env bash
# 更新部署脚本：拉取最新代码（如果是 git 仓库）、重新构建镜像、滚动重启容器。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

if [ -d .git ]; then
  echo "== 拉取最新代码 =="
  git pull
else
  echo "当前目录不是 git 仓库，跳过拉取代码这一步（请自行确保代码已是最新）"
fi

echo "== 建议先备份，再更新 =="
bash scripts/backup.sh

echo "== 重新构建镜像 =="
"${COMPOSE[@]}" build

echo "== 应用数据库迁移并重启容器 =="
"${COMPOSE[@]}" up -d

echo "== 等待服务健康并验证 Nginx =="
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T nginx wget -qO- http://127.0.0.1/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "服务启动超时，请检查 docker compose logs" >&2
    exit 1
  fi
done
"${COMPOSE[@]}" exec -T nginx nginx -t

echo "== 记录本次发布证据 =="
bash scripts/record-release.sh

echo "== 清理旧的悬空镜像 =="
docker image prune -f

echo ""
echo "更新完成，可用以下命令查看日志确认服务正常："
echo "  docker compose logs -f backend frontend"
echo "  发布记录：release-records/latest.txt"
