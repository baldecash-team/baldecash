import { createUploadQueue } from '../videoUploadQueue';

const fakeFile = (n: string) => new File(['x'], n, { type: 'video/webm' });

test('sube los 3 clips concurrentemente y settleAll marca todos done', async () => {
  const seen: number[] = [];
  const q = createUploadQueue(async (i) => { seen.push(i); });
  q.start(0, fakeFile('a'), 'video_negocio_1');
  q.start(1, fakeFile('b'), 'video_negocio_2');
  q.start(2, fakeFile('c'), 'video_negocio_3');
  const entries = await q.settleAll();
  expect(entries.every((e) => e.status === 'done')).toBe(true);
  expect(seen.sort()).toEqual([0, 1, 2]);
  expect(q.failed()).toHaveLength(0);
});

test('un clip que falla queda en error; los demas done', async () => {
  const q = createUploadQueue(async (i) => {
    if (i === 1) throw new Error('boom');
  });
  q.start(0, fakeFile('a'), 'c0');
  q.start(1, fakeFile('b'), 'c1');
  await q.settleAll();
  const failed = q.failed();
  expect(failed).toHaveLength(1);
  expect(failed[0].index).toBe(1);
  expect(failed[0].error).toContain('boom');
  expect(q.get(0)?.status).toBe('done');
});

test('reintentar un clip fallido lo lleva a done', async () => {
  let attempt = 0;
  const q = createUploadQueue(async (i) => {
    if (i === 0 && attempt === 0) { attempt++; throw new Error('once'); }
  });
  q.start(0, fakeFile('a'), 'c0');
  await q.settleAll();
  expect(q.failed()).toHaveLength(1);
  // retry: re-start del mismo indice
  q.start(0, q.get(0)!.file, q.get(0)!.code);
  await q.settleAll();
  expect(q.failed()).toHaveLength(0);
  expect(q.get(0)?.status).toBe('done');
});
