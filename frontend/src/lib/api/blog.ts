import { apiFetch, type ApiMeta } from './client';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { BlogPost, BlogCategory, BlogTag } from '@/types/blog';

export interface BlogListParams {
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export function resolveBlogMedia(post: BlogPost): BlogPost {
  return { ...post, coverImage: post.coverImage ? resolveMediaUrl(post.coverImage) : post.coverImage };
}

export async function listBlogPosts(params: BlogListParams = {}): Promise<{ items: BlogPost[]; meta?: ApiMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.tag) search.set('tag', params.tag);
  if (params.q) search.set('q', params.q);
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));

  const qs = search.toString();
  try {
    const { data, meta } = await apiFetch<BlogPost[]>(`/blog${qs ? `?${qs}` : ''}`, {
      revalidate: 60,
      tags: ['blog'],
    });
    return { items: data.map(resolveBlogMedia), meta };
  } catch {
    // 构建期后端不可达时的兜底：见 lib/api/settings.ts 顶部注释
    return { items: [] };
  }
}

export async function getBlogPostBySlug(slug: string): Promise<{ post: BlogPost; related: BlogPost[] } | null> {
  try {
    const { data } = await apiFetch<{ post: BlogPost; related: BlogPost[] }>(`/blog/${slug}`, {
      revalidate: 60,
      tags: ['blog', `blog:${slug}`],
    });
    return { post: resolveBlogMedia(data.post), related: data.related.map(resolveBlogMedia) };
  } catch {
    return null;
  }
}

export async function listBlogCategories(): Promise<BlogCategory[]> {
  try {
    const { data } = await apiFetch<BlogCategory[]>('/blog-categories', { revalidate: 300, tags: ['blog-categories'] });
    return data;
  } catch {
    return [];
  }
}

export async function listBlogTags(): Promise<BlogTag[]> {
  try {
    const { data } = await apiFetch<BlogTag[]>('/blog-tags', { revalidate: 300, tags: ['blog-tags'] });
    return data;
  } catch {
    return [];
  }
}
