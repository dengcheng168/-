import type { FastifyInstance } from 'fastify';
import { requireRole } from '../../middleware/require-role.js';
import { ADMIN_MANAGE_ROLES } from '../../config/roles.js';
import {
  adminUserListHandler,
  adminUserDetailHandler,
  adminUserCreateHandler,
  adminUserUpdateHandler,
  adminUserResetPasswordHandler,
  adminUserUnlockHandler,
  adminUserRevokeSessionsHandler,
} from './admin-users.controller.js';

export async function adminUserRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', requireRole(ADMIN_MANAGE_ROLES));

  app.get('/admin-users', adminUserListHandler);
  app.post('/admin-users', adminUserCreateHandler);
  app.get('/admin-users/:id', adminUserDetailHandler);
  app.patch('/admin-users/:id', adminUserUpdateHandler);
  app.post('/admin-users/:id/reset-password', adminUserResetPasswordHandler);
  app.post('/admin-users/:id/unlock', adminUserUnlockHandler);
  app.post('/admin-users/:id/revoke-sessions', adminUserRevokeSessionsHandler);
}
