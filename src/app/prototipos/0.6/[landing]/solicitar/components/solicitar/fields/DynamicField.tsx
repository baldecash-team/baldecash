'use client';

/**
 * DynamicField - Renders the correct field component based on API config
 * Maps WizardField type to the appropriate UI component
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { WizardField, WizardFieldOption, filterFieldOptions, getForcedValue } from '../../../../../services/wizardApi';
import { sanitizeEmailInput } from '../../../../../services/emailValidation';
import { isPersonNameField, sanitizeNameInput } from '../../../../../services/nameValidation';
import { useWizard, FILE_PENDING_REUPLOAD } from '../../../context/WizardContext';
import { useLayout } from '../../../../context/LayoutContext';
import { useFieldTracking } from '../../../hooks/useFieldTracking';
import { largoAlSalir } from '../../../utils/largoAlSalir';
import { CampoDelRegistroContext, useRegistroDeOpciones } from '../../../hooks/useRegistroDeOpciones';
import { leadLockKey } from '../../../hooks/useLeadPrefill';
import { useDatosMatricula } from '../../../../calculadora/utils/useDatosMatricula';
import { errorAlSalir, estaVacio, seValidaAlSalir } from '../../../utils/validarAlSalir';
import { resolverForma } from './formaDeLista';
import { TextInput, contadorVisible } from './TextInput';
import { CurrencyInput } from './CurrencyInput';
import { SegmentedControl } from './SegmentedControl';
import { RadioGroup } from './RadioGroup';
import { SelectInput } from './SelectInput';
import { CascadingSelectField } from './CascadingSelectField';
import { DateInput } from './DateInput';
import { limitesDelCampo } from '../../../../../services/fechaLimites';
import { FileUpload } from './FileUpload';
import { TextArea } from './TextArea';
import { CheckboxField } from './CheckboxField';
import { ListaDeVarias, comoLista } from './ListaDeVarias';
import { DocumentNumberField } from './DocumentNumberField';
import { AddressAutocompleteField } from './AddressAutocompleteField';
import { useCamposV2 } from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';
import { mensajeCelularV2 } from '@/app/prototipos/0.6/components/diseno-2/paso1/datosPersonalesV2';

interface DynamicFieldProps {
  field: WizardField;
  showError?: boolean;
  /** Step order number for event tracking */
  stepOrder?: number;
  /**
   * Diseño 2 (BAL-4960, revisión F2): avisa a `DynamicWizardStep` cuando este
   * campo tiene un error LOCAL (no vive en `formData`: `DateInput` por edad
   * mínima / fuera de rango, `AddressAutocompleteField` por geolocalización
   * o Google Maps). Se usa para ocultar la pista (`hint`) — "si hay error
   * visible, la pista no se muestra" — sin duplicar la lógica de validación.
   */
  onLocalErrorChange?: (code: string, hasError: boolean) => void;
  /**
   * Diseño 2 (BAL-4960): la pista, cuando el campo la pinta junto a su
   * contador de caracteres (ver `pistaVaEnElCampo`). Si no, la pinta
   * `DynamicWizardStep` y esto llega vacío.
   */
  pista?: string | null;
}

/** Tipos que pintan su contador dentro de `TextInput` (con `max_length`). */
const TIPOS_CON_CONTADOR = new Set(['text', 'phone']);

/**
 * Diseño 2 (BAL-4960): ¿la pista va dentro del campo, en la fila de su
 * contador? Solo si el campo es de texto con máximo y el contador se ve.
 */
export function pistaVaEnElCampo(field: WizardField, v2: boolean): boolean {
  return v2 && TIPOS_CON_CONTADOR.has(field.type) && !!field.max_length
    && contadorVisible(field.show_counter, v2);
}

/**
 * BAL-5254: el globo de ayuda (`FieldTooltip`) de cualquier campo sabe de qué
 * campo es por este contexto, para registrar `help_open`.
 */
export const DynamicField: React.FC<DynamicFieldProps> = (props) => (
  <CampoDelRegistroContext.Provider value={props.field.code}>
    <DynamicFieldInterno {...props} />
  </CampoDelRegistroContext.Provider>
);

