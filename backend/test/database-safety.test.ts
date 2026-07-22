import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import {
  assertSafeTestDatabaseUrl,
  assertSafeProductionDatabaseUrl,
  toPrismaSqliteUrl,
  DatabaseSafetyError,
} from '../src/lib/database-safety.js';
import {
  createIsolatedTestDatabase,
  applyTestMigrations,
  destroyIsolatedTestDatabase,
} from './helpers/test-database.js';

// 这个文件专门测试"数据库安全门禁 + 隔离测试库生命周期"本身，全部用真实 Prisma + 真实
// SQLite 临时文件验证（真的建目录、真的跑 prisma migrate deploy、真的连接查询），
// 不 mock 掉数据库——mock 掉的话没法证明门禁和迁移在真实环境下确实按预期工作。

test('assertSafeTestDatabaseUrl: rejects the real development database path (dev.db)', () => {
  const devDbUrl = toPrismaSqliteUrl(path.resolve(process.cwd(), 'prisma', 'dev.db'));
  assert.throws(() => assertSafeTestDatabaseUrl(devDbUrl), DatabaseSafetyError);
});

test('assertSafeTestDatabaseUrl: rejects a production-shaped path (/app/data/production.db)', () => {
  assert.throws(() => assertSafeTestDatabaseUrl('file:/app/data/production.db'), DatabaseSafetyError);
});

test('assertSafeTestDatabaseUrl: rejects any file named production.db regardless of directory', () => {
  const someOtherProdPath = toPrismaSqliteUrl(path.join(os.tmpdir(), 'not-actually-under-koigate-tests', 'production.db'));
  assert.throws(() => assertSafeTestDatabaseUrl(someOtherProdPath), DatabaseSafetyError);
});

test('assertSafeTestDatabaseUrl: rejects a path outside the system temp directory even if it mentions "test"', () => {
  const outsideTmp = toPrismaSqliteUrl(path.resolve(process.cwd(), 'prisma', 'test-fixture.db'));
  assert.throws(() => assertSafeTestDatabaseUrl(outsideTmp), DatabaseSafetyError);
});

test('assertSafeTestDatabaseUrl: accepts a properly-named isolated temp database path', () => {
  const validUrl = toPrismaSqliteUrl(path.join(os.tmpdir(), 'koigate-tests-abc123', 'test.db'));
  assert.doesNotThrow(() => assertSafeTestDatabaseUrl(validUrl));
});

test('assertSafeTestDatabaseUrl: rejects in-memory SQLite', () => {
  assert.throws(() => assertSafeTestDatabaseUrl('file::memory:'), DatabaseSafetyError);
});

test('assertSafeProductionDatabaseUrl: rejects a path containing "test"', () => {
  assert.throws(() => assertSafeProductionDatabaseUrl('file:/app/data/test.db'), DatabaseSafetyError);
});

test('assertSafeProductionDatabaseUrl: rejects a path under the system temp directory', () => {
  const tmpPath = toPrismaSqliteUrl(path.join(os.tmpdir(), 'koigate-tests-xyz', 'test.db'));
  assert.throws(() => assertSafeProductionDatabaseUrl(tmpPath), DatabaseSafetyError);
});

test('assertSafeProductionDatabaseUrl: accepts the real Docker persistence path', () => {
  assert.doesNotThrow(() => assertSafeProductionDatabaseUrl('file:/app/data/production.db'));
});

test('toPrismaSqliteUrl: converts a Windows-style absolute path with backslashes to a forward-slash file: URL', () => {
  const url = toPrismaSqliteUrl('C:\\Users\\someone\\AppData\\Local\\Temp\\koigate-tests-abc\\test.db');
  assert.equal(url, 'file:C:/Users/someone/AppData/Local/Temp/koigate-tests-abc/test.db');
});

test('toPrismaSqliteUrl: converts a POSIX absolute path unchanged aside from the file: prefix', () => {
  const url = toPrismaSqliteUrl('/tmp/koigate-tests-abc/test.db');
  assert.equal(url, 'file:/tmp/koigate-tests-abc/test.db');
});

test('toPrismaSqliteUrl / assertSafeTestDatabaseUrl: a path containing spaces is handled correctly', () => {
  const spacedPath = path.join(os.tmpdir(), 'koigate-tests-with space', 'test.db');
  const url = toPrismaSqliteUrl(spacedPath);
  assert.ok(url.includes('with space'));
  assert.doesNotThrow(() => assertSafeTestDatabaseUrl(url));
});

