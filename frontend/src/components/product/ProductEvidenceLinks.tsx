import Link from 'next/link';
import type { Locale } from '@/lib/i18n/locales';
import { localeHref } from '@/lib/i18n/paths';

export function ProductEvidenceLinks({ locale = 'en' }: { locale?: Locale }) {
  const items = locale === 'es' ? [
    { href: '/about', title: 'Empresa y Capacidades', description: 'Conozca la cooperación OEM / ODM, la fabricación y la coordinación del control de calidad de Li-Men.' },
    { href: '/certificates', title: 'Certificados y Alcance', description: 'Confirme qué documento corresponde al modelo y mercado seleccionados.' },
  ] : [
    { href: '/about', title: 'Company & Capabilities', description: 'Review Li-Men\'s OEM / ODM cooperation, manufacturing workflow and quality-control coordination.' },
    { href: '/certificates', title: 'Certificates & Scope', description: 'Confirm which document applies to the selected model and market.' },
  ];

  return (
    <section className="mt-12 border-t border-grey-200 pt-8">
      <h2 className="text-center text-2xl font-semibold text-navy-950">
        {locale === 'es' ? 'Información para Compradores B2B' : 'B2B Buyer Information'}
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={localeHref(item.href, locale)} className="rounded-lg border border-grey-200 bg-white p-5 shadow-sm transition hover:border-water-300 hover:shadow-md">
            <h3 className="font-semibold text-navy-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-grey-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
