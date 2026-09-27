'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n/locales';

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}
declare global { interface Window { turnstile?: TurnstileApi } }

export function TurnstileWidget({ siteKey, locale, resetSignal, onToken }: {
  siteKey: string; locale: Locale; resetSignal: unknown; onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const api = window.turnstile;
    if (!ready || !api || !container.current) return;
    onToken('');
    const id = api.render(container.current, {
      sitekey: siteKey, language: locale, size: 'flexible', 'response-field': false,
      callback: (token: string) => { setError(false); onToken(token); },
      'expired-callback': () => onToken(''),
      'error-callback': () => { setError(true); onToken(''); },
    });
    return () => { api.remove(id); };
  }, [ready, siteKey, locale, resetSignal, onToken]);

  return <>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      onReady={() => setReady(true)} onError={() => { setError(true); onToken(''); }} />
    <div ref={container} />
    {error && <p role="alert" className="text-sm text-red-600">{locale === 'es'
      ? 'No se pudo cargar la verificación. Actualiza la página e inténtalo de nuevo.'
      : 'Verification could not load. Please refresh the page and try again.'}</p>}
  </>;
}
