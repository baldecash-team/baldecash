'use client';

/**
 * LandingHero - Split layout: Imagen izquierda + Form derecha
 * Configuración fija v0.5 - 100vh completo
 * Usa componentes de formulario del wizard-solicitud
 * Validación y estados success como el wizard
 */

import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { Send, Check, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { TextInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/TextInput';
import { SelectInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/SelectInput';
import { CampaignData, Region, InstitucionEducativa, LeadFormData } from '../../../types/landing';

interface LandingHeroProps {
  campaign: CampaignData;
  regions: Region[];
  instituciones: InstitucionEducativa[];
  onSubmit?: (data: LeadFormData) => void;
}

// Custom Checkbox component (from wizard resumen)
const LandingCheckbox = ({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex items-start gap-3 w-full text-left cursor-pointer"
  >
    <div
      className={`
        w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
        transition-all duration-200
        ${checked
          ? 'bg-[#4654CD] border-[#4654CD]'
          : 'bg-white border-neutral-300 hover:border-[#4654CD]/50'
        }
      `}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-neutral-700">{label}</p>
      {description && (
        <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>
      )}
    </div>
  </button>
);

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidWhatsApp = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 9;
};

const isValidDNI = (dni: string): boolean => {
  return dni.length === 8 && /^\d+$/.test(dni);
};

// Hero banner from BaldeCash
const HERO_IMAGE_URL = 'https://pidetuprestamo.baldecash.com/img/landings/landing-general-foreground.png?v=4';

export const LandingHero: React.FC<LandingHeroProps> = ({
  campaign,
  regions,
  instituciones,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    correo: '',
    whatsapp: '',
    dni: '',
    regionId: '',
    provinciaId: '',
    institucionId: '',
    aceptaTerminos: false,
    aceptaPromociones: false,
  });

  // Validation states
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const provincias = selectedRegion?.provincias || [];

  // Convert data to SelectInput format
  const regionOptions = regions.map((r) => ({ value: r.id, label: r.nombre }));
  const provinciaOptions = provincias.map((p) => ({ value: p.id, label: p.nombre }));
  const institucionOptions = instituciones.map((i) => ({ value: i.id, label: i.nombre }));

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
        ...(field === 'regionId' ? { provinciaId: '' } : {}),
      };

      // Re-validate if field was already touched
      if (touched[field]) {
        setTimeout(() => validateFieldValue(field, value), 0);
      }

      return newData;
    });
  };

  const validateFieldValue = (field: string, value: string | boolean): boolean => {
    let error = '';

    switch (field) {
      case 'correo':
        if (!value) {
          error = 'El correo es requerido';
        } else if (!isValidEmail(value as string)) {
          error = 'Ingresa un correo válido';
        }
        break;
      case 'whatsapp':
        if (!value) {
          error = 'El WhatsApp es requerido';
        } else if (!isValidWhatsApp(value as string)) {
          error = 'Ingresa 9 dígitos';
        }
        break;
      case 'dni':
        if (!value) {
          error = 'El DNI es requerido';
        } else if (!isValidDNI(value as string)) {
          error = 'Ingresa 8 dígitos';
        }
        break;
      case 'regionId':
        if (!value) {
          error = 'Selecciona una región';
        }
        break;
      case 'provinciaId':
        if (!value && formData.regionId) {
          error = 'Selecciona una provincia';
        }
        break;
      case 'institucionId':
        if (!value) {
          error = 'Selecciona tu institución';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validate on blur using current formData value
    const value = formData[field as keyof LeadFormData];
    validateFieldValue(field, value);
  };

  const isFieldValid = (field: string): boolean => {
    const value = formData[field as keyof LeadFormData];
    return touched[field] && !!value && !errors[field];
  };

  const validateAllFields = (): boolean => {
    const fields = ['correo', 'whatsapp', 'dni', 'regionId', 'provinciaId', 'institucionId'];
    let allValid = true;

    // Mark all as touched
    const newTouched: Record<string, boolean> = {};
    fields.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate each field
    fields.forEach((field) => {
      const value = formData[field as keyof LeadFormData];
      if (!validateFieldValue(field, value)) {
        allValid = false;
      }
    });

    return allValid;
  };

  const [showTermsError, setShowTermsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsValid = validateAllFields();

    // Check terms
    if (!formData.aceptaTerminos) {
      setShowTermsError(true);
    } else {
      setShowTermsError(false);
    }

    if (!fieldsValid || !formData.aceptaTerminos) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 4500));
    onSubmit?.(formData);
    setIsSubmitting(false);
    setIsSubmitSuccess(true);
  };

  const handleReset = () => {
    setIsSubmitSuccess(false);
    setFormData({
      correo: '',
      whatsapp: '',
      dni: '',
      regionId: '',
      provinciaId: '',
      institucionId: '',
      aceptaTerminos: false,
      aceptaPromociones: false,
    });
    setTouched({});
    setErrors({});
    setShowTermsError(false);
  };

  return (
    <section
      className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]"
    >
      {/* Top/Left: Hero Image */}
      <div className="w-full lg:h-full lg:w-[900px] flex-shrink-0">
        <img
          src={HERO_IMAGE_URL}
          alt="BaldeCash - Laptops para estudiantes"
          className="w-full h-auto lg:h-full lg:object-cover"
        />
      </div>

      {/* Bottom/Right: Form */}
      <div className="w-full lg:flex-1 flex items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-neutral-50 to-white">
        <div className="w-full max-w-lg">
          {/* Success State */}
          {isSubmitSuccess ? (
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]"
                  style={{ backgroundColor: `${campaign.colorPrimario}15` }}
                >
                  <CheckCircle2
                    className="w-10 h-10 animate-[fade-in_0.4s_ease-out_0.2s_both]"
                    style={{ color: campaign.colorPrimario }}
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                ¡Solicitud enviada!
              </h2>
              <p className="text-neutral-500 mb-6">
                Hemos recibido tus datos correctamente.<br />
                Te contactaremos pronto por WhatsApp.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400">
                  Revisa tu correo <span className="font-medium text-neutral-600">{formData.correo}</span> para más información.
                </p>
                <Button
                  variant="flat"
                  className="cursor-pointer text-neutral-600 hover:bg-neutral-100"
                  startContent={<RotateCcw className="w-4 h-4" />}
                  onPress={handleReset}
                >
                  Enviar otra solicitud
                </Button>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-5">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-neutral-800 mb-1">
                  Ingresa tus datos y conoce nuestro catálogo
                </h2>
                <p className="text-sm text-neutral-500">
                  ¡Tu laptop ideal te espera!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <TextInput
                  id="correo"
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  type="email"
                  value={formData.correo}
                  onChange={(v) => handleInputChange('correo', v)}
                  onBlur={() => handleFieldBlur('correo')}
                  error={errors.correo}
                  success={isFieldValid('correo')}
                  required
                />

                <TextInput
                  id="whatsapp"
                  label="WhatsApp"
                  placeholder="999 999 999"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(v) => handleInputChange('whatsapp', v.replace(/\D/g, '').slice(0, 9))}
                  onBlur={() => handleFieldBlur('whatsapp')}
                  error={errors.whatsapp}
                  success={isFieldValid('whatsapp')}
                  required
                />

                <TextInput
                  id="dni"
                  label="DNI"
                  placeholder="12345678"
                  type="text"
                  value={formData.dni}
                  onChange={(v) => handleInputChange('dni', v.replace(/\D/g, '').slice(0, 8))}
                  onBlur={() => handleFieldBlur('dni')}
                  error={errors.dni}
                  success={isFieldValid('dni')}
                  maxLength={8}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <SelectInput
                    id="region"
                    label="Región"
                    placeholder="Selecciona"
                    value={formData.regionId}
                    onChange={(v) => {
                      handleInputChange('regionId', v);
                      setTouched((prev) => ({ ...prev, regionId: true }));
                    }}
                    options={regionOptions}
                    error={errors.regionId}
                    success={isFieldValid('regionId')}
                    searchable={false}
                    required
                  />

                  <SelectInput
                    id="provincia"
                    label="Provincia"
                    placeholder="Selecciona"
                    value={formData.provinciaId}
                    onChange={(v) => {
                      handleInputChange('provinciaId', v);
                      setTouched((prev) => ({ ...prev, provinciaId: true }));
                    }}
                    options={provinciaOptions}
                    error={errors.provinciaId}
                    success={isFieldValid('provinciaId')}
                    searchable={false}
                    disabled={!formData.regionId}
                    required
                  />
                </div>

                <SelectInput
                  id="institucion"
                  label="¿Dónde estudias?"
                  placeholder="Selecciona tu institución"
                  value={formData.institucionId}
                  onChange={(v) => {
                    handleInputChange('institucionId', v);
                    setTouched((prev) => ({ ...prev, institucionId: true }));
                  }}
                  options={institucionOptions}
                  error={errors.institucionId}
                  success={isFieldValid('institucionId')}
                  searchable={true}
                  required
                />

                <div className={`rounded-lg p-3 space-y-3 transition-colors ${showTermsError && !formData.aceptaTerminos ? 'bg-red-50 border-2 border-red-200' : 'bg-neutral-50'}`}>
                  <LandingCheckbox
                    id="acceptTerms"
                    checked={formData.aceptaTerminos}
                    onChange={(v) => {
                      handleInputChange('aceptaTerminos', v);
                      if (v) setShowTermsError(false);
                    }}
                    label={
                      <span>
                        Acepto los{' '}
                        <a href="#" className="text-[#4654CD] underline">
                          términos y condiciones
                        </a>
                      </span>
                    }
                    description="He leído y acepto la política de privacidad"
                  />

                  <LandingCheckbox
                    id="acceptPromos"
                    checked={formData.aceptaPromociones}
                    onChange={(v) => handleInputChange('aceptaPromociones', v)}
                    label="Quiero recibir promociones"
                    description="Acepto recibir ofertas por WhatsApp y correo"
                  />

                  {showTermsError && !formData.aceptaTerminos && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      Debes aceptar los términos y condiciones
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold text-white cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{ backgroundColor: campaign.colorPrimario }}
                  radius="lg"
                  size="md"
                  disabled={isSubmitting}
                  startContent={
                    isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )
                  }
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar ahora'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
