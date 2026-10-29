'use client';

/**
 * `form_field_error` en Diseño 1 (BAL-5276, punto 1).
 *
 * Hasta acá solo lo emitía Diseño 2 (`diseno-2/useErroresAlSalir`), y al
 * comparar D2 parecía tener más errores solo porque los contaba. Diseño 1 pone
 * sus errores en el contexto del wizard en dos momentos:
 * - al salir del campo (los datos del familiar, BAL-5255, en `DynamicField`);
 * - al «Continuar» (`validateStepDetallado`, todos los campos del paso).
 *
 * Este hook mira esos errores y reporta cada uno UNA vez, con las mismas
 * propiedades que Diseño 2 (`step_code`, `field_code`, `field_name`,
 * `error_field`, `error_rule`, `error_message`, `momento`, `diseno`). El
 * momento y la regla los anota quien pone el error (`origenDeErrores`); sin
 * anotación, `continuar` (las validaciones de «Continuar»/«Enviar» de
 * StepClient). Un campo que deja de tener error se olvida, así que si vuelve
 * a fallar cuenta otra vez. Nunca se manda lo que se escribió.
 */

import { useEffect, useRef } from 'react';
import { useWizard } from '../context/WizardContext';
import { useEventTrackerOptional } from '../context/EventTrackerContext';
import type { WizardStep } from '../../../services/wizardApi';
import { origenDelError } from '../../../services/origenDeErrores';

export function useErroresDeCampoD1(step: WizardStep, activo: boolean): void {
  const { formData } = useWizard();
  const tracker = useEventTrackerOptional();
  const reportadosRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    reportadosRef.current = new Map();
  }, [step.code]);

  useEffect(() => {
    if (!activo || !tracker) return;
    for (const field of step.fields) {
      const codigo = field.code;
      const error = formData[codigo]?.error;
      if (!error) {
        reportadosRef.current.delete(codigo);
        continue;
      }
      if (reportadosRef.current.get(codigo) === error) continue;
      reportadosRef.current.set(codigo, error);
      const origen = origenDelError(codigo, error);
      tracker.track('form_field_error', {
        step_code: step.code,
        field_code: codigo,
        field_name: codigo,
        error_field: codigo,
        error_rule: origen?.regla ?? null,
        error_message: error,
        momento: origen?.momento ?? 'continuar',
        diseno: 1,
      });
    }
  }, [activo, tracker, formData, step]);
}

export default useErroresDeCampoD1;
