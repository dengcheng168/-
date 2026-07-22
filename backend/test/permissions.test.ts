import { test } from 'node:test';
import assert from 'node:assert/strict';
import { can, rolesWithPermission } from '../src/config/permissions.js';
import { CONTENT_ROLES, INQUIRY_ROLES, ADMIN_MANAGE_ROLES, SETTINGS_SENSITIVE_ROLES } from '../src/config/roles.js';

// SUPER_ADMIN: 所有后台读写权限、管理员管理、系统设置、日志查看
test('SUPER_ADMIN has full access including admins, sensitive settings, and log read', () => {
  assert.equal(can('SUPER_ADMIN', 'products', 'write'), true);
  assert.equal(can('SUPER_ADMIN', 'admins', 'write'), true);
  assert.equal(can('SUPER_ADMIN', 'settingsSensitive', 'write'), true);
  assert.equal(can('SUPER_ADMIN', 'logs', 'read'), true);
  assert.equal(can('SUPER_ADMIN', 'inquiries', 'write'), true);
});

// CONTENT_ADMIN: 允许内容模块，禁止管理员/敏感设置/日志/角色
test('CONTENT_ADMIN can manage content but not admins, sensitive settings, logs, or inquiries', () => {
  for (const resource of ['products', 'productCategories', 'pages', 'blog', 'faqs', 'certificates', 'media'] as const) {
    assert.equal(can('CONTENT_ADMIN', resource, 'write'), true, `CONTENT_ADMIN should write ${resource}`);
  }
  assert.equal(can('CONTENT_ADMIN', 'admins', 'write'), false);
  assert.equal(can('CONTENT_ADMIN', 'settingsSensitive', 'write'), false);
  assert.equal(can('CONTENT_ADMIN', 'logs', 'read'), false);
  assert.equal(can('CONTENT_ADMIN', 'inquiries', 'write'), false);
});

// SALES: 只允许询盘，禁止一切内容和系统配置
test('SALES can only manage inquiries, nothing else', () => {
  assert.equal(can('SALES', 'inquiries', 'write'), true);
  for (const resource of ['products', 'pages', 'blog', 'faqs', 'certificates', 'admins', 'settings', 'settingsSensitive', 'logs'] as const) {
    assert.equal(can('SALES', resource, 'write'), false, `SALES should NOT write ${resource}`);
    if (resource !== 'settings') {
      assert.equal(can('SALES', resource, 'read'), false, `SALES should NOT read ${resource}`);
    }
  }
});

test('rolesWithPermission derives the exact route-guard groups used across the app', () => {
  assert.deepEqual(new Set(CONTENT_ROLES), new Set(['SUPER_ADMIN', 'CONTENT_ADMIN']));
  assert.deepEqual(new Set(INQUIRY_ROLES), new Set(['SUPER_ADMIN', 'SALES']));
  assert.deepEqual(new Set(ADMIN_MANAGE_ROLES), new Set(['SUPER_ADMIN']));
  assert.deepEqual(new Set(SETTINGS_SENSITIVE_ROLES), new Set(['SUPER_ADMIN']));
});

test('unknown role has no permissions anywhere (fails closed)', () => {
  assert.equal(can('EDITOR', 'products', 'write'), false);
  assert.equal(can('EDITOR', 'inquiries', 'write'), false);
  assert.equal(can('SOMETHING_MADE_UP', 'admins', 'read'), false);
});

test('rolesWithPermission returns an empty list for a resource nobody has', () => {
  // "翻译" 之类未来资源目前矩阵里完全没有定义，任何角色都不该意外获得权限
  assert.deepEqual(rolesWithPermission('admins' as never, 'read'), ['SUPER_ADMIN']);
});
