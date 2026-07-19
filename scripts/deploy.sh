#!/usr/bin/env bash
# 首次部署脚本：检查环境变量、构建镜像、启动容器、初始化管理员账号。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.prod.yml)

if [ ! -f .env ]; then
  echo "未找到 .env 文件，正在从 .env.example 复制一份..."
  cp .env.example .env
  echo "请先编辑 .env（尤其是 JWT_SECRET / ADMIN_INIT_EMAIL / ADMIN_INIT_PASSWORD / DOMAIN_NAME），然后重新运行本脚本。"
  exit 1
fi

echo "== 构建镜像 =="
"${COMPOSE[@]}" build

echo "== 启动容器 =="
"${COMPOSE[@]}" up -d

echo "== 等待后端就绪 =="
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T backend wget -qO- http://127.0.0.1:4000/api/health > /dev/null 2>&1; then
    echo "后端已就绪"
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "后端启动超时，请用 docker compose logs backend 查看日志"
    exit 1
  fi
done

echo "== 初始化管理员账号（若已存在则跳过）=="
"${COMPOSE[@]}" exec -T backend npm run create-admin

echo ""
echo "部署完成。"
echo "  - 前台网站：http://<服务器IP或域名>/"
echo "  - 后台管理：http://<服务器IP或域名>/admin/login"
echo "  - 请尽快登录后台修改默认管理员密码"
echo "  - 如需 HTTPS，请参考 README.md「HTTPS 配置」章节"
