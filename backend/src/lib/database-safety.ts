import os from 'node:os';
import path from 'node:path';

/**
 * SQLite DATABASE_URL 安全门禁。
 *
 * 背景：本项目 NODE_ENV=test/development/production 共用同一套 Prisma schema，唯一的隔离手段
 * 是三者的 DATABASE_URL 指向不同的 SQLite 文件。历史上测试曾经因为没有这层校验直接连上了
 * backend/prisma/dev.db，测试的 finally 清理逻辑把开发库里的正式配置（SiteSetting.siteBaseUrl）
 * 冲掉了。这里的校验在 env.ts 里、任何 PrismaClient 构造之前无条件执行——校验不通过直接抛错
 * 终止进程启动，而不是打日志放行。
 */

export class DatabaseSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseSafetyError';
  }
}

/** schema.prisma 所在目录：Prisma 把 file: 相对路径解析到这里，不是解析到 process.cwd() 本身，
 * 但本项目无论本地开发（cwd=backend/）还是 Docker 运行时镜像（cwd=/app，prisma 复制到 /app/prisma）
 * 都满足 cwd 的直接子目录就是 prisma/，所以用 cwd 推导即可，不需要反向查找 schema.prisma 文件。 */
function getPrismaDir(): string {
  return path.resolve(process.cwd(), 'prisma');
}

function stripFileScheme(databaseUrl: string): string {
  if (!databaseUrl.startsWith('file:')) {
    throw new DatabaseSafetyError(
      `DATABASE_URL 必须是 SQLite 的 file: URL（当前项目不使用 MySQL/PostgreSQL），实际收到协议不是 file: -> "${databaseUrl}"`,
    );
  }
  return databaseUrl.slice('file:'.length);
}

function resolveAbsolutePath(rawPath: string): string {
  if (rawPath === ':memory:' || rawPath.startsWith(':memory:')) {
    throw new DatabaseSafetyError('不允许使用内存 SQLite 数据库（file::memory:），必须是磁盘上的真实文件。');
  }
  if (rawPath.length === 0) {
    throw new DatabaseSafetyError('DATABASE_URL 的 file: 后面路径为空。');
  }
  // Prisma 的 file: URL 里绝对路径既可能是 /app/data/production.db（POSIX）也可能是
  // C:/Users/xxx/test.db（Windows，Prisma 官方文档推荐用正斜杠），path.isAbsolute 在两种
  // 运行平台下都能正确识别，其余情况视为相对 schema.prisma 目录的相对路径。
  return path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(getPrismaDir(), rawPath);
}

/** 转成用于比较的规范化字符串：统一正斜杠，Windows 下大小写不敏感。 */
function toComparable(absPath: string): string {
  const normalized = absPath.replace(/\\/g, '/');
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function isUnderDirectory(comparableTarget: string, comparableDir: string): boolean {
  return comparableTarget === comparableDir || comparableTarget.startsWith(`${comparableDir}/`);
}

/** 把一个绝对路径转成 Prisma 可以直接使用的 SQLite file: URL，统一用正斜杠——
 * Windows 下 file:C:/Users/.../test.db 和 POSIX 下 file:/tmp/.../test.db 都是合法写法。 */
export function toPrismaSqliteUrl(absolutePath: string): string {
  return `file:${absolutePath.replace(/\\/g, '/')}`;
}

export interface DatabaseUrlInfo {
  absolutePath: string;
  comparablePath: string;
  fileName: string;
}

export function describeDatabaseUrl(databaseUrl: string): DatabaseUrlInfo {
  const rawPath = stripFileScheme(databaseUrl);
  const absolutePath = resolveAbsolutePath(rawPath);
  return {
    absolutePath,
    comparablePath: toComparable(absolutePath),
    fileName: path.basename(absolutePath),
  };
}

/** NODE_ENV=test 时的白名单校验：必须落在系统临时目录下，文件名/目录名明确带 test 标记，
 * 且不能是开发库或任何看起来像生产库的路径。不满足任何一条都立即抛错。 */
export function assertSafeTestDatabaseUrl(databaseUrl: string): DatabaseUrlInfo {
  const info = describeDatabaseUrl(databaseUrl);
  const { absolutePath, comparablePath, fileName } = info;

  const tmpRoot = toComparable(path.resolve(os.tmpdir()));
  if (!isUnderDirectory(comparablePath, tmpRoot)) {
    throw new DatabaseSafetyError(
      `拒绝启动测试：NODE_ENV=test 时 DATABASE_URL 必须指向系统临时目录（${os.tmpdir()}）下的隔离数据库，` +
        `实际解析为 "${absolutePath}"。测试不允许连接开发或生产数据库。`,
    );
  }

  const mentionsTest = /(test|tmp|temp)/i.test(fileName) || /(test|tmp|temp)/i.test(comparablePath);
  if (!mentionsTest) {
    throw new DatabaseSafetyError(
      `拒绝启动测试：测试数据库文件路径必须明确包含 test/tmp/temp 标记，实际路径 "${absolutePath}" 不满足。`,
    );
  }

  const devDbPath = toComparable(path.resolve(getPrismaDir(), 'dev.db'));
  if (comparablePath === devDbPath) {
    throw new DatabaseSafetyError('拒绝启动测试：DATABASE_URL 指向开发数据库 backend/prisma/dev.db，测试不允许连接开发数据库。');
  }

  if (fileName.toLowerCase() === 'production.db' || comparablePath.includes('/app/data/') || comparablePath.includes('/data/')) {
    throw new DatabaseSafetyError(`拒绝启动测试：DATABASE_URL 看起来指向生产数据库目录/文件名（"${absolutePath}"），测试不允许连接生产数据库。`);
  }

  return info;
}

/** NODE_ENV=production 时的反向校验：黑名单排除任何看起来是测试库或临时目录的路径，
 * 内存数据库也一律拒绝。校验失败时应用直接拒绝启动。 */
export function assertSafeProductionDatabaseUrl(databaseUrl: string): DatabaseUrlInfo {
  const info = describeDatabaseUrl(databaseUrl);
  const { absolutePath, comparablePath, fileName } = info;

  if (/test/i.test(fileName) || /test/i.test(comparablePath)) {
    throw new DatabaseSafetyError(`拒绝启动：NODE_ENV=production 但 DATABASE_URL 路径包含 "test"（"${absolutePath}"），生产环境禁止连接测试数据库。`);
  }

  const tmpRoot = toComparable(path.resolve(os.tmpdir()));
  if (isUnderDirectory(comparablePath, tmpRoot)) {
    throw new DatabaseSafetyError(`拒绝启动：NODE_ENV=production 但 DATABASE_URL 指向系统临时目录（"${absolutePath}"），生产数据库必须位于持久化目录。`);
  }

  return info;
}

/** 在 env.ts 里无条件调用：dev/test/production 三种模式各自校验，不满足直接抛错终止进程启动。
 * development 模式不做限制（允许连接常规的开发数据库），只有 test 和 production 有强制门禁。 */
export function assertDatabaseSafety(nodeEnv: string, databaseUrl: string): void {
  if (nodeEnv === 'test') {
    assertSafeTestDatabaseUrl(databaseUrl);
  } else if (nodeEnv === 'production') {
    assertSafeProductionDatabaseUrl(databaseUrl);
  }
}
