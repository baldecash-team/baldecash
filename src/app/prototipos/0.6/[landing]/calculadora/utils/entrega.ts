/**
 * Entrega de la calculadora a /solicitar.
 *
 * El recorrido normal de la plataforma es catálogo → detalle de producto →
 * solicitar, y en cada paso el producto elegido se guarda en almacenamiento
 * local. `/solicitar` no consulta ningún endpoint para saber qué se está
 * financiando: lo lee de ahí.
 *
 * El producto de matrícula no tiene catálogo ni detalle, así que la calculadora
 * ocupa ese lugar: arma el mismo objeto y lo deja en la misma clave. Por eso
 * /solicitar funciona sin cambios.
 *
 * Los montos y los datos de la institución se guardan aparte, en una clave
 * propia, porque no tienen lugar en el objeto de producto y el formulario los
 * necesita después para completar sus campos.
 */

import type { SelectedProduct } from '../../solicitar/context/ProductContext';
import { getStorageKey } from '../../solicitar/context/ProductContext';
import type { TipoInstitucion } from '../../universidad/types/instituciones';
import type { CampoMontoPerfil } from '../perfiles';
import type { MontosMatricula } from '../types/calculadora';
import { totalAFinanciar } from '../types/calculadora';

/** Clave propia del producto de matrícula, con el mismo prefijo que usa el resto. */
export function getMatriculaKey(landing: string): string {
  return `baldecash-${landing}-matricula-datos`;
}

/**
 * Tipo de producto del riel de préstamo en efectivo.
 *
 * Además de identificar el producto, apaga accesorios y seguros por
 * compatibilidad: un préstamo no lleva periféricos ni seguro por rango de
 * precio.
 */
export const TIPO_EFECTIVO = 'efectivo';

/** Clave única donde el formulario guarda y restaura TODO su estado. */
function getFormularioKey(landing: string): string {
  return `baldecash-wizard-${landing}-data`;
}

/**
 * Deja los importes donde el formulario los va a encontrar.
 *
 * El formulario NO lee las claves propias de la calculadora: restaura su estado
 * desde una sola clave, con la forma `{codigo: {value}}`, y lo hace UNA vez al
 * montarse. Por eso esto corre antes de navegar: escrito después, el valor no
 * entra hasta que la persona recargue.
 *
 * Se fusiona en vez de reemplazar. Esa clave guarda todo lo que la persona ya
 * cargó; escribir un objeto nuevo le borraría el formulario entero.
 *
 * A diferencia del modal de captación, acá la calculadora SÍ manda: si vuelve
 * atrás y cambia los montos, los nuevos pisan a los viejos. Un importe anterior
 * que sobreviva es peor que ninguno, porque viaja como si fuera el elegido.
 *
 * Los códigos los declara el perfil de la landing y NO se escriben acá: cada
 * producto financia otra cosa y el paso del asistente que los recoge solo tiene
 * los suyos. Sembrar el código de otro producto deja un dato huérfano que ningún
 * paso recoge, y encima pisa el del formulario si alguna vez coinciden.
 */
export function sembrarImportesEnFormulario(
  landing: string,
  montos: MontosMatricula,
  campos: CampoMontoPerfil[]
): void {
  const clave = getFormularioKey(landing);

  let data: Record<string, { value?: unknown }> = {};
  try {
    const crudo = localStorage.getItem(clave);
    if (crudo) data = JSON.parse(crudo) as Record<string, { value?: unknown }>;
  } catch {
    // Contenido corrupto: se arranca limpio antes que perder los importes.
    data = {};
  }

  for (const campo of campos) {
    // El formulario guarda todo como texto, así que el importe viaja como
    // cadena y conserva sus decimales.
    data[campo.codigoFormulario] = {
      ...(data[campo.codigoFormulario] ?? {}),
      value: String(montos[campo.clave]),
    };
  }

  try {
    localStorage.setItem(clave, JSON.stringify(data));
  } catch {
    // Sin almacenamiento los importes no viajan, pero el resto del recorrido
    // sigue: el formulario los pedirá si están visibles.
  }
}

/** Lo que la calculadora deja para que el formulario lo recupere. */
export interface DatosMatricula {
  /** Identificador del centro de estudios elegido en la pantalla de institución. */
  institucionId: number | null;
  institucionNombre: string | null;
  /**
   * Tipo del centro de estudios (`university` | `institute` | `school`).
   *
   * Opcional porque hay recorridos a medio andar guardados de antes de que
   * existiera: sin tipo, el paso académico deja el campo editable en vez de
   * bloquearlo con un valor inventado.
   */
  institucionTipo?: TipoInstitucion | null;
  montoMatricula: number;
  montoPrimeraCuota: number;
  plazoMeses: number;
}

