/**
 * Formato del campo «Monto» (`currency`) del wizard — BAL-4395.
 *
 * Dos caras del mismo dato:
 * - lo que se guarda en form_data: el número limpio de siempre («2500»,
 *   «1234567.5»), porque el legacy y ws2 lo leen así;
 * - lo que ve el cliente mientras escribe: con coma de miles al estilo es-PE
 *   («2,500», «1,234,567.5»).
 */

/** Decimales que se aceptan si el cliente los escribe (no se fuerzan). */
export const MAX_DECIMALES = 2;

const esDigito = (ch: string) => ch >= '0' && ch <= '9';

/**
 * Deja solo dígitos y un punto decimal (máx. 2 decimales). Sirve para lo que
 * el cliente teclea o pega («S/ 2,500.50» -> «2500.50») y para valores que ya
 * vienen guardados. Un punto antes de cualquier dígito solo cuenta si le sigue
 * un dígito («.5» -> «0.5»), así el «S/.» de un monto pegado no se confunde
 * con el decimal.
 */
export function limpiarMonto(texto: string | number | null | undefined): string {
  if (texto === null || texto === undefined) return '';
  const s = String(texto);
  let entero = '';
  let decimales = '';
  let vioPunto = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (esDigito(ch)) {
      if (!vioPunto) entero += ch;
      else if (decimales.length < MAX_DECIMALES) decimales += ch;
    } else if (ch === '.' && !vioPunto) {
      if (entero !== '' || esDigito(s[i + 1] ?? '')) vioPunto = true;
    }
  }
  entero = entero.replace(/^0+(?=\d)/, '');
  if (vioPunto && entero === '') entero = '0';
  return vioPunto ? `${entero}.${decimales}` : entero;
}

/**
 * Lo que ve el cliente: coma cada tres dígitos en la parte entera y punto
 * decimal (mismo resultado que `Intl.NumberFormat('es-PE')`, pero sin pasar
 * por `Number`, para respetar un «2500.» o «2500.0» a medio escribir).
 */
export function formatearMonto(texto: string | number | null | undefined): string {
  const limpio = limpiarMonto(texto);
  if (limpio === '') return '';
  const [entero, decimales] = limpio.split('.');
  const agrupado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimales !== undefined ? `${agrupado}.${decimales}` : agrupado;
}

/** Cuántos dígitos o puntos hay antes de `hasta` (las comas no cuentan). */
export function contarSignificativos(texto: string, hasta: number): number {
  let n = 0;
  const fin = Math.min(hasta, texto.length);
  for (let i = 0; i < fin; i++) {
    if (esDigito(texto[i]) || texto[i] === '.') n++;
  }
  return n;
}

/** Posición del cursor en el texto con comas tras `n` dígitos o puntos. */
export function posicionEnFormateado(formateado: string, n: number): number {
  if (n <= 0) return 0;
  let vistos = 0;
  for (let i = 0; i < formateado.length; i++) {
    if (formateado[i] !== ',') vistos++;
    if (vistos >= n) return i + 1;
  }
  return formateado.length;
}
