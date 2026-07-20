const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface CompareFacesResult {
  success: boolean;
  is_match?: boolean;
  similarity?: number;
  threshold?: number;
  comparison_id?: number;
  error?: string;
}

/**
 * Compara selfie (source) vs DNI (target) contra el endpoint nativo de ws2.
 * Fail-safe: ante error de red o HTTP no-OK devuelve { success:false, error }.
 */
export async function compareFaces(
  sourceImage: string,
  targetImage: string,
  applicationId?: number,
): Promise<CompareFacesResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/kyc/compare-faces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_image: sourceImage,
        target_image: targetImage,
        application_id: applicationId,
      }),
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
