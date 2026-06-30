import { resolveQuestion } from '../VideoFlow';

test('usa questions[] cuando existe (descripción + video ejemplo)', () => {
  const qs = [{ code: 'q1', description: '¿Pregunta uno?', example_video_url: 'https://x/1.mp4' }];
  const r = resolveQuestion(qs, [], 0);
  expect(r.code).toBe('q1');
  expect(r.text).toBe('¿Pregunta uno?');
  expect(r.example?.videoUrl).toBe('https://x/1.mp4');
});

test('fallback a document_type_codes + pregunta hardcodeada', () => {
  const r = resolveQuestion([], ['video_negocio_1'], 0);
  expect(r.code).toBe('video_negocio_1');
  expect(typeof r.text).toBe('string');
});
