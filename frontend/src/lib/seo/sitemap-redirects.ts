import type { MetadataRoute } from 'next';
import { apiFetch } from '../api/client';

export type Redirect = { toPath: string; statusCode: number } | null;
export type ResolvedPath = { path: string; redirect: Redirect };

async function resolveRedirects(paths: string[]): Promise<ResolvedPath[]> {
  const { data } = await apiFetch<ResolvedPath[]>('/redirects/resolve-batch', {
    method: 'POST',
    body: JSON.stringify({ paths }),
    revalidate: 60,
    tags: ['redirects'],
    signal: AbortSignal.timeout(5000),
  });
  return data;
}

/** Resolve public redirect rules in one cached request so UI entry points can avoid linking to redirect sources. */
export async function publicRedirectSourcePaths(paths: string[]): Promise<Set<string>> {
  if (paths.length === 0) return new Set();
  const resolved = await resolveRedirects([...new Set(paths)]);
  return new Set(
    resolved
      .filter((item) => item.redirect && [301, 302].includes(item.redirect.statusCode) && item.redirect.toPath !== item.path)
      .map((item) => item.path),
  );
}

/** Keep redirect sources out of both sitemap URLs and language alternates. */
export async function excludeSitemapRedirects(
  entries: MetadataRoute.Sitemap,
  resolve: (paths: string[]) => Promise<ResolvedPath[]> = resolveRedirects,
): Promise<MetadataRoute.Sitemap> {
  const paths = [...new Set(entries.map((entry) => new URL(entry.url).pathname))];
  const excluded = new Set<string>();
  // Match the API's 200-path cap; today's sitemap needs just one request.
  for (let offset = 0; offset < paths.length; offset += 200) {
    const batch = paths.slice(offset, offset + 200);
    const resolved = new Map((await resolve(batch)).map((item) => [item.path, item.redirect]));
    for (const path of batch) {
      if (!resolved.has(path)) throw new Error('Incomplete sitemap redirect response');
      const rule = resolved.get(path);
      if (rule && [301, 302].includes(rule.statusCode) && rule.toPath !== path) excluded.add(path);
    }
  }
  const retained = entries.filter((entry) => !excluded.has(new URL(entry.url).pathname));
  const urls = new Set(retained.map((entry) => entry.url));
  return retained.map((entry) => {
    if (!entry.alternates?.languages) return entry;
    const languages = Object.fromEntries(
      Object.entries(entry.alternates.languages).filter(([, url]) => url && urls.has(String(url))),
    );
    return { ...entry, alternates: { ...entry.alternates, languages } };
  });
}
