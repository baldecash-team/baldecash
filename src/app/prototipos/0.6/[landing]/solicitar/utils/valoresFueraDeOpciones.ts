/**
 * Borrador con opciones que ya no existen (BAL-4433).
 *
 * El borrador del wizard vive en `localStorage` sin vencimiento y se restaura
 * tal cual. Si en el panel se ocultó una opción después de que la persona la
 * eligió, el valor viejo sobrevive: la lista no lo pinta como elegido, pero el
 * campo NO está vacío, así que «requerido» pasa y el valor se envía. Así llegó
 * `income_proof_type = "billetera_digital"` a la solicitud 128137 (ucv,
 * 4-oct-2026) cuando el campo solo ofrecía `boleta_pago`, `recibo_honorarios`
 * y `ninguno`.
 *
 * Esta función descarta esos valores para que la persona vuelva a elegir. Solo
 * mira campos lista con opciones PROPIAS (las que trae el wizard): los que
 * cargan su lista de otro lado (`options_source`, `cascade_from`) no se pueden
 * contrastar acá. Un campo que no está en el formulario actual tampoco se toca,
 * ni los que llena el prellenado del documento (`prefill_config`, p. ej.
 * `gender`): llegan en el formato del buró y el backend los normaliza.
 *
 * Devuelve el MISMO objeto si no hubo nada que descartar (para no disparar un
 * render ni reescribir el storage de gusto).
 */
import { getPrefillTargetFieldCodes, type WizardStep } from '../../../services/wizardApi';
import type { FieldState } from '../types/solicitar';

const TIPOS_LISTA = new Set(['radio', 'select', 'autocomplete', 'checkbox', 'checkbox_group']);

/** code -> valores válidos, juntando los pasos donde aparece el campo. */
function opcionesPorCampo(steps: WizardStep[]): Map<string, Set<string>> {
  const porCampo = new Map<string, Set<string>>();
  const prellenados = new Set<string>();
  for (const step of steps) {
    for (const field of step.fields ?? []) {
      for (const code of getPrefillTargetFieldCodes(field.prefill_config)) prellenados.add(code);
    }
  }
  for (const step of steps) {
    for (const field of step.fields ?? []) {
      if (!TIPOS_LISTA.has(field.type) || prellenados.has(field.code)) continue;
      if (field.options_source || field.cascade_from) continue;
      const opciones = field.options ?? [];
      // Sin opciones propias no hay contra qué comparar (y un checkbox sin
      // opciones es la casilla simple "true"/"false").
      if (opciones.length === 0) continue;
      const valores = porCampo.get(field.code) ?? new Set<string>();
      for (const opcion of opciones) valores.add(String(opcion.value));
      porCampo.set(field.code, valores);
    }
  }
  return porCampo;
}

export function descartarValoresFueraDeOpciones(
  formData: Record<string, FieldState>,
  steps: WizardStep[],
): Record<string, FieldState> {
  const porCampo = opcionesPorCampo(steps);
  if (porCampo.size === 0) return formData;

  let resultado: Record<string, FieldState> | null = null;
  const cambiar = (code: string, state: FieldState) => {
    if (!resultado) resultado = { ...formData };
    resultado[code] = state;
  };

  for (const [code, valores] of porCampo) {
    const state = formData[code];
    if (!state) continue;
    const { value } = state;

    if (Array.isArray(value)) {
      // Solo listas de textos (casilla múltiple); los archivos no son opciones.
      if (value.length === 0 || !value.every(v => typeof v === 'string')) continue;
      const vigentes = (value as string[]).filter(v => valores.has(v));
      if (vigentes.length === value.length) continue;
      cambiar(code, { ...state, value: vigentes, label: undefined, error: undefined });
      continue;
    }

    if (typeof value !== 'string' || value === '' || valores.has(value)) continue;
    cambiar(code, { ...state, value: '', label: undefined, error: undefined });
  }

  return resultado ?? formData;
}
