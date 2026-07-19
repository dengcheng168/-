import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

export default fp(async function prismaPlugin(app: FastifyInstance) {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate('prisma', prisma);

  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
});
