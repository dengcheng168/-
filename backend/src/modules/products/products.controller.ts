import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import {
  listPublicProducts,
  getPublicProductBySlug,
  listAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  updateProductStatus,
  toggleProductFeatured,
  reorderProducts,
  bulkUpdateProductStatus,
} from './products.service.js';
import {
  createProductSchema,
  updateProductSchema,
  reorderSchema,
  bulkStatusSchema,
  productListQuerySchema,
} from './products.schema.js';

export async function publicListHandler(request: FastifyRequest) {
  const query = paginationQuerySchema.parse(request.query);
  const filters = productListQuerySchema.parse(request.query);
  const { items, meta } = await listPublicProducts(request.server.prisma, query, {
    categorySlug: filters.category,
    featured: filters.featured,
    q: filters.q,
  });
  return ok(items, meta);
}

export async function publicDetailHandler(
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply,
) {
  const result = await getPublicProductBySlug(request.server.prisma, request.params.slug);
  if (!result) return reply.status(404).send(fail('产品不存在', 'NOT_FOUND'));
  return ok(result);
}

export async function adminListHandler(
  request: FastifyRequest<{ Querystring: { q?: string; status?: string; categoryId?: string } }>,
) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminProducts(request.server.prisma, query, {
    q: request.query.q,
    status: request.query.status,
    categoryId: request.query.categoryId ? Number(request.query.categoryId) : undefined,
  });
  return ok(items, meta);
}

export async function adminDetailHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const product = await getAdminProductById(request.server.prisma, Number(request.params.id));
  if (!product) return reply.status(404).send(fail('产品不存在', 'NOT_FOUND'));
  return ok(product);
}

export async function adminCreateHandler(request: FastifyRequest) {
  const input = createProductSchema.parse(request.body);
  const product = await createProduct(request.server.prisma, input);
  return ok(product);
}

export async function adminUpdateHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const input = updateProductSchema.parse(request.body);
  const product = await updateProduct(request.server.prisma, Number(request.params.id), input);
  return ok(product);
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  await softDeleteProduct(request.server.prisma, Number(request.params.id));
  return ok({ deleted: true });
}

export async function adminUpdateStatusHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const { status } = updateProductSchema.pick({ status: true }).parse(request.body);
  const product = await updateProductStatus(request.server.prisma, Number(request.params.id), status!);
  return ok(product);
}

export async function adminToggleFeaturedHandler(request: FastifyRequest<{ Params: { id: string } }>) {
  const { featured } = updateProductSchema.pick({ featured: true }).parse(request.body);
  const product = await toggleProductFeatured(request.server.prisma, Number(request.params.id), !!featured);
  return ok(product);
}

export async function adminReorderHandler(request: FastifyRequest) {
  const { items } = reorderSchema.parse(request.body);
  await reorderProducts(request.server.prisma, items);
  return ok({ reordered: true });
}

export async function adminBulkStatusHandler(request: FastifyRequest) {
  const { ids, status } = bulkStatusSchema.parse(request.body);
  await bulkUpdateProductStatus(request.server.prisma, ids, status);
  return ok({ updated: ids.length });
}
