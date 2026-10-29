'use client';

/**
 * Errores al salir del campo, para Diseño 2 (BAL-4959).
 *
 * En Diseño 1 los errores aparecen recién al apretar "Continuar". Acá también
 * al dejar un campo (blur): se marca como tocado y se valida con el MISMO
 * validador del formulario (`validateField`, el que usa `validateStep`). Desde
 * ese momento el campo se revalida a cada cambio, así el borde pasa de rojo a
 * verde mientras la persona corrige.
 *
 * El error se guarda donde siempre (`setFieldError` del contexto del wizard),
 * así que "Continuar" y el envío lo ven igual que antes. Lo que pinta el borde
 * es `DynamicWizardStep` con `camposTocados`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWizard } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext';
import { validateField, type WizardField, type WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { estaVacio, seValidaAlSalir } from '@/app/prototipos/0.6/[landing]/solicitar/utils/validarAlSalir';

/**
 * Lugares fuera del campo a donde se va el foco SIN haberlo dejado: la lista
 * de un select o un buscador se abre en un portal.
 */
const DENTRO_DE_UN_DESPLEGABLE = '[role="listbox"], [role="option"], [role="dialog"], [data-slot="popover"], [data-slot="content"]';

/**
 * Un campo que el propio formulario vació (p. ej. el número de documento al
 * cambiar de tipo) vuelve a "no tocado": su error espera a que la persona lo
 * toque de nuevo o intente continuar (hallazgo menor del QA F10, BAL-4969).
 */
export const EVENTO_CAMPO_REINICIADO = 'diseno2:campo-reiniciado';

/** Avisa que `codigo` se vació solo y no debe mostrar error todavía. */
export function reiniciarCampoTocado(codigo: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(EVENTO_CAMPO_REINICIADO, { detail: codigo }));
}

