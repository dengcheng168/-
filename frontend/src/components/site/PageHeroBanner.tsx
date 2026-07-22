import Image from 'next/image';
import { Container } from '@/components/ui/Container';

/**
 * 静态页面顶部的通栏背景图区域（深色遮罩 + 白色文字），只在对应 Page.heroImage 设置了值时渲染，
 * 视觉上跟首页 HeroBanner 保持一致。面包屑不放在这里面——放在下面正常的白色区域，
 * 这样不管有没有设置背景图，面包屑的颜色对比度都是对的，不用另外做深色变体。
 *
 * 桌面图/手机图跟首页 HeroBanner 同一套逻辑：按 Tailwind 响应式 display 切换两张图而不是换
 * src，其中一个没配就用另一个兜底，不会出现某个设备上突然空白。
 */
export function PageHeroBanner({
  image,
  imageMobile,
  title,
  children,
}: {
  image?: string | null;
  imageMobile?: string | null;
  title: string;
  children?: React.ReactNode;
}) {
  const desktopSrc = image ?? imageMobile;
  const mobileSrc = imageMobile ?? image;

  return (
    <div className="relative isolate flex min-h-[280px] items-center overflow-hidden bg-navy-950">
      {desktopSrc && <Image src={desktopSrc} alt="" fill priority sizes="100vw" className="hidden object-cover sm:block" />}
      {mobileSrc && <Image src={mobileSrc} alt="" fill priority sizes="100vw" className="block object-cover sm:hidden" />}
      <div className="absolute inset-0 bg-navy-950/70" />
      <Container className="relative z-10 py-16">
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        {children}
      </Container>
    </div>
  );
}
