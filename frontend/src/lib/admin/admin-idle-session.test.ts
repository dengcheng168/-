import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_THROTTLE_MS,
  IDLE_TIMEOUT_MS,
  LEASE_TTL_MS,
  WARNING_BEFORE_MS,
  computeRemainingMs,
  createListenerRegistry,
  generateTabId,
  hasBroadcastChannel,
  hasWebLocks,
  isTimedOut,
  makeSessionEvent,
  readLastActivityAt,
  readLease,
  releaseLease,
  reduceIncomingEvent,
  resolveNavigationTarget,
  shouldWarn,
  tryAcquireLease,
  writeLastActivityAt,
  type KeyValueStorage,
} from './admin-idle-session';

function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

test('1. 60分钟阈值计算：正好60分钟前活动时剩余时间为0', () => {
  const now = 1_000_000_000_000;
  const remaining = computeRemainingMs(now, now - IDLE_TIMEOUT_MS);
  assert.equal(remaining, 0);
  assert.equal(isTimedOut(remaining), true);
});

test('2. 最后1分钟警告计算：剩余59秒应触发警告，剩余61秒不触发', () => {
  assert.equal(shouldWarn(59_000), true);
  assert.equal(shouldWarn(WARNING_BEFORE_MS), true);
  assert.equal(shouldWarn(61_000), false);
});

test('3. 继续操作重置：写入后立即读回应得到同一时间戳，剩余时间恢复满额', () => {
  const storage = createMemoryStorage();
  const now = 2_000_000_000_000;
  writeLastActivityAt(storage, now);
  const lastActivityAt = readLastActivityAt(storage, now);
  assert.equal(lastActivityAt, now);
  assert.equal(computeRemainingMs(now, lastActivityAt), IDLE_TIMEOUT_MS);
});

test('4. 活动时间戳更新：多次写入以最后一次为准', () => {
  const storage = createMemoryStorage();
  writeLastActivityAt(storage, 100);
  writeLastActivityAt(storage, 200);
  assert.equal(readLastActivityAt(storage, 9999), 200);
});

test('5. 过期lease可以被其他标签页接管', () => {
  const storage = createMemoryStorage();
  const now = 3_000_000_000_000;
  assert.equal(tryAcquireLease(storage, 'tab-A', now), true);
  const later = now + LEASE_TTL_MS + 1;
  assert.equal(tryAcquireLease(storage, 'tab-B', later), true);
  assert.equal(readLease(storage)?.ownerTabId, 'tab-B');
});

test('6. 未过期lease不能被其他标签页接管', () => {
  const storage = createMemoryStorage();
  const now = 4_000_000_000_000;
  assert.equal(tryAcquireLease(storage, 'tab-A', now), true);
  assert.equal(tryAcquireLease(storage, 'tab-B', now + 10), false);
  assert.equal(readLease(storage)?.ownerTabId, 'tab-A');
});

test('7. 非owner不能释放lease', () => {
  const storage = createMemoryStorage();
  const now = 5_000_000_000_000;
  tryAcquireLease(storage, 'tab-A', now);
  releaseLease(storage, 'tab-B');
  assert.equal(readLease(storage)?.ownerTabId, 'tab-A');
  releaseLease(storage, 'tab-A');
  assert.equal(readLease(storage), null);
});

test('8. 同时超时时只有一个标签页获得所有权', () => {
  const storage = createMemoryStorage();
  const now = 6_000_000_000_000;
  const resultA = tryAcquireLease(storage, 'tab-A', now);
  const resultB = tryAcquireLease(storage, 'tab-B', now);
  const resultC = tryAcquireLease(storage, 'tab-C', now);
  const successCount = [resultA, resultB, resultC].filter(Boolean).length;
  assert.equal(successCount, 1);
});

test('9. logout-start事件到达后，非事件源标签页应导航而不是忽略', () => {
  const action = reduceIncomingEvent('logout-start', 'self-tab', 'other-tab');
  assert.equal(action.type, 'navigate-to-login');
});

