/**
 * BAL-4959: `pasosConPrimerResumen` es la cuenta de N que usa el progreso de
 * Diseño 2 (`ProgresoV2`, vía `pasosDelProgreso` de `ShellV2`) y `TransicionDelWizard`.
 * Con dos pasos de resumen (ej. "Resumen" + la pantalla del contrato, los dos
 * con `is_summary_step: true`) el total NO debe duplicarse: solo cuenta el
 * primero, igual que `WizardProgress.progressSteps` en Diseño 1.
 *
 * Re-revisión: sin NINGÚN `is_summary_step`, `WizardProgress` (líneas
 * ~125-139) igual agrega un "Resumen" sintético al final — así que acá
 * también, con la misma condición y la misma etiqueta, para que N sea igual
 * en los dos diseños.
 */
import { pasosConPrimerResumen } from '../WizardConfigContext';
import type { WizardStep } from '../../../../services/wizardApi';

const paso = (code: string, is_summary_step = false): WizardStep =>
  ({ code, url_slug: code, name: code, title: code, is_summary_step, fields: [], order: 0 } as unknown as WizardStep);

describe('pasosConPrimerResumen', () => {
  it('sin NINGÚN is_summary_step: agrega el mismo "Resumen" sintético que WizardProgress, para que N coincida', () => {
    const steps = [paso('datos-personales'), paso('datos-academicos')];
    const resultado = pasosConPrimerResumen(steps);
    expect(resultado.map((s) => s.code)).toEqual(['datos-personales', 'datos-academicos', 'resumen']);
    expect(resultado).toHaveLength(3); // mismo N que WizardProgress.progressSteps
    expect(resultado[2].title).toBe('Resumen');
    expect(resultado[2].is_summary_step).toBe(true);
  });

  it('con un resumen: regulares + ese resumen (su propio título, no se reemplaza)', () => {
    const steps = [paso('datos-personales'), paso('datos-academicos'), paso('resumen', true)];
    expect(pasosConPrimerResumen(steps).map((s) => s.code)).toEqual(['datos-personales', 'datos-academicos', 'resumen']);
  });

  it('con DOS resúmenes: solo cuenta el primero, no los dos', () => {
    const steps = [
      paso('datos-personales'),
      paso('datos-academicos'),
      paso('resumen', true),
      paso('contrato', true),
    ];
    const resultado = pasosConPrimerResumen(steps);
    expect(resultado.map((s) => s.code)).toEqual(['datos-personales', 'datos-academicos', 'resumen']);
    expect(resultado).toHaveLength(3); // N, no 4
  });
});
