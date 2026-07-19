import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ok, fail } from '../../lib/api-response.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { updateProfileSchema, changePasswordSchema } from './account.schema.js';

export async function adminAccountRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/account/me', async (request: FastifyRequest) => {
    const user = await request.server.prisma.adminUser.findUnique({
      where: { id: request.user.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    });
    return ok(user);
  });

  app.patch('/account/profile', async (request: FastifyRequest) => {
    const input = updateProfileSchema.parse(request.body);
    const user = await request.server.prisma.adminUser.update({
      where: { id: request.user.sub },
      data: input,
      select: { id: true, email: true, name: true, role: true },
    });
    return ok(user);
  });

  app.patch('/account/password', async (request: FastifyRequest, reply: FastifyReply) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(request.body);

    const user = await request.server.prisma.adminUser.findUnique({ where: { id: request.user.sub } });
    if (!user) return reply.status(404).send(fail('账号不存在', 'NOT_FOUND'));

    const valid = await verifyPassword(user.passwordHash, currentPassword);
    if (!valid) return reply.status(400).send(fail('当前密码不正确', 'INVALID_PASSWORD'));

    const passwordHash = await hashPassword(newPassword);
    await request.server.prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash } });

    return ok({ updated: true });
  });
}
