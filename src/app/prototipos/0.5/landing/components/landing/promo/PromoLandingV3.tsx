'use client';

/**
 * PromoLandingV3 - Flash Sale
 * Layout estilo Hero: Imagen full-width + overlay
 * Izquierda: Descuento grande + barra de stock limitado
 * Derecha: Formulario completo
 */

import React, { useState } from 'react';
import { Button, Chip, Progress } from '@nextui-org/react';
import { Send, Check, CheckCircle2, RotateCcw, Loader2, Flame, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { TextInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/TextInput';
import { SelectInput } from '@/app/prototipos/0.5/wizard-solicitud/components/wizard-solicitud/fields/SelectInput';
import { Region, InstitucionEducativa, LeadFormData } from '../../../types/landing';
import { formatMoney } from '../../../../utils/formatMoney';

interface PromoProduct {
  id: string;
  nombre: string;
  marca: string;
  imagen: string;
  precioOriginal: number;
  precioFlash: number;
  cuotaOriginal: number;
  cuotaFlash: number;
  specs: string[];
  stockTotal: number;
  stockVendido: number;
}

interface PromoLandingV3Props {
  product: PromoProduct;
  regions: Region[];
  instituciones: InstitucionEducativa[];
  onSubmit?: (data: LeadFormData) => void;
  colorPrimario?: string;
}

// Custom Checkbox component
const PromoCheckbox = ({
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
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidWhatsApp = (phone: string): boolean => phone.replace(/\D/g, '').length === 9;
const isValidDNI = (dni: string): boolean => dni.length === 8 && /^\d+$/.test(dni);

export const PromoLandingV3: React.FC<PromoLandingV3Props> = ({
  product,
  regions,
  instituciones,
  onSubmit,
  colorPrimario = '#4654CD',
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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsError, setShowTermsError] = useState(false);

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const provincias = selectedRegion?.provincias || [];

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
    onSubmit?.(formData);
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

  const descuento = Math.round(((product.precioOriginal - product.precioFlash) / product.precioOriginal) * 100);
  const stockRestante = product.stockTotal - product.stockVendido;
  const stockPorcentaje = (product.stockVendido / product.stockTotal) * 100;
  const stockBajo = stockRestante <= 5;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background - Red/Orange gradient for urgency */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80')] bg-cover bg-center opacity-10" />

      {/* Animated flames effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-600/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left: Product Info */}
          <div className="text-white">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-6">
              <Chip
                size="lg"
                className="px-4 py-2 h-auto bg-white animate-pulse"
                startContent={<Flame className="w-4 h-4 text-red-500" />}
              >
                <span className="text-red-500 font-bold">FLASH SALE</span>
              </Chip>
              {stockBajo && (
                <Chip
                  size="lg"
                  className="px-4 py-2 h-auto bg-yellow-400"
                  startContent={<AlertTriangle className="w-4 h-4 text-yellow-800" />}
                >
                  <span className="text-yellow-800 font-bold">¡ÚLTIMAS UNIDADES!</span>
                </Chip>
              )}
            </div>

            {/* Big Discount */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur rounded-2xl px-6 py-4">
                <div className="text-7xl lg:text-8xl font-black text-white drop-shadow-lg">
                  {descuento}%
                </div>
                <div className="text-left">
                  <p className="text-white/80 text-sm">DE DESCUENTO</p>
                  <p className="text-white font-bold text-xl">¡SOLO HOY!</p>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative mb-8">
              <div className="bg-white/20 backdrop-blur rounded-2xl p-8 flex items-center justify-center">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="max-h-56 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="mb-6">
              <p className="text-white/60 text-sm mb-1">{product.marca}</p>
              <h1 className="text-2xl lg:text-3xl font-bold mb-4 font-['Baloo_2']">{product.nombre}</h1>

              {/* Specs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.specs.map((spec, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm text-white/90">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-white/50 line-through text-2xl">S/{formatMoney(product.cuotaOriginal)}/mes</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-bold text-white">
                    S/{formatMoney(product.cuotaFlash)}
                  </span>
                  <span className="text-white/70 text-lg">/mes</span>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Precio total: <span className="line-through">S/{formatMoney(product.precioOriginal)}</span>{' '}
                  <span className="text-white font-medium">S/{formatMoney(product.precioFlash)}</span>
                </p>
              </div>

              {/* Stock Bar */}
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-medium text-sm">
                      {product.stockVendido} vendidos
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${stockBajo ? 'text-yellow-300' : 'text-white/70'}`}>
                    ¡Solo quedan {stockRestante}!
                  </span>
                </div>
                <Progress
                  value={stockPorcentaje}
                  size="md"
                  radius="full"
                  classNames={{
                    base: 'max-w-full',
                    track: 'bg-white/20',
                    indicator: stockBajo ? 'bg-yellow-400' : 'bg-white',
                  }}
                />
              </div>
            </div>

            {/* Trust Signal */}
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4 text-yellow-300" />
              <span>Garantía de 12 meses | Envío gratis a todo el Perú</span>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {isSubmitSuccess ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${colorPrimario}15` }}
                  >
                    <CheckCircle2 className="w-10 h-10" style={{ color: colorPrimario }} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">¡Solicitud enviada!</h2>
                <p className="text-neutral-500 mb-6">
                  Hemos recibido tus datos correctamente.<br />
                  Te contactaremos pronto por WhatsApp.
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
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold mb-2">
                    <Flame className="w-4 h-4" />
                    Oferta exclusiva
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800 mb-1">
                    ¡Aprovecha este precio!
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Completa tus datos antes que se agote
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
                    <PromoCheckbox
                      id="acceptTerms"
                      checked={formData.aceptaTerminos}
                      onChange={(v) => {
                        handleInputChange('aceptaTerminos', v);
                        if (v) setShowTermsError(false);
                      }}
                      label={
                        <span>
                          Acepto los{' '}
                          <a href="#" className="text-[#4654CD] underline">términos y condiciones</a>
                        </span>
                      }
                      description="He leído y acepto la política de privacidad"
                    />

                    <PromoCheckbox
                      id="acceptPromos"
                      checked={formData.aceptaPromociones}
                      onChange={(v) => handleInputChange('aceptaPromociones', v)}
                      label="Quiero recibir promociones"
                      description="Acepto recibir ofertas por WhatsApp y correo"
                    />

                    {showTermsError && !formData.aceptaTerminos && (
                      <p className="text-xs text-red-500">Debes aceptar los términos y condiciones</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-semibold text-white cursor-pointer hover:opacity-90 transition-all bg-gradient-to-r from-red-500 to-orange-500"
                    radius="lg"
                    size="lg"
                    disabled={isSubmitting}
                    startContent={
                      isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />
                    }
                  >
                    {isSubmitting ? 'Enviando...' : '¡Lo quiero ahora!'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoLandingV3;