test('createIsolatedTestDatabase: creates a unique directory under the system temp dir with a "test" marker', async () => {
  const context = await createIsolatedTestDatabase();
  try {
    assert.ok(context.directoryPath.startsWith(path.resolve(os.tmpdir())));
    assert.ok(path.basename(context.directoryPath).includes('koigate-tests-'));
    assert.equal(path.basename(context.databasePath), 'test.db');
    const stat = await fs.stat(context.directoryPath);
    assert.ok(stat.isDirectory());
  } finally {
    await destroyIsolatedTestDatabase(context);
  }
});

test('createIsolatedTestDatabase: two consecutive calls produce two different, non-colliding paths', async () => {
  const first = await createIsolatedTestDatabase();
  const second = await createIsolatedTestDatabase();
  try {
    assert.notEqual(first.directoryPath, second.directoryPath);
    assert.notEqual(first.databaseUrl, second.databaseUrl);
  } finally {
    await destroyIsolatedTestDatabase(first);
    await destroyIsolatedTestDatabase(second);
  }
});

test('applyTestMigrations: runs the real Prisma migrations against the fresh temp database and it is queryable and empty', async () => {
  const context = await createIsolatedTestDatabase();
  try {
    await applyTestMigrations(context);
    const stat = await fs.stat(context.databasePath);
    assert.ok(stat.size > 0, '迁移后 test.db 应该已经写入了 schema，不再是 0 字节');

    const prisma = new PrismaClient({ datasources: { db: { url: context.databaseUrl } } });
    try {
      // 新迁移出来的库应该是空的——不能有任何来自开发库/生产库的管理员、询盘等真实数据，
      // 这是"测试数据库不依赖开发库现有数据"这条原则最直接的证据。
      const adminCount = await prisma.adminUser.count();
      const inquiryCount = await prisma.inquiry.count();
      const siteSettingCount = await prisma.siteSetting.count();
      assert.equal(adminCount, 0, '新建的隔离测试库不应该有任何管理员账号');
      assert.equal(inquiryCount, 0, '新建的隔离测试库不应该有任何询盘数据');
      assert.equal(siteSettingCount, 0, '新建的隔离测试库不应该有任何 SiteSetting 数据（包括 siteBaseUrl）');
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    await destroyIsolatedTestDatabase(context);
  }
});

test('destroyIsolatedTestDatabase: removes test.db, its -wal/-shm/-journal sidecars, and the temp directory itself', async () => {
  const context = await createIsolatedTestDatabase();
  await applyTestMigrations(context);

  // 手工模拟 WAL/SHM/journal 旁路文件存在的情况（正常流程下 SQLite 可能会生成它们），
  // 确认清理逻辑确实把这几个变体都覆盖到，而不是只删 test.db 本体。
  await fs.writeFile(`${context.databasePath}-wal`, 'fake-wal');
  await fs.writeFile(`${context.databasePath}-shm`, 'fake-shm');
  await fs.writeFile(`${context.databasePath}-journal`, 'fake-journal');

  await destroyIsolatedTestDatabase(context);

  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    await assert.rejects(fs.stat(`${context.databasePath}${suffix}`), /ENOENT/, `${suffix || '(主文件)'} 应该已被删除`);
  }
  await assert.rejects(fs.stat(context.directoryPath), /ENOENT/, '临时目录本身也应该被删除');
});

test('destroyIsolatedTestDatabase: is safe to call twice (idempotent, does not throw on missing files)', async () => {
  const context = await createIsolatedTestDatabase();
  await destroyIsolatedTestDatabase(context);
  await assert.doesNotReject(destroyIsolatedTestDatabase(context));
});

test('the current process (running under test/bootstrap.ts) never has DATABASE_URL pointing at the development database', () => {
  const devDbAbsolute = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  const currentUrl = (process.env.DATABASE_URL ?? '').replace(/\\/g, '/');
  assert.ok(!currentUrl.endsWith('dev.db'), `当前进程的 DATABASE_URL 不应该指向 dev.db，实际是: ${currentUrl}`);
  assert.ok(currentUrl.toLowerCase().includes('koigate-tests-'), `当前进程的 DATABASE_URL 应该指向隔离临时库，实际是: ${currentUrl}`);
  void devDbAbsolute;
});
