/**
 * BAL-4433: al restaurar el borrador, una opción que ya no existe en el campo
 * se descarta (caso 128137: `income_proof_type = "billetera_digital"` cuando
 * el campo solo ofrece boleta_pago / recibo_honorarios / ninguno).
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { WizardProvider, useWizard } from '../WizardContext';

const mockSteps = [{
  id: 1, code: 'eco', url_slug: 'eco', name: 'Eco', title: 'Eco', description: '',
  icon: '', order: 1, required: true, skippable: false, estimated_time_minutes: 1,
  is_summary_step: false, motivational: null,
  fields: [{
    id: 21, code: 'income_proof_type', label: 'Sustento', type: 'radio', required: true,
    readonly: false, hidden: false, grid_columns: 12, grid_columns_mobile: 12,
    options: [
      { value: 'boleta_pago', label: 'Boleta de pago' },
      { value: 'recibo_honorarios', label: 'Recibo por honorarios' },
      { value: 'ninguno', label: 'Ninguno' },
    ],
    validations: [], dependency_groups: [], max_files: null,
  }],
}];

jest.mock('../WizardConfigContext', () => ({
  useWizardConfigOptional: () => ({ steps: mockSteps }),
}));

const KEY = 'baldecash-wizard-ucv-data';

function Espia({ onData }: { onData: (d: Record<string, unknown>) => void }) {
  const { formData } = useWizard();
  onData(formData);
  return null;
}

describe('WizardProvider: borrador con opciones que ya no existen', () => {
  beforeEach(() => localStorage.clear());

  it('vacía la opción vieja al restaurar y la saca también del storage', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      income_proof_type: { value: 'billetera_digital', touched: true, label: 'Billetera digital' },
      first_name: { value: 'Ana', touched: true },
    }));
    let ultimo: Record<string, { value?: unknown }> = {};
    render(
      <WizardProvider landingSlug="ucv">
        <Espia onData={(d) => { ultimo = d as typeof ultimo; }} />
      </WizardProvider>,
    );

    await waitFor(() => expect(ultimo.first_name?.value).toBe('Ana'));
    await waitFor(() => expect(ultimo.income_proof_type?.value).toBe(''));
    await waitFor(() => {
      const guardado = JSON.parse(localStorage.getItem(KEY) || '{}');
      expect(guardado.income_proof_type.value).toBe('');
      expect(guardado.first_name.value).toBe('Ana');
    });
  });

  it('respeta la opción vigente', async () => {
    localStorage.setItem(KEY, JSON.stringify({
      income_proof_type: { value: 'ninguno', touched: true, label: 'Ninguno' },
    }));
    let ultimo: Record<string, { value?: unknown; label?: string }> = {};
    render(
      <WizardProvider landingSlug="ucv">
        <Espia onData={(d) => { ultimo = d as typeof ultimo; }} />
      </WizardProvider>,
    );
    await waitFor(() => expect(ultimo.income_proof_type?.value).toBe('ninguno'));
    expect(ultimo.income_proof_type?.label).toBe('Ninguno');
  });
});
