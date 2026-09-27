import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { buildMetaPixelBootstrap } from './meta-pixel-bootstrap';

type FbqCall = unknown[];

class HarnessElement {
  constructor(
    readonly href = '',
    private readonly attributes: Record<string, string> = {},
  ) {}

  closest(selector: string) {
    return selector === 'a' ? this : null;
  }

  getAttribute(name: string) {
    return this.attributes[name] ?? null;
  }
}

function runHarness(pathname: string, search = '', initialCookie = '') {
  const clickHandlers: Array<(event: { target: HarnessElement }) => void> = [];
  const readyHandlers: Array<() => void> = [];
  const insertedScripts: Array<{ src?: string; async?: boolean }> = [];
  const browser = {
    location: { pathname, search, protocol: 'https:' },
    crypto: { randomUUID: (() => {
      let id = 0;
      return () => `id-${++id}`;
    })() },
    addEventListener: (name: string, handler: () => void) => {
      if (name === 'meta-pixel-ready') readyHandlers.push(handler);
    },
    dispatchEvent: (event: { type: string }) => {
      if (event.type === 'meta-pixel-ready') readyHandlers.forEach((handler) => handler());
    },
  };
  const document = {
    cookie: initialCookie,
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: { insertBefore: (script: { src?: string; async?: boolean }) => insertedScripts.push(script) } }],
    addEventListener: (name: string, handler: (event: { target: HarnessElement }) => void) => {
      if (name === 'click') clickHandlers.push(handler);
    },
  };
  const context = browser as typeof browser & Record<string, unknown> & {
    window: typeof browser;
    document: typeof document;
    Element: typeof HarnessElement;
    Event: new (type: string) => { type: string };
    decodeURIComponent: typeof decodeURIComponent;
  };
  context.window = browser;
  context.document = document;
  context.Element = HarnessElement;
  context.Event = class { constructor(readonly type: string) {} };
  context.decodeURIComponent = decodeURIComponent;
  context.URLSearchParams = URLSearchParams;
  context.encodeURIComponent = encodeURIComponent;
  context.Date = class extends Date { static now() { return 1_700_000_000_000; } } as DateConstructor;
  vm.runInNewContext(buildMetaPixelBootstrap('1604635384436034'), context);

  const fbq = context.fbq as ((...args: unknown[]) => void) & { queue: FbqCall[] };
  const drainCalls = () => Array.from(fbq.queue, (call) => Array.from(call));
  const click = (href: string, attributes?: Record<string, string>) => {
    clickHandlers.forEach((handler) => handler({ target: new HarnessElement(href, attributes) }));
  };
  return { click, drainCalls, insertedScripts, readyHandlers, browser: context };
}

test('runs the exact MetaPixel bootstrap once and establishes the readiness bridge', () => {
  const harness = runHarness('/');
  assert.equal(harness.browser['__META_PIXEL_ID__'], '1604635384436034');
  assert.equal(harness.browser['__META_PIXEL_READY__'], true);
  assert.equal(typeof harness.browser.fbq, 'function');
  assert.deepEqual(harness.drainCalls(), [['init', '1604635384436034']]);
  assert.equal(harness.insertedScripts.length, 1);
  assert.equal(harness.insertedScripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
});

test('sends exactly one Contact for one WhatsApp click with product context and an event ID', () => {
  const harness = runHarness('/products/compact-ro-600g');
  harness.click('https://wa.me/123456', { 'data-meta-contact-location': 'product_cta' });
  const calls = harness.drainCalls();
  assert.equal(calls.length, 2);
  assert.equal(calls[1][0], 'track');
  assert.equal(calls[1][1], 'Contact');
  const parameters = calls[1][2] as Record<string, unknown>;
  const options = calls[1][3] as Record<string, unknown>;
  assert.equal(parameters.page_path, '/products/compact-ro-600g');
  assert.equal(parameters.contact_location, 'product_cta');
  assert.equal(parameters.content_type, 'product');
  assert.deepEqual(Array.from(parameters.content_ids as string[]), ['compact-ro-600g']);
  assert.equal(parameters.contact_method, 'whatsapp_link');
  assert.equal(options.eventID, 'contact_id-1');
});

test('does not send Contact for a non-contact click', () => {
  const harness = runHarness('/');
  harness.click('https://koigatetech.com/products');
  assert.deepEqual(harness.drainCalls(), [['init', '1604635384436034']]);
});

test('persists a valid fbclid as a first-party _fbc fallback for immediate CAPI use', () => {
  const harness = runHarness('/', '?utm_source=meta&fbclid=AbC_123-xyz');
  assert.match(String(harness.browser.document.cookie), /^_fbc=fb.1.1700000000000.AbC_123-xyz;/);
  assert.match(String(harness.browser.document.cookie), /SameSite=Lax; Secure$/);
});

test('does not overwrite an existing _fbc or persist an invalid fbclid', () => {
  const existing = runHarness('/', '?fbclid=new-click', '_fbp=one; _fbc=fb.1.1.existing');
  assert.equal(existing.browser.document.cookie, '_fbp=one; _fbc=fb.1.1.existing');
  const invalid = runHarness('/', '?fbclid=%3Cscript%3E');
  assert.equal(invalid.browser.document.cookie, '');
});
