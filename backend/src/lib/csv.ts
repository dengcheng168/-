function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const headerLine = columns.map((c) => escapeCsvField(c.header)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c.key])).join(','));
  return [headerLine, ...lines].join('\r\n');
}
