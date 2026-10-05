/**
 * PDF de "Políticas y términos de equipos seminuevos" (documento definitivo),
 * alojado en S3 bajo el prefijo público `company/`. El objeto se subió con
 * `Content-Disposition: attachment`, así que el enlace fuerza la descarga
 * (el atributo `download` se ignora en URLs cross-origin, pero el header de S3
 * hace el trabajo). Usado por el detalle/catálogo seminuevo de copia-home y por
 * el enlace "Ver política" del RefurbishedWarningModal.
 */
export const POLITICAS_PDF_URL =
  'https://baldecash.s3.amazonaws.com/company/BaldeCash-Politicas-Equipos-Seminuevos.pdf';

export const POLITICAS_PDF_FILENAME = 'BaldeCash-Politicas-Equipos-Seminuevos.pdf';
