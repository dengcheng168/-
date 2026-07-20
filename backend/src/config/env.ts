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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('环境变量校验失败：');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
