/**
 * Reglas de la dirección de entrega, sin React: lo que el repartidor necesita
 * para encontrar la casa.
 *
 * Salen de los envíos que el courier devolvió sin entregar: direcciones con
 * solo el nombre de la zona, plus codes de Google (`3WFV+FF8`), coordenadas,
 * un paradero en vez de una calle, referencias como "-" o "4ta cruz". En Perú
 * una casa se ubica de dos formas —por vía y número, o por zona, manzana y
 * lote— y el formulario pide una de las dos, en partes, en vez de un texto
 * libre.
 */

export type FormaDireccion = 'via' | 'lote';

export const TIPOS_VIA = ['Av.', 'Jr.', 'Calle', 'Pasaje', 'Prolongación', 'Carretera'] as const;
export const TIPOS_ZONA = [
  'Urbanización', 'AA.HH.', 'Asociación', 'Cooperativa', 'Pueblo Joven', 'Sector', 'Centro Poblado',
] as const;

export interface PartesDireccion {
  forma: FormaDireccion | '';
  tipoVia: string;
  nombreVia: string;
  /** Número de puerta; en una carretera, el kilómetro. */
  numero: string;
  tipoZona: string;
  nombreZona: string;
  mz: string;
  lote: string;
  /** Dpto, interior o piso. Opcional en las dos formas. */
  interior: string;
}

export type CampoDireccion = 'forma' | 'nombreVia' | 'numero' | 'nombreZona' | 'mz' | 'lote';

export const PARTES_VACIAS: PartesDireccion = {
  forma: '', tipoVia: 'Av.', nombreVia: '', numero: '',
  tipoZona: 'Urbanización', nombreZona: '', mz: '', lote: '', interior: '',
};

/**
 * Plus code de Google (`R22G+RRF`): lo devuelve cuando el punto no tiene calle
 * con nombre. Es un código de ubicación, no una dirección, y en la guía del
 * courier no le dice nada al repartidor. Lo mismo unas coordenadas pegadas.
 */
const PLUS_CODE = /\b[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/i;
const COORDENADAS = /-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.?\d*/;
export const esCodigoDeUbicacion = (v: string) => PLUS_CODE.test(v) || COORDENADAS.test(v);

const letras = (v: string) => (v.match(/[a-záéíóúüñ]/gi) || []).length;
const MZ_O_LOTE = /^[a-z0-9]{1,4}$/i;
const NUMERO_PUERTA = /^\d{1,5}[a-z]?$/i;
const KILOMETRO = /^\d{1,4}([.,]\d{1,3})?$/;

const esCarretera = (p: PartesDireccion) => p.tipoVia === 'Carretera';

/** El renglón que llega a la guía del courier: "Av. Benavides 1238". */
export function componerDireccion(p: PartesDireccion): string {
  const t = (v: string) => v.trim().replace(/\s+/g, ' ');
  if (p.forma === 'via') {
    const numero = esCarretera(p) ? `Km ${t(p.numero)}` : t(p.numero);
    return [p.tipoVia, t(p.nombreVia), numero].filter(Boolean).join(' ');
  }
  if (p.forma === 'lote') {
    return [p.tipoZona, t(p.nombreZona), `Mz ${t(p.mz).toUpperCase()}`, `Lt ${t(p.lote).toUpperCase()}`]
      .filter(Boolean).join(' ');
  }
  return '';
}

const errorDeNombre = (v: string, que: string): string | null => {
  const texto = v.trim();
  if (!texto) return `Escribe el nombre de ${que}`;
  if (esCodigoDeUbicacion(texto) || texto.includes('+')) {
    return 'Ese es un código de Google, no un nombre. Escríbelo como aparece en tu recibo de luz o agua';
  }
  if (letras(texto) < 3) return `Escribe el nombre completo de ${que}`;
  return null;
};

/** Todo lo que falta o está mal en las partes, por campo, de una vez. */
export function erroresDeDireccion(p: PartesDireccion): Partial<Record<CampoDireccion, string>> {
  const errores: Partial<Record<CampoDireccion, string>> = {};
  if (!p.forma) {
    errores.forma = 'Elige cómo es tu dirección';
    return errores;
  }
  if (p.forma === 'via') {
    const nombre = errorDeNombre(p.nombreVia, 'la vía');
    if (nombre) errores.nombreVia = nombre;
    const numero = p.numero.trim();
    if (esCarretera(p)) {
      if (!KILOMETRO.test(numero)) errores.numero = 'Escribe el kilómetro (ej: 12 o 12.5)';
    } else if (!numero) {
      errores.numero = 'Escribe el número de tu casa. Si no tiene, elige «Manzana y lote»';
    } else if (!NUMERO_PUERTA.test(numero)) {
      errores.numero = 'Solo el número de puerta (ej: 1238 o 430B)';
    }
  } else {
    const zona = errorDeNombre(p.nombreZona, 'tu urbanización o asentamiento');
    if (zona) errores.nombreZona = zona;
    if (!MZ_O_LOTE.test(p.mz.trim())) errores.mz = 'Escribe tu manzana (ej: B o B2)';
    if (!MZ_O_LOTE.test(p.lote.trim())) errores.lote = 'Escribe tu lote (ej: 14)';
  }
  return errores;
}

/**
 * Para una dirección que ya llegó escrita (del legacy o de la solicitud): por
 * qué no le sirve al repartidor, o null si sirve. No se exige el formato en
 * partes —la mayoría de las guardadas son texto libre y están bien—, pero sí
 * que no sea un código y que tenga número o manzana y lote.
 */
export function problemaDeDireccionGuardada(v: string): string | null {
  const texto = v.trim();
  if (!texto) return 'no tenemos tu dirección';
  if (esCodigoDeUbicacion(texto)) return `"${texto}" es un código de Google, no una dirección`;
  if (!/\d/.test(texto)) return `a "${texto}" le falta el número de tu casa o tu manzana y lote`;
  if (letras(texto) < 3) return `"${texto}" no tiene el nombre de la calle ni de la zona`;
  return null;
}

/**
 * La referencia es lo que usa el repartidor cuando la dirección no alcanza, y
 * es la causa más común de "dirección no ubicada". Por eso no basta con que
 * haya algo escrito: un "-" o un "ninguna" heredados del legacy pasaban como
 * referencia y el courier volvía sin entregar.
 */
export const REFERENCIA_MIN = 10;
const REFERENCIAS_VACIAS = new Set([
  '-', '.', 'ninguna', 'ninguno', 'no', 'na', 'n/a', 'sin referencia', 'ninguna referencia', 'x',
]);
export function errorDeReferencia(v: string): string | null {
  const texto = v.trim();
  if (!texto || REFERENCIAS_VACIAS.has(texto.toLowerCase())) {
    return 'Escribe una referencia para el repartidor';
  }
  if (texto.length < REFERENCIA_MIN || letras(texto) < 3) {
    return 'Agrega más detalle: qué hay cerca o cómo es tu casa';
  }
  return null;
}

/** Celular peruano: 9 dígitos que empiezan en 9. Es al que llama el courier. */
export const esCelularValido = (v: string) => /^9\d{8}$/.test(v.replace(/\D/g, ''));
