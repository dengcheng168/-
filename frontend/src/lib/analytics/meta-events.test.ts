import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMetaRouteEvents, sendMetaRouteEvents, waitForMetaPixelReady } from './meta-events';

test('creates one PageView with an event ID for a regular page', () => {
  const events = buildMetaRouteEvents('/about', 'en', () => 'one');
  assert.deepEqual(events, [{
    name: 'PageView',
    parameters: { page_language: 'en', page_path: '/about' },
    eventID: 'pageview_one',
  }]);
});

test('creates PageView and one product-specific ViewContent for supported product routes', () => {
  const ids = ['one', 'two'];
  const events = buildMetaRouteEvents('/es/products/compact-ro-600g', 'es', () => ids.shift()!);
  assert.equal(events.length, 2);
  assert.deepEqual(events[1], {
    name: 'ViewContent',
    parameters: {
      content_type: 'product',
      content_ids: ['compact-ro-600g'],
      page_path: '/es/products/compact-ro-600g',
    },
    eventID: 'viewcontent_two',
  });
});

test('does not treat product indexes or categories as ViewContent', () => {
  for (const pathname of ['/products', '/products/category/under-sink', '/es/products/category/under-sink']) {
    assert.equal(buildMetaRouteEvents(pathname, 'en', () => 'id').length, 1, pathname);
  }
});

test('sends one PageView and one product ViewContent through the fbq call shape', () => {
  const calls: unknown[][] = [];
  const ids = ['page', 'product'];
  sendMetaRouteEvents({
    pathname: '/products/compact-ro-600g',
    locale: 'en',
    randomId: () => ids.shift()!,
    track: (...args) => { calls.push(args); },
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0][1], 'PageView');
  assert.deepEqual(calls[0][3], { eventID: 'pageview_page' });
  assert.equal(calls[1][1], 'ViewContent');
  assert.deepEqual(calls[1][3], { eventID: 'viewcontent_product' });
});

test('delivers a delayed route event once after the Pixel readiness signal', () => {
  let ready = false;
  let listener: (() => void) | undefined;
  let sends = 0;
  const dispose = waitForMetaPixelReady({
    isReady: () => ready,
    addReadyListener: (next) => { listener = next; },
    removeReadyListener: (next) => { if (listener === next) listener = undefined; },
    send: () => { sends += 1; },
  });
  assert.equal(sends, 0);
  ready = true;
  listener?.();
  listener?.();
  assert.equal(sends, 1);
  dispose();
});

test('does not emit a route event after its React effect has been disposed', () => {
  let listener: (() => void) | undefined;
  let sends = 0;
  const dispose = waitForMetaPixelReady({
    isReady: () => false,
    addReadyListener: (next) => { listener = next; },
    removeReadyListener: () => {},
    send: () => { sends += 1; },
  });
  dispose();
  listener?.();
  assert.equal(sends, 0);
});
