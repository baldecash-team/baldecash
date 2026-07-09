'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import type { LeadFormConfig, LeadFormFieldConfig, LeadFormFieldOptionsFilter, StudyCenter } from '../../types/hero';
import { useSessionOptional } from '../../[landing]/solicitar/context/SessionContext';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import { TextInput } from '../../[landing]/solicitar/components/solicitar/fields/TextInput';
import { SelectInput } from '../../[landing]/solicitar/components/solicitar/fields/SelectInput';
import { GeoCascadeField } from './GeoCascadeField';
import { saveLeadId, saveLeadPrefill } from '../../hooks/useLeadGuard';

interface LeadLeadFormProps {
  config: LeadFormConfig;
  landingId: number;
  landing: string;
  studyCenters: StudyCenter[];
  primaryColor?: string;
  secondaryColor?: string;
  /** 'split' aplica el estilo de la versión simplificada (fieldsets/legends, consent en caja) */
  variant?: 'default' | 'split';
  submittingRef?: React.MutableRefObject<boolean>;
}

interface FormState {
  document_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  study_center_id: string;
  accepts_terms: boolean;
  accepts_marketing: boolean;
}

interface FormErrors {
  document_number?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  study_center_id?: string;
  accepts_terms?: string;
  general?: string;
  /** Campos dinámicos (grupo student/guardian, u otros no-core) se indexan por field.code */
  [code: string]: string | undefined;
}

type TextFormField = 'document_number' | 'first_name' | 'last_name' | 'phone' | 'study_center_id';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';
const APP_BASE_PATH = process.env.NEXT_PUBLIC_APP_BASE_PATH || '';

// Campos hardcodeados usados cuando la landing no tiene configuración dinámica en BD
const DEFAULT_FIELDS: LeadFormFieldConfig[] = [
  { code: 'document_number', label: 'DNI', field_type: 'document_number', placeholder: 'Ej. 12345678', is_required: true, is_visible: true, display_order: 0, input_mode: 'numeric', max_length: 8, pattern: '^\\d{8}$' },
  { code: 'first_name',      label: 'Nombre',   field_type: 'text', placeholder: 'Tus nombres',    is_required: true, is_visible: true, display_order: 1 },
  { code: 'last_name',       label: 'Apellido',  field_type: 'text', placeholder: 'Tus apellidos',  is_required: true, is_visible: true, display_order: 2 },
  { code: 'phone',           label: 'Celular',   field_type: 'phone', placeholder: 'Ej. 987654321', is_required: true, is_visible: true, display_order: 3, input_mode: 'numeric', max_length: 9, pattern: '^\\d{9}$' },
  { code: 'institution',     label: 'Lugar de estudio', field_type: 'autocomplete', placeholder: '¿Dónde estudias?', is_required: true, is_visible: true, display_order: 4, options_source: 'study-centers', min_search_length: 3 },
];

function buildOptionsSearchUrl(source: string, search: string, filter?: LeadFormFieldOptionsFilter | null): string {
  const params = new URLSearchParams({ search });
  if (filter?.type?.length) params.set('type', filter.type.join(','));
  if (filter?.ids?.length) params.set('ids', filter.ids.join(','));
  return `${API_BASE_URL}/public/options/${source}?${params.toString()}`;
}

function buildSearchUrl(search: string, filter?: LeadFormFieldOptionsFilter | null): string {
  return buildOptionsSearchUrl('study-centers', search, filter);
}

/** Codes con un slot fijo en FormState (comportamiento legacy, sin cambios). */
const CORE_FIELD_CODES = new Set(['document_number', 'first_name', 'last_name', 'phone']);

function resolveCoreKey(field: LeadFormFieldConfig): TextFormField | null {
  if (field.options_source === 'study-centers' || field.code === 'institution') return 'study_center_id';
  if (CORE_FIELD_CODES.has(field.code)) return field.code as TextFormField;
  return null;
}

