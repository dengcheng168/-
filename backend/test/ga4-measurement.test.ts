import test from 'node:test';
import assert from 'node:assert/strict';
import { sendGa4LeadEvent } from '../src/lib/ga4-measurement.js';

test('sends a privacy-safe GA4 generate_lead event', async () => {
  let requestUrl = '';
  let requestBody = '';
  const fakeFetch = (async (input: URL | RequestInfo, init?: RequestInit) => {
    requestUrl = String(input);
    requestBody = String(init?.body ?? '');
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  const sent = await sendGa4LeadEvent(
    {
      measurementId: 'G-TEST123456',
      apiSecret: 'server-only-secret',
      inquiryId: 42,
      createdAt: new Date('2026-09-10T12:00:00.000Z'),
      sourcePage: '/products/example',
      pageLanguage: 'es',
    },
    fakeFetch,
  );

  assert.equal(sent, true);
  const url = new URL(requestUrl);
  assert.equal(url.searchParams.get('measurement_id'), 'G-TEST123456');
  assert.equal(url.searchParams.get('api_secret'), 'server-only-secret');
  const body = JSON.parse(requestBody);
  assert.equal(body.events[0].name, 'generate_lead');
  assert.equal(body.events[0].params.inquiry_id, 42);
  assert.equal(body.events[0].params.source_page, '/products/example');
  assert.equal(body.events[0].params.page_language, 'es');
  assert.equal(requestBody.includes('email'), false);
  assert.equal(requestBody.includes('name'), true); // event property name only
});

test('does nothing when configuration is missing or invalid', async () => {
  let calls = 0;
  const fakeFetch = (async () => {
    calls += 1;
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  assert.equal(await sendGa4LeadEvent({ inquiryId: 1, createdAt: new Date() }, fakeFetch), false);
  assert.equal(
    await sendGa4LeadEvent(
      { measurementId: 'AW-123', apiSecret: 'secret', inquiryId: 1, createdAt: new Date() },
      fakeFetch,
    ),
    false,
  );
  assert.equal(calls, 0);
});

test('surfaces transport errors to the non-blocking caller', async () => {
  const fakeFetch = (async () => new Response(null, { status: 500 })) as typeof fetch;
  await assert.rejects(
    sendGa4LeadEvent(
      { measurementId: 'G-TEST123456', apiSecret: 'secret', inquiryId: 1, createdAt: new Date() },
      fakeFetch,
    ),
    /returned 500/,
  );
});
