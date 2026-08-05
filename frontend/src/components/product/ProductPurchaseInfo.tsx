export interface PurchaseInfoItem {
  label: string;
  value: string;
}

/** 首屏采购信息卡（MOQ/Packaging/OEM 等），空字段由调用方过滤，不在这里编造占位内容 */
export function ProductPurchaseInfo({ items }: { items: PurchaseInfoItem[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="mt-5 grid overflow-hidden rounded-lg border border-grey-200 bg-grey-50 sm:grid-flow-col sm:auto-cols-fr"
      aria-label="Key purchasing information"
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`px-4 py-3 ${i > 0 ? 'border-t border-grey-200 sm:border-l sm:border-t-0' : ''}`}
        >
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-grey-500">{item.label}</span>
          <span className="mt-1 block text-sm font-bold leading-snug text-navy-950">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
