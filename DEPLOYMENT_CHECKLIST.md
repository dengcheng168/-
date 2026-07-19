# 部署检查清单

对照需求文档「二十九、验收标准」逐条核对。

## 上线前

- [ ] 已复制 `.env.example` → `.env` 并修改所有默认密码/密钥
- [ ] 已修改 `JWT_SECRET` 为随机长字符串（`openssl rand -base64 48`）
- [ ] 已修改 `ADMIN_INIT_EMAIL` / `ADMIN_INIT_PASSWORD`
- [ ] 已将 `DOMAIN_NAME`、`NEXT_PUBLIC_SITE_URL` 改为真实域名
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
- [ ] `sitemap.xml`、`robots.txt` 可正常访问
- [ ] 重启容器（`docker compose restart`）后数据不丢失（挂载卷生效）
- [ ] 内存占用适合 2GB 服务器（`docker stats` 观察，三容器总和不应长期逼近 1.2GB 上限）
- [ ] 不依赖任何必须付费的第三方服务（Turnstile / SMTP 均为可选，未配置也能正常使用核心功能）

## 上线后

- [ ] 已在后台「设置 → 管理员账号」修改默认管理员密码
- [ ] 已配置 HTTPS / Let's Encrypt 证书，HTTP 自动跳转 HTTPS
- [ ] 已设置定期备份（cron + `scripts/backup.sh`）
- [ ] 已用真实浏览器（非自动化工具）完整走一遍：首页浏览 → 产品详情 → 提交询盘 → 后台登录 → 查看询盘 → 编辑首页 Banner → 退出登录

## 已知限制（交付时的说明，非缺陷）

- 未实现西班牙语/阿拉伯语多语言路由（按用户要求：前台仅英语，后台仅中文，见 `README.md` 开头说明）
- 富文本编辑使用直接编辑 HTML 的文本域，而非可视化编辑器（Tiptap 等），管理员需要输入 HTML 标签
- 本次交付过程中开发环境没有安装 Docker，`docker build` / `docker compose up` 未在此环境实际执行验证，仅完成了 YAML 语法校验、Dockerfile 人工审查、部署脚本语法校验（`backup.sh` 已实际执行验证）。首次在真实服务器上部署时请留意日志，如遇问题参考 README「常见问题」章节
