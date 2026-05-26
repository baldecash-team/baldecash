'use client';

import React, { useState, useRef, useCallback } from 'react';
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
}

interface FormErrors {
  document_number?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  study_center_id?: string;
  general?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

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

  const [form, setForm] = useState<FormState>({
    document_number: '',
    first_name: '',
    last_name: '',
    phone: '',
    study_center_id: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const sendPartialCapture = async (patch: Partial<FormState>) => {
    if (!session?.sessionId) return;
    const hasValue = Object.values(patch).some((v) => v && String(v).trim());
    if (!hasValue) return;
    try {
      const body: Record<string, unknown> = { landing_id: landingId, session_id: session.sessionId };
      for (const [k, v] of Object.entries(patch)) {
        if (v && String(v).trim()) body[k] = k === 'study_center_id' ? parseInt(v) : v;
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

  const handleChange = (field: keyof FormState, value: string) => {
    trackStart(field);
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleBlur = (field: keyof FormState, value: string) => {
    handleFieldComplete(field, value);
    sendPartialCapture({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        tracker?.track('lead_form_error', { landing, error_code: res.status });
        setErrors({ general: data.detail || 'Ocurrió un error. Intenta de nuevo.' });
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
    } catch {
      tracker?.track('lead_form_error', { landing, error_code: 0, detail: 'network_error' });
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full">
      {/* Descripción — renderiza HTML directo desde BD, sin fallback */}
      {config.description && (
        <div
          className="text-sm text-neutral-500 mb-5 [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: config.description }}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
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
          onChange={(v) => {
            handleChange('study_center_id', v);
            handleBlur('study_center_id', v);
          }}
          searchable
          onSearch={handleStudyCenterSearch}
        />

        {/* Error general */}
        {errors.general && (
          <p className="text-sm text-[#ef4444] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.general}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: primaryColor }}
          className="w-full h-11 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
