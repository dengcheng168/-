import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-water-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy-950">Page Not Found</h1>
      <p className="mt-3 max-w-md text-grey-500">
        Sorry, we couldn&rsquo;t find the page you were looking for. It may have been moved or no longer exists.
      </p>
      <div className="mt-8">
        <Button href="/">Back to Home</Button>
      </div>
    </Container>
  );
}
