import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { getYoutubeVideoId } from '@/lib/utils/youtube';
import { LiteYoutubeEmbed } from './LiteYoutubeEmbed';

export function InquirySection({ locale = 'en', videoUrl }: { locale?: Locale; videoUrl?: string | null } = {}) {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;

  return (
    <section className="pt-16 pb-8">
      <Container>
        <SectionHeading eyebrow={t(locale, 'sectionVideoEyebrow')} title={t(locale, 'sectionVideoTitle')} />
        <div className="mx-auto mt-10 aspect-video w-full max-w-6xl overflow-hidden rounded-lg">
          <LiteYoutubeEmbed videoId={videoId} locale={locale} />
        </div>
      </Container>
    </section>
  );
}