const DynamicFieldInterno: React.FC<DynamicFieldProps> = ({ field, showError = false, stepOrder, onLocalErrorChange, pista }) => {
  const { getFieldValue, getFieldError, updateField, setFieldError, getAllDynamicOptions, formData } = useWizard();
  const { agreementData, landing } = useLayout();
  const { onFieldFocus, onFieldBlur } = useFieldTracking(stepOrder);
  const { onOptionSelected } = useRegistroDeOpciones();

  // Diseño 2 (BAL-4963): los textos de Brenda para el celular.
  const v2 = useCamposV2();
  // Diseño 1 (BAL-5255): los datos del familiar se validan al salir del campo.
  // Diseño 2 ya valida al salir con `useErroresAlSalir`.
  const validaAlSalir = !v2 && seValidaAlSalir(field);
  const [validadoAlSalir, setValidadoAlSalir] = useState(false);
  const mostrarError = showError || validadoAlSalir;

  // Get current value and error
  const value = getFieldValue(field.code) as string;
  const error = mostrarError ? getFieldError(field.code) : undefined;

  // Build form values object for visibility evaluation
  const formValues = useMemo(() => {
    const values: Record<string, string | string[]> = {};
    for (const [key, state] of Object.entries(formData)) {
      if (state?.value !== undefined) {
        values[key] = state.value as string | string[];
      }
    }
    return values;
  }, [formData]);


  // Dynamic field lock: when a `set_value` dependency group is satisfied,
  // the backend forces this field to a specific value and we disable input.
  // Generalises the previous hardcoded "minor → income_source=familiar" rule.
  const forcedValue = useMemo(
    () => getForcedValue(field, formValues),
    [field, formValues]
  );

  // Apply the forced value and mirror it to the legacy submit flag used by
  // useSubmitApplication to tag auto-filled income_source as `llenada_manualmente`.
  useEffect(() => {
    if (forcedValue != null) {
      if (value !== forcedValue) {
        updateField(field.code, forcedValue);
      }
      if (field.code === 'income_source' && formData['_income_source_auto']?.value !== 'true') {
        updateField('_income_source_auto', 'true');
      }
    } else if (field.code === 'income_source' && formData['_income_source_auto']?.value === 'true') {
      updateField('_income_source_auto', '');
    }
  }, [forcedValue, value, field.code, updateField, formData]);

  const isLockedByMinor = forcedValue != null;

  // Prellenado desde el lead que el socio empujó: solo lectura. Es el dato que
  // el socio declaró y sobre el que se le liquida; si el postulante lo edita,
  // el lead y la solicitud dejan de ser la misma persona.
  const isLockedFromLead = formData[leadLockKey(field.code)]?.value === 'true';

  // For convenio landings: auto-populate and lock the institution field
  const isConvenioInstitution = field.code === 'institution' && !!agreementData?.study_center_id;
  useEffect(() => {
    if (!isConvenioInstitution) return;
    const studyCenterId = String(agreementData!.study_center_id);
    const label = agreementData!.institution_short_name || agreementData!.institution_name || agreementData!.name || '';
    if (getFieldValue('institution') !== studyCenterId) {
      updateField('institution', studyCenterId, label);
    }
  }, [isConvenioInstitution, agreementData, getFieldValue, updateField]);

  // For convenio landings: auto-populate and lock the institution_type field.
  // The value (university/institute/school) comes from the study_center's
  // institution_type and matches the field option values 1:1.
  const isConvenioInstitutionType = field.code === 'institution_type' && !!agreementData?.institution_type;
  useEffect(() => {
    if (!isConvenioInstitutionType) return;
    const typeValue = agreementData!.institution_type!;
    // Label from the field's own options (fallback to the raw value).
    const typeLabel = field.options?.find((o) => String(o.value) === typeValue)?.label ?? typeValue;
    if (getFieldValue('institution_type') !== typeValue) {
      updateField('institution_type', typeValue, typeLabel);
    }
  }, [isConvenioInstitutionType, agreementData, getFieldValue, updateField, field.options]);

  // Producto de matrícula: la institución NO se elige acá. Se eligió en la
  // primera pantalla del recorrido (`/{landing}/universidad`), es la que define
  // el convenio con el que se simuló la cuota, y volver a pedirla en el paso
  // académico invita a contestar otra cosa. Se rellena y se bloquea.
  //
  // El convenio de la landing manda sobre esto: si la landing tiene uno, la
  // institución sale de ahí y este bloque no interviene.
  const datosMatricula = useDatosMatricula(landing);

  const isMatriculaInstitution =
    field.code === 'institution' &&
    !isConvenioInstitution &&
    !!datosMatricula?.institucionId;
  useEffect(() => {
    if (!isMatriculaInstitution) return;
    const studyCenterId = String(datosMatricula!.institucionId);
    const label = datosMatricula!.institucionNombre || '';
    if (getFieldValue('institution') !== studyCenterId) {
      updateField('institution', studyCenterId, label);
    }
  }, [isMatriculaInstitution, datosMatricula, getFieldValue, updateField]);

  // El tipo se deriva de la institución elegida, no se pregunta. Los valores
  // (university/institute/school) son los mismos que usan las opciones del
  // campo, así que entran sin traducir.
  const isMatriculaInstitutionType =
    field.code === 'institution_type' &&
    !isConvenioInstitutionType &&
    !!datosMatricula?.institucionTipo;
  useEffect(() => {
    if (!isMatriculaInstitutionType) return;
    const typeValue = datosMatricula!.institucionTipo!;
    const typeLabel = field.options?.find((o) => String(o.value) === typeValue)?.label ?? typeValue;
    if (getFieldValue('institution_type') !== typeValue) {
      updateField('institution_type', typeValue, typeLabel);
    }
  }, [isMatriculaInstitutionType, datosMatricula, getFieldValue, updateField, field.options]);

  // Filter options based on visibility conditions
  const filteredOptions = useMemo(() => {
    let options = filterFieldOptions(field, formValues);
    // Remove "otros" option from institution_type field
    if (field.code === 'institution_type') {
      options = options.filter(opt => opt.value !== 'other');
    }
    // When a set_value rule is active, restrict the dropdown to only the forced
    // option so the UI visibly shows a single enabled choice.
    if (forcedValue != null) {
      options = options.filter(opt => String(opt.value) === forcedValue);
    }
    return options;
  }, [field, formValues, forcedValue]);

  // BAL-4383: con `auto_select_single`, si a una lista le queda una sola
  // opción visible (p. ej. tras filtrar por dependencias) se elige sola, sin
  // que el cliente tenga que tocarla. Antes del switch/return para no romper
  // el orden de hooks.
  useEffect(() => {
    if (!field.auto_select_single) return;
    if (field.type !== 'select' && field.type !== 'autocomplete') return;
    if (filteredOptions.length !== 1) return;
    const unica = filteredOptions[0];
    if (field.allow_multiple) {
      // Con varias el valor es una lista: `[]` también es «nada marcado».
      if (comoLista(value).length > 0) return;
      updateField(field.code, [unica.value], unica.label);
      return;
    }
    if (value) return;
    updateField(field.code, unica.value, unica.label);
  }, [field.auto_select_single, field.allow_multiple, field.type, field.code, filteredOptions, value, updateField]);

  // Build tooltip from API help_text (100% from BD)
  // NOTE: Must be before conditional return to maintain hooks order
  const tooltip = useMemo(() => {
    if (field.help_text) {
      return {
        title: field.help_text.title || field.label,
        description: field.help_text.description || '',
        recommendation: field.help_text.recommendation ?? undefined,
      };
    }
    return undefined;
  }, [field.help_text, field.label]);

  // Focus/blur handlers for event tracking
  const handleFocus = useCallback(() => {
    onFieldFocus(field.code);
  }, [field.code, onFieldFocus]);

  const handleBlur = useCallback(() => {
    const currentValue = getFieldValue(field.code);
    const hasValue = Array.isArray(currentValue)
      ? currentValue.length > 0
      : !!currentValue;
    // BAL-5254: en celular y documento (de la persona y del familiar) también
    // el largo de lo escrito; en los demás campos, como siempre.
    const largo = largoAlSalir(field.code, currentValue);
    if (largo === undefined) onFieldBlur(field.code, hasValue);
    else onFieldBlur(field.code, hasValue, largo);
    // BAL-5255: con algo escrito, el mismo error que daría «Continuar»; vacío
    // no avisa (el «obligatorio» espera al «Continuar»). Al escribir,
    // `updateField` borra el error, así que al corregir se va solo.
    if (validaAlSalir && !estaVacio(currentValue as string | string[])) {
      const valor = currentValue as string | string[];
      setFieldError(field.code, errorAlSalir(field, valor, { ...formValues, [field.code]: valor }, getAllDynamicOptions()));
      setValidadoAlSalir(true);
    }
  }, [field, getFieldValue, onFieldBlur, validaAlSalir, setFieldError, formValues, getAllDynamicOptions]);

  // Diseño 2: reenvía el error local del campo (DateInput, AddressAutocompleteField)
  // con su código, para que `DynamicWizardStep` oculte la pista.
  const handleLocalErrorChange = useCallback(
    (hasError: boolean) => {
      onLocalErrorChange?.(field.code, hasError);
    },
    [field.code, onLocalErrorChange]
  );


  // Common props for all field types
  const commonProps = {
    id: field.code,
    label: field.label,
    value,
    onChange: (newValue: string) => updateField(field.code, newValue),
    onFocus: handleFocus,
    onBlur: handleBlur,
    error,
    required: field.required,
    disabled:
      field.readonly ||
      isLockedByMinor ||
      isConvenioInstitution ||
      isConvenioInstitutionType ||
      isMatriculaInstitution ||
      isMatriculaInstitutionType ||
      isLockedFromLead,
    tooltip,
    helpText: undefined as string | undefined,
  };

  // Listas, radios y botones de una opción: además de guardar, registran la
  // opción elegida (`option_selected`, BAL-5254). `value` aún es la anterior.
  const onChangeOpcion = (newValue: string) => {
    onOptionSelected(field.code, newValue, value);
    commonProps.onChange(newValue);
  };

  // Render based on field type
  switch (field.type) {
    case 'document_number':
      // Special field that triggers auto-prefill on complete document number
      return (
        <DocumentNumberField
          field={field}
          showError={mostrarError}
          // BAL-5210: entrada y salida como los demás campos (titular y familiar).
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

    case 'address':
    case 'address_autocomplete':
      // Google Maps Places autocomplete for address input
      // Backend sends 'address' (FieldType.ADDRESS), frontend also supports 'address_autocomplete'
      return (
        <AddressAutocompleteField
          field={field}
          showError={showError}
          onLocalErrorChange={onLocalErrorChange ? handleLocalErrorChange : undefined}
          // BAL-5210: entrada y salida como los demás campos.
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

    case 'text':
      return (
        <TextInput
          {...commonProps}
          // Los campos `text` son dinámicos (vienen de `form_field`), así que
          // el filtro se aplica SOLO a los que son nombres de persona:
          // "Empresa donde Labora" o "¿Qué beca tiene?" llevan números con
          // todo derecho. Ver `PERSON_NAME_FIELD_CODES`.
          onChange={
            isPersonNameField(field.code)
              ? (newValue: string) => updateField(field.code, sanitizeNameInput(newValue))
              : commonProps.onChange
          }
          type="text"
          placeholder={field.placeholder || undefined}
          maxLength={field.max_length || undefined}
          showCounter={field.show_counter}
          pista={pista}
          success={!error && !!value}
        />
      );

    case 'email':
      return (
        <TextInput
          {...commonProps}
          // Pegar el hipervínculo del correo (`mailto:alguien@dominio.pe`) era la
          // forma más común de guardar un address que Mailgun luego no podía
          // entregar. Se limpia al vuelo, igual que `phone` filtra los no-dígitos.
          onChange={(newValue: string) => updateField(field.code, sanitizeEmailInput(newValue))}
          type="email"
          placeholder={field.placeholder || undefined}
          inputMode="email"
          success={!error && !!value}
        />
      );

    case 'phone':
      return (
        <TextInput
          {...commonProps}
          onChange={(newValue: string) => updateField(field.code, newValue.replace(/\D/g, ''))}
          // Diseño 2: el texto del error de Brenda (vacío, corto, no empieza
          // con 9); cuándo hay error lo decide el validador. Solo el celular
          // del titular habla de "tu celular".
          error={v2 ? mensajeCelularV2({ error, valor: value, field, bloqueado: isLockedFromLead }) : error}
          type="tel"
          placeholder={field.placeholder || undefined}
          maxLength={field.max_length || undefined}
          showCounter={field.show_counter}
          pista={pista}
          inputMode="numeric"
          success={!error && !!value}
          startContent={field.prefix || undefined}
        />
      );

    case 'currency':
      // BAL-4395: el cliente ve «2,500»; a form_data va «2500» como siempre.
      // BAL-4400: `decimal_places` 0 = solo soles enteros; null = como hoy.
      return (
        <CurrencyInput
          {...commonProps}
          placeholder={field.placeholder || undefined}
          success={!error && !!value}
          startContent={field.prefix || undefined}
          endContent={field.suffix || undefined}
          min={field.min_value ?? undefined}
          max={field.max_value ?? undefined}
          step={field.step ?? undefined}
          decimales={field.decimal_places}
        />
      );

    case 'number':
      return (
        <TextInput
          {...commonProps}
          type="number"
          placeholder={field.placeholder || undefined}
          inputMode="numeric"
          success={!error && !!value}
          startContent={field.prefix || undefined}
          endContent={field.suffix || undefined}
          min={field.min_value ?? undefined}
          max={field.max_value ?? undefined}
          step={field.step ?? undefined}
        />
      );

    case 'date':
      // Determinar el offset de año inicial según el tipo de campo
      // birth_date: -20 años (para personas ~20 años)
      // work_start_date y otros: 0 (año actual)
      const dateYearOffset = field.code === 'birth_date' ? -20 : 0;
      const dateMinAge = field.code === 'birth_date' ? 17 : 0;
      // Fecha mínima / máxima exactas del panel (BAL-4396), resueltas contra hoy.
      const limitesFecha = limitesDelCampo(field);
      return (
        <DateInput
          {...commonProps}
          placeholder={field.placeholder || 'Selecciona una fecha'}
          success={!error && !!value}
          defaultYearOffset={dateYearOffset}
          minAge={dateMinAge}
          dateRange={field.date_range ?? 'past'}
          minDate={limitesFecha.min}
          maxDate={limitesFecha.max}
          limitMessage={limitesFecha.mensaje}
          onLocalErrorChange={onLocalErrorChange ? handleLocalErrorChange : undefined}
        />
      );

    case 'radio':
      // Use SegmentedControl for 2-3 options, RadioGroup for 4-5, SelectInput for 6+
      const radioOptions = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }));

      if (radioOptions.length <= 3) {
        // 2-3 options: horizontal buttons
        return (
          <SegmentedControl
            {...commonProps}
            onChange={onChangeOpcion}
            options={radioOptions}
            success={!error && !!value}
          />
        );
      }
      if (radioOptions.length <= 5) {
        // 4-5 options: vertical card list (like 0.5)
        return (
          <RadioGroup
            {...commonProps}
            onChange={onChangeOpcion}
            options={radioOptions}
            success={!error && !!value}
          />
        );
      }
      // 6+ options: dropdown select
      return (
        <SelectInput
          {...commonProps}
          onChange={onChangeOpcion}
          options={radioOptions}
          placeholder={field.placeholder || 'Selecciona una opción'}
          searchable={false}
          success={!error && !!value}
        />
      );

    case 'select':
    case 'autocomplete': {
      const opcionesLista = filteredOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description || undefined,
      }));
      // Toda lista del sistema va a CascadingSelectField (aquí `forma` sale
      // «search»). Las chicas que dejan elegir forma (BAL-4701: tipo de
      // documento, estado civil) la resuelven allá, con las opciones que trae
      // el catálogo: aquí todavía no se sabe cuántas son.
      const delSistema = Boolean(field.options_source || field.cascade_from);
      const varias = Boolean(field.allow_multiple) && !delSistema;
      const forma = resolverForma({
        tipo: field.type,
        displayMode: field.display_mode,
        cantidad: opcionesLista.length,
        delSistema,
        varias,
      });
      if (varias) {
        // BAL-4354: el cliente marca varias; se guarda `string[]`.
        return (
          <ListaDeVarias
            id={field.code}
            label={field.label}
            forma={forma}
            value={comoLista(formData[field.code]?.value)}
            onChange={(valores, textos) => updateField(field.code, valores, textos)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            options={opcionesLista}
            placeholder={field.placeholder || undefined}
            error={error}
            tooltip={tooltip}
            disabled={commonProps.disabled}
            required={field.required}
          />
        );
      }
      if (forma === 'buttons') {
        return <SegmentedControl {...commonProps} onChange={onChangeOpcion} options={opcionesLista} success={!error && !!value} />;
      }
      if (forma === 'cards') {
        return <RadioGroup {...commonProps} onChange={onChangeOpcion} options={opcionesLista} success={!error && !!value} />;
      }
      return (
        <CascadingSelectField
          field={field}
          staticOptions={opcionesLista}
          showError={showError}
          searchable={forma === 'search'}
          disabled={commonProps.disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    }

    case 'textarea':
      return (
        <TextArea
          {...commonProps}
          placeholder={field.placeholder || undefined}
          maxLength={field.max_length || undefined}
          showCounter={field.show_counter}
          rows={4}
          success={!error && !!value}
        />
      );

    case 'checkbox':
      // Checkbox puede ser simple (sin opciones) o múltiple (con opciones)
      const checkboxOptions = filteredOptions.length > 0
        ? filteredOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))
        : undefined;

      // Para checkbox, el value puede ser string o array
      const checkboxValue = formData[field.code]?.value;

      return (
        <CheckboxField
          id={field.code}
          label={field.label}
          value={checkboxValue as string | string[]}
          onChange={(newValue) => updateField(field.code, newValue as string | string[])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          options={checkboxOptions}
          error={error}
          required={field.required}
          disabled={field.readonly}
          tooltip={tooltip}
          success={!error && (Array.isArray(checkboxValue) ? checkboxValue.length > 0 : !!checkboxValue)}
          // Este campo vive en el grid de 12 columnas del paso (gap-y-1): sin
          // esta línea reservada, un checkbox simple queda pegado a la
          // siguiente pregunta (4px) mientras los demás campos dejan ~40px.
          reserveBottomSpace
        />
      );

    case 'hidden':
      // Hidden fields store values in formData but render nothing
      return null;

    case 'file':
      // FileUpload expects different value type
      const fileValue = formData[field.code]?.value;
      // Detect reupload marker (file was uploaded but lost after page refresh)
      const needsReupload = fileValue === FILE_PENDING_REUPLOAD;
      const lostFileNames = needsReupload ? formData[field.code]?.label : undefined;
      const files = Array.isArray(fileValue) ? fileValue : [];

      return (
        <FileUpload
          id={field.code}
          label={field.label}
          value={files as unknown as { id: string; file: File; name: string; size: number; type: string }[]}
          onChange={(newFiles) => updateField(field.code, newFiles as unknown as File[])}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accept={field.accepted_file_types || '.pdf,.jpg,.jpeg,.png'}
          maxFiles={field.max_files || 1}
          maxSize={(field.max_file_size_mb || 5) * 1024 * 1024}
          error={error}
          warning={needsReupload
            ? `Archivo previamente cargado (${lostFileNames || 'archivo'}). Por favor, vuelve a subirlo.`
            : undefined}
          required={field.required}
          disabled={field.readonly}
          tooltip={tooltip}
        />
      );

    default:
      // Fallback to text input
      return (
        <TextInput
          {...commonProps}
          type="text"
          placeholder={field.placeholder || undefined}
          success={!error && !!value}
        />
      );
  }
};

export default DynamicField;
