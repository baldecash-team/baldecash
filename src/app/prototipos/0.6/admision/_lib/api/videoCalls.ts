import { apiFetch, type ApiResult } from './client';

/**
 * Credenciales de sala que devuelve el backend al canjear el link.
 *
 * `room_url` + `token` es el par crudo de Daily. Sirve igual para Prebuilt
 * (`createFrame`) que para una UI propia (`createCallObject`): el backend no
 * decide cuál se usa.
 */
export type VideoCallJoin = {
  room_url: string;
  token: string;
  status: string | null;
  scheduled_at: string | null;
  expires_at: string | null;
};

/**
 * Canjea el link de la videollamada.
 *
 * El backend valida el token SIN consumirlo, así que esto se puede llamar
 * varias veces: el cliente recarga la página o se le corta el 4G y vuelve a
 * entrar. Cada llamada devuelve un meeting token nuevo y de vida corta.
 */
export async function joinVideoCall(token: string): Promise<ApiResult<VideoCallJoin>> {
  return apiFetch(`/public/video-calls/${token}`);
}
