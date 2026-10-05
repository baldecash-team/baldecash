import { destaparPorLeadSinBuro } from '../DynamicWizardStep';

const LOCK = '_lead_locked_document_number';

describe('destaparPorLeadSinBuro', () => {
  it('destapa los campos personales para un CE que vino del link corto del socio', () => {
    expect(
      destaparPorLeadSinBuro(
        { [LOCK]: 'true', document_type: 'ce', document_number: '007805455' },
        'document_number',
        'document_type',
      ),
    ).toBe(true);
  });

  it('no cambia nada para quien llega por su cuenta, aunque sea CE', () => {
    expect(
      destaparPorLeadSinBuro(
        { document_type: 'ce', document_number: '007805455' },
        'document_number',
        'document_type',
      ),
    ).toBe(false);
  });

  it('no cambia nada para un DNI del link corto: ahi el buro si responde', () => {
    expect(
      destaparPorLeadSinBuro(
        { [LOCK]: 'true', document_type: 'dni', document_number: '74391469' },
        'document_number',
        'document_type',
      ),
    ).toBe(false);
  });

  it('sin tipo de documento resuelto todavia, no destapa nada', () => {
    expect(
      destaparPorLeadSinBuro({ [LOCK]: 'true', document_type: '' }, 'document_number', 'document_type'),
    ).toBe(false);
  });

  it('lee el tipo del campo que el disparador declare, no de uno fijo', () => {
    expect(
      destaparPorLeadSinBuro(
        { [LOCK]: 'true', tipo_documento: 'CE' },
        'document_number',
        'tipo_documento',
      ),
    ).toBe(true);
  });
});
