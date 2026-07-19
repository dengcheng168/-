# syntax=docker/dockerfile:1

# ---- base：所有阶段共用的基础镜像 ----
# alpine 体积小，适合 2 核 2GB 的小型 VPS；openssl 是 Prisma 查询引擎运行时依赖，
# python3/make/g++ 用于 argon2/sharp 等原生模块在没有匹配预编译包时的兜底编译。
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

# ---- deps：安装完整依赖（含 devDependencies，构建阶段需要 TypeScript/Prisma CLI）----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build：生成 Prisma Client 并编译 TypeScript ----
FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runtime：直接复用 build 阶段的 node_modules，避免原生模块重新链接的平台不一致问题 ----
# 说明：为简化构建流程，运行时镜像保留了 devDependencies（体积会略大于严格意义上的生产镜像），
# 换来的好处是容器启动时可以直接用 `npx prisma migrate deploy` 执行迁移，无需额外的迁移专用镜像。
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
# scripts/create-admin.ts 通过 tsx 直接以 TS 源码运行（用于 `npm run create-admin`），
# 它 import 的是 ../src/lib/... 源文件而非编译产物，因此运行时镜像里也要保留 src/。
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY package.json ./

RUN mkdir -p /app/data /app/uploads /app/logs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
