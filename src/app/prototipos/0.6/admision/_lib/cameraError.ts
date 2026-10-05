/**
 * Diagnóstico de errores de cámara (getUserMedia) con mensajes accionables.
 */

/** ¿El navegador expone la API de cámara en este contexto (https/localhost)? */
export function isCameraAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/** Mapea el error de getUserMedia a un mensaje claro y con siguiente paso. */
export function cameraErrorMessage(err: unknown): string {
  const name = (err as { name?: string } | null)?.name ?? '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Bloqueaste la cámara. Actívala desde el candado del navegador, o sube un archivo.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No pudimos acceder a tu cámara. Reintenta o sube un archivo de video.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Tu cámara está en uso por otra app. Ciérrala y reintenta, o sube un archivo.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'No pudimos configurar la cámara. Reintenta o sube un archivo.';
    case 'SecurityError':
      return 'El navegador bloqueó la cámara. Usa https:// o sube un archivo.';
    case 'AbortError':
      return 'Se interrumpió la cámara. Inténtalo de nuevo.';
    default:
      if (!isCameraAvailable()) {
        return 'Tu navegador no permite la cámara aquí. Sube un archivo de video.';
      }
      return 'No pudimos acceder a la cámara. Reintenta o sube un archivo.';
  }
}
