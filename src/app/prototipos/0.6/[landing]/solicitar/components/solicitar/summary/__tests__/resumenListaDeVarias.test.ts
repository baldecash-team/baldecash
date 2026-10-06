/**
 * BAL-4354 — el Resumen muestra lo marcado en una lista de varias con sus
 * textos («Deportes, Tecnología»), no con los códigos.
 */
jest.mock('../../../../context/WizardConfigContext', () => ({ useWizardConfig: () => ({}) }));
jest.mock('../../../../context/WizardContext', () => ({ useWizard: () => ({}) }));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({ useAnalytics: () => ({}) }));

import { resolveFieldValue } from '../WizardSummary';
import type { WizardField } from '../../../../../../services/wizardApi';

const intereses = {
  code: 'intereses',
  type: 'select',
  allow_multiple: true,
  options: [
    { value: 'deportes', label: 'Deportes' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'musica', label: 'Música' },
  ],
} as unknown as WizardField;

describe('Resumen de una lista de varias', () => {
  it('muestra los textos separados por coma', () => {
    expect(resolveFieldValue(intereses, ['deportes', 'tecnologia'])).toBe('Deportes, Tecnología');
  });

  it('una opción que ya no existe se muestra tal cual', () => {
    expect(resolveFieldValue(intereses, ['deportes', 'viejo'])).toBe('Deportes, viejo');
  });

  it('nada marcado se ve como «-»', () => {
    expect(resolveFieldValue(intereses, [])).toBe('-');
  });
});
