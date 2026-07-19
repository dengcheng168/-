import type { TocHeading } from '@/lib/utils/toc';

export function BlogTOC({ headings }: { headings: TocHeading[] }) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-lg border border-grey-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-grey-700">On this page</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
            <a href={`#${heading.id}`} className="text-grey-700 hover:text-water-600">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