export function useErroresAlSalir(step: WizardStep | null) {
  const { formData, setFieldError, getAllDynamicOptions } = useWizard();
  // `form_field_error` (BAL-4969, casuísticas): estaba en el catálogo de ws2
  // pero nadie lo emitía, y la medición de errores por campo salía vacía.
  const tracker = useEventTrackerOptional();
  // Cada paso arranca sin campos tocados: lo tocado se guarda junto con el
  // paso al que pertenece, y al cambiar de paso se lee como vacío.
  const codigoPaso = step?.code ?? null;
  const [tocados, setTocados] = useState<{ paso: string | null; campos: ReadonlySet<string> }>(() => ({
    paso: codigoPaso,
    campos: new Set(),
  }));
  const camposTocados = useMemo<ReadonlySet<string>>(
    () => (tocados.paso === codigoPaso ? tocados.campos : new Set()),
    [tocados, codigoPaso],
  );

  // `form_field_error` sale al VALIDAR —al salir del campo o al intentar
  // continuar/enviar—, una vez por error. Antes salía a cada tecla: el cambio
  // del valor limpia el error del contexto, la revalidación lo volvía a poner
  // y cada vuelta contaba como "error nuevo" (E2E BAL-4969: 8 filas de
  // "Mínimo 9 caracteres" al tipear un celular).
  // - `porReportarRef`: campos que se acaban de dejar (blur), pendientes de
  //   reportar en la próxima validación.
  // - `reportadosRef`: el último mensaje reportado por campo; se borra cuando
  //   el campo queda válido, así un error NUEVO vuelve a contar.
  const porReportarRef = useRef<Set<string>>(new Set());
  const reportadosRef = useRef<Map<string, string>>(new Map());
  const [salidas, setSalidas] = useState(0);
  useEffect(() => {
    porReportarRef.current = new Set();
    reportadosRef.current = new Map();
  }, [codigoPaso]);

  const reportar = useCallback((codigo: string, error: string) => {
    if (reportadosRef.current.get(codigo) === error) return;
    reportadosRef.current.set(codigo, error);
    tracker?.track('form_field_error', {
      step_code: codigoPaso,
      field_code: codigo,
      error_field: codigo,
      error_message: error,
      diseno: 2,
    });
  }, [tracker, codigoPaso]);

  const camposPorCodigo = useMemo(() => {
    const m = new Map<string, WizardField>();
    for (const f of step?.fields ?? []) m.set(f.code, f);
    return m;
  }, [step]);

  // BAL-5255: los datos del familiar (los que se comparan contra el
  // solicitante, `not_equals_field`) vacíos no avisan al salir: su
  // «obligatorio» espera al «Continuar». Con algo escrito, como cualquier campo.
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  const vacioQueEspera = useCallback((codigo: string, valor: unknown) => {
    const field = camposPorCodigo.get(codigo);
    return !!field && seValidaAlSalir(field) && estaVacio(valor as string | string[] | undefined);
  }, [camposPorCodigo]);

  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const contenedor = (e.target as HTMLElement).closest<HTMLElement>('[data-campo]');
    const codigo = contenedor?.dataset.campo;
    if (!contenedor || !codigo) return;
    const siguiente = e.relatedTarget as HTMLElement | null;
    if (siguiente && (contenedor.contains(siguiente) || siguiente.closest(DENTRO_DE_UN_DESPLEGABLE))) return;
    if (vacioQueEspera(codigo, formDataRef.current[codigo]?.value)) return;
    porReportarRef.current.add(codigo);
    // Un campo ya tocado no cambia `tocados`: esto fuerza la revalidación.
    setSalidas((n) => n + 1);
    setTocados((prev) => {
      if (prev.paso !== codigoPaso) return { paso: codigoPaso, campos: new Set([codigo]) };
      if (prev.campos.has(codigo)) return prev;
      return { paso: codigoPaso, campos: new Set(prev.campos).add(codigo) };
    });
  }, [codigoPaso, vacioQueEspera]);

  // Un campo vaciado por el formulario deja de contar como tocado.
  useEffect(() => {
    const alReiniciar = (e: Event) => {
      const codigo = (e as CustomEvent<string>).detail;
      if (!codigo) return;
      setTocados((prev) => {
        if (prev.paso !== codigoPaso || !prev.campos.has(codigo)) return prev;
        const campos = new Set(prev.campos);
        campos.delete(codigo);
        return { paso: codigoPaso, campos };
      });
      setFieldError(codigo, null);
    };
    window.addEventListener(EVENTO_CAMPO_REINICIADO, alReiniciar);
    return () => window.removeEventListener(EVENTO_CAMPO_REINICIADO, alReiniciar);
  }, [codigoPaso, setFieldError]);

  // Validar lo tocado, y revalidar a cada cambio. Solo se escribe el error si
  // cambió: `setFieldError` crea estado nuevo y sin el guard esto no pararía.
  useEffect(() => {
    if (camposTocados.size === 0) return;
    const valores: Record<string, string | string[]> = {};
    for (const [k, st] of Object.entries(formData)) {
      if (st?.value !== undefined) valores[k] = st.value as string | string[];
    }
    const opciones = getAllDynamicOptions();
    for (const codigo of camposTocados) {
      const field = camposPorCodigo.get(codigo);
      if (!field) continue;
      // Si una dependencia lo escondió, ya no se valida (ni se le deja error).
      if (!document.querySelector(`[data-campo="${CSS.escape(codigo)}"]`)) continue;
      // El campo se tocó, así que estaba en pantalla: no se repite la regla de
      // visibilidad (que con el prellenado no es la simple).
      const actual = formData[codigo]?.error ?? null;
      // Familiar tocado y luego vaciado: no se le pone «obligatorio» (escribir
      // ya borró su error); el que ponga «Continuar» se deja tal cual.
      if (vacioQueEspera(codigo, valores[codigo])) {
        if (actual) reportar(codigo, actual);
        porReportarRef.current.delete(codigo);
        continue;
      }
      const { error } = validateField(field, valores[codigo], valores, opciones, true, { diseno2: true });
      if ((error ?? null) !== actual) setFieldError(codigo, error);
      if (!error) reportadosRef.current.delete(codigo);
      else if (porReportarRef.current.has(codigo)) reportar(codigo, error);
      porReportarRef.current.delete(codigo);
    }
  }, [camposTocados, formData, camposPorCodigo, getAllDynamicOptions, setFieldError, reportar, salidas, vacioQueEspera]);

  // Errores que pone la validación de "Continuar"/"Enviar" en campos que la
  // persona no llegó a tocar: se reportan una vez (mismo registro de arriba).
  useEffect(() => {
    for (const codigo of camposPorCodigo.keys()) {
      if (camposTocados.has(codigo)) continue;
      const error = formData[codigo]?.error;
      if (error) reportar(codigo, error);
    }
  }, [formData, camposPorCodigo, camposTocados, reportar]);

  return { camposTocados, onBlur };
}

export default useErroresAlSalir;
