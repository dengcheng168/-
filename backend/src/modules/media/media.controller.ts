import type { FastifyReply, FastifyRequest } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { paginationQuerySchema } from '../../lib/pagination.js';
import { auditLogFromRequest } from '../../lib/audit-log.js';
import {
  saveUpload,
  listAdminMedia,
  getMediaById,
  updateMediaAltText,
  findMediaUsage,
  deleteMedia,
  UnsupportedFileTypeError,
  MediaInUseError,
} from './media.service.js';

export async function adminUploadHandler(request: FastifyRequest, reply: FastifyReply) {
  const file = await request.file();
  if (!file) {
    return reply.status(400).send(fail('未收到上传文件', 'NO_FILE'));
  }

  const buffer = await file.toBuffer();
  const altField = file.fields.altText as { value?: unknown } | undefined;
  const altText = altField && 'value' in altField ? String(altField.value) : undefined;

  try {
    const media = await saveUpload(request.server.prisma, {
      buffer,
      originalName: file.filename,
      mimeType: file.mimetype,
      uploadedById: request.user.sub,
      altText,
    });
    return ok(media);
  } catch (err) {
    if (err instanceof UnsupportedFileTypeError) {
      return reply.status(400).send(fail(err.message, 'UNSUPPORTED_FILE_TYPE'));
    }
    throw err;
  }
}

export async function adminListHandler(request: FastifyRequest<{ Querystring: { mimeType?: string } }>) {
  const query = paginationQuerySchema.parse(request.query);
  const { items, meta } = await listAdminMedia(request.server.prisma, query, {
    mimeType: request.query.mimeType,
  });
  return ok(items, meta);
}

export async function adminUpdateHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: { altText?: string } }>,
  reply: FastifyReply,
) {
  const media = await getMediaById(request.server.prisma, Number(request.params.id));
  if (!media) return reply.status(404).send(fail('媒体文件不存在', 'NOT_FOUND'));

  const updated = await updateMediaAltText(request.server.prisma, media.id, request.body.altText ?? '');
  await auditLogFromRequest(request.server.prisma, request, {
    action: 'media.update',
    resourceType: 'media',
    resourceId: updated.id,
    summary: `更新媒体文件描述 ${updated.originalName ?? updated.id}`,
    before: { altText: media.altText },
    after: { altText: updated.altText },
  });
  return ok(updated);
}

export async function adminUsageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const media = await getMediaById(request.server.prisma, Number(request.params.id));
  if (!media) return reply.status(404).send(fail('媒体文件不存在', 'NOT_FOUND'));

  const usages = await findMediaUsage(request.server.prisma, media.url);
  return ok({ inUse: usages.length > 0, usages });
}

export async function adminDeleteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const id = Number(request.params.id);
  try {
    await deleteMedia(request.server.prisma, id);
    await auditLogFromRequest(request.server.prisma, request, {
      action: 'media.delete',
      resourceType: 'media',
      resourceId: id,
      summary: `删除媒体文件 #${id}`,
    });
    return ok({ deleted: true });
  } catch (err) {
    if (err instanceof MediaInUseError) {
      return reply.status(409).send(fail(err.message, 'MEDIA_IN_USE'));
    }
    throw err;
  }
}
