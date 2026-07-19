import Link from 'next/link';

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pageHref = (p: number) => {
    const url = new URL(basePath, 'https://placeholder.local');
    url.searchParams.set('page', String(p));
    return `${url.pathname}?${url.searchParams.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={pageHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`rounded-md px-3 py-2 text-sm ${page <= 1 ? 'pointer-events-none text-grey-200' : 'text-navy-900 hover:bg-grey-100'}`}
      >
        Previous
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={`rounded-md px-3 py-2 text-sm ${p === page ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-grey-100'}`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={pageHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`rounded-md px-3 py-2 text-sm ${page >= totalPages ? 'pointer-events-none text-grey-200' : 'text-navy-900 hover:bg-grey-100'}`}
      >
        Next
      </Link>
    </nav>
  );
}