/** Key usada para indexar `errors` — coincide con el core key cuando aplica, si no el field.code. */
function errorKeyFor(field: LeadFormFieldConfig): string {
  return resolveCoreKey(field) ?? field.code;
}

/** Consentimiento dinámico del form-config (p.ej. code='consent_14', declaración de edad/
 * apoderado). Es ADICIONAL y distinto del TyC+Privacidad fijo: su valor y texto se guardan en
 * `fields` (→ captured_data), mientras que `accepts_terms`/`consent_text` los aporta el TyC. */
function isConsentField(field: LeadFormFieldConfig): boolean {
  return field.field_type === 'checkbox' && field.code.toLowerCase().includes('consent');
}

/** Texto legal del checkbox fijo de TyC + Privacidad; se registra como `consent_text`. */
const TYC_CONSENT_TEXT =
  'He leído y acepto los Términos y Condiciones y la Política de Privacidad';

export const LeadLeadForm: React.FC<LeadLeadFormProps> = ({
  config,
  landingId,
  landing,
  studyCenters,
  primaryColor = '#4654CD',
  secondaryColor = '#03DBD0',
  variant = 'default',
  submittingRef,
}) => {
  const router = useRouter();
  const session = useSessionOptional();
  const tracker = useEventTrackerOptional();

  const [dynamicFields, setDynamicFields] = useState<LeadFormFieldConfig[] | null>(null);
  const [fieldsLoading, setFieldsLoading] = useState(true);

  useEffect(() => {
    setFieldsLoading(true);
    fetch(`${API_BASE_URL}/public/leads/form-config?landing_id=${landingId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.fields?.length) setDynamicFields(data.fields); })
      .catch(() => {})
      .finally(() => setFieldsLoading(false));
  }, [landingId]);

  // Prioridad: BD dinámica > config.fields del hero > DEFAULT_FIELDS hardcodeados
  const activeFields = (dynamicFields ?? config.fields ?? DEFAULT_FIELDS)
    .filter(f => f.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  const studyCenterField = activeFields.find(
    f => f.options_source === 'study-centers' || f.code === 'institution'
  );

  const hasStarted = useRef(false);
  const partialLeadIdRef = useRef<number | null>(null);
  const localSubmittingRef = useRef(false);
  // Usa el ref compartido del padre si se provee (evita doble submit entre instancias desktop/mobile)
  const isSubmittingRef = submittingRef ?? localSubmittingRef;
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const [form, setForm] = useState<FormState>({
    document_number: '',
    first_name: '',
    last_name: '',
    phone: '',
    study_center_id: '',
    accepts_terms: false,
    accepts_marketing: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Valores de campos que no tienen slot fijo en FormState (grupo student/guardian, u otros
  // codes fuera del set legacy). Se indexan por field.code.
  const [extra, setExtra] = useState<Record<string, string | boolean>>({});
  // Opciones remotas para autocompletes genéricos (options_source distinto de 'study-centers'),
  // indexadas por field.code — el flujo de institution sigue usando studyCenterOptions.
  const [remoteOptions, setRemoteOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  const getFieldValue = useCallback((field: LeadFormFieldConfig): string | boolean => {
    const key = resolveCoreKey(field);
    if (key) return form[key];
    const raw = extra[field.code];
    if (field.field_type === 'checkbox') return raw === true;
    return (raw as string) ?? '';
  }, [form, extra]);

  const setFieldValue = useCallback((field: LeadFormFieldConfig, value: string | boolean) => {
    const key = resolveCoreKey(field);
    if (key) {
      setForm((prev) => ({ ...prev, [key]: value }));
      return;
    }
    setExtra((prev) => ({ ...prev, [field.code]: value }));
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);
  const [studyCenterOptions, setStudyCenterOptions] = useState<{ value: string; label: string }[]>(() =>
    studyCenters.map((sc) => ({ value: String(sc.id), label: sc.shortName || sc.name }))
  );

  const handleStudyCenterSearch = useCallback(async (search: string) => {
    try {
      const url = buildSearchUrl(search, studyCenterField?.options_filter);
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setStudyCenterOptions((data.options || []).map((o: { value: number; label: string }) => ({
        value: String(o.value),
        label: o.label,
      })));
    } catch { /* ignore */ }
  }, [studyCenterField?.options_filter]);

  // Búsqueda remota genérica para autocompletes con options_source distinto de 'study-centers'
  // (p.ej. 'careers', 'geo-units/districts'). Reusa el mismo endpoint /public/options/{source}.
  const handleGenericAutocompleteSearch = useCallback(async (field: LeadFormFieldConfig, search: string) => {
    if (!field.options_source) return;
    try {
      const url = buildOptionsSearchUrl(field.options_source, search, field.options_filter);
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setRemoteOptions((prev) => ({
        ...prev,
        [field.code]: (data.options || []).map((o: { value: number | string; label: string }) => ({
          value: String(o.value),
          label: o.label,
        })),
      }));
    } catch { /* ignore */ }
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    for (const field of activeFields) {
      if (!field.is_required) continue;
      const key = errorKeyFor(field);
      if (field.field_type === 'checkbox') {
        if (!getFieldValue(field)) newErrors[key] = `Debes aceptar ${field.label.toLowerCase()}`;
        continue;
      }
      const rawValue = getFieldValue(field);
      const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      if (!value) {
        if (field.code === 'document_number') newErrors.document_number = 'Ingresa un DNI válido (8 dígitos)';
        else if (field.code === 'phone' || field.field_type === 'phone') newErrors[key] = 'Ingresa un celular válido (9 dígitos)';
        else if (field.code === 'institution' || field.options_source === 'study-centers') newErrors.study_center_id = `Selecciona ${field.label.toLowerCase()}`;
        else newErrors[key] = `Ingresa tu ${field.label.toLowerCase()}`;
      } else if (field.pattern && typeof value === 'string' && !new RegExp(field.pattern).test(value)) {
        if (field.code === 'document_number') newErrors.document_number = 'Ingresa un DNI válido (8 dígitos)';
        else if (field.code === 'phone' || field.field_type === 'phone') newErrors[key] = 'Ingresa un celular válido (9 dígitos)';
        else newErrors[key] = `${field.label} inválido`;
      }
    }
    if (!form.accepts_terms) newErrors.accepts_terms = 'Debes aceptar los términos para continuar';
    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) showToast('Completa todos los campos para continuar');
    return !hasErrors;
  };

  const trackStart = (field: string) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      tracker?.track('lead_form_start', { landing, field });
    }
  };

  const handleFieldComplete = (field: string, value: string) => {
    if (value.trim()) tracker?.track('lead_form_field_complete', { landing, field });
  };

  const sendPartialCapture = async (patch: Partial<Pick<FormState, TextFormField>>) => {
    if (!session?.sessionId) return;
    const hasValue = Object.values(patch).some((v) => v && String(v).trim());
    if (!hasValue) return;
    try {
      const body: Record<string, unknown> = { landing_id: landingId, session_id: session.sessionId };
      for (const [k, v] of Object.entries(patch)) {
        if (v && String(v).trim()) body[k] = k === 'study_center_id' ? parseInt(v as string) : v;
      }
      const res = await fetch(`${API_BASE_URL}/public/leads/capture-partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        partialLeadIdRef.current = data.lead_id;
      }
    } catch { /* fire-and-forget */ }
  };

  const handleChange = (field: TextFormField, value: string) => {
    trackStart(field);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleBlur = (field: TextFormField, value: string) => {
    handleFieldComplete(field, value);
    sendPartialCapture({ [field]: value });
  };

  // Versiones genéricas de handleChange/handleBlur para cualquier field.code (grupo
  // student/guardian u otros fuera del set legacy). Para los 5 campos core delegan en
  // el mismo slot de FormState que handleChange/handleBlur; para el resto usan `extra`
  // y no disparan capture-partial (el endpoint hoy solo acepta los campos core).
  const handleFieldChange = (field: LeadFormFieldConfig, rawValue: string) => {
    trackStart(field.code);
    setFieldValue(field, rawValue);
    const key = errorKeyFor(field);
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleFieldBlur = (field: LeadFormFieldConfig, value: string) => {
    handleFieldComplete(field.code, value);
    const key = resolveCoreKey(field);
    if (key) sendPartialCapture({ [key]: value } as Partial<Pick<FormState, TextFormField>>);
  };

  const handleCheckboxToggle = (field: LeadFormFieldConfig, checked: boolean) => {
    setFieldValue(field, checked);
    const key = errorKeyFor(field);
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  // Construye el body de POST /public/leads/capture según el contrato `LeadCaptureRequest`
  // de ws2: un set fijo de codes mapea a columnas top-level (first_name, last_name, phone,
  // study_center_id, document_number); `accepts_terms`/`consent_text` provienen del checkbox
  // fijo de TyC+Privacidad. TODO lo demás (grupo student/guardian, consentimientos dinámicos
  // adicionales, u otros codes no-core) va anidado en `fields{}` (→ captured_data).
  // Sin campos extra/guardian (fallback legacy de 5 campos) esto produce el mismo body de
  // siempre, con `fields` ausente.
  const buildCapturePayload = (): Record<string, unknown> => {
    const fields: Record<string, unknown> = {};
    let phone = form.phone.trim();
    let documentNumber: string | undefined;

    for (const field of activeFields) {
      const coreKey = resolveCoreKey(field);
      if (coreKey === 'first_name' || coreKey === 'last_name' || coreKey === 'phone' || coreKey === 'study_center_id') {
        continue; // ya cubiertos por `form` más abajo
      }
      if (coreKey === 'document_number') {
        documentNumber = form.document_number.trim();
        continue;
      }
      if (isConsentField(field)) {
        // Consentimiento ADICIONAL (distinto del TyC): su valor y texto van a captured_data.
        fields[field.code] = getFieldValue(field) === true;
        fields[`${field.code}_text`] = field.label;
        continue;
      }

      const raw = extra[field.code];
      if (raw === undefined || raw === '') continue;

      // Celular del apoderado bajo un code distinto ('guardian_phone') — gana sobre el
      // celular del estudiante (code 'phone', ya cubierto arriba por `form.phone`).
      if (field.code === 'guardian_phone') {
        const trimmed = String(raw).trim();
        if (trimmed) phone = trimmed;
        continue;
      }

      if (field.field_type === 'autocomplete') {
        fields[`${field.code}_id`] = raw;
        const label = remoteOptions[field.code]?.find((o) => o.value === raw)?.label;
        if (label) fields[`${field.code}_label`] = label;
        continue;
      }

      fields[field.code] = typeof raw === 'string' ? raw.trim() : raw;
    }

    const payload: Record<string, unknown> = {
      landing_id: landingId,
      session_id: session?.sessionId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone,
      accepts_terms: form.accepts_terms,
      consent_text: TYC_CONSENT_TEXT,
      accepts_marketing: form.accepts_marketing,
    };
    if (form.study_center_id) payload.study_center_id = parseInt(form.study_center_id, 10);
    if (documentNumber) payload.document_number = documentNumber;
    if (Object.keys(fields).length > 0) payload.fields = fields;
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!validate()) return;
    isSubmittingRef.current = true;
    tracker?.track('lead_form_submit', { landing, study_center_id: form.study_center_id });
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE_URL}/public/leads/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCapturePayload()),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        tracker?.track('lead_form_error', { landing, error_code: res.status });
        showToast(data.detail || 'Ocurrió un error. Intenta de nuevo.');
        isSubmittingRef.current = false;
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      tracker?.track('lead_form_success', { landing, lead_id: data.lead_id });
      // Guardar lead_id y prefill del wizard en localStorage
      if (data.lead_id) {
        saveLeadId(landing, data.lead_id);
        saveLeadPrefill(landing, {
          document_number: form.document_number.trim(),
          phone: form.phone.trim(),
          first_name: form.first_name.trim(),
        });
      }
      if (data.redirect_url) {
        router.push(data.redirect_url);
        // No apagar el loading — el spinner se mantiene hasta que el redirect completa
      } else {
        // Sin redirect_url: no navegar ni mostrar catálogo, solo la pantalla de éxito.
        isSubmittingRef.current = false;
        setIsLoading(false);
        setSuccess(data.success_message || '¡Gracias! Te contactaremos pronto.');
      }
    } catch {
      tracker?.track('lead_form_error', { landing, error_code: 0, detail: 'network_error' });
      showToast('Error de conexión. Intenta de nuevo.');
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };


  const renderCheckboxField = (field: LeadFormFieldConfig) => {
    const checked = getFieldValue(field) === true;
    const key = errorKeyFor(field);
    const err = errors[key];
    return (
      <label key={field.code} className={`flex items-start gap-2.5 cursor-pointer group ${config.two_columns ? 'lg:col-span-2' : ''}`}>
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => handleCheckboxToggle(field, e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              checked
                ? 'border-transparent'
                : err
                ? 'border-[#ef4444] bg-white'
                : 'border-neutral-300 bg-white group-hover:border-neutral-400'
            }`}
            style={checked ? { backgroundColor: primaryColor } : {}}
          >
            {checked && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-neutral-600 leading-relaxed">{field.label}</span>
      </label>
    );
  };

  // TyC + Privacidad (obligatorio) y marketing (opcional) — mismo check SVG-box del form normal.
  const renderTycConsent = () => (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={form.accepts_terms}
          onChange={(e) => {
            setForm((p) => ({ ...p, accepts_terms: e.target.checked }));
            if (errors.accepts_terms) setErrors((p) => { const er = { ...p }; delete er.accepts_terms; return er; });
          }}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.accepts_terms ? 'border-transparent' : errors.accepts_terms ? 'border-[#ef4444] bg-white' : 'border-neutral-300 bg-white group-hover:border-neutral-400'}`}
          style={form.accepts_terms ? { backgroundColor: primaryColor } : {}}
        >
          {form.accepts_terms && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" /></svg>
          )}
        </div>
      </div>
      <span className="text-xs text-neutral-600 leading-relaxed">
        He leído y acepto los{' '}
        <a href={`${APP_BASE_PATH}/${landing}/legal/terminos-y-condiciones`} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80" style={{ color: primaryColor }} onClick={(e) => e.stopPropagation()}>Términos y Condiciones</a>{' '}y la{' '}
        <a href={`${APP_BASE_PATH}/${landing}/legal/politica-de-privacidad`} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:opacity-80" style={{ color: primaryColor }} onClick={(e) => e.stopPropagation()}>Política de Privacidad</a>
      </span>
    </label>
  );

  const renderMarketingConsent = () => (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={form.accepts_marketing}
          onChange={(e) => setForm((p) => ({ ...p, accepts_marketing: e.target.checked }))}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.accepts_marketing ? 'border-transparent' : 'border-neutral-300 bg-white group-hover:border-neutral-400'}`}
          style={form.accepts_marketing ? { backgroundColor: primaryColor } : {}}
        >
          {form.accepts_marketing && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" /></svg>
          )}
        </div>
      </div>
      <span className="text-xs text-neutral-500 leading-relaxed">Quiero recibir ofertas y promociones de BaldeCash</span>
    </label>
  );

  const renderField = (field: LeadFormFieldConfig) => {
    const isStudyCenter = field.options_source === 'study-centers' || field.code === 'institution';
    // En modo split los inputs usan el estilo completo del wizard (no small/compact, con error visible).
    const isSplit = variant === 'split';

    if (isStudyCenter) {
      const label = config.study_center_label ?? field.label;
      const placeholder = config.study_center_placeholder ?? field.placeholder ?? '¿Dónde estudias?';
      return (
        <SelectInput
          key={field.code}
          id="lead-estudio"
          label={label}
          placeholder={placeholder}
          value={form.study_center_id}
          options={studyCenterOptions}
          error={errors.study_center_id}
          small={!isSplit}
          compact={!isSplit}
          hideErrorText={isSplit ? false : isDesktop}
          onChange={(v) => {
            handleChange('study_center_id', v);
            handleBlur('study_center_id', v);
          }}
          searchable
          onSearch={handleStudyCenterSearch}
        />
      );
    }

    if (field.field_type === 'checkbox') {
      return renderCheckboxField(field);
    }

    // Distrito -> cascada Departamento / Provincia / Distrito (geo-units)
    if (field.options_source === 'geo-units/districts' || field.code === 'district') {
      const key = errorKeyFor(field);
      return (
        <GeoCascadeField
          key={field.code}
          value={(getFieldValue(field) as string) ?? ''}
          districtLabelText={field.label}
          error={errors[key]}
          small={!isSplit}
          compact={!isSplit}
          hideErrorText={isSplit ? false : isDesktop}
          onChange={(v) => handleFieldChange(field, v)}
        />
      );
    }

    if (field.field_type === 'select') {
      const value = (getFieldValue(field) as string) ?? '';
      const key = errorKeyFor(field);
      return (
        <SelectInput
          key={field.code}
          id={`lead-${field.code}`}
          label={field.label}
          placeholder={field.placeholder ?? 'Selecciona una opción'}
          value={value}
          options={field.options_static ?? []}
          error={errors[key]}
          small={!isSplit}
          compact={!isSplit}
          hideErrorText={isSplit ? false : isDesktop}
          searchable={false}
          onChange={(v) => handleFieldChange(field, v)}
        />
      );
    }

    if (field.field_type === 'autocomplete') {
      const value = (getFieldValue(field) as string) ?? '';
      const key = errorKeyFor(field);
      return (
        <SelectInput
          key={field.code}
          id={`lead-${field.code}`}
          label={field.label}
          placeholder={field.placeholder ?? 'Escribe para buscar'}
          value={value}
          options={remoteOptions[field.code] ?? []}
          error={errors[key]}
          small={!isSplit}
          compact={!isSplit}
          hideErrorText={isSplit ? false : isDesktop}
          searchable
          minSearchLength={field.min_search_length ?? 0}
          onSearch={(search) => handleGenericAutocompleteSearch(field, search)}
          onChange={(v) => handleFieldChange(field, v)}
        />
      );
    }

    // text / number / phone / email / document_number → TextInput
    const value = (getFieldValue(field) as string) ?? '';
    const key = errorKeyFor(field);
    const isNumericInput = field.code === 'document_number' || field.code === 'phone' || field.field_type === 'document_number' || field.field_type === 'phone';
    const inputType: 'text' | 'email' | 'tel' | 'number' =
      field.field_type === 'email' ? 'email'
      : field.field_type === 'phone' ? 'tel'
      : field.field_type === 'number' ? 'number'
      : 'text';
    return (
      <TextInput
        key={field.code}
        id={`lead-${field.code}`}
        label={field.label}
        placeholder={field.placeholder ?? ''}
        type={inputType}
        value={value}
        inputMode={field.input_mode as React.HTMLAttributes<HTMLInputElement>['inputMode'] | undefined}
        maxLength={field.max_length ?? undefined}
        showCounter={isSplit && !!field.max_length}
        compact={!isSplit}
        small={!isSplit}
        hideErrorText={isSplit ? false : isDesktop}
        error={errors[key]}
        onChange={(v) => handleFieldChange(field, isNumericInput ? v.replace(/\D/g, '') : v)}
        onBlur={() => handleFieldBlur(field, value)}
      />
    );
  };

  // Agrupación student/guardian — si no hay campos de grupo guardian, se mantiene el
  // render plano de siempre (fallback, sin regresión de comportamiento).
  const studentFields = activeFields.filter((f) => f.group === 'student');
  const guardianFields = activeFields.filter((f) => f.group === 'guardian');
  const ungroupedFields = activeFields.filter((f) => !f.group);
  const hasGuardianGroup = guardianFields.length > 0;

  // 2 columnas en pantallas no-mobile (lg+) cuando la landing lo configura (config.two_columns).
  const twoCol = !!config.two_columns;
  const groupGridCls = twoCol
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-2'
    : 'space-y-2';
  const headerSpanCls = twoCol ? 'lg:col-span-2' : '';

  // Pantalla de éxito cuando el backend no envía redirect_url — reemplaza el form
  // completo, sin navegar ni mostrar el catálogo.
  if (success) {
    const big = variant === 'split';
    // Divide el mensaje en título (primera frase) + cuerpo (resto), para dar
    // jerarquía. Si el backend manda una sola frase, el cuerpo queda vacío.
    const parts = success.trim().split(/(?<=[!.?])\s+/);
    const successTitle = parts[0] ?? success;
    const successBody = parts.slice(1).join(' ').trim();
    return (
      <div className={`w-full flex flex-col items-center text-center ${big ? 'gap-5 py-16 sm:py-20' : 'gap-4 py-10'}`}>
        {/* Check con anillo aqua de acento + ripple que se expande al aparecer */}
        <div className={`relative flex items-center justify-center ${big ? 'w-24 h-24' : 'w-16 h-16'}`}>
          {/* Anillo estático en aqua: aporta el acento de marca sin recargar */}
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: `${secondaryColor}55` }}
            aria-hidden
          />
          {/* Ripple animado en color primario */}
          <span
            className="lead-success-ring absolute inset-0 rounded-full"
            style={{ backgroundColor: `${primaryColor}22` }}
            aria-hidden
          />
          <span
            className="lead-success-icon relative flex items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}14`, width: '84%', height: '84%' }}
          >
            <CheckCircle2 className={big ? 'w-11 h-11' : 'w-8 h-8'} style={{ color: primaryColor }} strokeWidth={2} />
          </span>
        </div>

        {/* Chip de estado: lectura inmediata de "recibido" */}
        <span
          className="lead-success-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['Asap',sans-serif] text-[11px] font-semibold uppercase tracking-[0.08em]"
          style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: secondaryColor }} aria-hidden />
          Solicitud recibida
        </span>

        <div className="flex flex-col items-center gap-1.5">
          <h3
            className={`lead-success-title font-['Baloo_2',_sans-serif] font-bold text-[#131b2e] leading-tight tracking-[-0.01em] ${big ? 'text-2xl sm:text-3xl' : 'text-xl'}`}
          >
            {successTitle}
          </h3>
          {successBody && (
            <p
              className={`lead-success-body font-['Asap',sans-serif] text-neutral-500 leading-relaxed ${big ? 'text-base max-w-sm' : 'text-sm max-w-xs'}`}
            >
              {successBody}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Versión simplificada "split": fieldsets con legend + consents al final ──
  // Reutiliza handlers/estado/renderField del form; solo cambia el markup.
  if (variant === 'split') {
    const consentFields = activeFields.filter(isConsentField);
    const studentNonConsent = [...studentFields, ...ungroupedFields.filter((f) => !isConsentField(f))];
    const steps = config.split?.steps ?? [];
    const legendCls = "font-['Asap',sans-serif] text-[13px] font-bold uppercase tracking-[0.09em] text-neutral-500 mb-5 pb-2 border-b border-neutral-100 w-full";
    const rowGridCls = 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1';
    return (
      <div className="w-full relative">
        {toast && (
          <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
            <div className="bg-[#1a1a2e] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
              <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {toast}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate className="w-full">
          {fieldsLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 rounded-lg bg-neutral-100 animate-pulse" />
              ))}
            </div>
          )}
          {!fieldsLoading && (
            <>
              <fieldset className="border-0 p-0 mb-9">
                <legend className={legendCls}>
                  {steps[0]?.title || 'Tus datos'}
                </legend>
                <div className={rowGridCls}>{studentNonConsent.map(renderField)}</div>
              </fieldset>

              {hasGuardianGroup && (
                <fieldset className="border-0 p-0 mb-9">
                  <legend className={legendCls}>
                    {steps[1]?.title || 'Tu apoderado'}
                  </legend>
                  <div className={rowGridCls}>{guardianFields.map(renderField)}</div>
                </fieldset>
              )}

              <fieldset className="border-0 p-0">
                <legend className={legendCls}>
                  {steps[2]?.title || 'Confirmación'}
                </legend>

                <div className="space-y-3">
                  {consentFields.map(renderCheckboxField)}
                  {renderTycConsent()}
                  {renderMarketingConsent()}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full h-12 mt-6 rounded-lg text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (config.cta_text || 'Enviar registro')}
                </button>
              </fieldset>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Toast de validación — solo desktop */}
      {toast && isDesktop && (
        <div className="absolute -top-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#1a1a2e] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {toast}
          </div>
        </div>
      )}
      {/* Descripción — renderiza HTML directo desde BD, sin fallback */}
      {config.description && (
        <div
          className="text-xs text-neutral-500 mb-3 [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: config.description }}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        {fieldsLoading ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
            ))}
          </>
        ) : null}
        {!fieldsLoading && (
          hasGuardianGroup ? (
            <>
              <div className={groupGridCls}>
                <p className={`text-xs font-semibold text-neutral-500 uppercase tracking-wide ${headerSpanCls}`}>
                  Datos del estudiante
                </p>
                {[...studentFields, ...ungroupedFields].map(renderField)}
              </div>
              <div className={`${groupGridCls} pt-2`}>
                <p className={`text-xs font-semibold text-neutral-500 uppercase tracking-wide ${headerSpanCls}`}>
                  Datos del apoderado
                </p>
                {guardianFields.map(renderField)}
              </div>
            </>
          ) : twoCol ? (
            <div className={groupGridCls}>{activeFields.map(renderField)}</div>
          ) : (
            activeFields.map(renderField)
          )
        )}

        {/* Checkbox 1: TyC + Privacidad (obligatorio) */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={form.accepts_terms}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, accepts_terms: e.target.checked }));
                  if (errors.accepts_terms) setErrors((prev) => { const er = { ...prev }; delete er.accepts_terms; return er; });
                }}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  form.accepts_terms
                    ? 'border-transparent'
                    : errors.accepts_terms
                    ? 'border-[#ef4444] bg-white'
                    : 'border-neutral-300 bg-white group-hover:border-neutral-400'
                }`}
                style={form.accepts_terms ? { backgroundColor: primaryColor } : {}}
              >
                {form.accepts_terms && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-neutral-600 leading-relaxed">
              He leído y acepto los{' '}
              <a
                href={`${APP_BASE_PATH}/${landing}/legal/terminos-y-condiciones`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:opacity-80"
                style={{ color: primaryColor }}
                onClick={(e) => e.stopPropagation()}
              >
                Términos y Condiciones
              </a>
              {' '}y la{' '}
              <a
                href={`${APP_BASE_PATH}/${landing}/legal/politica-de-privacidad`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:opacity-80"
                style={{ color: primaryColor }}
                onClick={(e) => e.stopPropagation()}
              >
                Política de Privacidad
              </a>
            </span>
          </label>
        </div>

        {/* Checkbox 2: Promociones (opcional) */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={form.accepts_marketing}
              onChange={(e) => setForm((prev) => ({ ...prev, accepts_marketing: e.target.checked }))}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                form.accepts_marketing
                  ? 'border-transparent'
                  : 'border-neutral-300 bg-white group-hover:border-neutral-400'
              }`}
              style={form.accepts_marketing ? { backgroundColor: primaryColor } : {}}
            >
              {form.accepts_marketing && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-neutral-500 leading-relaxed">
            Quiero recibir ofertas y promociones de BaldeCash
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: primaryColor }}
          className="w-full h-10 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : config.cta_text}
        </button>
      </form>
    </div>
  );
};
