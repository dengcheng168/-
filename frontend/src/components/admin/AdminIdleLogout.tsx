'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

// 无操作自动登出：60 分钟内没有任何鼠标/键盘/触摸活动就强制退出登录，最后 1 分钟弹窗倒计时提醒。
// 用 localStorage 记录"最后活动时间"（而不是纯内存状态），同一浏览器里开着的多个后台标签页
// 共享同一个计时基准——在另一个标签页操作也会顺带延长这个标签页的会话，不会互相抢先登出。
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const WARNING_BEFORE_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 1000;
const ACTIVITY_THROTTLE_MS = 5000;
const STORAGE_KEY = 'admin_last_activity_at';
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;

function readLastActivityAt(): number {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function writeLastActivityAt(): void {
  window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

export function AdminIdleLogout() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const warningOpenRef = useRef(false);
  const loggingOutRef = useRef(false);

  useEffect(() => {
    warningOpenRef.current = remainingMs !== null;
  }, [remainingMs]);

  useEffect(() => {
    writeLastActivityAt();

    let lastRun = 0;
    // 警告弹窗弹出期间，普通活动（比如只是把鼠标划过页面）不会静默续期——
    // 必须点"继续操作"按钮显式确认，否则用户离开电脑时鼠标被同事无意碰到也会误续期。
    const handleActivity = () => {
      if (warningOpenRef.current || loggingOutRef.current) return;
      const now = Date.now();
      if (now - lastRun < ACTIVITY_THROTTLE_MS) return;
      lastRun = now;
      writeLastActivityAt();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    const interval = window.setInterval(() => {
      if (loggingOutRef.current) return;
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - readLastActivityAt());

      if (remaining <= 0) {
        loggingOutRef.current = true;
        setRemainingMs(null);
        void logoutAction();
        return;
      }

      setRemainingMs(remaining <= WARNING_BEFORE_MS ? remaining : null);
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      window.clearInterval(interval);
    };
  }, []);

  const handleContinue = useCallback(() => {
    writeLastActivityAt();
    setRemainingMs(null);
  }, []);

  const open = remainingMs !== null;
  const seconds = open ? Math.max(0, Math.ceil(remainingMs / 1000)) : 0;

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
