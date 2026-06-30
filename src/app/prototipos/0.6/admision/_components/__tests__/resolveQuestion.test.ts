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
  expect(r.text).toBe('¿A qué se dedica tu negocio y desde cuándo?');
  expect(r.example).toBeDefined();
});

test('rama primaria sin example_video_url', () => {
  const qs = [{ code: 'q1', description: '¿Q?' }];
  const r = resolveQuestion(qs, [], 0);
  expect(r.code).toBe('q1');
  expect(r.text).toBe('¿Q?');
  expect(r.example).toBeUndefined();
});
