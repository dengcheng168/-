import { apiFetch } from './client';
import type { NavigationItem } from '@/types/navigation';

export async function getNavigation(): Promise<NavigationItem[]> {
  try {
    const { data } = await apiFetch<NavigationItem[]>('/navigation', { revalidate: 300, tags: ['navigation'] });
    return data;
  } catch {
    // 构建期后端不可达时的兜底：见 lib/api/settings.ts 顶部注释
    return [];
  }
}
