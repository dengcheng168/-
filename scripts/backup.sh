#!/usr/bin/env bash
# 备份脚本：数据库用 SQLite 官方在线备份 API（不是直接 cp/tar 数据库文件），上传目录仍然
# 直接打包，都带时间戳保存到 backups/ 目录。建议用 cron 定期执行，例如每天凌晨 3 点：
#   0 3 * * * cd /path/to/site && bash scripts/backup.sh >> backups/backup.log 2>&1
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="$ROOT_DIR/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DB_PATH="$ROOT_DIR/data/production.db"
DB_BACKUP="$BACKUP_DIR/koigate-db-$TIMESTAMP.db"
UPLOADS_ARCHIVE="$BACKUP_DIR/koigate-uploads-$TIMESTAMP.tar.gz"
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "错误：数据库文件不存在: $DB_PATH（这个脚本只应该在部署了 Docker 的服务器上运行，不是本地开发机）" >&2
  exit 1
fi

echo "== 用 SQLite 在线备份 API 备份数据库到 $DB_BACKUP =="
# 用 `sqlite3 <db> ".backup ..."`，而不是在数据库可能正在被写入时直接 cp/tar 主文件——
# .backup 走 SQLite 自己的 Backup API，即使当前有写事务在进行（含 WAL 模式）也能拿到一份
# 一致的快照，不会像直接拷文件那样可能拷到一个事务写到一半的中间状态。
sqlite3 "$DB_PATH" ".backup '$DB_BACKUP'"

if [ ! -s "$DB_BACKUP" ]; then
  echo "错误：备份文件不存在或大小为 0，备份失败: $DB_BACKUP" >&2
  exit 1
fi

DB_BACKUP_SHA256="$(sha256sum "$DB_BACKUP" | cut -d' ' -f1)"
echo "$(date -Iseconds)  $DB_BACKUP_SHA256  $(basename "$DB_BACKUP")" >> "$BACKUP_DIR/checksums.sha256"
echo "数据库备份完成：$DB_BACKUP（$(du -h "$DB_BACKUP" | cut -f1)，SHA-256: $DB_BACKUP_SHA256）"

echo "== 打包 uploads/ 到 $UPLOADS_ARCHIVE =="
tar -czf "$UPLOADS_ARCHIVE" uploads

echo "== 清理 $KEEP_DAYS 天前的旧备份 =="
find "$BACKUP_DIR" -name 'koigate-db-*.db' -mtime "+$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'koigate-uploads-*.tar.gz' -mtime "+$KEEP_DAYS" -delete

echo "备份完成。恢复前请先停止写入（例如 docker compose stop backend）再替换数据库文件，不要在应用仍在运行时直接覆盖。"
