'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LeadFormConfig, StudyCenter } from '../../types/hero';
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

export const LeadLeadForm: React.FC<LeadLeadFormProps> = ({
  config,
  landingId,
  landing,
  studyCenters,
  primaryColor = '#4654CD',
}) => {
  const router = useRouter();
  const session = useSessionOptional();
  const tracker = useEventTrackerOptional();
  const hasStarted = useRef(false);
  const partialLeadIdRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);
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
      const res = await fetch(`${API_BASE_URL}/public/options/study-centers?search=${encodeURIComponent(search)}`);
      if (!res.ok) return;
      const data = await res.json();
      setStudyCenterOptions((data.options || []).map((o: { value: number; label: string }) => ({
        value: String(o.value),
        label: o.label,
      })));
    } catch { /* ignore */ }
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!/^\d{8}$/.test(form.document_number.trim())) newErrors.document_number = 'Ingresa un DNI válido (8 dígitos)';
    if (!form.first_name.trim()) newErrors.first_name = 'Ingresa tu nombre';
    if (!form.last_name.trim()) newErrors.last_name = 'Ingresa tu apellido';
    if (!/^\d{9}$/.test(form.phone.trim())) newErrors.phone = 'Ingresa un celular válido (9 dígitos)';
    if (!form.study_center_id) newErrors.study_center_id = 'Selecciona tu lugar de estudio';
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
        {/* DNI */}
        <TextInput
          id="lead-dni"
          label="DNI"
          placeholder="Ej. 12345678"
          value={form.document_number}
          inputMode="numeric"
          maxLength={8}
          showCounter={false}
          compact
          small
          hideErrorText={isDesktop}
          error={errors.document_number}
          onChange={(v) => handleChange('document_number', v.replace(/\D/g, ''))}
          onBlur={() => handleBlur('document_number', form.document_number)}
        />

        {/* Nombre */}
        <TextInput
          id="lead-nombre"
          label="Nombre"
          placeholder="Tus nombres"
          value={form.first_name}
          compact
          small
          hideErrorText={isDesktop}
          error={errors.first_name}
          onChange={(v) => handleChange('first_name', v)}
          onBlur={() => handleBlur('first_name', form.first_name)}
        />

        {/* Apellido */}
        <TextInput
          id="lead-apellido"
          label="Apellido"
          placeholder="Tus apellidos"
          value={form.last_name}
          compact
          small
          hideErrorText={isDesktop}
          error={errors.last_name}
          onChange={(v) => handleChange('last_name', v)}
          onBlur={() => handleBlur('last_name', form.last_name)}
        />

        {/* Celular */}
        <TextInput
          id="lead-celular"
          label="Celular"
          placeholder="Ej. 987654321"
          value={form.phone}
          inputMode="numeric"
          maxLength={9}
          showCounter={false}
          compact
          small
          hideErrorText={isDesktop}
          error={errors.phone}
          onChange={(v) => handleChange('phone', v.replace(/\D/g, ''))}
          onBlur={() => handleBlur('phone', form.phone)}
        />

        {/* Lugar de estudio */}
        <SelectInput
          id="lead-estudio"
          label="Lugar de estudio"
          placeholder="¿Dónde estudias?"
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
