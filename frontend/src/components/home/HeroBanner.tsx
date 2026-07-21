import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { PublicSiteSettings } from '@/types/settings';

export function HeroBanner({ settings }: { settings: PublicSiteSettings }) {
  // 移动端没单独传图时兜底用桌面图（保持原有行为），反过来同理——两个字段都是可选的，
  // 不能因为其中一个没配就在对应设备上整个 hero 区域变成空白导航蓝底
  const desktopSrc = settings.heroDesktopImage ?? settings.heroMobileImage;
  const mobileSrc = settings.heroMobileImage ?? settings.heroDesktopImage;

  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy-950">
      {desktopSrc && (
        <Image
          src={desktopSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover sm:block"
        />
      )}
      {mobileSrc && (
        <Image
          src={mobileSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="block object-cover sm:hidden"
        />
      )}
      <div className="absolute inset-0 bg-navy-950/70" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">{settings.heroHeadline}</h1>
          <p className="mt-5 text-lg text-grey-100/90">{settings.heroSubheadline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={settings.heroButton1Link} variant="primary">
              {settings.heroButton1Text}
            </Button>
            <Button href={settings.heroButton2Link} variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-navy-950">
              {settings.heroButton2Text}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
