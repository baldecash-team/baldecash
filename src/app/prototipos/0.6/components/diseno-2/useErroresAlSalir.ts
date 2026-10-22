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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWizard } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext';
import { validateField, type WizardField, type WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

/**
 * Lugares fuera del campo a donde se va el foco SIN haberlo dejado: la lista
 * de un select o un buscador se abre en un portal.
 */
const DENTRO_DE_UN_DESPLEGABLE = '[role="listbox"], [role="option"], [role="dialog"], [data-slot="popover"], [data-slot="content"]';

export function useErroresAlSalir(step: WizardStep | null) {
  const { formData, setFieldError, getAllDynamicOptions } = useWizard();
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

  const camposPorCodigo = useMemo(() => {
    const m = new Map<string, WizardField>();
    for (const f of step?.fields ?? []) m.set(f.code, f);
    return m;
  }, [step]);

  const onBlur = useCallback((e: React.FocusEvent<HTMLElement>) => {
    const contenedor = (e.target as HTMLElement).closest<HTMLElement>('[data-campo]');
    const codigo = contenedor?.dataset.campo;
    if (!contenedor || !codigo) return;
    const siguiente = e.relatedTarget as HTMLElement | null;
    if (siguiente && (contenedor.contains(siguiente) || siguiente.closest(DENTRO_DE_UN_DESPLEGABLE))) return;
    setTocados((prev) => {
      if (prev.paso !== codigoPaso) return { paso: codigoPaso, campos: new Set([codigo]) };
      if (prev.campos.has(codigo)) return prev;
      return { paso: codigoPaso, campos: new Set(prev.campos).add(codigo) };
    });
  }, [codigoPaso]);

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
      const { error } = validateField(field, valores[codigo], valores, opciones, true);
      const actual = formData[codigo]?.error ?? null;
      if ((error ?? null) !== actual) setFieldError(codigo, error);
    }
  }, [camposTocados, formData, camposPorCodigo, getAllDynamicOptions, setFieldError]);

  return { camposTocados, onBlur };
}

export default useErroresAlSalir;
