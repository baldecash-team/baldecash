'use client';

/**
 * CaptacionBanner - Banner de captación con 6 layouts y 3 mensajes iterables
 *
 * Layouts:
 * L1: Split Clásico - Imagen izquierda (55%) + Formulario derecha (45%)
 * L2: Split Invertido - Formulario izquierda + Imagen derecha
 * L3: Hero Centrado - Imagen full-width con contenido centrado
 * L4: Card Flotante - Imagen full-width con formulario flotante lateral
 * L5: Minimalista - Sin imagen, fondo gradiente, formulario destacado
 * L6: Video Hero - Video de fondo con formulario overlay
 *
 * Mensajes:
 * V1: Cuota mínima - "Desde S/XX al mes"
 * V2: Sin inicial - "0% inicial"
 * V3: Regalo incluido - Accesorio gratis
 */

import React, { useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { Send, Check, CheckCircle2, RotateCcw, Loader2, Gift, CreditCard, Sparkles, Shield, Users, Building } from 'lucide-react';
import { TextInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/TextInput';
import { SelectInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/SelectInput';
import { BannerVersion, LayoutVersion, LeadFormData } from '../../../types/landing';
import { regions, instituciones } from '../../../data/mockLandingData';

interface CaptacionBannerProps {
  layoutVersion: LayoutVersion;
  bannerVersion: BannerVersion;
  isCleanMode?: boolean;
}

// Datos de contenido por versión de mensaje
const bannerData = {
  1: {
    badge: '+10,000 estudiantes ya tienen su laptop',
    headline: 'Tu laptop desde',
    highlightText: 'S/89 al mes',
    highlightBg: 'bg-white/10 backdrop-blur-sm text-white',
    highlightBgLight: 'bg-[#4654CD] text-white',
    subheadline: 'Financiamiento sin tarjeta de crédito. Solo necesitas tu DNI.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
    video: 'https://videos.pexels.com/video-files/3209211/3209211-uhd_2560_1440_25fps.mp4',
    formTitle: 'Solicita tu laptop ahora',
    formSubtitle: 'Completa tus datos y te contactamos',
  },
  2: {
    badge: 'Sin complicaciones, sin sorpresas',
    headline: 'Empieza con',
    highlightText: '0% inicial',
    highlightBg: 'bg-[#03DBD0] text-neutral-900',
    highlightBgLight: 'bg-[#03DBD0] text-neutral-900',
    subheadline: 'Tu primera cuota recién es a los 30 días de recibir tu equipo.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80',
    video: 'https://videos.pexels.com/video-files/5077072/5077072-uhd_2560_1440_25fps.mp4',
    formTitle: '¡Sin cuota inicial!',
    formSubtitle: 'Déjanos tus datos para comenzar',
  },
  3: {
    badge: 'Promoción por tiempo limitado',
    headline: 'Llévate GRATIS',
    highlightText: 'Mochila Porta Laptop',
    highlightBg: 'bg-[#03DBD0] text-neutral-900',
    highlightBgLight: 'bg-[#03DBD0] text-neutral-900',
    subheadline: 'Por la compra de cualquier laptop. Stock limitado.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80',
    video: 'https://videos.pexels.com/video-files/4065924/4065924-uhd_2560_1440_25fps.mp4',
    formTitle: '¡Reclama tu regalo!',
    formSubtitle: 'Completa el formulario para participar',
  },
};

// Custom Checkbox component
const LandingCheckbox = ({
  checked,
  onChange,
  label,
  description,
}: {
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
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidWhatsApp = (phone: string): boolean => phone.replace(/\D/g, '').length === 9;
const isValidDNI = (dni: string): boolean => dni.length === 8 && /^\d+$/.test(dni);

// ===========================================
// Lead Form Component (reusable across layouts)
// ===========================================
interface LeadFormProps {
  data: typeof bannerData[1];
  compact?: boolean;
  darkMode?: boolean;
  className?: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ data, compact = false, darkMode = false, className = '' }) => {
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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsError, setShowTermsError] = useState(false);

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const provincias = selectedRegion?.provincias || [];

  const regionOptions = regions.map((r) => ({ value: r.id, label: r.nombre }));
  const provinciaOptions = provincias.map((p) => ({ value: p.id, label: p.nombre }));
  const institucionOptions = instituciones.map((i) => ({ value: i.id, label: i.nombre }));

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'regionId' ? { provinciaId: '' } : {}),
    }));
    if (touched[field]) {
      setTimeout(() => validateFieldValue(field, value), 0);
    }
  };

  const validateFieldValue = (field: string, value: string | boolean): boolean => {
    let error = '';
    switch (field) {
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
      case 'regionId':
        if (!value) error = 'Selecciona una región';
        break;
      case 'provinciaId':
        if (!value && formData.regionId) error = 'Selecciona una provincia';
        break;
      case 'institucionId':
        if (!value) error = 'Selecciona tu institución';
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
    const newTouched: Record<string, boolean> = {};
    fields.forEach((field) => { newTouched[field] = true; });
    setTouched(newTouched);
    fields.forEach((field) => {
      const value = formData[field as keyof LeadFormData];
      if (!validateFieldValue(field, value)) allValid = false;
    });
    return allValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldsValid = validateAllFields();
    if (!formData.aceptaTerminos) setShowTermsError(true);
    else setShowTermsError(false);
    if (!fieldsValid || !formData.aceptaTerminos) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsSubmitting(false);
    setIsSubmitSuccess(true);
  };

  const handleReset = () => {
    setIsSubmitSuccess(false);
    setFormData({
      correo: '', whatsapp: '', dni: '', regionId: '', provinciaId: '',
      institucionId: '', aceptaTerminos: false, aceptaPromociones: false,
    });
    setTouched({});
    setErrors({});
    setShowTermsError(false);
  };

  // Success State
  if (isSubmitSuccess) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 text-center ${className}`}>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#4654CD]/10">
            <CheckCircle2 className="w-10 h-10 text-[#4654CD]" />
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
            Revisa tu correo <span className="font-medium text-neutral-600">{formData.correo}</span>
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
    );
  }

  // Form
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-neutral-100 ${compact ? 'p-4' : 'p-5'} ${className}`}>
      <div className="text-center mb-4">
        <h2 className={`font-bold text-neutral-800 mb-1 ${compact ? 'text-lg' : 'text-xl'}`}>
          {data.formTitle}
        </h2>
        <p className="text-sm text-neutral-500">
          {data.formSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-${compact ? '2' : '3'}`}>
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
            checked={formData.aceptaPromociones}
            onChange={(v) => handleInputChange('aceptaPromociones', v)}
            label="Quiero recibir promociones"
            description="Acepto recibir ofertas por WhatsApp y correo"
          />

          {showTermsError && !formData.aceptaTerminos && (
            <p className="text-xs text-red-500">
              Debes aceptar los términos y condiciones
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full font-semibold text-white cursor-pointer bg-[#4654CD] hover:bg-[#3a47b3] transition-all"
          radius="lg"
          size="lg"
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
  );
};

// ===========================================
// Trust Signals Component
// ===========================================
const TrustSignals: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div className="flex flex-wrap gap-4">
    <div className={`flex items-center gap-2 text-sm ${light ? 'text-white/80' : 'text-neutral-600'}`}>
      <Shield className={`w-4 h-4 ${light ? 'text-[#03DBD0]' : 'text-[#4654CD]'}`} />
      <span>Registrados en SBS</span>
    </div>
    <div className={`flex items-center gap-2 text-sm ${light ? 'text-white/80' : 'text-neutral-600'}`}>
      <Users className={`w-4 h-4 ${light ? 'text-[#03DBD0]' : 'text-[#4654CD]'}`} />
      <span>+10,000 estudiantes</span>
    </div>
    <div className={`flex items-center gap-2 text-sm ${light ? 'text-white/80' : 'text-neutral-600'}`}>
      <Building className={`w-4 h-4 ${light ? 'text-[#03DBD0]' : 'text-[#4654CD]'}`} />
      <span>32 alianzas</span>
    </div>
  </div>
);

// ===========================================
// Main Component
// ===========================================
export const CaptacionBanner: React.FC<CaptacionBannerProps> = ({
  layoutVersion,
  bannerVersion,
  isCleanMode = false,
}) => {
  const data = bannerData[bannerVersion];
  const VersionIcon = bannerVersion === 1 ? Sparkles : bannerVersion === 2 ? CreditCard : Gift;

  // ===========================================
  // L1: Split Clásico
  // ===========================================
  const renderSplitClasico = () => (
    <section className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left: Hero Image + Message */}
      <div className="relative w-full lg:w-[55%] min-h-[400px] lg:min-h-full overflow-hidden">
        <img
          src={data.image}
          alt="Banner de captación"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center p-8 lg:p-12">
          <Chip
            size="sm"
            radius="sm"
            startContent={<VersionIcon className="w-3.5 h-3.5" />}
            classNames={{
              base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
              content: 'text-white text-xs font-medium',
            }}
          >
            {data.badge}
          </Chip>
          <h1 className="font-['Baloo_2'] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {data.headline}
          </h1>
          <div className={`inline-block mb-6 ${data.highlightBg} rounded-xl px-6 py-4 w-fit`}>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {data.highlightText}
            </span>
          </div>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            {data.subheadline}
          </p>
          <TrustSignals light />
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-neutral-50 to-white">
        <div className="w-full max-w-md">
          <LeadForm data={data} />
        </div>
      </div>
    </section>
  );

  // ===========================================
  // L2: Split Invertido
  // ===========================================
  const renderSplitInvertido = () => (
    <section className="flex flex-col lg:flex-row-reverse min-h-[calc(100vh-4rem)]">
      {/* Right: Hero Image + Message (visually on right) */}
      <div className="relative w-full lg:w-[55%] min-h-[400px] lg:min-h-full overflow-hidden">
        <img
          src={data.image}
          alt="Banner de captación"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 h-full flex flex-col justify-center items-end text-right p-8 lg:p-12">
          <Chip
            size="sm"
            radius="sm"
            startContent={<VersionIcon className="w-3.5 h-3.5" />}
            classNames={{
              base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
              content: 'text-white text-xs font-medium',
            }}
          >
            {data.badge}
          </Chip>
          <h1 className="font-['Baloo_2'] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {data.headline}
          </h1>
          <div className={`inline-block mb-6 ${data.highlightBg} rounded-xl px-6 py-4 w-fit`}>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold">
              {data.highlightText}
            </span>
          </div>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            {data.subheadline}
          </p>
          <TrustSignals light />
        </div>
      </div>

      {/* Left: Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-neutral-50 to-white">
        <div className="w-full max-w-md">
          <LeadForm data={data} />
        </div>
      </div>
    </section>
  );

  // ===========================================
  // L3: Hero Centrado
  // ===========================================
  const renderHeroCentrado = () => (
    <section className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Image */}
      <img
        src={data.image}
        alt="Banner de captación"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8 max-w-2xl">
          <Chip
            size="sm"
            radius="sm"
            startContent={<VersionIcon className="w-3.5 h-3.5" />}
            classNames={{
              base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
              content: 'text-white text-xs font-medium',
            }}
          >
            {data.badge}
          </Chip>
          <h1 className="font-['Baloo_2'] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {data.headline}{' '}
            <span className={`inline-block ${data.highlightBg} rounded-xl px-4 py-2`}>
              {data.highlightText}
            </span>
          </h1>
          <p className="text-lg text-white/80 mb-6">
            {data.subheadline}
          </p>
          <div className="flex justify-center">
            <TrustSignals light />
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md">
          <LeadForm data={data} />
        </div>
      </div>
    </section>
  );

  // ===========================================
  // L4: Card Flotante
  // ===========================================
  const renderCardFlotante = () => (
    <section className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Image */}
      <img
        src={data.image}
        alt="Banner de captación"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Message */}
            <div className="text-left">
              <Chip
                size="sm"
                radius="sm"
                startContent={<VersionIcon className="w-3.5 h-3.5" />}
                classNames={{
                  base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
                  content: 'text-white text-xs font-medium',
                }}
              >
                {data.badge}
              </Chip>
              <h1 className="font-['Baloo_2'] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {data.headline}
              </h1>
              <div className={`inline-block mb-6 ${data.highlightBg} rounded-xl px-6 py-4 w-fit`}>
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  {data.highlightText}
                </span>
              </div>
              <p className="text-lg text-white/80 mb-8 max-w-md">
                {data.subheadline}
              </p>
              <TrustSignals light />
            </div>

            {/* Right: Floating Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                <LeadForm data={data} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ===========================================
  // L5: Minimalista
  // ===========================================
  const renderMinimalista = () => (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#4654CD]/5 via-white to-[#03DBD0]/5">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Chip
              size="sm"
              radius="sm"
              startContent={<VersionIcon className="w-3.5 h-3.5" />}
              classNames={{
                base: 'bg-[#4654CD]/10 px-3 py-1 h-auto mb-6',
                content: 'text-[#4654CD] text-xs font-medium',
              }}
            >
              {data.badge}
            </Chip>
            <h1 className="font-['Baloo_2'] text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 leading-tight mb-4">
              {data.headline}{' '}
              <span className={`inline-block ${data.highlightBgLight} rounded-xl px-4 py-2`}>
                {data.highlightText}
              </span>
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
              {data.subheadline}
            </p>
            <div className="flex justify-center mb-8">
              <TrustSignals />
            </div>
          </div>

          {/* Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <LeadForm data={data} className="shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ===========================================
  // L6: Video Hero
  // ===========================================
  const renderVideoHero = () => (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={data.video} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Message */}
            <div className="text-left">
              <Chip
                size="sm"
                radius="sm"
                startContent={<VersionIcon className="w-3.5 h-3.5" />}
                classNames={{
                  base: 'bg-white/20 backdrop-blur-sm px-3 py-1 h-auto mb-6',
                  content: 'text-white text-xs font-medium',
                }}
              >
                {data.badge}
              </Chip>
              <h1 className="font-['Baloo_2'] text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {data.headline}
              </h1>
              <div className={`inline-block mb-8 ${data.highlightBg} rounded-2xl px-8 py-5 w-fit`}>
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  {data.highlightText}
                </span>
              </div>
              <p className="text-xl text-white/90 mb-10 max-w-lg">
                {data.subheadline}
              </p>
              <TrustSignals light />
            </div>

            {/* Right: Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <LeadForm data={data} className="backdrop-blur-sm bg-white/95" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ===========================================
  // Render based on layout version
  // ===========================================
  switch (layoutVersion) {
    case 1:
      return renderSplitClasico();
    case 2:
      return renderSplitInvertido();
    case 3:
      return renderHeroCentrado();
    case 4:
      return renderCardFlotante();
    case 5:
      return renderMinimalista();
    case 6:
      return renderVideoHero();
    default:
      return renderSplitClasico();
  }
};

export default CaptacionBanner;
