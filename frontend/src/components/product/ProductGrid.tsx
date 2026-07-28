import type { Product } from '@/types/product';
import type { Locale } from '@/lib/i18n/locales';
import { t } from '@/lib/i18n/site-strings';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  products,
  locale = 'en',
  center = false,
}: {
  products: Product[];
  locale?: Locale;
  /** 首页"精选产品"预览区想要的效果：不满一行时整组居中。完整目录/分类/搜索页则要严格左到右排列，
   * 最后一行不满时保持贴左（不居中），跟目录类页面的常规阅读习惯一致，默认关闭。 */
  center?: boolean;
}) {
  if (products.length === 0) {
    return <p className="py-12 text-center text-grey-500">{t(locale, 'noProductsFound')}</p>;
  }

  return (
    <div className={`flex flex-wrap gap-6 ${center ? 'justify-center' : ''}`}>
      {products.map((product) => (
        <div key={product.id} className="w-[calc(50%-12px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
          <ProductCard product={product} locale={locale} />
        </div>
      ))}
    </div>
  );
}
