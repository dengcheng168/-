export type MetaRouteEvent = {
  name: 'PageView' | 'ViewContent';
  parameters: Record<string, string | string[]>;
  eventID: string;
};

export function createMetaEventId(prefix: string, randomId: () => string): string {
  return `${prefix}_${randomId()}`;
}

/** Builds the page events once per eligible App Router pathname. */
export function buildMetaRouteEvents(
  pathname: string,
  locale: string,
  randomId: () => string,
): MetaRouteEvent[] {
  const events: MetaRouteEvent[] = [{
    name: 'PageView',
    parameters: { page_language: locale, page_path: pathname },
    eventID: createMetaEventId('pageview', randomId),
  }];
  const productMatch = pathname.match(/^\/(?:es\/)?products\/([^/]+)$/);
  if (productMatch) {
    events.push({
      name: 'ViewContent',
      parameters: {
        content_type: 'product',
        content_ids: [decodeURIComponent(productMatch[1])],
        page_path: pathname,
      },
      eventID: createMetaEventId('viewcontent', randomId),
    });
  }
  return events;
}

/** Sends the events built above through the real fbq call shape. */
export function sendMetaRouteEvents(input: {
  pathname: string;
  locale: string;
  randomId: () => string;
  track: (command: 'track', name: MetaRouteEvent['name'], parameters: MetaRouteEvent['parameters'], options: { eventID: string }) => void;
}): void {
  for (const event of buildMetaRouteEvents(input.pathname, input.locale, input.randomId)) {
    input.track('track', event.name, event.parameters, { eventID: event.eventID });
  }
}

/** Schedules one route-send without losing it when the Pixel bootstrap is delayed. */
export function waitForMetaPixelReady(input: {
  isReady: () => boolean;
  addReadyListener: (listener: () => void) => void;
  removeReadyListener: (listener: () => void) => void;
  send: () => void;
}): () => void {
  let disposed = false;
  let sent = false;
  const sendOnce = () => {
    if (disposed || sent) return;
    sent = true;
    input.send();
  };
  if (input.isReady()) sendOnce();
  else input.addReadyListener(sendOnce);
  return () => {
    disposed = true;
    input.removeReadyListener(sendOnce);
  };
}
