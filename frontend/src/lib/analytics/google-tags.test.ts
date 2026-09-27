import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { buildGoogleTags } from './google-tags';

test('one loader configures GA4 and Ads separately, including Ads-only and GA4-only', () => {
  for (const [ga4, ads] of [['G-TEST123456', 'AW-123456789'], ['G-TEST123456', ''], ['', 'AW-123456789']]) {
    const tags = buildGoogleTags(ga4, ads, 'es')!;
    assert.equal(new URL(tags.src).searchParams.get('id'), ga4 || ads);
    const context = vm.createContext({ window: {} });
    vm.runInContext('var dataLayer = window.dataLayer = [];', context);
    vm.runInContext(tags.script, context);
    const calls = Array.from(context.dataLayer as IArguments[], (args) => Array.from(args));
    assert.equal(calls.filter(call => call[0] === 'js').length, 1);
    assert.deepEqual(calls.filter(call => call[0] === 'config').map(call => call[1]), [ga4, ads].filter(Boolean));
    assert.ok(calls.filter(call => call[0] === 'config').every(call => (call[2] as {page_language:string}).page_language === 'es'));
  }
});

test('empty, wrong-platform IDs and pasted scripts never render; valid other tag survives', () => {
  assert.equal(buildGoogleTags('', null), null);
  for (const invalid of ['<script>gtag("config", "G-TEST123456")</script>', "G-X');alert(1);//", 'AW-123', 'G-A B']) {
    assert.equal(buildGoogleTags(invalid, ''), null);
    assert.equal(buildGoogleTags(invalid, 'AW-123')!.script.includes(invalid), invalid === 'AW-123');
  }
  assert.equal(buildGoogleTags('', 'G-TEST123456'), null);
  assert.equal(buildGoogleTags(' G-TEST123456 ', '')!.src.endsWith('G-TEST123456'), true);
});
