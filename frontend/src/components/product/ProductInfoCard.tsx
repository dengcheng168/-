export function ProductInfoCard({ title, description }: { title: string; description?: string }) {
  return (
    <article className="min-h-[130px] rounded-lg border border-grey-200 bg-white p-5 shadow-sm">
      <h3 className="text-[17px] font-semibold text-navy-950">{title}</h3>
      {description && <p className="mt-2.5 text-sm leading-[1.7] text-grey-500">{description}</p>}
    </article>
  );
}
