import Image from 'next/image';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import type { Certificate } from '@/types/content';
import { getCertificateDisplayMeta, localizeCertMeta } from '@/lib/certificates/display-config';

function formatDate(dateStr: string | null, locale: Locale) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CertificateCard({
  certificate,
  locale = 'en',
  muted = false,
}: {
  certificate: Certificate;
  locale?: Locale;
  muted?: boolean;
}) {
  const rawMeta = getCertificateDisplayMeta(certificate.id);
  const meta = rawMeta ? localizeCertMeta(rawMeta, locale) : null;
  const issuedLabel = formatDate(certificate.issueDate, locale);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow ${
        muted ? 'border-grey-200 opacity-80' : 'border-grey-200 hover:shadow-lg'
      }`}
    >
      <div className="overflow-hidden bg-grey-50">
        <Image
          src={certificate.imageUrl}
          alt={certificate.name}
          width={0}
          height={0}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="h-auto w-full"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {certificate.issuingAuthority && (
          <span className="text-xs font-medium uppercase tracking-wide text-water-600">{certificate.issuingAuthority}</span>
        )}
        <h3 className="mt-1 text-base font-semibold leading-snug text-navy-950">{certificate.name}</h3>
        {certificate.certNumber && (
          <p className="mt-1 text-xs text-grey-500">
            {t(locale, 'certNumberPrefix')} {certificate.certNumber}
          </p>
        )}
        {issuedLabel && (
          <p className="mt-1 text-xs text-grey-500">
            {t(locale, 'issuedLabel')} {issuedLabel}
          </p>
        )}

        {meta && (
          <div className="mt-3 space-y-1.5 border-t border-grey-100 pt-3 text-xs text-grey-600">
            <p>
              <span className="font-semibold text-navy-950">{t(locale, 'certApplicableProductType')}: </span>
              {meta.productType}
            </p>
            <p>
              <span className="font-semibold text-navy-950">{t(locale, 'certApplicableModels')}: </span>
              {meta.models ? meta.models.join(', ') : t(locale, 'certModelsReferScope')}
            </p>
            {meta.status && (
              <p>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                    meta.group === 'historical' ? 'bg-grey-200 text-grey-700' : 'bg-water-50 text-water-700'
                  }`}
                >
                  {meta.status}
                </span>
              </p>
            )}
            {meta.expiredOn && (
              <p>
                <span className="font-semibold text-navy-950">{t(locale, 'certExpiryLabel')}: </span>
                {meta.expiredOn}
              </p>
            )}
          </div>
        )}

        {certificate.description && <p className="mt-3 line-clamp-3 text-sm text-grey-500">{certificate.description}</p>}

        {certificate.pdfUrl && (
          <a
            href={certificate.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm font-medium text-water-600 hover:underline"
          >
            {t(locale, 'viewPdf')}
          </a>
        )}
      </div>
    </div>
  );
}
