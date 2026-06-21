'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadFormConfig, LeadFormFieldConfig, LeadFormFieldOptionsFilter, StudyCenter } from '../../types/hero';
import { useSessionOptional } from '../../[landing]/solicitar/context/SessionContext';
import { useEventTrackerOptional } from '../../[landing]/solicitar/context/EventTrackerContext';
import { TextInput } from '../../[landing]/solicitar/components/solicitar/fields/TextInput';
import { SelectInput } from '../../[landing]/solicitar/components/solicitar/fields/SelectInput';
import { saveLeadId, saveLeadPrefill } from '../../hooks/useLeadGuard';

interface LeadLeadFormProps {
  config: LeadFormConfig;
  landingId: number;
  landing: string;
  studyCenters: StudyCenter[];
  primaryColor?: string;
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
}

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

function buildSearchUrl(search: string, filter?: LeadFormFieldOptionsFilter | null): string {
  const params = new URLSearchParams({ search });
  if (filter?.type?.length) params.set('type', filter.type.join(','));
  if (filter?.ids?.length) params.set('ids', filter.ids.join(','));
  return `${API_BASE_URL}/public/options/study-centers?${params.toString()}`;
}

export const LeadLeadForm: React.FC<LeadLeadFormProps> = ({
  config,
  landingId,
  landing,
  studyCenters,
  primaryColor = '#4654CD',
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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    for (const field of activeFields) {
      if (!field.is_required) continue;
      const key = field.code === 'institution' ? 'study_center_id' : field.code as keyof FormState;
      const rawValue = form[key as keyof FormState];
      const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
      if (!value) {
        if (field.code === 'document_number') newErrors.document_number = 'Ingresa un DNI válido (8 dígitos)';
        else if (field.code === 'phone') newErrors.phone = 'Ingresa un celular válido (9 dígitos)';
        else if (field.code === 'institution') newErrors.study_center_id = `Selecciona ${field.label.toLowerCase()}`;
        else newErrors[key as keyof FormErrors] = `Ingresa tu ${field.label.toLowerCase()}`;
      } else if (field.pattern && typeof value === 'string' && !new RegExp(field.pattern).test(value)) {
        if (field.code === 'document_number') newErrors.document_number = 'Ingresa un DNI válido (8 dígitos)';
        else if (field.code === 'phone') newErrors.phone = 'Ingresa un celular válido (9 dígitos)';
        else newErrors[key as keyof FormErrors] = `${field.label} inválido`;
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

  const handleFieldComplete = (field: keyof FormState, value: string) => {
    if (value.trim()) tracker?.track('lead_form_field_complete', { landing, field });
  };

  type TextFormField = 'document_number' | 'first_name' | 'last_name' | 'phone' | 'study_center_id';

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
        body: JSON.stringify({
          landing_id: landingId,
          session_id: session?.sessionId,
          document_number: form.document_number.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
          study_center_id: parseInt(form.study_center_id),
          accepts_terms: form.accepts_terms,
          accepts_marketing: form.accepts_marketing,
        }),
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
      router.push(data.redirect_url);
      // No apagar el loading — el spinner se mantiene hasta que el redirect completa
    } catch {
      tracker?.track('lead_form_error', { landing, error_code: 0, detail: 'network_error' });
      showToast('Error de conexión. Intenta de nuevo.');
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };


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
        {!fieldsLoading && activeFields.map((field) => {
          const isStudyCenter = field.options_source === 'study-centers' || field.code === 'institution';
          const isNumericInput = field.code === 'document_number' || field.code === 'phone';

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
                small
                hideErrorText={isDesktop}
                onChange={(v) => {
                  handleChange('study_center_id', v);
                  handleBlur('study_center_id', v);
                }}
                searchable
                onSearch={handleStudyCenterSearch}
              />
            );
          }

          const formKey = field.code as TextFormField;
          const formValue = (form[formKey as keyof FormState] as string) ?? '';
          const errorValue = errors[formKey as keyof FormErrors];
          return (
            <TextInput
              key={field.code}
              id={`lead-${field.code}`}
              label={field.label}
              placeholder={field.placeholder ?? ''}
              value={formValue}
              inputMode={field.input_mode as React.HTMLAttributes<HTMLInputElement>['inputMode'] | undefined}
              maxLength={field.max_length ?? undefined}
              showCounter={false}
              compact
              small
              hideErrorText={isDesktop}
              error={errorValue}
              onChange={(v) => handleChange(formKey, isNumericInput ? v.replace(/\D/g, '') : v)}
              onBlur={() => handleBlur(formKey, formValue)}
            />
          );
        })}

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
