/**
 * datosDePrueba — respuestas de prueba para «Probar en la web» (BAL-5367).
 *
 * El panel genera un link que abre el formulario real con un equipo elegido y
 * las respuestas ya llenas, para recorrerlo hasta el final sin teclear. Las
 * respuestas NO son fijas: se arman con el config que el wizard trae de ws2
 * (tipo de campo, opciones, validaciones, dependencias), porque un valor que no
 * está entre las opciones lo borra `descartarValoresFueraDeOpciones` y uno que
 * no pasa la validación deja el paso trabado.
 *
 * Reglas:
 * - Se recorre en el orden de los pasos y se respeta la visibilidad: un campo
 *   que con lo ya llenado no se muestra, no se llena.
 * - Cada campo prueba varios candidatos y se queda con el primero que pasa
 *   `validateField` (la misma validación que corre al apretar «Continuar»). Si
 *   ninguno pasa, se deja vacío y se cuenta en `omitidos`: mejor un campo vacío
 *   que un valor que el formulario rechaza.
 * - DNI: siempre el del Balde Bot (99999901, ws2 `app/core/test_identity.py`).
 *   NUNCA el 00000010: es una persona real.
 * - Archivos, campos ocultos y direcciones con Google se omiten.
 * - Listas con opciones propias: la primera visible que no sea «Otro».
 *   Listas que cargan sus opciones de ws2 (`options_source`): se piden con
 *   `cargarOpciones` (inyectable para los tests).
 */

import {
  evaluateFieldVisibility,
  filterFieldOptions,
  getForcedValue,
  validateField,
  type CascadingOption,
  type WizardField,
  type WizardStep,
} from '../../../services/wizardApi';

/** DNI ficticio del equipo (Balde Bot). No existe en RENIEC ni en Equifax. */
export const DNI_DE_PRUEBA = '99999901';

export type ValorDePrueba = string | string[];

export interface RespuestaDePrueba {
  fieldId: string;
  value: ValorDePrueba;
  label?: string;
}

export interface ResultadoDePrueba {
  respuestas: RespuestaDePrueba[];
  /** Códigos de los campos visibles que no se pudieron llenar con algo válido. */
  omitidos: string[];
}

/** Trae las opciones de un campo que las carga de ws2. */
export type CargarOpciones = (
  field: WizardField,
  valores: Record<string, ValorDePrueba>,
) => Promise<CascadingOption[]>;

const TIPOS_QUE_NO_SE_LLENAN = new Set(['file', 'hidden', 'address_autocomplete']);
const TIPOS_LISTA = new Set(['radio', 'select', 'autocomplete']);
const PARECE_OTRO = /^(otro|otra|otros|ninguno|ninguna)\b/i;

