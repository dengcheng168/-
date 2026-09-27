import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sendMetaInquiryEvents } from '../src/lib/meta-conversions.js';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

test('sends one deduplicated Lead with normalized hashed customer data', async () => {
  let requestUrl = '';
  let requestBody = '';
  const fakeFetch = (async (input: URL | RequestInfo, init?: RequestInit) => {
    requestUrl = String(input);
    requestBody = String(init?.body ?? '');
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  }) as typeof fetch;

  const sent = await sendMetaInquiryEvents({
    pixelId: '1604635384436034',
    accessToken: 'server-only-token',
    apiVersion: 'v23.0',
    eventId: 'inquiry-123',
    eventTime: new Date('2026-09-14T10:00:00Z'),
    eventSourceUrl: 'https://koigatetech.com/contact',
    email: ' Buyer@Example.com ',
    phone: '+86 138-0013-8000',
    firstName: 'Alice Zhang',
    country: 'CN',
    fbp: 'fb.1.123.456',
    fbc: 'fb.1.123.click',
    clientIpAddress: '203.0.113.9',
    clientUserAgent: 'Example Browser',
    productName: 'RO System',
  }, fakeFetch);

  assert.equal(sent, true);
  const url = new URL(requestUrl);
  assert.equal(url.pathname, '/v23.0/1604635384436034/events');
  assert.equal(url.searchParams.get('access_token'), 'server-only-token');
  const body = JSON.parse(requestBody);
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].event_name, 'Lead');
  assert.equal(body.data[0].event_id, 'inquiry-123');
  assert.deepEqual(body.data[0].user_data.em, [sha256('buyer@example.com')]);
  assert.deepEqual(body.data[0].user_data.ph, [sha256('8613800138000')]);
  assert.deepEqual(body.data[0].user_data.fn, [sha256('alice')]);
  assert.deepEqual(body.data[0].user_data.ln, [sha256('zhang')]);
  assert.deepEqual(body.data[0].user_data.external_id, [sha256('buyer@example.com')]);
  assert.deepEqual(body.data[0].user_data.country, [sha256('cn')]);
  assert.equal(body.data[0].user_data.client_ip_address, '203.0.113.9');
  assert.equal(body.data[0].user_data.client_user_agent, 'Example Browser');
  assert.equal(requestBody.includes('Buyer@Example.com'), false);
  assert.equal(requestBody.includes('+86 138-0013-8000'), false);
});

test('normalizes common country names for Meta advanced matching', async () => {
  let requestBody = '';
  const fakeFetch = (async (_input: URL | RequestInfo, init?: RequestInit) => {
    requestBody = String(init?.body ?? '');
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  }) as typeof fetch;

  await sendMetaInquiryEvents({
    pixelId: '1604635384436034',
    accessToken: 'server-only-token',
    eventId: 'inquiry-country-name',
    eventTime: new Date('2026-09-17T10:00:00Z'),
    eventSourceUrl: 'https://koigatetech.com/contact',
    email: 'buyer@example.com',
    firstName: 'Alice Zhang',
    country: 'China',
  }, fakeFetch);

  const body = JSON.parse(requestBody);
  assert.deepEqual(body.data[0].user_data.country, [sha256('cn')]);
  assert.deepEqual(body.data[0].user_data.ln, [sha256('zhang')]);
});

test('does nothing without valid server-side credentials', async () => {
  let calls = 0;
  const fakeFetch = (async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  const base = {
    eventId: 'inquiry-123',
    eventTime: new Date(),
    eventSourceUrl: 'https://koigatetech.com/contact',
    email: 'buyer@example.com',
  };
  assert.equal(await sendMetaInquiryEvents(base, fakeFetch), false);
  assert.equal(await sendMetaInquiryEvents({ ...base, pixelId: 'bad', accessToken: 'token' }, fakeFetch), false);
  assert.equal(calls, 0);
});

test('retries a transient Meta error once and surfaces a safe error', async () => {
  let calls = 0;
  const fakeFetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ error: { code: 4 } }), { status: 500 });
  }) as typeof fetch;
  await assert.rejects(
    sendMetaInquiryEvents({
      pixelId: '1604635384436034', accessToken: 'token', eventId: 'inquiry-123',
      eventTime: new Date(), eventSourceUrl: 'https://koigatetech.com/contact', email: 'buyer@example.com',
    }, fakeFetch),
    /Meta CAPI delivery failed \(500\): meta_4/,
  );
  assert.equal(calls, 2);
});

test('rejects a successful response that does not acknowledge the expected event', async () => {
  const fakeFetch = (async () => new Response(null, { status: 500 })) as typeof fetch;
  await assert.rejects(
    sendMetaInquiryEvents({
      pixelId: '1604635384436034',
      accessToken: 'token',
      eventId: 'inquiry-123',
      eventTime: new Date(),
      eventSourceUrl: 'https://koigatetech.com/contact',
      email: 'buyer@example.com',
    }, fakeFetch),
    /Meta CAPI delivery failed \(500\): http_error/,
  );
});
