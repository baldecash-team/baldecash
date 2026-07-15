export type UploadStatus = 'uploading' | 'done' | 'error';

export interface UploadEntry {
  index: number;
  code: string;
  file: File;
  status: UploadStatus;
  error?: string;
}

export type DoUpload = (index: number, file: File, code: string) => Promise<void>;

/**
 * Cola de subidas en segundo plano: dispara cada subida sin bloquear y permite
 * esperar a todas al final (settleAll) e inspeccionar las fallidas (failed).
 * Sin dependencia de React → unit-testeable.
 */
export function createUploadQueue(doUpload: DoUpload) {
  const entries = new Map<number, UploadEntry>();
  const promises = new Map<number, Promise<void>>();

  function start(index: number, file: File, code: string): void {
    entries.set(index, { index, code, file, status: 'uploading' });
    const p = doUpload(index, file, code).then(
      () => {
        const e = entries.get(index);
        if (e) e.status = 'done';
      },
      (err: unknown) => {
        const e = entries.get(index);
        if (e) {
          e.status = 'error';
          e.error = err instanceof Error ? err.message : String(err);
        }
      },
    );
    promises.set(index, p);
  }

  async function settleAll(): Promise<UploadEntry[]> {
    await Promise.allSettled([...promises.values()]);
    return [...entries.values()];
  }

  const failed = () => [...entries.values()].filter((e) => e.status === 'error');
  const anyUploading = () => [...entries.values()].some((e) => e.status === 'uploading');
  const get = (index: number) => entries.get(index);

  return { start, settleAll, failed, anyUploading, get };
}
