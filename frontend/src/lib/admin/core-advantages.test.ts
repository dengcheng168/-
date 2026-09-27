import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoreAdvantages } from './core-advantages';

test('核心优势保存标题、说明和排序，不保留编辑器内部字段', () => {
  assert.deepEqual(parseCoreAdvantages(JSON.stringify([
    { id: 4, title: ' OEM ', description: ' Custom packaging ' },
    { title: 'Quality' },
  ])), [{ title: 'OEM', description: 'Custom packaging' }, { title: 'Quality', description: '' }]);
});

test('删除全部核心优势会保存空列表，而不是忽略修改', () => {
  assert.deepEqual(parseCoreAdvantages('[]'), []);
  assert.deepEqual(parseCoreAdvantages(''), []);
});

test('拒绝损坏的 JSON、非列表、缺少标题和非文字说明', () => {
  for (const value of ['{', '{}', 'null', '[null]', '[{}]', '[{"title":"  "}]', '[{"title":"OEM","description":{}}]']) {
    assert.throws(() => parseCoreAdvantages(value));
  }
});
