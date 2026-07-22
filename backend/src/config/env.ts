import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  /**
   * 决定 request.ip（限流/登录锁定/操作日志用的客户端 IP）信任哪些来源的 X-Forwarded-For。
   * 默认只信任回环地址和私网地址段（loopback + uniquelocal，对应 Docker 内部网络/宿主机反代
   * 这种"前面就是自己人的反向代理"部署方式）。如果不做这层限制，公网请求可以直接伪造
   * X-Forwarded-For 头绕过按 IP 的限流和登录锁定。逗号分隔，支持 proxy-addr 的预设名
   * （loopback/linklocal/uniquelocal）和具体 IP/CIDR。
   */
  TRUST_PROXY: z.string().default('loopback, uniquelocal'),

  DATABASE_URL: z.string().default('file:./dev.db'),

  JWT_SECRET: z.string().min(1).default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  ADMIN_INIT_EMAIL: z.string().email().optional(),
  ADMIN_INIT_PASSWORD: z.string().optional(),

  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().int().positive().default(10),

  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),

  /**
   * 保存正式站点域名（SiteSetting.siteBaseUrl）后，后端服务器到服务器调用前端
   * POST /api/internal/revalidate-site-config 的目标地址。本机开发时前后端分属不同端口
   * （backend:4000 调用 frontend:3000），Docker 部署时改用服务名（见根目录 docker-compose.yml
   * backend 服务的 FRONTEND_BASE_URL 覆盖值）。
   */
  FRONTEND_BASE_URL: z.string().default('http://localhost:3000'),
  /**
   * 与前端共享的内部调用密钥，用于 revalidate-site-config 接口鉴权，不是 NEXT_PUBLIC_*。
   * 未配置时后端仍会尝试调用（返回 401 会被当作"缓存刷新失败"处理，不阻塞域名保存本身），
   * 生产环境必须显式配置且与前端的同名变量一致。
   */
  REVALIDATE_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('环境变量校验失败：');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
