# 部署检查清单

对照需求文档「二十九、验收标准」逐条核对。

## 上线前

- [ ] 已复制 `.env.example` → `.env` 并修改所有默认密码/密钥
- [ ] 已修改 `JWT_SECRET` 为随机长字符串（`openssl rand -base64 48`）
- [ ] 已修改 `ADMIN_INIT_EMAIL` / `ADMIN_INIT_PASSWORD`
- [ ] 已将 `DOMAIN_NAME` 改为真实域名（Nginx `server_name` / 证书用，与下面的 `SITE_URL` 用途不同，两个都要改）
- [ ] 已配置 `SITE_URL` 为真实域名作为故障回退（`REVALIDATE_SECRET` 也已生成随机值，`openssl rand -base64 32`）
- [ ] 已在后台"全站设置 -> SEO 与追踪 -> 正式站点域名"里配置正式域名（这是 canonical/hreflang/Sitemap/Robots/Open Graph/JSON-LD 的主要事实源，优先级高于 `SITE_URL`；`NEXT_PUBLIC_SITE_URL` 已废弃，不需要再单独配置，只在前两者都缺失时才会被读取）
- [ ] 已确认服务器安全组/防火墙放行 80/443 端口
- [ ] 已替换种子数据中的占位证书、客户评价、公司联系方式为真实内容

## 部署验证（对应需求文档验收标准）

- [ ] `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` 三个容器均正常启动且健康检查通过
- [ ] 前台首页可正常访问，展示真实数据
- [ ] 后端 `/api/health` 返回 200
- [ ] 后台 `/admin/login` 可以登录
- [ ] 后台可以新增/编辑产品，图片上传后能生成 WebP 和缩略图
- [ ] 后台可以发布博客文章
- [ ] 前台询盘表单可以提交，后台「询盘管理」能看到并可导出 CSV
- [ ] 首页 Banner、核心优势等模块可在后台「首页模块」修改并在前台生效
- [ ] 手机端页面正常显示（导航折叠菜单、响应式布局）
- [ ] `sitemap.xml`、`robots.txt` 可正常访问，且其中的地址是真实域名，不是 `localhost` 或容器内部地址
- [ ] 后台"SEO 设置"页面查看正式站点域名的"当前生效来源"显示为"后台配置"（不是环境变量回退），产品/文章详情页 canonical、hreflang 也确认是真实域名
- [ ] 已确认新域名的 DNS、SSL 证书已生效；如果是更换首选域名（例如从裸域名切到 www 子域名），非首选域名已配置 301 重定向到首选域名（这些都需要在 Nginx/证书/DNS 层单独配置，后台修改域名本身不会自动处理）
- [ ] 重启容器（`docker compose restart`）后数据不丢失（挂载卷生效）
- [ ] 内存占用适合 2GB 服务器（`docker stats` 观察，三容器总和不应长期逼近 1.2GB 上限）
- [ ] 不依赖任何必须付费的第三方服务（Turnstile / SMTP 均为可选，未配置也能正常使用核心功能）

## 上线后

- [ ] 已在后台「设置 → 管理员账号」修改默认管理员密码
- [ ] 已配置 HTTPS / Let's Encrypt 证书，HTTP 自动跳转 HTTPS
- [ ] 已设置定期备份（cron + `scripts/backup.sh`）
- [ ] 已用真实浏览器（非自动化工具）完整走一遍：首页浏览 → 产品详情 → 提交询盘 → 后台登录 → 查看询盘 → 编辑首页 Banner → 退出登录

## SQLite 数据库持久化与备份

项目继续使用 SQLite（不安装 MySQL/PostgreSQL）。生产数据库不是宝塔面板里的独立数据库服务，
而是容器内 `/app/data/production.db` 这一个文件，对应宿主机 `./data` 目录（`docker-compose.yml`
里 `./data:/app/data` 绑定挂载）。**宝塔"数据库"菜单显示为 0 是正常现象**，不代表数据库没建好或
配置有问题——SQLite 是文件数据库，不需要在宝塔的数据库管理界面里创建。

- [ ] 确认服务器上 `./data` 目录存在且不为空（`ls -lah data/`），里面应该有 `production.db`
- [ ] 重启容器后确认数据未丢失：`docker compose restart backend`，再登录后台确认之前保存的设置还在
- [ ] 重建镜像后确认数据未丢失：`docker compose up -d --build backend`，同样登录确认设置还在
- [ ] **禁止使用** `docker compose down -v`——`-v` 会删除 named volume，虽然本项目用的是宿主机绑定
      目录（理论上不受影响），但仍然不要养成加 `-v` 的习惯
- [ ] 已配置定期备份（`scripts/backup.sh`，用的是 SQLite 官方在线备份 API `.backup`，不是在数据库
      正在写入时直接 `cp`/`tar` 主文件——后者在极端情况下可能拷到一个事务写到一半的不一致状态）
- [ ] 备份文件不提交进 Git（`backups/` 已在 `.gitignore` 里），不放在 Nginx 会直接对外提供静态文件
      的目录下

### 服务器验证清单（本地开发环境没有 Docker CLI，以下命令待部署到服务器后执行）

```bash
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=200 backend

# 确认数据库路径和挂载
docker compose exec backend sh -lc 'echo "$DATABASE_URL"'
docker compose exec backend sh -lc 'ls -lah /app/data'

# 验证持久化：先在后台改一项设置，记下来，然后：
docker compose restart backend
# 重新登录后台确认设置还在
docker compose up -d --build backend   # 重建镜像，不删除 volume
# 再次确认设置还在
```

## 自动化测试数据库隔离

后端 `npm test` 不会连接开发数据库（`backend/prisma/dev.db`）或生产数据库，每个测试文件运行在
独立进程里，各自在系统临时目录下创建一个全新的隔离 SQLite 文件（`test/bootstrap.ts` 自动完成，
不需要开发者手工配置 `DATABASE_URL`），测试结束自动删除。`backend/src/lib/database-safety.ts`
在 `NODE_ENV=test`/`NODE_ENV=production` 时分别做强制校验，防止测试误连开发/生产库、防止生产
环境误用测试库路径。**不要**在生产容器里直接跑未隔离的测试脚本。

## 已知限制（交付时的说明，非缺陷）

- 未实现西班牙语/阿拉伯语多语言路由（按用户要求：前台仅英语，后台仅中文，见 `README.md` 开头说明）
- 富文本编辑使用直接编辑 HTML 的文本域，而非可视化编辑器（Tiptap 等），管理员需要输入 HTML 标签
- 本次交付过程中开发环境没有安装 Docker，`docker build` / `docker compose up` 未在此环境实际执行验证，仅完成了 YAML 语法校验、Dockerfile 人工审查、部署脚本语法校验（`backup.sh` 已实际执行验证）。首次在真实服务器上部署时请留意日志，如遇问题参考 README「常见问题」章节
