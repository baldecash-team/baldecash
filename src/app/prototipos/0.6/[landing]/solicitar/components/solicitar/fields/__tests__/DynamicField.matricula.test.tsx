/**
 * Institución bloqueada en el paso académico del producto de matrícula.
 *
 * La institución se elige en la primera pantalla del recorrido
 * (`/{landing}/universidad`) y es la que define el convenio con el que se simuló
 * la cuota. Volver a preguntarla en el paso académico invita a contestar otra
 * cosa, y la solicitud terminaría con una institución distinta de la que fijó el
 * precio.
 *
 * El campo se sigue dibujando con su componente real —el autocompletado de
 * centros de estudio— y no como un texto plano: bloqueado, pero reconocible.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import { WizardField } from '../../../../../../services/wizardApi';
import { getMatriculaKey } from '../../../../../calculadora/utils/entrega';
import { INSTITUCIONES } from '../../../../../universidad/types/instituciones';

// --- mocks -----------------------------------------------------------------

const mockUpdateField = jest.fn();
const mockFieldValues: Record<string, string> = {};

jest.mock('../../../../context/WizardContext', () => ({
  useWizard: () => ({
    getFieldValue: (code: string) => mockFieldValues[code] ?? '',
    getFieldError: () => undefined,
    updateField: mockUpdateField,
    formData: {},
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

let mockAgreementData: Record<string, unknown> | null = null;
const LANDING = 'matricula-ucv';

jest.mock('../../../../../context/LayoutContext', () => ({
  useLayout: () => ({ agreementData: mockAgreementData, landing: LANDING }),
}));

jest.mock('../../../../hooks/useFieldTracking', () => ({
  useFieldTracking: () => ({ onFieldFocus: jest.fn(), onFieldBlur: jest.fn() }),
}));

jest.mock('../CascadingSelectField', () => ({
  CascadingSelectField: ({ field, disabled }: { field: { code: string }; disabled?: boolean }) => (
    <div
      data-testid="cascading-select"
      data-code={field.code}
      data-disabled={disabled ? 'true' : 'false'}
    />
  ),
}));

jest.mock('../SegmentedControl', () => ({
  SegmentedControl: ({ id, disabled }: { id: string; disabled?: boolean }) => (
    <div data-testid="segmented-control" data-code={id} data-disabled={disabled ? 'true' : 'false'} />
  ),
}));

import { DynamicField } from '../DynamicField';

// --- fixtures --------------------------------------------------------------

const institutionField = {
  id: 30,
  code: 'institution',
  label: 'Institución',
  type: 'autocomplete',
  options_source: 'study-centers',
  options: [],
  required: true,
  readonly: false,
  dependency_groups: [],
} as unknown as WizardField;

const institutionTypeField = {
  id: 31,
  code: 'institution_type',
  label: 'Tipo de institución',
  type: 'select',
  options_source: null,
  options: [
    { value: 'university', label: 'Universidad' },
    { value: 'institute', label: 'Instituto' },
    { value: 'school', label: 'Colegio' },
    { value: 'other', label: 'Otro' },
  ],
  required: true,
  readonly: false,
  dependency_groups: [],
} as unknown as WizardField;

function sembrarMatricula(datos: Record<string, unknown>): void {
  localStorage.setItem(getMatriculaKey(LANDING), JSON.stringify(datos));
}

const UCV = {
  institucionId: 409,
  institucionNombre: 'Universidad César Vallejo',
  institucionTipo: 'university',
  montoMatricula: 1200,
  montoPrimeraCuota: 0,
  plazoMeses: 6,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  for (const k of Object.keys(mockFieldValues)) delete mockFieldValues[k];
  mockAgreementData = null;
});

// --- tests -----------------------------------------------------------------

describe('DynamicField — institución del producto de matrícula', () => {
  it('bloquea la institución y la rellena con la elegida en el primer paso', () => {
    sembrarMatricula(UCV);

    render(<DynamicField field={institutionField} />);

    // Sigue siendo el autocompletado de centros de estudio, no un texto plano.
    const campo = screen.getByTestId('cascading-select');
    expect(campo).toHaveAttribute('data-code', 'institution');
    expect(campo).toHaveAttribute('data-disabled', 'true');

    // El id es lo que viaja; el nombre se guarda como etiqueta para que el
    // campo bloqueado no se vea vacío.
    expect(mockUpdateField).toHaveBeenCalledWith(
      'institution',
      '409',
      'Universidad César Vallejo'
    );
  });

  it('deriva el tipo de institución y también lo bloquea', () => {
    sembrarMatricula(UCV);

    render(<DynamicField field={institutionTypeField} />);

    const campo = screen.getByTestId('segmented-control');
    expect(campo).toHaveAttribute('data-code', 'institution_type');
    expect(campo).toHaveAttribute('data-disabled', 'true');
    expect(mockUpdateField).toHaveBeenCalledWith('institution_type', 'university', 'Universidad');
  });

  it('no vuelve a escribir el campo si ya tiene el valor elegido', () => {
    sembrarMatricula(UCV);
    mockFieldValues['institution'] = '409';

    render(<DynamicField field={institutionField} />);

    expect(mockUpdateField).not.toHaveBeenCalled();
  });

  it('deja la institución editable cuando no hay recorrido de matrícula', () => {
    render(<DynamicField field={institutionField} />);

    expect(screen.getByTestId('cascading-select')).toHaveAttribute('data-disabled', 'false');
    expect(mockUpdateField).not.toHaveBeenCalled();
  });

  it('deja el tipo editable si los datos guardados son de antes de que existiera', () => {
    // Recorrido a medio andar, guardado sin tipo: bloquearlo exigiría inventar
    // un valor, y un dato inventado y de solo lectura es peor que preguntarlo.
    const sinTipo: Record<string, unknown> = { ...UCV };
    delete sinTipo.institucionTipo;
    sembrarMatricula(sinTipo);

    render(<DynamicField field={institutionTypeField} />);

    expect(screen.getByTestId('segmented-control')).toHaveAttribute('data-disabled', 'false');
    expect(mockUpdateField).not.toHaveBeenCalled();
  });

  it('el convenio de la landing manda sobre la institución de matrícula', () => {
    sembrarMatricula(UCV);
    mockAgreementData = { study_center_id: 551, institution_name: 'Senati' };

    render(<DynamicField field={institutionField} />);

    expect(mockUpdateField).toHaveBeenCalledWith('institution', '551', 'Senati');
    expect(mockUpdateField).not.toHaveBeenCalledWith(
      'institution',
      '409',
      'Universidad César Vallejo'
    );
  });
});

/**
 * El bloqueo no conoce a ninguna institución en particular.
 *
 * Hoy solo una está habilitada, pero habilitar otra es cambiar un `disponible`
 * en la lista curada. Si esto dependiera de un id concreto, ese cambio de una
 * línea dejaría el paso académico editable sin que nadie se entere.
 */
