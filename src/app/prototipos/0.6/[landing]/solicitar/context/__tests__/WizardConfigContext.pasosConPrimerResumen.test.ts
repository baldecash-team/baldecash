/**
 * BAL-4959: `pasosConPrimerResumen` es la cuenta de N que usa el progreso de
 * Diseño 2 (`ProgresoV2`, vía `pasosDelProgreso` de `ShellV2`) y `TransicionDelWizard`.
 * Con dos pasos de resumen (ej. "Resumen" + la pantalla del contrato, los dos
 * con `is_summary_step: true`) el total NO debe duplicarse: solo cuenta el
 * primero, igual que `WizardProgress.progressSteps` en Diseño 1.
 */
import { pasosConPrimerResumen } from '../WizardConfigContext';
import type { WizardStep } from '../../../../services/wizardApi';

const paso = (code: string, is_summary_step = false): WizardStep =>
  ({ code, url_slug: code, name: code, title: code, is_summary_step, fields: [], order: 0 } as unknown as WizardStep);

describe('pasosConPrimerResumen', () => {
  it('sin resumen: solo los regulares', () => {
    const steps = [paso('datos-personales'), paso('datos-academicos')];
    expect(pasosConPrimerResumen(steps).map((s) => s.code)).toEqual(['datos-personales', 'datos-academicos']);
  });

  it('con un resumen: regulares + ese resumen', () => {
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
