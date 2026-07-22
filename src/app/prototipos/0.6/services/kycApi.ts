const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface CompareFacesResult {
  success: boolean;
  is_match?: boolean;
  similarity?: number;
  threshold?: number;
  comparison_id?: number;
  error?: string;
}

export interface CompareFacesKeys {
  source_key?: string;
  target_key?: string;
}

/**
 * Compara selfie (source) vs DNI (target) contra el endpoint nativo de ws2.
 * `sourceImage`/`targetImage` aceptan dataURL base64 (Fase 2a) o URL de S3
 * (Fase 2b, tras subir con `getKycUploadUrl`/`uploadToS3`). `keys` es opcional
 * y agrega `source_key`/`target_key` al body cuando se subió a S3.
 * Fail-safe: ante error de red o HTTP no-OK devuelve { success:false, error }.
 */
export async function compareFaces(
  sourceImage: string,
  targetImage: string,
  applicationId?: number,
  keys?: CompareFacesKeys,
): Promise<CompareFacesResult> {
  try {
    const body: Record<string, unknown> = {
      source_image: sourceImage,
      target_image: targetImage,
      application_id: applicationId,
    };
    if (keys?.source_key) body.source_key = keys.source_key;
    if (keys?.target_key) body.target_key = keys.target_key;

    const response = await fetch(`${API_BASE_URL}/public/kyc/compare-faces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // 400 de AWS trae { detail: { success:false, error, error_code } }
      let error = 'No pudimos verificar tu identidad. Intenta nuevamente.';
      try {
        const data = await response.json();
        error = data?.detail?.error || data?.error || error;
      } catch { /* noop */ }
      return { success: false, error };
    }

    return (await response.json()) as CompareFacesResult;
  } catch {
    return { success: false, error: 'Error de conexión. Intenta nuevamente.' };
  }
}

export interface KycUploadUrl {
  upload_url: string;
  file_url: string;
  key: string;
}

/**
 * Pide una URL presignada de S3 para subir la selfie o el DNI.
 * Fail-safe: ante error de red o HTTP no-OK devuelve null (el caller decide
 * cómo degradar: mostrar error reintentable, nunca lanzar).
 */
export async function getKycUploadUrl(
  applicationCode: string,
  kind: 'selfie' | 'dni',
  contentType = 'image/jpeg',
): Promise<KycUploadUrl | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_code: applicationCode,
        kind,
        content_type: contentType,
      }),
    });

    if (!response.ok) return null;
    return (await response.json()) as KycUploadUrl;
  } catch {
    return null;
  }
}

/**
 * Sube un blob a la URL presignada de S3 (PUT directo).
 * Fail-safe: ante error de red o HTTP no-OK devuelve false.
 */
export async function uploadToS3(
  uploadUrl: string,
  blob: Blob,
  contentType = 'image/jpeg',
): Promise<boolean> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convierte un dataURL (`data:<mime>;base64,<data>`) capturado por <canvas>
 * en un Blob listo para subir con `uploadToS3`.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64 = ''] = dataUrl.split(',');
  const mimeMatch = /data:(.*?);base64/.exec(header);
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
