import { createHash } from 'node:crypto';

export interface MetaInquiryEvents {
  pixelId?: string | null;
  accessToken?: string | null;
  apiVersion?: string | null;
  eventId: string;
  eventTime: Date;
  eventSourceUrl: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  country?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  productName?: string | null;
}

type FetchLike = typeof fetch;

/** Error safe to put in application logs: it deliberately carries no request data. */
export class MetaConversionError extends Error {
  constructor(
    public readonly status: number | undefined,
    public readonly code: string,
  ) {
    super(`Meta CAPI delivery failed${status ? ` (${status})` : ''}: ${code}`);
    this.name = 'MetaConversionError';
  }
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const clean = (value?: string | null) => value?.trim() || '';

function hashEmail(value: string) {
  return sha256(value.trim().toLowerCase());
}

function hashPhone(value?: string | null) {
  const normalized = clean(value).replace(/\D/g, '');
  return normalized ? sha256(normalized) : undefined;
}

function hashFirstName(value?: string | null) {
  const normalized = clean(value).toLowerCase().split(/\s+/)[0];
  return normalized ? sha256(normalized) : undefined;
}

function hashLastName(value?: string | null) {
  const parts = clean(value).toLowerCase().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? sha256(parts.at(-1)!) : undefined;
}

function hashCountry(value?: string | null) {
  const normalized = clean(value).toLowerCase().replace(/[._-]+/g, ' ').replace(/\s+/g, ' ');
  const countryCodes: Record<string, string> = {
    china: 'cn', 'people s republic of china': 'cn', prc: 'cn',
    'united states': 'us', 'united states of america': 'us', usa: 'us',
    'united kingdom': 'gb', uk: 'gb', 'great britain': 'gb',
    spain: 'es', mexico: 'mx', canada: 'ca', australia: 'au',
    germany: 'de', france: 'fr', italy: 'it', netherlands: 'nl',
    singapore: 'sg', philippines: 'ph', indonesia: 'id', malaysia: 'my',
    thailand: 'th', vietnam: 'vn', india: 'in', 'united arab emirates': 'ae', uae: 'ae',
    'saudi arabia': 'sa', egypt: 'eg', brazil: 'br', chile: 'cl', peru: 'pe',
  };
  const code = /^[a-z]{2}$/.test(normalized) ? normalized : countryCodes[normalized];
  return code ? sha256(code) : undefined;
}

export async function sendMetaInquiryEvents(
  input: MetaInquiryEvents,
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  const pixelId = clean(input.pixelId);
  const accessToken = clean(input.accessToken);
  if (!/^\d+$/.test(pixelId) || !accessToken || !input.eventId || !input.email) return false;

  const userData: Record<string, string | string[]> = {
    em: [hashEmail(input.email)],
  };
  const optionalHashed = {
    ph: hashPhone(input.phone),
    fn: hashFirstName(input.firstName),
    country: hashCountry(input.country),
  };
  for (const [key, value] of Object.entries(optionalHashed)) {
    if (value) userData[key] = [value];
  }
  if (clean(input.fbp)) userData.fbp = clean(input.fbp);
  if (clean(input.fbc)) userData.fbc = clean(input.fbc);
  if (clean(input.clientIpAddress)) userData.client_ip_address = clean(input.clientIpAddress);
  if (clean(input.clientUserAgent)) userData.client_user_agent = clean(input.clientUserAgent);

  const eventTime = Math.floor(input.eventTime.getTime() / 1000);
  const common = {
    event_time: eventTime,
    event_source_url: input.eventSourceUrl,
    action_source: 'website',
    user_data: userData,
  };
  const endpoint = new URL(
    `https://graph.facebook.com/${clean(input.apiVersion) || 'v23.0'}/${pixelId}/events`,
  );
  endpoint.searchParams.set('access_token', accessToken);

  // A successful form submission is a Lead, not a generic Contact click. Keeping
  // Contact exclusively for contact-entry clicks prevents funnel inflation.
  const body = JSON.stringify({
    data: [{
      ...common,
      event_name: 'Lead',
      event_id: input.eventId,
      custom_data: {
        lead_type: 'B2B_inquiry_form_submission',
        ...(clean(input.productName) ? { content_name: clean(input.productName) } : {}),
      },
    }],
  });

  // One bounded retry covers transient network and Meta 5xx/rate-limit failures.
  // The identical event_id makes a retry safe if the first response was lost.
  let lastError: MetaConversionError | undefined;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(3000),
      });
      let responseBody: { events_received?: unknown; error?: { code?: unknown } } | undefined;
      try { responseBody = await response.json() as typeof responseBody; } catch { /* response is not JSON */ }

      if (response.ok && responseBody?.events_received === 1) return true;

      const code = typeof responseBody?.error?.code === 'number'
        ? `meta_${responseBody.error.code}`
        : response.ok ? 'unexpected_events_received' : 'http_error';
      const error = new MetaConversionError(response.status, code);
      if (attempt === 0 && (response.status === 408 || response.status === 429 || response.status >= 500)) {
        lastError = error;
        continue;
      }
      throw error;
    } catch (err) {
      const error = err instanceof MetaConversionError
        ? err
        : new MetaConversionError(undefined, 'network_error');
      if (attempt === 0 && error.code === 'network_error') {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  throw lastError ?? new MetaConversionError(undefined, 'unknown_error');
}

export async function sendMetaQualityEvent(input: {
  prisma: import('@prisma/client').PrismaClient;
  eventName: 'QualifiedLead' | 'QuoteProvided' | 'SaleWon';
  eventId: string;
  eventTime: Date;
  sourceUrl?: string | null;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  country?: string | null;
  customData?: Record<string, unknown>;
}): Promise<boolean> {
  const { env } = await import('../config/env.js');
  if (!env.META_CAPI_ACCESS_TOKEN) return false;
  const settings = await input.prisma.siteSetting.findUnique({
    where: { id: 1 },
    select: { metaPixelId: true, siteBaseUrl: true },
  });
  const pixelId = clean(settings?.metaPixelId);
  if (!/^\d+$/.test(pixelId) || !settings?.siteBaseUrl) return false;
  const userData: Record<string, string[]> = {
    em: [hashEmail(input.email)],
    external_id: [hashEmail(input.email)],
  };
  const optional = {
    ph: hashPhone(input.phone),
    fn: hashFirstName(input.firstName),
    ln: hashLastName(input.firstName),
    country: hashCountry(input.country),
  };
  for (const [key, value] of Object.entries(optional)) if (value) userData[key] = [value];
  const endpoint = new URL(`https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${pixelId}/events`);
  endpoint.searchParams.set('access_token', env.META_CAPI_ACCESS_TOKEN);
  const sourcePath = input.sourceUrl?.startsWith('/') ? input.sourceUrl : '/contact';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: input.eventName,
        event_id: input.eventId,
        event_time: Math.floor(input.eventTime.getTime() / 1000),
        event_source_url: new URL(sourcePath, settings.siteBaseUrl).toString(),
        action_source: 'website',
        user_data: userData,
        custom_data: input.customData ?? {},
      }],
    }),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`Meta Conversions API returned ${response.status}`);
  return true;
}
