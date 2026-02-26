'use client';

/**
 * Libro de Reclamaciones - BaldeCash v0.6
 * Formulario para presentar reclamos y quejas según normativa peruana
 * Usa useLayout() para obtener navbar y footer del landing
 */

import React, { useState } from 'react';
import { Button, Card, CardBody, Radio, RadioGroup } from '@nextui-org/react';
import { Send, AlertCircle, FileText, User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { CubeGridSpinner, useScrollToTop, Toast } from '@/app/prototipos/_shared';
import { useLayout } from '../../context/LayoutContext';

interface FormData {
  // Identificación del consumidor
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  // Identificación del bien contratado
  tipoServicio: string;
  montoReclamado: string;
  descripcionBien: string;
  // Detalle de la reclamación
  tipoReclamo: 'reclamo' | 'queja';
  detalleReclamo: string;
  pedidoConsumidor: string;
}

const initialFormData: FormData = {
  tipoDocumento: 'dni',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  tipoServicio: '',
  montoReclamado: '',
  descripcionBien: '',
  tipoReclamo: 'reclamo',
  detalleReclamo: '',
  pedidoConsumidor: '',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export function LibroReclamacionesClient() {
  const { navbarProps, footerData, isLoading, hasError, landing } = useLayout();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useScrollToTop();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'Campo requerido';
    if (!formData.nombres.trim()) newErrors.nombres = 'Campo requerido';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Campo requerido';
    if (!formData.email.trim()) newErrors.email = 'Campo requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'Campo requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'Campo requerido';
    if (!formData.detalleReclamo.trim()) newErrors.detalleReclamo = 'Campo requerido';
    if (!formData.pedidoConsumidor.trim()) newErrors.pedidoConsumidor = 'Campo requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData(initialFormData);
  };

  // Show loading spinner while fetching
  if (isLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col overflow-y-auto">
      {/* Dynamic focus styles using CSS variables */}
      <style>{`
        .form-input-focus:focus {
          border-color: var(--color-primary, #4654CD) !important;
        }
      `}</style>

      {/* Navbar */}
      <Navbar
        promoBannerData={navbarProps.promoBannerData}
        logoUrl={navbarProps.logoUrl}
        customerPortalUrl={navbarProps.customerPortalUrl}
        navbarItems={navbarProps.navbarItems}
        megamenuItems={navbarProps.megamenuItems}
        activeSections={navbarProps.activeSections}
        landing={landing}
      />

      {/* Main Content */}
      <main className="flex-1 pt-40 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
            >
              <FileText className="w-8 h-8" style={{ color: 'var(--color-primary, #4654CD)' }} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-['Baloo_2'] mb-2">
              Libro de Reclamaciones
            </h1>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571)
            </p>
          </div>

          {/* Company Info */}
          <Card
            className="mb-6 border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 5%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 20%, transparent)',
            }}
          >
            <CardBody className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Razón Social</p>
                  <p className="font-medium text-neutral-800">Balde K S.A.C.</p>
                </div>
                <div>
                  <p className="text-neutral-500">RUC</p>
                  <p className="font-medium text-neutral-800">20605530509</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-neutral-500">Dirección</p>
                  <p className="font-medium text-neutral-800">Av. Alfredo Benavides 1238, Miraflores 15047</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Form */}
          <div className="space-y-6">
            {/* Section 1: Datos del Consumidor */}
            <Card className="shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                  >
                    <User className="w-5 h-5" style={{ color: 'var(--color-primary, #4654CD)' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-900">1. Identificación del Consumidor</h2>
                    <p className="text-sm text-neutral-500">Datos personales del reclamante</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Tipo de documento *
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border-2 border-neutral-200 bg-white text-neutral-800 form-input-focus focus:outline-none transition-colors"
                    >
                      <option value="dni">DNI</option>
                      <option value="ce">Carné de Extranjería</option>
                      <option value="pasaporte">Pasaporte</option>
                    </select>
                  </div>

                  <FormInput
                    label="Número de documento *"
                    value={formData.numeroDocumento}
                    onChange={(v) => handleInputChange('numeroDocumento', v)}
                    error={errors.numeroDocumento}
                    placeholder="12345678"
                    maxLength={12}
                  />

                  <FormInput
                    label="Nombres *"
                    value={formData.nombres}
                    onChange={(v) => handleInputChange('nombres', v)}
                    error={errors.nombres}
                    placeholder="Juan Carlos"
                  />

                  <FormInput
                    label="Apellidos *"
                    value={formData.apellidos}
                    onChange={(v) => handleInputChange('apellidos', v)}
                    error={errors.apellidos}
                    placeholder="Pérez García"
                  />

                  <FormInput
                    label="Correo electrónico *"
                    value={formData.email}
                    onChange={(v) => handleInputChange('email', v)}
                    error={errors.email}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    icon={<Mail className="w-4 h-4" />}
                  />

                  <FormInput
                    label="Teléfono *"
                    value={formData.telefono}
                    onChange={(v) => handleInputChange('telefono', v.replace(/\D/g, ''))}
                    error={errors.telefono}
                    placeholder="987654321"
                    maxLength={9}
                    icon={<Phone className="w-4 h-4" />}
                  />

                  <div className="sm:col-span-2">
                    <FormInput
                      label="Dirección *"
                      value={formData.direccion}
                      onChange={(v) => handleInputChange('direccion', v)}
                      error={errors.direccion}
                      placeholder="Av. Ejemplo 123, Dpto. 101"
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  <FormInput
                    label="Departamento"
                    value={formData.departamento}
                    onChange={(v) => handleInputChange('departamento', v)}
                    placeholder="Lima"
                  />

                  <FormInput
                    label="Provincia"
                    value={formData.provincia}
                    onChange={(v) => handleInputChange('provincia', v)}
                    placeholder="Lima"
                  />

                  <FormInput
                    label="Distrito"
                    value={formData.distrito}
                    onChange={(v) => handleInputChange('distrito', v)}
                    placeholder="Miraflores"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Section 2: Bien Contratado */}
            <Card className="shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--color-primary, #4654CD)' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-900">2. Identificación del Bien Contratado</h2>
                    <p className="text-sm text-neutral-500">Información del servicio o producto</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Tipo de servicio"
                    value={formData.tipoServicio}
                    onChange={(v) => handleInputChange('tipoServicio', v)}
                    placeholder="Ej: Financiamiento de laptop"
                  />

                  <FormInput
                    label="Monto reclamado (S/)"
                    value={formData.montoReclamado}
                    onChange={(v) => handleInputChange('montoReclamado', v.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                  />

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Descripción del bien o servicio
                    </label>
                    <textarea
                      value={formData.descripcionBien}
                      onChange={(e) => handleInputChange('descripcionBien', e.target.value)}
                      placeholder="Describa el producto o servicio contratado..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-neutral-200 bg-white text-neutral-800 form-input-focus focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Section 3: Detalle del Reclamo */}
            <Card className="shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                  >
                    <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-primary, #4654CD)' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-900">3. Detalle de la Reclamación</h2>
                    <p className="text-sm text-neutral-500">Describa su reclamo o queja</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Tipo de reclamación *
                    </label>
                    <RadioGroup
                      value={formData.tipoReclamo}
                      onValueChange={(v) => handleInputChange('tipoReclamo', v)}
                      orientation="horizontal"
                      classNames={{
                        wrapper: 'gap-6',
                      }}
                    >
                      <Radio value="reclamo" classNames={{ label: 'text-sm' }}>
                        <div>
                          <span className="font-medium">Reclamo</span>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Disconformidad relacionada a los productos o servicios
                          </p>
                        </div>
                      </Radio>
                      <Radio value="queja" classNames={{ label: 'text-sm' }}>
                        <div>
                          <span className="font-medium">Queja</span>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Malestar o descontento respecto a la atención al público
                          </p>
                        </div>
                      </Radio>
                    </RadioGroup>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Detalle del reclamo o queja *
                    </label>
                    <textarea
                      value={formData.detalleReclamo}
                      onChange={(e) => handleInputChange('detalleReclamo', e.target.value)}
                      placeholder="Describa detalladamente los hechos que motivaron su reclamo o queja..."
                      rows={4}
                      className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white text-neutral-800 focus:outline-none transition-colors resize-none ${
                        errors.detalleReclamo ? 'border-red-400' : 'border-neutral-200 form-input-focus'
                      }`}
                    />
                    {errors.detalleReclamo && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.detalleReclamo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Pedido del consumidor *
                    </label>
                    <textarea
                      value={formData.pedidoConsumidor}
                      onChange={(e) => handleInputChange('pedidoConsumidor', e.target.value)}
                      placeholder="Indique qué solución espera obtener..."
                      rows={3}
                      className={`w-full px-3 py-2.5 rounded-lg border-2 bg-white text-neutral-800 focus:outline-none transition-colors resize-none ${
                        errors.pedidoConsumidor ? 'border-red-400' : 'border-neutral-200 form-input-focus'
                      }`}
                    />
                    {errors.pedidoConsumidor && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.pedidoConsumidor}
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Legal Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Nota importante:</p>
              <p>
                La formulación del reclamo no impide acudir a otras vías de solución de controversias ni
                es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá dar
                respuesta al reclamo en un plazo no mayor a 30 días calendario.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                radius="lg"
                className="text-white font-semibold px-8 cursor-pointer"
                style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
                endContent={!isSubmitting && <Send className="w-4 h-4" />}
                isLoading={isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Reclamo'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer data={footerData} landing={landing} />

      {/* Success Toast */}
      <Toast
        message="Su reclamo ha sido registrado exitosamente. Recibirá una respuesta en los próximos 30 días calendario."
        type="success"
        isVisible={isSuccess}
        onClose={() => setIsSuccess(false)}
        duration={5000}
        position="bottom"
      />
    </div>
  );
}

// Helper component for form inputs
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  icon?: React.ReactNode;
}

function FormInput({ label, value, onChange, error, placeholder, type = 'text', maxLength, icon }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full h-11 px-3 rounded-lg border-2 bg-white text-neutral-800 focus:outline-none transition-colors ${
            icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-400' : 'border-neutral-200 form-input-focus'
          }`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
