'use client';

import { Moon, Sun } from 'lucide-react';
import { useAdminTheme } from './AdminThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '切换为浅色模式' : '切换为深色模式'}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
