/** Subida directa a S3 mediante URL prefirmada (PUT con progreso). */
export async function uploadFile(
  uploadUrl: string,
  file: Blob,
  contentType: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  if (uploadUrl.startsWith('mock://')) {
    onProgress?.(100);
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`upload_failed_${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('upload_network_error'));
    xhr.send(file as Blob);
  });
}
