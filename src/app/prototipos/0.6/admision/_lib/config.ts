/**
 * Configuración del cliente de admisión.
 * Endpoints públicos de FastAPI (sin Bearer); el SPA llama directo.
 */
export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'https://api.baldecash.com/api/v1',
  apiMode: (process.env.NEXT_PUBLIC_ADMISSION_API_MODE ?? 'live') as 'mock' | 'live',
};
