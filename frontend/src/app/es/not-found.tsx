import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Página No Encontrada',
  robots: { index: false, follow: false },
};

export default function SpanishNotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-water-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy-950">Página No Encontrada</h1>
      <p className="mt-3 max-w-md text-grey-500">
        Lo sentimos, no pudimos encontrar la página que buscaba. Es posible que haya sido movida o ya no exista.
      </p>
      <div className="mt-8">
        <Button href="/es">Volver al Inicio</Button>
      </div>
    </Container>
  );
}
