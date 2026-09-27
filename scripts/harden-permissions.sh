#!/usr/bin/env bash
# Apply least-privilege permissions without changing ownership.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ "$(id -u)" -ne 0 ]; then
  echo "错误：请以 root 运行此脚本，以便修复生产目录权限。" >&2
  exit 1
fi

echo "== 收紧源码与配置权限 =="
chmod 755 "$ROOT_DIR"
find backend frontend nginx scripts -type d -exec chmod 755 {} +
find backend frontend nginx scripts -type f -exec chmod 644 {} +
find scripts -type f -name '*.sh' -exec chmod 755 {} +

echo "== 保留运行时目录的必要写权限 =="
install -d -m 755 data uploads backend/logs backups release-records
find data uploads backend/logs backups release-records -type d -exec chmod 755 {} +
find data uploads backend/logs backups release-records -type f -exec chmod 644 {} +

if [ -f .env ]; then
  chmod 600 .env
fi

echo "== 检查不应存在的全员可写项 =="
world_writable="$(find . -xdev -path './.git' -prune -o -path './data' -prune -o -path './uploads' -prune -o -path './backend/logs' -prune -o -path './backups' -prune -o -path './release-records' -prune -o -perm -0002 -print)"
if [ -n "$world_writable" ]; then
  echo "错误：以下源码/配置路径仍为全员可写：" >&2
  printf '%s\n' "$world_writable" >&2
  exit 1
fi

echo "权限检查通过。注意：如容器使用非 root UID，请按实际 UID/GID 调整 data/uploads/logs 的所有者。"
