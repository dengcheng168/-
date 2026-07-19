import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import type { PublicSiteSettings } from '@/types/settings';

export function HeroBanner({ settings }: { settings: PublicSiteSettings }) {
  return (
    <section className="relative isolate flex min-h-[560px] items-center overflow-hidden bg-navy-950">
      {settings.heroDesktopImage && (
        <Image
          src={settings.heroDesktopImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
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
