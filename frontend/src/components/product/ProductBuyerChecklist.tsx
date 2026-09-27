import type { Locale } from '@/lib/i18n/locales';
import type { Product } from '@/types/product';

export function ProductBuyerChecklist({ product, locale = 'en' }: { product: Product; locale?: Locale }) {
  const isSpanish = locale === 'es';
  const modelReference = product.sku || product.name;
  const keySpecs = product.specs.slice(0, 3);

  const items = [
    {
      label: isSpanish ? 'Referencia del modelo' : 'Model reference',
      value: modelReference,
    },
    ...(product.category ? [{
      label: isSpanish ? 'Tipo de producto' : 'Product type',
      value: product.category.name,
    }] : []),
    ...keySpecs.map((spec) => ({ label: spec.label, value: spec.value })),
    ...(product.moq ? [{ label: isSpanish ? 'MOQ indicado' : 'Stated MOQ', value: product.moq }] : []),
    ...(product.packagingInfo ? [{
      label: isSpanish ? 'Embalaje indicado' : 'Stated packaging',
      value: product.packagingInfo,
    }] : []),
  ];

  return (
    <section className="mt-12 border-t border-grey-200 pt-8 lg:mt-14 lg:pt-9">
      <div className="rounded-lg border border-water-200 bg-water-50 p-6 sm:p-7">
        <h2 className="text-2xl font-semibold text-navy-950">
          {isSpanish ? 'Lista de verificación para cotizar este modelo' : 'Quote Checklist for This Model'}
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-grey-700">
          {isSpanish
            ? 'Use estos datos al solicitar una cotización y confirme el mercado de destino, el voltaje, la cantidad, el embalaje, la marca privada y los documentos de conformidad requeridos.'
            : 'Use these details when requesting a quotation, and confirm the destination market, voltage, quantity, packaging, private-label requirements and required conformity documents.'}
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-md bg-white p-4 shadow-sm">
              <dt className="text-xs font-bold uppercase tracking-wide text-water-700">{item.label}</dt>
              <dd className="mt-1.5 text-sm leading-6 text-navy-950">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm leading-6 text-grey-700">
          {product.oemOdmSupport
            ? (isSpanish
                ? 'Este modelo admite coordinación OEM / ODM. La viabilidad final depende del alcance de personalización, la cantidad y los requisitos del mercado.'
                : 'This model supports OEM / ODM coordination. Final feasibility depends on the customization scope, order quantity and destination-market requirements.')
            : (isSpanish
                ? 'Confirme con el equipo comercial la disponibilidad de personalización para este modelo antes de finalizar las especificaciones.'
                : 'Confirm customization availability for this model with the sales team before finalizing the specification.')}
        </p>
      </div>
    </section>
  );
}
