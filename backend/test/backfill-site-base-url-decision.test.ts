import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideSiteBaseUrlBackfill } from '../src/lib/backfill-site-base-url-decision.js';

test('decideSiteBaseUrlBackfill: skips and does not overwrite when a database value already exists', () => {
  const decision = decideSiteBaseUrlBackfill('https://existing.example.com', { SITE_URL: 'https://from-env.example.com' });
  assert.equal(decision.action, 'skip-existing');
  assert.equal((decision as { existingValue: string }).existingValue, 'https://existing.example.com');
});

test('decideSiteBaseUrlBackfill: writes from SITE_URL when database is empty', () => {
  const decision = decideSiteBaseUrlBackfill(null, { SITE_URL: 'https://koigatetech.com' });
  assert.equal(decision.action, 'write');
  assert.equal((decision as { source: string }).source, 'SITE_URL');
  assert.equal((decision as { value: string }).value, 'https://koigatetech.com');
});

test('decideSiteBaseUrlBackfill: SITE_URL takes priority over NEXT_PUBLIC_SITE_URL', () => {
  const decision = decideSiteBaseUrlBackfill(null, {
    SITE_URL: 'https://primary.example.com',
    NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com',
  });
  assert.equal(decision.action, 'write');
  assert.equal((decision as { source: string }).source, 'SITE_URL');
  assert.equal((decision as { value: string }).value, 'https://primary.example.com');
});

test('decideSiteBaseUrlBackfill: falls back to NEXT_PUBLIC_SITE_URL when SITE_URL is absent', () => {
  const decision = decideSiteBaseUrlBackfill(null, { NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com' });
  assert.equal(decision.action, 'write');
  assert.equal((decision as { source: string }).source, 'NEXT_PUBLIC_SITE_URL');
});

test('decideSiteBaseUrlBackfill: falls through to NEXT_PUBLIC_SITE_URL when SITE_URL is invalid', () => {
  const decision = decideSiteBaseUrlBackfill(null, {
    SITE_URL: 'not-a-valid-url',
    NEXT_PUBLIC_SITE_URL: 'https://legacy.example.com',
  });
  assert.equal(decision.action, 'write');
  assert.equal((decision as { source: string }).source, 'NEXT_PUBLIC_SITE_URL');
});

test('decideSiteBaseUrlBackfill: never writes localhost from either environment variable', () => {
  const decision = decideSiteBaseUrlBackfill(null, {
    SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  });
  assert.equal(decision.action, 'skip-no-source');
});

test('decideSiteBaseUrlBackfill: skips with no source when both env vars are missing', () => {
  const decision = decideSiteBaseUrlBackfill(null, {});
  assert.equal(decision.action, 'skip-no-source');
});

test('decideSiteBaseUrlBackfill: is repeatable/idempotent (running it again after a write is now a skip-existing)', () => {
  const first = decideSiteBaseUrlBackfill(null, { SITE_URL: 'https://koigatetech.com' });
  assert.equal(first.action, 'write');
  const writtenValue = (first as { value: string }).value;
  const second = decideSiteBaseUrlBackfill(writtenValue, { SITE_URL: 'https://koigatetech.com' });
  assert.equal(second.action, 'skip-existing');
});
