import { after } from 'node:test';
import {
  createIsolatedTestDatabase,
  applyTestMigrations,
  destroyIsolatedTestDatabase,
  sweepStaleTestDatabases,
  type TestDatabaseContext,
} from './helpers/test-database.js';

/**
 * 通过 `node --import ./test/bootstrap.ts --test ...` 加载。
 *
 * `node --test <glob>` 对每个匹配到的测试文件默认各自开一个独立子进程运行（已用哨兵测试实测
 * 验证过：两个测试文件打印出的 process.pid 不同）。`--import` 指定的模块会在该子进程里、在
 * `--test` 真正加载具体测试文件之前完整 import 一遍（包括本模块顶层的 await），所以这里
 * 设置的 NODE_ENV / DATABASE_URL 能在 app.ts、env.ts、任何 PrismaClient 构造之前生效——
 * 已经用一个人为加了 300ms 延迟的最小复现脚本验证过这个时序（bootstrap 的 console.log
 * 完全先于被 --test 加载的测试文件模块顶层代码打印，同一个 pid）。
 *
 * 效果：12 个测试文件 = 12 个独立子进程 = 12 个完全独立的临时 SQLite 文件，天然不会有
 * 多进程并发写同一个 SQLite 文件的锁竞争问题，也不需要额外的 worker 编号协调逻辑。
 */

// 实测发现：`node --import tsx --import ./test/bootstrap.ts --test <file>` 在同一个子进程里
// 会把这个模块的顶层代码完整跑两遍（同一个 process.pid，两次都打印、两次都建库），怀疑是
// tsx 的加载器钩子和 Node --import 解析链路叠加导致的重复求值，不是 node:test 本身按测试
// 文件数重复 fork 进程（fork 数量已经用不带 --import 的哨兵脚本单独验证过，和文件数一致）。
// 用 process.env 做跨"求值实例"的幂等标记——它是进程级可变状态，不受 ESM 模块实例是否被
// 重复创建影响，能保证不管这个模块被求值几次，临时库只真正创建一次。
const BOOTSTRAP_GUARD_ENV_KEY = '__KOIGATE_TEST_DB_BOOTSTRAPPED';

if (process.env[BOOTSTRAP_GUARD_ENV_KEY] !== '1') {
  process.env[BOOTSTRAP_GUARD_ENV_KEY] = '1';
  process.env.NODE_ENV = 'test';

  // 偶尔个别进程清理自己的临时库会失败（见 test-database.ts 的注释），顺手扫一遍陈旧残留，
  // 避免累积；只清超过 1 小时的旧目录，不会碰到其它并发测试进程正在使用的目录。
  await sweepStaleTestDatabases();

  const context: TestDatabaseContext = await createIsolatedTestDatabase();
  process.env.DATABASE_URL = context.databaseUrl;

  await applyTestMigrations(context);

  // 只打印路径本身（SQLite file: URL 不含账号密码等 secret），方便定位某次失败具体用的是哪个临时库。
  console.log(`[test-bootstrap] pid=${process.pid} isolated test database ready: ${context.databaseUrl}`);

  let torndown = false;
  const teardown = async (): Promise<void> => {
    if (torndown) return;
    torndown = true;
    await destroyIsolatedTestDatabase(context);
  };

  // 正常路径：node:test 顶层 after() 在这个进程里的全部测试跑完之后、进程退出之前被 await，
  // 是这里最主要、最可靠的清理时机。如果这个进程里实际上一个测试都没跑（例如只是编译期
  // 探测），after() 可能根本不会触发，下面的 exit 钩子作为同步兜底。
  after(teardown);

  // 异常路径（Ctrl+C 等）：node:test 的 after() 钩子不保证在收到终止信号时还会执行，
  // 这里加一层尽力而为的兜底，清理完再真正退出进程。
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void teardown().finally(() => process.exit(signal === 'SIGINT' ? 130 : 143));
    });
  }
}
