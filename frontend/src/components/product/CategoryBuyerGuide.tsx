import type { Locale } from '@/lib/i18n/locales';

const GUIDES = {
  'under-sink-ro-water-purifiers': {
    en: {
      title: 'How B2B Buyers Compare Under-Sink RO Systems',
      intro: 'Shortlist models using verified installation, capacity and maintenance requirements rather than model appearance alone.',
      items: [
        ['Tank or tankless', 'Confirm available cabinet space, peak demand and preferred dispensing response.'],
        ['Rated capacity', 'Compare GPD and flow only under the stated inlet-water, pressure and temperature conditions.'],
        ['Filter configuration', 'Check cartridge format, replacement supply and maintenance requirements for the destination market.'],
      ],
    },
    es: {
      title: 'Cómo Comparan los Compradores B2B los Sistemas RO Bajo Fregadero',
      intro: 'Seleccione modelos según la instalación, capacidad y mantenimiento verificados, no solo por la apariencia.',
      items: [
        ['Con tanque o sin tanque', 'Confirme el espacio, la demanda máxima y la respuesta de dispensado.'],
        ['Capacidad nominal', 'Compare GPD y caudal bajo las condiciones declaradas de agua, presión y temperatura.'],
        ['Configuración de filtros', 'Revise el formato del cartucho, el suministro de repuestos y el mantenimiento.'],
      ],
    },
  },
  'countertop-ro-water-purifiers': {
    en: {
      title: 'How B2B Buyers Compare Countertop RO Purifiers',
      intro: 'Confirm the intended market, water source, heating functions, tank format and control requirements before selecting a model.',
      items: [
        ['Installation', 'Confirm countertop space, feed-water method and plug-and-use requirements.'],
        ['Heating and dispensing', 'Compare only the temperatures, outlets and controls documented for the exact model.'],
        ['Service planning', 'Confirm removable parts, filter supply, manuals and destination-market electrical requirements.'],
      ],
    },
    es: {
      title: 'Cómo Comparan los Compradores B2B los Purificadores RO de Encimera',
      intro: 'Confirme el mercado, la fuente de agua, el calentamiento, el depósito y el control antes de elegir.',
      items: [
        ['Instalación', 'Confirme el espacio, la alimentación de agua y los requisitos de conexión.'],
        ['Calentamiento y dispensado', 'Compare solo temperaturas, salidas y controles documentados para el modelo.'],
        ['Plan de servicio', 'Confirme piezas desmontables, filtros, manuales y requisitos eléctricos.'],
      ],
    },
  },
  'commercial-ro-water-purification-systems': {
    en: {
      title: 'Information Required Before Commercial RO Selection',
      intro: 'Commercial system selection should begin with project data. A capacity number alone is not enough for a reliable quotation.',
      items: [
        ['Feed water', 'Provide the water source, available analysis, TDS, hardness, pressure and temperature.'],
        ['Demand profile', 'Provide daily demand, peak flow, operating hours and required product-water quality.'],
        ['Site and compliance', 'Confirm power, installation space, pretreatment, destination market and documentation requirements.'],
      ],
    },
    es: {
      title: 'Información Necesaria Antes de Seleccionar un Sistema RO Comercial',
      intro: 'La selección debe comenzar con datos del proyecto; la capacidad nominal por sí sola no basta.',
      items: [
        ['Agua de alimentación', 'Indique la fuente, análisis disponible, TDS, dureza, presión y temperatura.'],
        ['Perfil de demanda', 'Indique demanda diaria, caudal máximo, horas de operación y calidad requerida.'],
        ['Sitio y cumplimiento', 'Confirme energía, espacio, pretratamiento, mercado y documentos necesarios.'],
      ],
    },
  },
} as const;

export function CategoryBuyerGuide({ slug, locale = 'en' }: { slug: string; locale?: Locale }) {
  const guide = GUIDES[slug as keyof typeof GUIDES]?.[locale];
  if (!guide) return null;

  return (
    <section className="mt-10 rounded-2xl border border-water-100 bg-water-50 p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-navy-950">{guide.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-grey-500">{guide.intro}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {guide.items.map(([title, description]) => (
          <div key={title} className="rounded-lg bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-navy-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-grey-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
