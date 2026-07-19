import { Container } from '@/components/ui/Container';
import type { StatItem } from '@/types/settings';
import { CountUpValue } from './CountUpValue';

export function StatsCounter({ stats }: { stats: StatItem[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="bg-water-500 py-14 text-white">
      <Container>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold sm:text-4xl">
                <CountUpValue value={stat.value} />
              </div>
              <div className="mt-1 text-sm text-white/90">{stat.label}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
