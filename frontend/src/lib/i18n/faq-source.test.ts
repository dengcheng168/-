import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFaqContent, resolveFaqListContent } from './faq-source';
import type { Faq } from '@/types/content';

const enFaq: Faq = { id: 1, question: 'What is RO?', answer: 'Reverse osmosis.', category: null };

test('resolveFaqContent: FaqTranslation (published) takes priority over legacy Translation and English', () => {
  const result = resolveFaqContent(
    enFaq,
    { question: 'Que es RO? (nueva)', answer: 'Osmosis inversa (nueva).' },
    { 'faq.1.question': 'Que es RO? (legado)', 'faq.1.answer': 'Osmosis inversa (legado).' },
  );
  assert.equal(result.question, 'Que es RO? (nueva)');
  assert.equal(result.answer, 'Osmosis inversa (nueva).');
});

test('resolveFaqContent: falls back to legacy Translation table when no FaqTranslation exists', () => {
  const result = resolveFaqContent(enFaq, null, {
    'faq.1.question': 'Que es RO? (legado)',
    'faq.1.answer': 'Osmosis inversa (legado).',
  });
  assert.equal(result.question, 'Que es RO? (legado)');
  assert.equal(result.answer, 'Osmosis inversa (legado).');
});

test('resolveFaqContent: falls back to English when neither source has content', () => {
  const result = resolveFaqContent(enFaq, null, {});
  assert.equal(result.question, enFaq.question);
  assert.equal(result.answer, enFaq.answer);
});

test('resolveFaqContent: empty/whitespace FaqTranslation field is treated as absent, falls through to legacy', () => {
  const result = resolveFaqContent(enFaq, { question: '   ', answer: undefined }, { 'faq.1.question': 'Legado' });
  assert.equal(result.question, 'Legado');
  assert.equal(result.answer, enFaq.answer);
});

test('resolveFaqContent: partial FaqTranslation (only question) still falls back per-field for answer', () => {
  const result = resolveFaqContent(enFaq, { question: 'Nueva pregunta' }, { 'faq.1.answer': 'Respuesta legado' });
  assert.equal(result.question, 'Nueva pregunta');
  assert.equal(result.answer, 'Respuesta legado');
});

test('resolveFaqListContent: maps a list, each item resolved independently by its own id', () => {
  const faqs = [
    { ...enFaq, id: 1, translation: { question: 'Uno ES' } },
    { id: 2, question: 'Second?', answer: 'Second answer.', category: null, translation: null },
  ];
  const result = resolveFaqListContent(faqs, { 'faq.2.answer': 'Segunda respuesta legado' });
  assert.equal(result[0]!.question, 'Uno ES');
  assert.equal(result[0]!.answer, enFaq.answer);
  assert.equal(result[1]!.question, 'Second?');
  assert.equal(result[1]!.answer, 'Segunda respuesta legado');
});
