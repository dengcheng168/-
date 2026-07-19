#!/usr/bin/env bash
# 备份脚本：把数据库文件和上传目录打包，带时间戳保存到 backups/ 目录。
# 建议用 cron 定期执行，例如每天凌晨 3 点：
#   0 3 * * * cd /path/to/site && bash scripts/backup.sh >> backups/backup.log 2>&1
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="$ROOT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/backup-$TIMESTAMP.tar.gz"
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "== 打包 data/ 与 uploads/ 到 $ARCHIVE =="
tar -czf "$ARCHIVE" data uploads

echo "== 清理 $KEEP_DAYS 天前的旧备份 =="
find "$BACKUP_DIR" -name 'backup-*.tar.gz' -mtime "+$KEEP_DAYS" -delete

echo "备份完成：$ARCHIVE（$(du -h "$ARCHIVE" | cut -f1)）"