describe('DynamicField — sirve para cualquier institución de la lista', () => {
  it.each(INSTITUCIONES.map((i) => [i.nombre, i]))(
    'bloquea la institución y su tipo con %s',
    (_nombre, institucion) => {
      sembrarMatricula({
        institucionId: institucion.id,
        institucionNombre: institucion.nombre,
        institucionTipo: institucion.tipo,
        montoMatricula: 1000,
        montoPrimeraCuota: 0,
        plazoMeses: 6,
      });

      const { unmount } = render(<DynamicField field={institutionField} />);
      expect(screen.getByTestId('cascading-select')).toHaveAttribute('data-disabled', 'true');
      expect(mockUpdateField).toHaveBeenCalledWith(
        'institution',
        String(institucion.id),
        institucion.nombre
      );
      unmount();

      render(<DynamicField field={institutionTypeField} />);
      expect(screen.getByTestId('segmented-control')).toHaveAttribute('data-disabled', 'true');
      expect(mockUpdateField).toHaveBeenCalledWith(
        'institution_type',
        institucion.tipo,
        expect.any(String)
      );
    }
  );

  /**
   * El tipo tiene que existir entre las opciones del campo. Si alguien suma una
   * institución con un tipo que el banco de preguntas no ofrece, el campo queda
   * bloqueado mostrando un valor crudo que nadie eligió.
   */
  it.each(INSTITUCIONES.map((i) => [i.nombre, i.tipo]))(
    'el tipo de %s es una opción real del campo',
    (_nombre, tipo) => {
      const valores = (institutionTypeField.options ?? []).map((o) => String(o.value));
      expect(valores).toContain(tipo);
    }
  );
});