export function leerDatosMatricula(landing: string): DatosMatricula | null {
  try {
    const crudo = localStorage.getItem(getMatriculaKey(landing));
    return crudo ? (JSON.parse(crudo) as DatosMatricula) : null;
  } catch {
    // Almacenamiento no disponible (modo privado o sin cuota).
    return null;
  }
}

/**
 * Guarda la institución elegida conservando lo demás.
 *
 * La escribe la pantalla de selección, que corre ANTES de que existan montos y
 * plazo. Por eso hace mezcla en vez de sobrescribir: si alguien vuelve atrás a
 * cambiar de institución, no se pierde lo ya cargado en la calculadora.
 */
export function guardarInstitucion(
  landing: string,
  institucionId: number,
  institucionNombre: string,
  institucionTipo: TipoInstitucion
): void {
  const previo = leerDatosMatricula(landing);
  guardarDatosMatricula(landing, {
    montoMatricula: previo?.montoMatricula ?? 0,
    montoPrimeraCuota: previo?.montoPrimeraCuota ?? 0,
    plazoMeses: previo?.plazoMeses ?? 0,
    institucionId,
    institucionNombre,
    institucionTipo,
  });
}

function guardarDatosMatricula(landing: string, datos: DatosMatricula): void {
  try {
    localStorage.setItem(getMatriculaKey(landing), JSON.stringify(datos));
  } catch {
    // Almacenamiento no disponible: el flujo sigue, el formulario pedirá los datos.
  }
}

export interface ParametrosEntrega {
  landing: string;
  productoId: number;
  /** Variante del producto. Sin ella la solicitud queda con dos tasas distintas. */
  varianteId: number;
  productoSlug: string;
  productoNombre: string;
  montos: MontosMatricula;
  /** Los importes que pide la landing, con el código donde viaja cada uno. */
  campos: CampoMontoPerfil[];
  plazoMeses: number;
  cuotaMensual: number;
  institucionId: number | null;
  institucionNombre: string | null;
  institucionTipo: TipoInstitucion | null;
}

/**
 * Escribe el producto y los datos de matrícula, y devuelve el objeto guardado.
 *
 * El monto financiado es la suma de los dos importes, no un precio de catálogo:
 * este producto no tiene precio de lista real, lo define quien solicita.
 */
export function entregarASolicitar(parametros: ParametrosEntrega): SelectedProduct | null {
  const {
    landing,
    productoId,
    varianteId,
    productoSlug,
    productoNombre,
    montos,
    campos,
    plazoMeses,
    cuotaMensual,
    institucionId,
    institucionNombre,
    institucionTipo,
  } = parametros;

  const total = totalAFinanciar(montos);

  const producto: SelectedProduct = {
    id: String(productoId),
    variantId: String(varianteId),
    slug: productoSlug,
    name: productoNombre,
    shortName: productoNombre,
    brand: 'BaldeCash',
    type: TIPO_EFECTIVO,
    price: total,
    monthlyPayment: cuotaMensual,
    months: plazoMeses,
    term: plazoMeses,
    // La matrícula se financia completa: sin cuota inicial y en un solo tramo.
    initialPercent: 0,
    initialAmount: 0,
    initialInstallments: 1,
    image: '',
    paymentFrequency: 'mensual',
    // Este producto no está en el catálogo y su cuota ya la resolvió el
    // simulador con el plazo elegido. Sin esta marca, el asistente le pide
    // planes al catálogo y le pisa la cuota con la del producto publicado.
    outOfCatalog: true,
  };

  try {
    localStorage.setItem(getStorageKey(landing), JSON.stringify(producto));
  } catch {
    // Sin almacenamiento no hay forma de entregar el producto a /solicitar.
    return null;
  }

  guardarDatosMatricula(landing, {
    institucionId,
    institucionNombre,
    institucionTipo,
    montoMatricula: montos.matricula,
    montoPrimeraCuota: montos.primeraCuota,
    plazoMeses,
  });

  // Los importes van además al estado del formulario, que es lo único que viaja
  // con la solicitud. La clave de arriba la lee esta pantalla; esta otra, el
  // asistente.
  sembrarImportesEnFormulario(landing, montos, campos);

  return producto;
}
