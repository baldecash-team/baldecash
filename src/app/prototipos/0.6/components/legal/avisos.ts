/**
 * Descargo legal propio de una landing.
 *
 * Una institución puede exigir que se aclare, en todo el recorrido, que el
 * crédito no es suyo. Eso no es una condición del producto ni copia de una
 * pantalla: es una frase que acompaña a la landing entera —el hero, la
 * calculadora y los pasos de la solicitud—, así que vive en un solo lugar y
 * las pantallas la piden por el segmento `[landing]` de la URL.
 *
 * La tabla se lee igual que la de `calculadora/perfiles.tsx`, y por el mismo
 * motivo: llevar el texto a la configuración obliga a tocar el backend y a
 * escribir en la base para corregir una coma de un texto legal, que es
 * justamente el que más se corrige antes de salir.
 *
 * Una landing sin entrada acá no dibuja nada. Es lo correcto: el descargo
 * nombra a una institución concreta, y mostrarlo donde no corresponde es peor
 * que no mostrarlo.
 */

export interface AvisoLegalLanding {
  /** Primera frase, en negrita. Es la que tiene que leerse aunque el resto no. */
  destacado: string;
  /** El cuerpo del descargo, sin el destacado. */
  cuerpo: string;
  /**
   * Cierre que solo se agrega en el hero.
   *
   * En el hero el aviso se lee una vez y con calma; en las franjas de las
   * pantallas del flujo se repite en cada paso, y ahí se deja lo que delimita
   * la responsabilidad. Esta frase no lo hace: aclara que el trámite sigue
   * siendo de la institución.
   */
  cierreHero?: string;
}

/**
 * Titulación en SENATI. Texto entregado por SENATI, se transcribe literal: no
 * se resume, no se reordena y no se le cambia la puntuación.
 */
const AVISO_TITULACION_SENATI: AvisoLegalLanding = {
  destacado: 'El financiamiento no involucra a SENATI.',
  cuerpo:
    'El crédito es otorgado exclusivamente por Balde K S.A.C. (BaldeCash), empresa supervisada ' +
    'por la SBS. SENATI no es parte del contrato de financiamiento: no otorga, garantiza ni avala ' +
    'el crédito, y no interviene en la evaluación, aprobación, desembolso ni cobranza. La ' +
    'obligación de pago corresponde únicamente al estudiante frente a BaldeCash, y su ' +
    'incumplimiento total o parcial no genera obligación, responsabilidad ni contingencia alguna ' +
    'para SENATI. Todo reclamo o consulta sobre el financiamiento se atiende exclusivamente por ' +
    'los canales de BaldeCash.',
  cierreHero: 'El trámite de titulación se sigue rigiendo por las condiciones de SENATI.',
};

const AVISOS_POR_LANDING: Record<string, AvisoLegalLanding> = {
  'titulo-senati': AVISO_TITULACION_SENATI,
};

/** El aviso de una landing, o `null` si esa landing no tiene ninguno. */
export function avisoLegalDe(landing: string | undefined): AvisoLegalLanding | null {
  if (!landing) return null;
  return AVISOS_POR_LANDING[landing] ?? null;
}
