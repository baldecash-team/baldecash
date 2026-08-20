/**
 * BAL-3168 — El resumen muestra campos ocultos que el paso nunca renderizo.
 *
 * Un campo con `hidden: true` y sin `dependency_groups` no se puede mostrar
 * nunca en su paso: no hay condicion que lo active. El paso lo entiende asi
 * (`DynamicWizardStep.fieldVisibility`) y la validacion tambien
 * (`wizardApi.validateStep`), pero el resumen (`WizardSummary.visibleFields`)
 * delega en `evaluateFieldVisibility` sin aplicar esa regla.
 *
 * `evaluateFieldVisibility` devuelve `true` a proposito -- su propio test lo
 * documenta como "visibility controlled by caller". El resumen es el unico de
 * los tres consumidores que no la aplica.
 *
 * Estos tests replican los dos filtros tal como estan hoy en el codigo para
 * dejar la diferencia a la vista.
 */
import { evaluateFieldVisibility, WizardField } from './wizardApi';

function createField(overrides: Partial<WizardField> = {}): WizardField {
  return {
    id: 1,
    code: 'test_field',
    label: 'Test Field',
    type: 'text',
    placeholder: null,
    help_text: null,
    required: false,
    readonly: false,
    hidden: false,
    grid_columns: 12,
    grid_columns_mobile: 12,
    prefix: null,
    suffix: null,
    min_length: null,
    max_length: null,
    min_value: null,
    max_value: null,
    pattern: null,
    mask: null,
    input_mode: null,
    options_source: null,
    options_filter: null,
    options: [],
    validations: [],
    dependency_groups: [],
    accepted_file_types: null,
    max_file_size_mb: null,
    max_files: 1,
    ...overrides,
  } as WizardField;
}

/** Replica de `DynamicWizardStep.fieldVisibility` (sin la rama de prefill). */
function visibleEnElPaso(
  field: WizardField,
  formValues: Record<string, string | string[]>
): boolean {
  if (field.hidden && (!field.dependency_groups || field.dependency_groups.length === 0)) {
    return false;
  }
  return evaluateFieldVisibility(field, formValues);
}

/** Replica de `WizardSummary.visibleFields` (sin la rama de prefill). */
function visibleEnElResumen(
  field: WizardField,
  formValues: Record<string, string | string[]>
): boolean {
  return evaluateFieldVisibility(field, formValues);
}

describe('BAL-3168: campo oculto sin dependencias', () => {
  const valores = { prueba_campo: 'valor-desde-localstorage' };

  it('el paso NO lo muestra', () => {
    const field = createField({ code: 'prueba_campo', hidden: true, dependency_groups: [] });
    expect(visibleEnElPaso(field, valores)).toBe(false);
  });

  it('el resumen SI lo muestra — este es el bug', () => {
    const field = createField({ code: 'prueba_campo', hidden: true, dependency_groups: [] });
    expect(visibleEnElResumen(field, valores)).toBe(true);
  });

  it('las dos pantallas discrepan sobre el mismo campo', () => {
    const field = createField({ code: 'prueba_campo', hidden: true, dependency_groups: [] });
    expect(visibleEnElResumen(field, valores)).not.toBe(visibleEnElPaso(field, valores));
  });

  it('un campo normal no oculto coincide en las dos', () => {
    const field = createField({ code: 'email', hidden: false, dependency_groups: [] });
    expect(visibleEnElPaso(field, valores)).toBe(true);
    expect(visibleEnElResumen(field, valores)).toBe(true);
  });
});