function hoyMas(dias: number, hoy: Date): string {
  const d = new Date(hoy.getTime());
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Candidatos de texto según lo que el código del campo dice que es. */
function candidatosDeTexto(field: WizardField): string[] {
  const code = field.code.toLowerCase();
  if (/document_number|dni|numero_documento|nro_documento/.test(code)) return [DNI_DE_PRUEBA];
  if (/apellido_materno|maternal|second_last/.test(code)) return ['Prueba'];
  if (/apellido|last_name|surname|paternal/.test(code)) return ['Bot'];
  if (/full_name|nombre_completo|nombres_completos/.test(code)) return ['Balde Bot Prueba'];
  if (/first_name|nombre/.test(code)) return ['Balde'];
  if (/ruc/.test(code)) return ['20123456789', '10123456789'];
  if (/direccion|address|calle/.test(code)) return ['Av. Prueba 123', 'Av Prueba 123'];
  if (/referencia/.test(code)) return ['Frente al parque de prueba'];
  if (/empresa|company|employer|centro_laboral/.test(code)) return ['Empresa de Prueba SAC'];
  if (/cargo|puesto|position|ocupacion/.test(code)) return ['Analista de prueba'];
  if (/codigo|code|matricula/.test(code)) return ['2026000001', 'U20260001', '12345678'];
  const largoMin = field.min_length ?? 0;
  const base = ['Prueba de BaldeCash', 'Prueba', 'Prueba 123', '123456'];
  if (largoMin > 0) base.push('Prueba'.padEnd(largoMin, 'a'));
  return base;
}

function candidatosDeCorreo(field: WizardField): string[] {
  const dominios = (field.allowed_email_domains || []).map((d) => d.replace(/^@/, '')).filter(Boolean);
  if (dominios.length) return dominios.map((d) => `balde.bot@${d}`);
  return ['balde.bot.prueba@baldecash.com'];
}

function candidatosDeNumero(field: WizardField): string[] {
  const min = field.min_value ?? null;
  const max = field.max_value ?? null;
  const code = field.code.toLowerCase();
  const base = /ingreso|income|sueldo|salario|monto|amount/.test(code) ? 2500
    : /edad|age/.test(code) ? 25
    : /hijo|dependiente|ciclo|semestre/.test(code) ? 1 : 1000;
  let v = base;
  if (min != null && v < min) v = min;
  if (max != null && v > max) v = max;
  return [String(v), ...(min != null ? [String(min)] : []), ...(max != null ? [String(max)] : [])];
}

function candidatosDeFecha(field: WizardField, hoy: Date): string[] {
  const code = field.code.toLowerCase();
  if (/birth|nacimiento|fecha_nac/.test(code)) return ['1995-01-01', '2000-01-01', '1990-06-15'];
  const iso = (v?: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? [v] : []);
  if (field.date_range === 'future') return [hoyMas(7, hoy), hoyMas(30, hoy), ...iso(field.date_min)];
  if (field.date_range === 'any') return [hoyMas(0, hoy), ...iso(field.date_min)];
  return ['2020-03-01', hoyMas(-30, hoy), ...iso(field.date_max), ...iso(field.date_min)];
}

function primeraOpcion<T extends { value: string | number; label: string }>(opciones: T[]): T | undefined {
  return opciones.find((o) => !PARECE_OTRO.test(String(o.label))) ?? opciones[0];
}

function opcionDni<T extends { value: string | number; label: string }>(opciones: T[]): T | undefined {
  return opciones.find((o) => /^dni$/i.test(String(o.value)) || /\bdni\b/i.test(String(o.label)));
}

/**
 * Arma las respuestas de prueba de todo el formulario, en el orden de los
 * pasos. `hoy` es inyectable para los tests.
 */
export async function armarDatosDePrueba(
  steps: WizardStep[],
  cargarOpciones: CargarOpciones,
  hoy: Date = new Date(),
): Promise<ResultadoDePrueba> {
  const valores: Record<string, ValorDePrueba> = {};
  const etiquetas: Record<string, string> = {};
  const cache: Record<string, CascadingOption[]> = {};
  const omitidos: string[] = [];

  const ordenados = [...steps].sort((a, b) => a.order - b.order);
  for (const step of ordenados) {
    for (const field of step.fields ?? []) {
      if (field.code in valores) continue;
      if (TIPOS_QUE_NO_SE_LLENAN.has(field.type) || field.readonly) continue;
      // `hidden` con una regla «mostrar» = oculto hasta que la regla se cumple
      // (p. ej. el monto del alquiler): decide la visibilidad, no el flag.
      const seMuestraPorRegla = (field.dependency_groups || []).some((g) => g.action === 'show');
      if (field.hidden && !seMuestraPorRegla) continue;
      if (!evaluateFieldVisibility(field, valores)) continue;

      const forzado = getForcedValue(field, valores);
      let candidatos: Array<{ value: ValorDePrueba; label?: string }> = [];

      if (forzado != null) {
        candidatos = [{ value: forzado }];
      } else if (field.options_source) {
        let opciones: CascadingOption[] = [];
        try {
          opciones = await cargarOpciones(field, valores);
        } catch {
          opciones = [];
        }
        cache[field.code] = opciones;
        const elegida = (field.code.includes('document_type') && opcionDni(opciones)) || primeraOpcion(opciones);
        if (elegida) candidatos = [{ value: String(elegida.value), label: elegida.label }];
      } else if (TIPOS_LISTA.has(field.type) || (field.type === 'checkbox' && field.options?.length)) {
        const opciones = filterFieldOptions(field, valores);
        const elegida = (field.code.includes('document_type') && opcionDni(opciones)) || primeraOpcion(opciones);
        if (elegida) {
          const multiple = field.type === 'checkbox' || field.allow_multiple;
          candidatos = [{ value: multiple ? [String(elegida.value)] : String(elegida.value), label: elegida.label }];
        }
      } else if (field.type === 'checkbox') {
        candidatos = [{ value: 'true' }];
      } else if (field.type === 'document_number') {
        candidatos = [{ value: DNI_DE_PRUEBA }];
      } else if (field.type === 'email') {
        candidatos = candidatosDeCorreo(field).map((value) => ({ value }));
      } else if (field.type === 'phone') {
        // El segundo celular (alterno, del familiar) distinto del principal.
        const otro = /secondary|alterno|alternativo|supporter|familiar|referencia|apoder/i.test(field.code);
        candidatos = (otro ? ['987654321', '923456781', '912345678'] : ['912345678', '987654321', '923456781'])
          .map((value) => ({ value }));
      } else if (field.type === 'date') {
        candidatos = candidatosDeFecha(field, hoy).map((value) => ({ value }));
      } else if (field.type === 'number' || field.type === 'currency') {
        candidatos = candidatosDeNumero(field).map((value) => ({ value }));
      } else {
        candidatos = candidatosDeTexto(field).map((value) => ({ value }));
      }

      const valido = candidatos.find((c) =>
        validateField(field, c.value, { ...valores }, cache, true).isValid,
      );
      if (!valido) {
        if (field.required) omitidos.push(field.code);
        continue;
      }
      valores[field.code] = valido.value;
      if (valido.label) etiquetas[field.code] = valido.label;
    }
  }

  return {
    respuestas: Object.entries(valores).map(([fieldId, value]) => ({
      fieldId, value, ...(etiquetas[fieldId] ? { label: etiquetas[fieldId] } : {}),
    })),
    omitidos,
  };
}
