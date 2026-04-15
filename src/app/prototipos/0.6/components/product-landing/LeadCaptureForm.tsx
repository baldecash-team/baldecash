'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, CheckCircle2, Loader2, Check } from 'lucide-react';
import { instituciones } from './data/v5Data';
import { ASSETS, BC } from './lib/constants';
import type { V5LeadFormData } from './types/v5Types';

// Validation helpers
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidWhatsApp = (phone: string): boolean => phone.replace(/\D/g, '').length === 9;
const isValidDNI = (dni: string): boolean => dni.length === 8 && /^\d+$/.test(dni);

export default function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<V5LeadFormData>({
    nombre: '',
    correo: '',
    whatsapp: '',
    dni: '',
    institucionId: '',
    aceptaTerminos: false,
    aceptaPromociones: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsError, setShowTermsError] = useState(false);

  const validateField = (field: string, value: string | boolean): boolean => {
    let error = '';
    switch (field) {
      case 'nombre':
        if (!value) error = 'El nombre es requerido';
        break;
      case 'correo':
        if (!value) error = 'El correo es requerido';
        else if (!isValidEmail(value as string)) error = 'Ingresa un correo válido';
        break;
      case 'whatsapp':
        if (!value) error = 'El WhatsApp es requerido';
        else if (!isValidWhatsApp(value as string)) error = 'Ingresa 9 dígitos';
        break;
      case 'dni':
        if (!value) error = 'El DNI es requerido';
        else if (!isValidDNI(value as string)) error = 'Ingresa 8 dígitos';
        break;
      case 'institucionId':
        if (!value) error = 'Selecciona tu institución';
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (field: keyof V5LeadFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setTimeout(() => validateField(field, value), 0);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof V5LeadFormData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = ['nombre', 'correo', 'whatsapp', 'dni', 'institucionId'] as const;
    const newTouched: Record<string, boolean> = {};
    fields.forEach((f) => (newTouched[f] = true));
    setTouched(newTouched);

    let allValid = true;
    fields.forEach((f) => {
      if (!validateField(f, formData[f])) allValid = false;
    });

    if (!formData.aceptaTerminos) { setShowTermsError(true); allValid = false; }
    else setShowTermsError(false);

    if (!allValid) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 3000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const inputClasses = (field: string) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && formData[field as keyof V5LeadFormData] && !errors[field];
    return `w-full px-4 py-3 rounded-xl text-sm bg-[#1c1c1e] text-white border transition-colors outline-none ${
      hasError
        ? 'border-red-500 focus:border-red-500'
        : isValid
        ? 'border-green-500 focus:border-green-500'
        : 'border-[#424245] focus:border-[#4654CD]'
    }`;
  };

  if (isSuccess) {
    return (
      <section id="lead-form" className="bg-black text-[#f5f5f7] py-24">
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${BC.primary}20` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: BC.secondary }} />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
            ¡Solicitud enviada!
          </h2>
          <p className="text-[#86868b] mb-4">
            Hemos recibido tus datos correctamente. Te contactaremos pronto por WhatsApp.
          </p>
          <p className="text-sm text-[#86868b]">
            Revisa tu correo <span className="text-white font-medium">{formData.correo}</span> para más información.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="bg-black text-[#f5f5f7] py-24">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Product image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1c1c1e]">
            <Image
              src={ASSETS.highlights.colors}
              alt="MacBook Neo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Right: Form */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-semibold mb-2"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Solicita tu MacBook Neo
            </h2>
            <p className="text-[#86868b] mb-8">
              Completa tus datos y te contactamos en menos de 24 horas.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="v5-nombre" className="block text-sm text-[#86868b] mb-1">Nombre completo</label>
                <input
                  id="v5-nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  className={inputClasses('nombre')}
                />
                {touched.nombre && errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="v5-correo" className="block text-sm text-[#86868b] mb-1">Correo electrónico</label>
                <input
                  id="v5-correo"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  onBlur={() => handleBlur('correo')}
                  className={inputClasses('correo')}
                />
                {touched.correo && errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
              </div>

              {/* WhatsApp + DNI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="v5-whatsapp" className="block text-sm text-[#86868b] mb-1">WhatsApp</label>
                  <input
                    id="v5-whatsapp"
                    type="tel"
                    placeholder="999 999 999"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    onBlur={() => handleBlur('whatsapp')}
                    className={inputClasses('whatsapp')}
                  />
                  {touched.whatsapp && errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>}
                </div>
                <div>
                  <label htmlFor="v5-dni" className="block text-sm text-[#86868b] mb-1">DNI</label>
                  <input
                    id="v5-dni"
                    type="text"
                    placeholder="12345678"
                    value={formData.dni}
                    onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, '').slice(0, 8))}
                    onBlur={() => handleBlur('dni')}
                    maxLength={8}
                    className={inputClasses('dni')}
                  />
                  {touched.dni && errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni}</p>}
                </div>
              </div>

              {/* Institución */}
              <div>
                <label htmlFor="v5-institucion" className="block text-sm text-[#86868b] mb-1">Institución educativa</label>
                <select
                  id="v5-institucion"
                  value={formData.institucionId}
                  onChange={(e) => { handleChange('institucionId', e.target.value); setTouched((p) => ({ ...p, institucionId: true })); }}
                  className={inputClasses('institucionId')}
                >
                  <option value="">Selecciona tu institución</option>
                  {instituciones.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                  ))}
                </select>
                {touched.institucionId && errors.institucionId && <p className="text-xs text-red-500 mt-1">{errors.institucionId}</p>}
              </div>

              {/* Checkboxes */}
              <div className={`rounded-xl p-4 space-y-3 transition-colors ${showTermsError && !formData.aceptaTerminos ? 'bg-red-950/30 border border-red-500/30' : 'bg-[#1c1c1e]'}`}>
                <button
                  type="button"
                  onClick={() => { handleChange('aceptaTerminos', !formData.aceptaTerminos); if (!formData.aceptaTerminos) setShowTermsError(false); }}
                  className="flex items-start gap-3 w-full text-left cursor-pointer bg-transparent border-none"
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                    style={{
                      backgroundColor: formData.aceptaTerminos ? BC.primary : 'transparent',
                      borderColor: formData.aceptaTerminos ? BC.primary : '#424245',
                    }}
                  >
                    {formData.aceptaTerminos && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs text-[#86868b]">
                    Acepto los <a href="#" className="underline" style={{ color: BC.secondary }}>términos y condiciones</a> y la política de privacidad
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('aceptaPromociones', !formData.aceptaPromociones)}
                  className="flex items-start gap-3 w-full text-left cursor-pointer bg-transparent border-none"
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                    style={{
                      backgroundColor: formData.aceptaPromociones ? BC.primary : 'transparent',
                      borderColor: formData.aceptaPromociones ? BC.primary : '#424245',
                    }}
                  >
                    {formData.aceptaPromociones && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs text-[#86868b]">Quiero recibir ofertas por WhatsApp y correo</span>
                </button>

                {showTermsError && !formData.aceptaTerminos && (
                  <p className="text-xs text-red-500">Debes aceptar los términos y condiciones</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full py-3 text-white font-medium transition-colors flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: BC.primary }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = BC.primaryHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BC.primary; }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-4 h-4" /> Solicitar financiamiento</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
