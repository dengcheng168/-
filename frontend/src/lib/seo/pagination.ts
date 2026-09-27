/** Build a stable, self-referencing URL for indexable paginated archive pages. */
export function paginatedPath(basePath: string, pageParam?: string): string {
  const page = Number(pageParam);
  return Number.isInteger(page) && page > 1 ? `${basePath}?page=${page}` : basePath;
}

export function paginatedTitle(baseTitle: string, pageParam?: string, locale: 'en' | 'es' = 'en'): string {
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page <= 1) return baseTitle;
  return `${baseTitle} - ${locale === 'es' ? 'Página' : 'Page'} ${page}`;
}

export function paginatedDescription(description: string | undefined, pageParam?: string, locale: 'en' | 'es' = 'en'): string | undefined {
  if (!description) return undefined;
  const page = Number(pageParam);
  if (!Number.isInteger(page) || page <= 1) return description;
  return `${description} ${locale === 'es' ? 'Página' : 'Page'} ${page}.`;
}
