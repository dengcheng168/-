import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdminUserSchema, resetPasswordSchema } from '../src/modules/admin-users/admin-users.schema.js';
import { changePasswordSchema } from '../src/modules/account/account.schema.js';
import { loginSchema } from '../src/modules/auth/auth.schema.js';

const NINE_CHARS = '123456789';
const TEN_CHARS = '1234567890';

test('createAdminUserSchema rejects a 9-character password', () => {
  const result = createAdminUserSchema.safeParse({ email: 'a@example.com', password: NINE_CHARS, role: 'SALES' });
  assert.equal(result.success, false);
});

test('createAdminUserSchema accepts a 10-character password', () => {
  const result = createAdminUserSchema.safeParse({ email: 'a@example.com', password: TEN_CHARS, role: 'SALES' });
  assert.equal(result.success, true);
});

test('resetPasswordSchema rejects a 9-character password', () => {
  const result = resetPasswordSchema.safeParse({ newPassword: NINE_CHARS });
  assert.equal(result.success, false);
});

test('resetPasswordSchema accepts a 10-character password', () => {
  const result = resetPasswordSchema.safeParse({ newPassword: TEN_CHARS });
  assert.equal(result.success, true);
});

test('changePasswordSchema (self-service) rejects a 9-character new password', () => {
  const result = changePasswordSchema.safeParse({ currentPassword: 'whatever', newPassword: NINE_CHARS });
  assert.equal(result.success, false);
});

test('changePasswordSchema (self-service) accepts a 10-character new password', () => {
  const result = changePasswordSchema.safeParse({ currentPassword: 'whatever', newPassword: TEN_CHARS });
  assert.equal(result.success, true);
});

test('loginSchema does NOT enforce the 10-character creation-time rule, so existing admins with a shorter legacy password can still log in', () => {
  const result = loginSchema.safeParse({ email: 'a@example.com', password: 'short1' });
  assert.equal(result.success, true, '登录时只要求密码非空，不能因为旧密码短于新规则就把老账号锁在门外');
});

test('loginSchema still rejects a genuinely empty password', () => {
  const result = loginSchema.safeParse({ email: 'a@example.com', password: '' });
  assert.equal(result.success, false);
});
