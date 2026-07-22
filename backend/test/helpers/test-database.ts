import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { toPrismaSqliteUrl, assertSafeTestDatabaseUrl } from '../../src/lib/database-safety.js';

const execFileAsync = promisify(execFile);

export interface TestDatabaseContext {
  directoryPath: string;
  databasePath: string;
  databaseUrl: string;
}

const helpersDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(helpersDir, '..', '..');
// 直接调用 prisma 包自己的 JS 入口（node_modules/prisma/package.json 的 bin 字段指向这里），
// 而不是 node_modules/.bin/prisma(.cmd)——后者在 Windows 上是个批处理脚本，execFile 必须
// 借助 shell 才能跑，既有转义安全提示的噪音，也多一层不必要的 shell 依赖。直接用
// `node <这个脚本>` 调用在 Windows/Linux 下行为一致。
const prismaCliEntry = path.resolve(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');

/**
 * 每次调用都在系统临时目录下创建一个全新、唯一命名的目录 + SQLite 文件。
 * 目录名和文件名都明确带 "test" 标记，满足 database-safety.ts 的白名单校验，
 * 也方便人工在临时目录里一眼认出这是测试残留（万一清理失败）。
 */
export async function createIsolatedTestDatabase(): Promise<TestDatabaseContext> {
  const directoryPath = await fs.mkdtemp(path.join(os.tmpdir(), 'koigate-tests-'));
  const databasePath = path.join(directoryPath, 'test.db');
  const databaseUrl = toPrismaSqliteUrl(databasePath);
  // 建库之前先自检一遍，如果这里都不满足白名单，后面 Prisma migrate 也不该跑。
  assertSafeTestDatabaseUrl(databaseUrl);
  return { directoryPath, databasePath, databaseUrl };
}

/**
 * 用正式的 `prisma migrate deploy`（不是 db push，不是 migrate reset）把仓库里已有的迁移
 * 依次应用到这个全新的临时数据库上，和生产环境建库走的是同一套迁移文件。
 */
export async function applyTestMigrations(context: TestDatabaseContext): Promise<void> {
  assertSafeTestDatabaseUrl(context.databaseUrl);
  await execFileAsync(process.execPath, [prismaCliEntry, 'migrate', 'deploy'], {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: context.databaseUrl, NODE_ENV: 'test' },
  });
}

export function getTestDatabaseUrl(context: TestDatabaseContext): string {
  return context.databaseUrl;
}

async function removeWithRetry(targetPath: string, attempts = 20, delayMs = 300): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await fs.rm(targetPath, { recursive: true, force: true });
      return;
    } catch (err) {
      if (attempt === attempts) {
        console.warn(`[test-database] 清理 "${targetPath}" 失败（已重试 ${attempts} 次）:`, err);
        return;
      }
      // Windows 上关闭 SQLite 连接后文件句柄可能还没完全释放，短暂重试几次再放弃。
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * 调用方必须先把这个数据库对应的所有 PrismaClient $disconnect() 完毕再调用这个函数。
 * 依次删除 test.db 本体以及可能存在的 -wal/-shm/-journal 旁路文件，最后删掉整个临时目录。
 * 只删 directoryPath 内部的内容，不会触碰临时目录之外的任何文件。删除失败只警告不抛错，
 * 避免清理阶段的异常掩盖测试本身的真实失败结果。
 */
export async function destroyIsolatedTestDatabase(context: TestDatabaseContext): Promise<void> {
  const sidecarSuffixes = ['', '-wal', '-shm', '-journal'];
  for (const suffix of sidecarSuffixes) {
    await removeWithRetry(`${context.databasePath}${suffix}`);
  }
  await removeWithRetry(context.directoryPath);
}

const STALE_DIRECTORY_PREFIX = 'koigate-tests-';

/**
 * 自愈式清理：偶尔会有个别测试进程在 Windows 上因为 SQLite 文件句柄释放得比重试预算慢，
 * 导致 destroyIsolatedTestDatabase 最终还是失败并只留下警告（这是允许的降级行为，不是 bug）。
 * 每次新测试进程启动、创建自己的隔离库之前，顺手清扫一遍系统临时目录里属于本项目、
 * 且已经超过 maxAgeMs 的旧 "koigate-tests-*" 目录，避免残留无限累积。只扫描/删除
 * os.tmpdir() 下这个精确前缀的目录，不触碰任何其它文件；按 mtime 设置一个足够大的年龄阈值，
 * 避免误删同一时刻正在运行的其它测试进程自己的临时目录。
 */
export async function sweepStaleTestDatabases(maxAgeMs = 60 * 60 * 1000): Promise<void> {
  const tmpRoot = os.tmpdir();
  let entries: string[];
  try {
    entries = await fs.readdir(tmpRoot);
  } catch {
    return;
  }
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.startsWith(STALE_DIRECTORY_PREFIX)) continue;
    const fullPath = path.join(tmpRoot, entry);
    try {
      const stat = await fs.stat(fullPath);
      if (!stat.isDirectory()) continue;
      if (now - stat.mtimeMs < maxAgeMs) continue;
      await fs.rm(fullPath, { recursive: true, force: true });
    } catch {
      // 扫描到的目录可能刚好被另一个仍在运行的测试进程占用，安静跳过，不影响当前测试。
    }
  }
}

export { assertSafeTestDatabaseUrl } from '../../src/lib/database-safety.js';
