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
      return 'Bloqueaste el acceso a la cámara. Actívalo desde el ícono de candado en la barra de direcciones y vuelve a intentar. También puedes subir un archivo de video.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No pudimos acceder a tu cámara. Puede estar desactivada, en uso por otra app (Zoom, Teams, Meet) o bloqueada por la privacidad del sistema. Revisa esos puntos e inténtalo de nuevo, o sube un archivo de video.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Tu cámara está siendo usada por otra aplicación. Ciérrala e inténtalo de nuevo, o sube un archivo.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'No pudimos configurar la cámara de este dispositivo. Inténtalo de nuevo o sube un archivo.';
    case 'SecurityError':
      return 'El navegador bloqueó la cámara por seguridad. Abre la página con https:// (o en localhost) o sube un archivo.';
    case 'AbortError':
      return 'Se interrumpió el acceso a la cámara. Inténtalo de nuevo.';
    default:
      if (!isCameraAvailable()) {
        return 'Tu navegador no permite usar la cámara en esta página (normalmente requiere https). Sube un archivo de video para continuar.';
      }
      return 'No pudimos acceder a la cámara. Inténtalo de nuevo o sube un archivo de video.';
  }
}
