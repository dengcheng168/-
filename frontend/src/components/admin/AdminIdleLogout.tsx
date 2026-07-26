'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ADMIN_LOGIN_PATH } from '@/config/constants';
import {
  ACTIVITY_THROTTLE_MS,
  BROADCAST_CHANNEL_NAME,
  CHECK_INTERVAL_MS,
  ADMIN_IDLE_LOGOUT_ENDPOINT,
  WEB_LOCK_NAME,
  computeRemainingMs,
  generateTabId,
  hasBroadcastChannel,
  hasWebLocks,
  isTimedOut,
  makeSessionEvent,
  readLastActivityAt,
  releaseLease,
  reduceIncomingEvent,
  resolveNavigationTarget,
  shouldWarn,
  tryAcquireLease,
  writeLastActivityAt,
  type SessionEvent,
  type SessionEventKind,
  type SessionEventReason,
} from '@/lib/admin/admin-idle-session';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;
const BROADCAST_STORAGE_FALLBACK_KEY = 'admin_logout_event_v1';

type ChannelMessage = { kind: SessionEventKind } & SessionEvent;

type LocksLike = {
  request: (
    name: string,
    options: { ifAvailable: boolean },
    callback: (lock: unknown) => Promise<void> | void,
  ) => Promise<void>;
};

function getLocks(nav: Navigator): LocksLike | null {
  if (!hasWebLocks(nav)) return null;
  return (nav as unknown as { locks: LocksLike }).locks;
}

