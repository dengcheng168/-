import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toCsv } from '../src/lib/csv.js';

test('CSV neutralizes spreadsheet expressions in both values and headers', () => {
  for (const value of ['=1+1', '+123', '-123', '@SUM(A1)', '  =1', '\t=1', '\r=1', '\n=1', `${String.fromCharCode(1)}=1`]) {
    const result = toCsv([{ value }], [{ key: 'value', header: value }]);
    const escaped = `'${value}`;
    const expected = /[",\n\r]/.test(escaped) ? `"${escaped.replace(/"/g, '""')}"` : escaped;
    assert.equal(result, `${expected}\r\n${expected}`);
  }
});

test('CSV preserves ordinary text, empty values and CSV escaping', () => {
  assert.equal(toCsv([{ a: 'A,"B"\nC', b: null, c: '净水器' }], [
    { key: 'a', header: 'Name' }, { key: 'b', header: 'Empty' }, { key: 'c', header: 'Text' },
  ]), 'Name,Empty,Text\r\n"A,""B""\nC",,净水器');
});
