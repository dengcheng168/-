import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  listVisibleNavigation,
  listAllNavigation,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  reorderNavItems,
} from './navigation.service.js';
import { createNavItemSchema, updateNavItemSchema, reorderSchema } from './navigation.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  return ok(await listVisibleNavigation(request.server.prisma));
}

export async function adminListHandler(request: FastifyRequest) {
  return ok(await listAllNavigation(request.server.prisma));
}

export async function adminCreateHandler(request: FastifyRequest) {
  const item = await createNavItem(request.server.prisma, createNavItemSchema.parse(request.body));
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'navigation_item.create',
    resourceType: 'navigation_item',
    resourceId: item.id,
    summary: `创建导航项 ${item.label}`,
    after: { label: item.label, url: item.url, visible: item.visible },
  });
  return ok(item);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateNavItemSchema.parse(request.body);
  const item = await updateNavItem(request.server.prisma, Number(request.params.id), input);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'navigation_item.update',
    resourceType: 'navigation_item',
    resourceId: item.id,
    summary: `更新导航项 ${item.label}`,
    after: { label: item.label, url: item.url, visible: item.visible },
  });
  return ok(item);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const id = Number(request.params.id);
  await deleteNavItem(request.server.prisma, id);
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'navigation_item.delete',
    resourceType: 'navigation_item',
    resourceId: id,
    summary: `删除导航项 #${id}`,
  });
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderNavItems(request.server.prisma, items);
  return ok({ reordered: true });
}
