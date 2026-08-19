/**
 * Versión real del sistema operativo vía User-Agent Client Hints.
 *
 * Los navegadores congelaron la versión del sistema dentro del user agent por
 * privacidad (*User-Agent Reduction*): Chrome declara siempre `Windows NT 10.0`
 * y `Android 10`, sin importar la versión real. Por eso `session.os_version`
 * dice "Android 10" para casi cualquier Android moderno y "Windows 10" para
 * Windows 11 — un campo que se ve normal y miente.
 *
 * La versión verdadera solo viaja si se pide explícitamente, por Client Hints.
 * Safari NO los implementa, así que en iPhone se sigue usando el user agent y
 * el dato queda como está: ahí no hay vía posible desde el cliente.
 */

/** Subconjunto de `navigator.userAgentData` que nos interesa. */
export interface UserAgentDataLike {
  platform?: string;
  getHighEntropyValues: (hints: string[]) => Promise<Record<string, unknown>>;
}

/**
 * Windows es el único caso donde el hint no es la versión comercial: Chrome
 * reporta `0.x` para Windows 7/8/8.1, `1..12` para Windows 10 y `>= 13` para
 * Windows 11.
 * @see https://learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11
 */
export function mapPlatformVersion(
  platform: string | undefined,
  platformVersion: string | undefined
): string | undefined {
  if (!platformVersion) return undefined;

  if (platform !== 'Windows') return platformVersion;

  const major = Number.parseInt(platformVersion.split('.')[0] ?? '', 10);
  if (Number.isNaN(major)) return undefined;
  if (major >= 13) return '11';
  if (major >= 1) return '10';
  // 0.x es Windows 7/8/8.1 y el hint no distingue cuál: mejor no afirmar nada.
  return undefined;
}

/**
 * Resuelve la versión del sistema, prefiriendo los Client Hints y cayendo al
 * valor sacado del user agent cuando no están disponibles.
 *
 * Nunca lanza: el tracking no puede romper la creación de la sesión.
 */
export async function resolveOsVersion(
  fallback: string,
  uaData?: UserAgentDataLike
): Promise<string> {
  if (!uaData?.getHighEntropyValues) return fallback;

  try {
    const values = await uaData.getHighEntropyValues(['platformVersion']);
    const platform =
      (values.platform as string | undefined) ?? uaData.platform;
    const mapped = mapPlatformVersion(
      platform,
      values.platformVersion as string | undefined
    );
    return mapped ?? fallback;
  } catch {
    return fallback;
  }
}

/** Lee `navigator.userAgentData` sin romper donde no existe (Safari, SSR). */
export function getUserAgentData(): UserAgentDataLike | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as Navigator & { userAgentData?: UserAgentDataLike };
  return nav.userAgentData;
}
