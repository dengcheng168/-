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
# 已废弃（deprecated）：正式站点域名的主要事实源现在是后台"SEO 设置 -> 正式站点域名"
# （SiteSetting.siteBaseUrl），运行时故障回退用 SITE_URL 环境变量（见下方 runtime 阶段），
# 两者都不需要重新构建镜像即可生效。这个变量只作为两者都缺失时的最后一层兼容回退，
# 计划后续版本移除，新的部署不再需要设置它。
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG NEXT_PUBLIC_UPLOADS_BASE_URL=
ARG INTERNAL_API_BASE_URL=http://backend:4000
# 构建期站点根地址：只用于让本次构建产物（canonical/hreflang/metadataBase 等）使用正式域名，
# 不参与运行时故障回退优先级（那套逻辑仍由 SITE_URL 环境变量在 runtime 阶段单独提供，见下方
# runtime 阶段说明及 lib/site/resolve-site-base-url.ts）。构建期缺失/非法时必须让本次
# `npm run build` 直接失败，而不是静默落回上面的 NEXT_PUBLIC_SITE_URL=http://localhost 兼容值。
ARG SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_UPLOADS_BASE_URL=$NEXT_PUBLIC_UPLOADS_BASE_URL
ENV INTERNAL_API_BASE_URL=$INTERNAL_API_BASE_URL
ENV SITE_URL=$SITE_URL

RUN node -e "\
const raw = process.env.SITE_URL; \
if (!raw) throw new Error('SITE_URL is required during frontend build'); \
const url = new URL(raw); \
const blocked = new Set(['localhost', '127.0.0.1', '::1']); \
if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SITE_URL must use http or https'); \
if (blocked.has(url.hostname)) throw new Error('SITE_URL must not use localhost'); \
if (url.search || url.hash) throw new Error('SITE_URL must not include query or hash'); \
console.log('Validated frontend build SITE_URL:', url.origin); \
"

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
