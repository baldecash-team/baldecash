/**
 * Galería referencial por grado (A/B/C) para iPhones seminuevos de copia-home.
 * Las imágenes viven en el bucket S3 público de ws2 (images/productos/...) y se
 * usan como galería + "imagen referencial" cuando el equipo es un iPhone
 * reacondicionado. Solo aplica a iPhones; el resto de equipos usa sus imágenes
 * reales del API.
 */

const S3 = 'https://baldecash.s3.amazonaws.com/images/productos/copia-home/iphone-grados';

export type IphoneGrade = 'A' | 'B' | 'C';

export const IPHONE_GRADE_IMAGES: Record<IphoneGrade, string[]> = {
  A: [`${S3}/a/a-1.jpg`, `${S3}/a/a-2.jpg`, `${S3}/a/a-3.jpg`],
  B: [`${S3}/b/b-1.png`, `${S3}/b/b-2.png`, `${S3}/b/b-3.png`],
  C: [`${S3}/c/c-1.jpg`, `${S3}/c/c-2.jpg`, `${S3}/c/c-3.jpg`, `${S3}/c/c-4.jpg`, `${S3}/c/c-5.jpg`],
};

/** ¿El nombre corresponde a un iPhone? */
export function isIphoneName(name: string): boolean {
  return /iphone/i.test(name);
}
