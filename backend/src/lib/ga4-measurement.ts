export interface Ga4LeadEvent {
  measurementId?: string | null;
  apiSecret?: string | null;
  inquiryId: number;
  createdAt: Date;
  sourcePage?: string | null;
  pageLanguage?: string | null;
}

type FetchLike = typeof fetch;

/**
 * Send a server-side GA4 lead event without exposing the Measurement Protocol
 * secret to the browser. No contact fields or other PII are transmitted.
 *
 * The caller deliberately treats failures as non-fatal: analytics must never
 * change the inquiry API response or prevent an inquiry from being stored.
 */
export async function sendGa4LeadEvent(
  event: Ga4LeadEvent,
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  const measurementId = event.measurementId?.trim();
  const apiSecret = event.apiSecret?.trim();
  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId) || !apiSecret) return false;

  const timestampSeconds = Math.floor(event.createdAt.getTime() / 1000);
  const endpoint = new URL('https://www.google-analytics.com/mp/collect');
  endpoint.searchParams.set('measurement_id', measurementId);
  endpoint.searchParams.set('api_secret', apiSecret);

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: `server.${timestampSeconds}.${event.inquiryId}`,
      timestamp_micros: event.createdAt.getTime() * 1000,
      events: [
        {
          name: 'generate_lead',
          params: {
            engagement_time_msec: 1,
            session_id: timestampSeconds,
            inquiry_id: event.inquiryId,
            source_page: event.sourcePage || '(unknown)',
            page_language: event.pageLanguage || 'en',
          },
        },
      ],
    }),
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) throw new Error(`GA4 Measurement Protocol returned ${response.status}`);
  return true;
}
