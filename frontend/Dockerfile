# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# ---- deps：安装依赖 ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build：生成 standalone 产物 ----
# 构建阶段会执行 next build 的静态生成，其中部分页面会尝试请求后端 API。
# 由于 Docker 构建默认处于隔离网络，连不上 backend 容器属于正常情况——
# 前端各数据请求函数（见 src/lib/api/*.ts）都做了 try/catch 兜底，
# 构建期拿不到数据时用占位内容完成预渲染，容器启动后 ISR 会在首次真实请求时刷新为最新内容。
FROM deps AS build
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG NEXT_PUBLIC_UPLOADS_BASE_URL=
ARG INTERNAL_API_BASE_URL=http://backend:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_UPLOADS_BASE_URL=$NEXT_PUBLIC_UPLOADS_BASE_URL
ENV INTERNAL_API_BASE_URL=$INTERNAL_API_BASE_URL

RUN npm run build

# ---- runtime：只拷贝 standalone 产物，体积远小于完整 node_modules ----
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
