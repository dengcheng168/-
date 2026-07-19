import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { FactoryStat } from '@/types/settings';

export function FactoryStrength({ stats, photos }: { stats: FactoryStat[]; photos: string[] }) {
  if (stats.length === 0 && photos.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading eyebrow="Our Factory" title="Factory Strength" />

        {stats.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-navy-950 sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-grey-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {photos.slice(0, 8).map((photo) => (
              <div key={photo} className="relative aspect-square overflow-hidden rounded-lg bg-grey-100">
                <Image src={photo} alt="Factory" fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