// 后台无操作自动登出，支持多标签页安全协调：
// - 优先用 Web Locks API 保证同一时刻只有一个标签页真正调用服务端登出；不支持时退化为 localStorage lease。
// - 优先用 BroadcastChannel 主动广播活动/登出事件；不支持时退化为监听 localStorage 的 'storage' 事件。
// - 轮询（1 秒一次）只作为浏览器后台标签页节流或事件丢失时的兜底，不是唯一同步方式。
// - 非锁拥有者收到 logout-start/logout-complete 后直接整页导航去登录入口，绝不重复调用服务端登出，
//   也不会在没有 Cookie 的情况下再打一次可能被 proxy 拦成裸 404 的请求。
export function AdminIdleLogout() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const warningOpenRef = useRef(false);
  const loggingOutRef = useRef(false);
  const logoutRequestInFlightRef = useRef(false);
  const tabIdRef = useRef('');
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    warningOpenRef.current = remainingMs !== null;
  }, [remainingMs]);

  const navigateToLogin = useCallback(() => {
    window.location.replace(resolveNavigationTarget(ADMIN_LOGIN_PATH));
  }, []);

  const broadcast = useCallback((kind: SessionEventKind, reason?: SessionEventReason) => {
    const event = makeSessionEvent(tabIdRef.current, Date.now(), reason);
    const message: ChannelMessage = { kind, ...event };
    channelRef.current?.postMessage(message);
    try {
      window.localStorage.setItem(BROADCAST_STORAGE_FALLBACK_KEY, JSON.stringify(message));
    } catch {
      // localStorage 不可用时静默忽略：广播只是同步优化，轮询仍会兜底发现状态变化
    }
  }, []);

  const handleIncoming = useCallback((kind: SessionEventKind, eventTabId: string) => {
    const action = reduceIncomingEvent(kind, tabIdRef.current, eventTabId);
    if (action.type === 'close-warning-and-reset') {
      setRemainingMs(null);
    } else if (action.type === 'navigate-to-login') {
      loggingOutRef.current = true;
      window.location.replace(resolveNavigationTarget(ADMIN_LOGIN_PATH));
    }
  }, []);

  const performServerLogout = useCallback(async () => {
    try {
      await fetch(ADMIN_IDLE_LOGOUT_ENDPOINT, { method: 'POST', cache: 'no-store' });
    } catch {
      // 服务端登出请求失败也不阻塞后续导航兜底，见 doLogout 里始终执行 navigateToLogin
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    tabIdRef.current = generateTabId();
    writeLastActivityAt(window.localStorage, Date.now());

    if (hasBroadcastChannel(window)) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (ev: MessageEvent<ChannelMessage>) => {
        handleIncoming(ev.data.kind, ev.data.tabId);
      };
      channelRef.current = channel;
    }

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key !== BROADCAST_STORAGE_FALLBACK_KEY || !ev.newValue) return;
      try {
        const message = JSON.parse(ev.newValue) as ChannelMessage;
        handleIncoming(message.kind, message.tabId);
      } catch {
        // 忽略无法解析的跨标签页事件内容
      }
    };
    window.addEventListener('storage', handleStorage);

    let lastActivityBroadcastAt = 0;
    const handleActivity = () => {
      if (warningOpenRef.current || loggingOutRef.current) return;
      const now = Date.now();
      if (now - lastActivityBroadcastAt < ACTIVITY_THROTTLE_MS) return;
      lastActivityBroadcastAt = now;
      writeLastActivityAt(window.localStorage, now);
      broadcast('activity', 'user-activity');
    };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    const doLogout = async (reason: SessionEventReason) => {
      loggingOutRef.current = true;
      setRemainingMs(null);
      broadcast('logout-start', reason);
      await performServerLogout();
      broadcast('logout-complete', reason);
      navigateToLogin();
    };

    // navigator.locks.request() 本身是异步的（哪怕加了 ifAvailable:true，浏览器仍需要一次任务队列往返
    // 才能回调），loggingOutRef 只在真正拿到锁、进入 doLogout 后才会被置位。如果只在 doLogout 里置位，
    // 两次相邻的 1 秒轮询就可能在锁回调落地前重复调用 runLogout，从同一个标签页发出两次登出请求。
    // 用 logoutRequestInFlightRef 在发起锁/lease 请求前就同步占位，避免这个竞态；
    // 只在确认"这一轮没拿到锁/lease"时才复位，保证非拥有者标签页下一轮仍能重试，不会死锁。
    const runLogout = async (reason: SessionEventReason) => {
      if (loggingOutRef.current || logoutRequestInFlightRef.current) return;
      logoutRequestInFlightRef.current = true;

      const locks = getLocks(navigator);
      if (locks) {
        let acquired = false;
        await locks.request(WEB_LOCK_NAME, { ifAvailable: true }, async (lock) => {
          if (lock === null) return;
          acquired = true;
          await doLogout(reason);
        });
        if (!acquired) {
          logoutRequestInFlightRef.current = false;
        }
        return;
      }

      if (!tryAcquireLease(window.localStorage, tabIdRef.current, Date.now())) {
        logoutRequestInFlightRef.current = false;
        return;
      }
      await doLogout(reason);
      releaseLease(window.localStorage, tabIdRef.current);
    };

    const interval = window.setInterval(() => {
      if (loggingOutRef.current) return;
      const now = Date.now();
      const lastActivityAt = readLastActivityAt(window.localStorage, now);
      const remaining = computeRemainingMs(now, lastActivityAt);

      if (isTimedOut(remaining)) {
        void runLogout('idle-timeout');
        return;
      }

      setRemainingMs(shouldWarn(remaining) ? remaining : null);
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [broadcast, handleIncoming, navigateToLogin, performServerLogout]);

  const handleContinue = useCallback(() => {
    writeLastActivityAt(window.localStorage, Date.now());
    setRemainingMs(null);
    broadcast('activity', 'manual-continue');
  }, [broadcast]);

  const open = remainingMs !== null;
  const seconds = open ? Math.max(0, Math.ceil((remainingMs as number) / 1000)) : 0;

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>长时间无操作，即将自动退出登录</DialogTitle>
          <DialogDescription>为保障账号安全，检测到您已有一段时间没有操作，将在 {seconds} 秒后自动退出登录。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleContinue}>继续操作</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
