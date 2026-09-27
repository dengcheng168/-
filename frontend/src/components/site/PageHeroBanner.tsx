import { ResponsiveHeroImage } from './ResponsiveHeroImage';
import { Container } from '@/components/ui/Container';

/**
 * 静态页面顶部的通栏背景图区域（深色遮罩 + 白色文字），只在对应 Page.heroImage 设置了值时渲染，
 * 视觉上跟首页 HeroBanner 保持一致。面包屑不放在这里面——放在下面正常的白色区域，
 * 这样不管有没有设置背景图，面包屑的颜色对比度都是对的，不用另外做深色变体。
 *
 * 用 picture 按屏幕宽度选择图片，避免同时下载桌面图和手机图；缺图时互相兜底。
 */
export function PageHeroBanner({
  image,
  imageMobile,
  eyebrow,
  title,
  children,
  compactOnMobile = false,
}: {
  image?: string | null;
  imageMobile?: string | null;
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  compactOnMobile?: boolean;
}) {
  const desktopSrc = image ?? imageMobile;
  const mobileSrc = imageMobile ?? image;

  return (
    <div
      className={`relative isolate flex items-center overflow-hidden bg-navy-950 ${
        compactOnMobile ? 'min-h-[320px] sm:min-h-[400px]' : 'min-h-[400px]'
      }`}
    >
      <ResponsiveHeroImage desktop={desktopSrc} mobile={mobileSrc} />
      <div className="absolute inset-0 bg-navy-950/70" />
      <Container className="relative z-10 py-16">
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-water-400">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
        {children}
      </Container>
    </div>
  );
}