test('10. logout-complete事件到达后，非事件源标签页应导航去登录入口', () => {
  const action = reduceIncomingEvent('logout-complete', 'self-tab', 'other-tab');
  assert.equal(action.type, 'navigate-to-login');
});

test('11. 收到自己标签页发出的事件应被忽略（storage事件同步场景的自反过滤）', () => {
  const action = reduceIncomingEvent('logout-start', 'self-tab', 'self-tab');
  assert.equal(action.type, 'ignore');
});

test('12. activity事件应关闭警告并重置，而不是导航离开（BroadcastChannel场景）', () => {
  const action = reduceIncomingEvent('activity', 'self-tab', 'other-tab');
  assert.equal(action.type, 'close-warning-and-reset');
});

test('13. 事件载荷只包含eventId/tabId/occurredAt/reason四个字段，不含认证信息', () => {
  const event = makeSessionEvent('tab-A', 123, 'idle-timeout');
  const keys = Object.keys(event).sort();
  assert.deepEqual(keys, ['eventId', 'occurredAt', 'reason', 'tabId']);
});

test('14. tabId生成不依赖任何身份信息，两次生成不相同', () => {
  const a = generateTabId();
  const b = generateTabId();
  assert.notEqual(a, b);
  assert.equal(typeof a, 'string');
  assert.ok(a.length > 0);
});

test('15. BroadcastChannel不可用时hasBroadcastChannel正确降级为false', () => {
  const fakeGlobal = {} as typeof globalThis;
  assert.equal(hasBroadcastChannel(fakeGlobal), false);
  const fakeGlobalWithChannel = { BroadcastChannel: function () {} } as unknown as typeof globalThis;
  assert.equal(hasBroadcastChannel(fakeGlobalWithChannel), true);
});

test('16. Web Locks不可用时hasWebLocks正确降级为false', () => {
  assert.equal(hasWebLocks({}), false);
  assert.equal(hasWebLocks(null), false);
  assert.equal(hasWebLocks({ locks: { request: () => {} } }), true);
});

test('17. 无论服务端登出请求参数如何，导航目标始终固定为登录入口', () => {
  const loginPath = '/qZzH86tTnyvhqTpk';
  assert.equal(resolveNavigationTarget(loginPath), loginPath);
});

test('18. 监听器注册表在removeAll后不残留任何活跃监听', () => {
  const registered = new Set<string>();
  const fakeTarget = {
    addEventListener: (type: string) => registered.add(type),
    removeEventListener: (type: string) => registered.delete(type),
  };
  const registry = createListenerRegistry(fakeTarget, ['mousemove', 'keydown']);
  registry.add();
  assert.equal(registry.activeCount(), 2);
  assert.equal(registered.size, 2);
  registry.removeAll();
  assert.equal(registry.activeCount(), 0);
  assert.equal(registered.size, 0);
});

test('19. lease序列化内容只包含ownerTabId/token/expiresAt，不含Cookie/Token/用户身份字段', () => {
  const storage = createMemoryStorage();
  tryAcquireLease(storage, 'tab-A', 7_000_000_000_000);
  const raw = storage.getItem('admin_logout_lease_v1');
  assert.ok(raw);
  const parsed = JSON.parse(raw as string);
  const keys = Object.keys(parsed).sort();
  assert.deepEqual(keys, ['expiresAt', 'ownerTabId', 'token']);
});

test('20. 重复获取自己已持有的lease是幂等的，不会产生异常或额外副作用', () => {
  const storage = createMemoryStorage();
  const now = 8_000_000_000_000;
  assert.equal(tryAcquireLease(storage, 'tab-A', now), true);
  assert.doesNotThrow(() => tryAcquireLease(storage, 'tab-A', now + 1));
  assert.equal(readLease(storage)?.ownerTabId, 'tab-A');
});

test('额外: ACTIVITY_THROTTLE_MS 小于 WARNING_BEFORE_MS，确保节流不会吞掉警告窗口内的活动', () => {
  assert.ok(ACTIVITY_THROTTLE_MS < WARNING_BEFORE_MS);
});
