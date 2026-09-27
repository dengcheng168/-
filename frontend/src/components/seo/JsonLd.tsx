export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const schemaType = typeof data['@type'] === 'string' ? data['@type'] : 'schema';

  return (
    <script
      id={`json-ld-${schemaType.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
