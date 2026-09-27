import assert from 'node:assert/strict';
import { test } from 'node:test';
import { updateCertificateSchema } from '../src/modules/certificates/certificates.schema.js';

test('certificate dates distinguish clearing from omission', () => {
  assert.deepEqual(updateCertificateSchema.parse({ issueDate: null, expiryDate: null }), { issueDate: null, expiryDate: null });
  assert.deepEqual(updateCertificateSchema.parse({}), {});
  assert.equal(updateCertificateSchema.parse({ issueDate: '2026-08-28' }).issueDate?.toISOString(), '2026-08-28T00:00:00.000Z');
  assert.equal(updateCertificateSchema.safeParse({ issueDate: 'invalid' }).success, false);
});

test('clearing certificate dates persists null in SQLite', async () => {
  const { buildApp } = await import('../src/app.js');
  const { updateCertificate } = await import('../src/modules/certificates/certificates.service.js');
  const app = await buildApp();
  try {
    const row = await app.prisma.certificate.create({ data: { name: 'Date regression', imageUrl: '/uploads/test.webp', issueDate: new Date(), expiryDate: new Date() } });
    await updateCertificate(app.prisma, row.id, updateCertificateSchema.parse({ issueDate: null, expiryDate: null }));
    const saved = await app.prisma.certificate.findUniqueOrThrow({ where: { id: row.id } });
    assert.equal(saved.issueDate, null);
    assert.equal(saved.expiryDate, null);
  } finally { await app.close(); }
});

test('certificate applicability scope is stored as JSON but exposed as a string array', async () => {
  const { buildApp } = await import('../src/app.js');
  const { getCertificateById, updateCertificate } = await import('../src/modules/certificates/certificates.service.js');
  const app = await buildApp();
  try {
    const row = await app.prisma.certificate.create({ data: { name: 'Scope regression', imageUrl: '/uploads/test.webp' } });
    await updateCertificate(app.prisma, row.id, updateCertificateSchema.parse({
      applicableProductType: 'UV sterilizer',
      applicableModels: ['UV-01', 'UV-02'],
    }));
    const raw = await app.prisma.certificate.findUniqueOrThrow({ where: { id: row.id } });
    assert.equal(raw.applicableModels, '["UV-01","UV-02"]');
    const publicShape = await getCertificateById(app.prisma, row.id);
    assert.deepEqual(publicShape?.applicableModels, ['UV-01', 'UV-02']);
  } finally { await app.close(); }
});
