import type { PrismaClient } from '@prisma/client';
import { toSkipTake, buildPaginationMeta, type PaginationQuery } from '../../lib/pagination.js';
import type { CreateRedirectInput, UpdateRedirectInput } from './redirects.schema.js';
import { isRedirectPath } from './redirect-path.js';

export async function listAdminRedirects(prisma: PrismaClient, query: PaginationQuery) {
  const [items, total] = await Promise.all([
    prisma.redirect.findMany({ orderBy: { createdAt: 'desc' }, ...toSkipTake(query) }),
    prisma.redirect.count(),
  ]);
  return { items, meta: buildPaginationMeta(query, total) };
}

export async function createRedirect(prisma: PrismaClient, input: CreateRedirectInput) {
  await assertNoRedirectCycle(prisma, input.fromPath, input.toPath);
  return prisma.redirect.create({ data: input });
}

export async function updateRedirect(prisma: PrismaClient, id: number, input: UpdateRedirectInput) {
  const existing = await prisma.redirect.findUniqueOrThrow({ where: { id } });
  await assertNoRedirectCycle(prisma, input.fromPath ?? existing.fromPath, input.toPath ?? existing.toPath, id);
  return prisma.redirect.update({ where: { id }, data: input });
}

async function assertNoRedirectCycle(prisma: PrismaClient, fromPath: string, toPath: string, excludeId?: number) {
  const visited = new Set([fromPath]);
  let path = toPath;
  for (let hop = 0; hop < 10; hop++) {
    if (visited.has(path)) break;
    visited.add(path);
    const next = await findRedirectByFromPath(prisma, path);
    if (!next || next.id === excludeId) return;
    path = next.toPath;
  }
  throw Object.assign(new Error('重定向会形成循环或链路过长，请修改目标路径'), { statusCode: 400 });
}

export function deleteRedirect(prisma: PrismaClient, id: number) {
  return prisma.redirect.delete({ where: { id } });
}

export function findRedirectByFromPath(prisma: PrismaClient, fromPath: string) {
  return prisma.redirect.findUnique({ where: { fromPath } });
}

/** Resolve a bounded chain before emitting any redirect, including legacy rows.
 * Invalid or cyclic data must never put visitors in a redirect loop.
 */
export async function resolvePublicRedirect(prisma: PrismaClient, fromPath: string) {
  return resolveWithLookup(fromPath, (path) => findRedirectByFromPath(prisma, path));
}

type PublicRule = { toPath: string; statusCode: number };

/** One bounded batch per chain depth, never one HTTP request per sitemap URL. */
export async function resolvePublicRedirectBatch(prisma: PrismaClient, paths: string[]) {
  const unique = [...new Set(paths)];
  const rows = new Map<string, PublicRule | null>();
  let frontier = unique;
  for (let hop = 0; hop < 10 && frontier.length; hop++) {
    const queries = [...new Set(frontier.filter((path) => isRedirectPath(path) && !rows.has(path)))];
    if (queries.length) {
      const found = await prisma.redirect.findMany({
        where: { fromPath: { in: queries } },
        select: { fromPath: true, toPath: true, statusCode: true },
      });
      queries.forEach((path) => rows.set(path, null));
      found.forEach((row) => rows.set(row.fromPath, row));
    }
    frontier = [...new Set(frontier.flatMap((path) => {
      const next = rows.get(path)?.toPath;
      return next && isRedirectPath(next) ? [next] : [];
    }))];
  }
  return Promise.all(unique.map(async (path) => ({
    path, redirect: await resolveWithLookup(path, async (key) => rows.get(key) ?? null),
  })));
}

async function resolveWithLookup(fromPath: string, lookup: (path: string) => Promise<PublicRule | null>) {
  if (!isRedirectPath(fromPath)) return null;
  const visited = new Set<string>();
  let path = fromPath;
  let statusCode: 301 | 302 = 301;
  for (let hop = 0; hop < 10; hop++) {
    if (visited.has(path)) return null;
    visited.add(path);
    const row = await lookup(path);
    if (!row) return path === fromPath ? null : { toPath: path, statusCode };
    if (!isRedirectPath(row.toPath) || ![301, 302].includes(row.statusCode)) return null;
    if (row.statusCode === 302) statusCode = 302;
    path = row.toPath;
  }
  return null;
}
