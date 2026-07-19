import type { FastifyRequest } from 'fastify';
import { ok } from '../../lib/api-response.js';
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
  return ok(await createNavItem(request.server.prisma, createNavItemSchema.parse(request.body)));
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateNavItemSchema.parse(request.body);
  return ok(await updateNavItem(request.server.prisma, Number(request.params.id), input));
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await deleteNavItem(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderNavItems(request.server.prisma, items);
  return ok({ reordered: true });
}
