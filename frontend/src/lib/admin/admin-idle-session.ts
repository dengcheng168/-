// 纯逻辑模块：不依赖 window/document/localStorage，只通过参数注入依赖，
// 因此可以在普通 Node 环境（node:test）里直接单测，也天然满足 SSR 安全（不在模块顶层访问浏览器全局对象）。

export const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const WARNING_BEFORE_MS = 60 * 1000;
export const CHECK_INTERVAL_MS = 1000;
export const ACTIVITY_THROTTLE_MS = 5000;
export const LEASE_TTL_MS = 8000;

export const STORAGE_KEY_ACTIVITY = 'admin_last_activity_at';
export const STORAGE_KEY_LEASE = 'admin_logout_lease_v1';
export const BROADCAST_CHANNEL_NAME = 'koigate-admin-session-v1';
export const WEB_LOCK_NAME = 'koigate-admin-idle-logout-v1';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LogoutLease {
  ownerTabId: string;
  token: string;
  expiresAt: number;
}

export type SessionEventReason = 'idle-timeout' | 'manual-continue' | 'user-activity';
export type SessionEventKind = 'activity' | 'logout-start' | 'logout-complete';

export interface SessionEvent {
  eventId: string;
  tabId: string;
  occurredAt: number;
  reason?: SessionEventReason;
}

export type SessionAction =
  | { type: 'close-warning-and-reset' }
  | { type: 'navigate-to-login' }
  | { type: 'ignore' };

function safeRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function generateTabId(): string {
  return safeRandomId();
}

export function readLastActivityAt(storage: KeyValueStorage, now: number): number {
  const raw = storage.getItem(STORAGE_KEY_ACTIVITY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : now;
}

export function writeLastActivityAt(storage: KeyValueStorage, now: number): void {
  storage.setItem(STORAGE_KEY_ACTIVITY, String(now));
}

export function computeRemainingMs(now: number, lastActivityAt: number): number {
  return IDLE_TIMEOUT_MS - (now - lastActivityAt);
}

export function shouldWarn(remainingMs: number): boolean {
  return remainingMs <= WARNING_BEFORE_MS;
}

export function isTimedOut(remainingMs: number): boolean {
  return remainingMs <= 0;
}

function parseLease(raw: string | null): LogoutLease | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LogoutLease>;
    if (
      typeof parsed.ownerTabId === 'string' &&
      typeof parsed.token === 'string' &&
      typeof parsed.expiresAt === 'number'
    ) {
      return { ownerTabId: parsed.ownerTabId, token: parsed.token, expiresAt: parsed.expiresAt };
    }
  } catch {
    // 忽略损坏的 lease 内容，视为无锁
  }
  return null;
}

export function readLease(storage: KeyValueStorage): LogoutLease | null {
  return parseLease(storage.getItem(STORAGE_KEY_LEASE));
}

export function isLeaseActive(lease: LogoutLease | null, now: number): boolean {
  return lease !== null && lease.expiresAt > now;
}

// 写入后重新读取确认所有权：避免两个标签页在同一时刻都误以为自己拿到了锁。
export function tryAcquireLease(storage: KeyValueStorage, tabId: string, now: number): boolean {
  const existing = readLease(storage);
  if (isLeaseActive(existing, now) && existing !== null && existing.ownerTabId !== tabId) {
    return false;
  }

  const token = safeRandomId();
  const lease: LogoutLease = { ownerTabId: tabId, token, expiresAt: now + LEASE_TTL_MS };
  storage.setItem(STORAGE_KEY_LEASE, JSON.stringify(lease));

  const confirmed = readLease(storage);
  return confirmed !== null && confirmed.ownerTabId === tabId && confirmed.token === token;
}

export function releaseLease(storage: KeyValueStorage, tabId: string): void {
  const existing = readLease(storage);
  if (existing !== null && existing.ownerTabId === tabId) {
    storage.removeItem(STORAGE_KEY_LEASE);
  }
}

export function makeSessionEvent(tabId: string, now: number, reason?: SessionEventReason): SessionEvent {
  return { eventId: safeRandomId(), tabId, occurredAt: now, reason };
}

// 收到跨标签页事件后的纯决策函数：来自本标签页自己的事件一律忽略，
// activity 事件重置警告状态，logout-start/logout-complete 一律导航去登录入口，不再调用服务端登出。
export function reduceIncomingEvent(
  kind: SessionEventKind,
  selfTabId: string,
  eventTabId: string,
): SessionAction {
  if (eventTabId === selfTabId) return { type: 'ignore' };
  if (kind === 'activity') return { type: 'close-warning-and-reset' };
  return { type: 'navigate-to-login' };
}

export function hasBroadcastChannel(target: typeof globalThis): boolean {
  return typeof (target as Record<string, unknown>).BroadcastChannel === 'function';
}

export function hasWebLocks(nav: unknown): boolean {
  if (typeof nav !== 'object' || nav === null) return false;
  const locks = (nav as Record<string, unknown>).locks;
  return typeof locks === 'object' && locks !== null && typeof (locks as Record<string, unknown>).request === 'function';
}

// 无论服务端登出请求成功还是失败，客户端最终导航目标都固定为登录入口，不允许停留在错误状态。
export function resolveNavigationTarget(loginPath: string): string {
  return loginPath;
}

export interface ListenerRegistry {
  add(): void;
  removeAll(): void;
  activeCount(): number;
}

export function createListenerRegistry(
  target: { addEventListener: (type: string, fn: () => void) => void; removeEventListener: (type: string, fn: () => void) => void },
  events: readonly string[],
): ListenerRegistry {
  const handler = () => {};
  let active = 0;
  return {
    add() {
      events.forEach((evt) => target.addEventListener(evt, handler));
      active = events.length;
    },
    removeAll() {
      events.forEach((evt) => target.removeEventListener(evt, handler));
      active = 0;
    },
    activeCount() {
      return active;
    },
  };
}
