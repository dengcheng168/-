import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getYoutubeEmbedUrl } from './youtube';

const EXPECTED = 'https://www.youtube.com/embed/AFtaGTQez4c';

test('getYoutubeEmbedUrl: 完整观看链接（watch?v=）', () => {
  assert.equal(getYoutubeEmbedUrl('https://www.youtube.com/watch?v=AFtaGTQez4c'), EXPECTED);
});

test('getYoutubeEmbedUrl: 分享短链（youtu.be）', () => {
  assert.equal(getYoutubeEmbedUrl('https://youtu.be/AFtaGTQez4c?si=abc123'), EXPECTED);
});

test('getYoutubeEmbedUrl: 已经是 embed 链接（带 si 追踪参数）', () => {
  assert.equal(getYoutubeEmbedUrl('https://www.youtube.com/embed/AFtaGTQez4c?si=Ln7p-5jpMdOjjk_X'), EXPECTED);
});

test('getYoutubeEmbedUrl: Shorts 链接', () => {
  assert.equal(getYoutubeEmbedUrl('https://www.youtube.com/shorts/AFtaGTQez4c'), EXPECTED);
});

test('getYoutubeEmbedUrl: 纯视频 ID', () => {
  assert.equal(getYoutubeEmbedUrl('AFtaGTQez4c'), EXPECTED);
});

test('getYoutubeEmbedUrl: 完整 <iframe> 嵌入代码（YouTube「分享→嵌入」原样粘贴）', () => {
  const iframeHtml =
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/AFtaGTQez4c?si=MHaOPCIeAg0ljJiQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
  assert.equal(getYoutubeEmbedUrl(iframeHtml), EXPECTED);
});

test('getYoutubeEmbedUrl: 前后空白会被 trim', () => {
  assert.equal(getYoutubeEmbedUrl('  https://youtu.be/AFtaGTQez4c  '), EXPECTED);
});

test('getYoutubeEmbedUrl: 空值/空字符串返回 null（不渲染视频）', () => {
  assert.equal(getYoutubeEmbedUrl(null), null);
  assert.equal(getYoutubeEmbedUrl(undefined), null);
  assert.equal(getYoutubeEmbedUrl(''), null);
  assert.equal(getYoutubeEmbedUrl('   '), null);
});

test('getYoutubeEmbedUrl: 无法识别的输入返回 null', () => {
  assert.equal(getYoutubeEmbedUrl('not a url'), null);
  assert.equal(getYoutubeEmbedUrl('https://example.com/video'), null);
  assert.equal(getYoutubeEmbedUrl('<iframe src="https://example.com"></iframe>'), null);
});
