function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  // Spreadsheet programs can execute formulas even in quoted CSV fields.
  // Prefix untrusted formula-like text (including leading control/space chars)
  // with an apostrophe so it is imported as text, not an expression.
  const raw = String(value);
  let firstVisibleIndex = 0;
  while (firstVisibleIndex < raw.length) {
    const character = raw.charAt(firstVisibleIndex);
    if (character.charCodeAt(0) > 31 && !/\s/u.test(character)) break;
    firstVisibleIndex += 1;
  }
  const firstVisibleCharacter = raw.charAt(firstVisibleIndex);
  const startsWithFormula = ['=', '+', '@', '-'].includes(firstVisibleCharacter);
  const startsWithCsvControl = [9, 10, 13].includes(raw.charCodeAt(0));
  const str = startsWithFormula || startsWithCsvControl
    ? `'${raw}`
    : raw;
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
