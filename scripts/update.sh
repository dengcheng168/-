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

echo "== 清理旧的悬空镜像 =="
docker image prune -f

echo ""
echo "更新完成，可用以下命令查看日志确认服务正常："
echo "  docker compose logs -f backend frontend"
