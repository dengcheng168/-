import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { t } from '@/lib/i18n/site-strings';
import type { Locale } from '@/lib/i18n/locales';
import { getYoutubeEmbedUrl } from '@/lib/utils/youtube';

export function InquirySection({ locale = 'en', videoUrl }: { locale?: Locale; videoUrl?: string | null } = {}) {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <section className="py-16">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow={t(locale, 'sectionVideoEyebrow')} title={t(locale, 'sectionVideoTitle')} />
        <div className="mt-10 aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            className="h-full w-full border-0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </Container>
    </section>
  );
}
