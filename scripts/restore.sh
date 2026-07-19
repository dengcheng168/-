#!/usr/bin/env bash
# 恢复脚本：从 backup.sh 生成的备份包恢复数据库文件和上传目录。
# 用法：bash scripts/restore.sh backups/backup-20260101-030000.tar.gz
#
# 警告：这是一个破坏性操作，会覆盖当前的 data/ 和 uploads/ 目录！
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

ARCHIVE="${1:-}"
if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
  echo "用法：bash scripts/restore.sh <备份文件路径>"
  echo "可用的备份文件："
  ls -1 backups/*.tar.gz 2>/dev/null || echo "  （backups/ 目录下暂无备份文件）"
  exit 1
fi

echo "警告：即将用 $ARCHIVE 覆盖当前的 data/ 和 uploads/ 目录。"
read -r -p "确认继续吗？输入 yes 继续： " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "已取消。"
  exit 0
fi

echo "== 停止容器 =="
"${COMPOSE[@]}" down

echo "== 恢复数据 =="
rm -rf data uploads
tar -xzf "$ARCHIVE"

echo "== 重新启动容器 =="
"${COMPOSE[@]}" up -d

echo "恢复完成。"
