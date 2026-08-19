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
import type { MontosMatricula } from '../types/calculadora';
import { totalAFinanciar } from '../types/calculadora';

/** Clave propia del producto de matrícula, con el mismo prefijo que usa el resto. */
export function getMatriculaKey(landing: string): string {
  return `baldecash-${landing}-matricula-datos`;
}

/** Lo que la calculadora deja para que el formulario lo recupere. */
export interface DatosMatricula {
  /** Identificador del centro de estudios elegido en la pantalla de institución. */
  institucionId: number | null;
  institucionNombre: string | null;
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
  institucionNombre: string
): void {
  const previo = leerDatosMatricula(landing);
  guardarDatosMatricula(landing, {
    montoMatricula: previo?.montoMatricula ?? 0,
    montoPrimeraCuota: previo?.montoPrimeraCuota ?? 0,
    plazoMeses: previo?.plazoMeses ?? 0,
    institucionId,
    institucionNombre,
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
  productoSlug: string;
  productoNombre: string;
  montos: MontosMatricula;
  plazoMeses: number;
  cuotaMensual: number;
  institucionId: number | null;
  institucionNombre: string | null;
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
    productoSlug,
    productoNombre,
    montos,
    plazoMeses,
    cuotaMensual,
    institucionId,
    institucionNombre,
  } = parametros;

  const total = totalAFinanciar(montos);

  const producto: SelectedProduct = {
    id: String(productoId),
    slug: productoSlug,
    name: productoNombre,
    shortName: productoNombre,
    brand: 'BaldeCash',
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
    montoMatricula: montos.matricula,
    montoPrimeraCuota: montos.primeraCuota,
    plazoMeses,
  });

  return producto;
}
