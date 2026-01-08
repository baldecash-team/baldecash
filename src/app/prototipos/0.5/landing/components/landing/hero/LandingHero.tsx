'use client';

/**
 * LandingHero - Split layout: Carousel izquierda + Form derecha
 * Configuración fija v0.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Select, SelectItem, Checkbox } from '@nextui-org/react';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { CampaignData, LandingProduct, Region, InstitucionEducativa, LeadFormData } from '../../../types/landing';

interface LandingHeroProps {
  campaign: CampaignData;
  products: LandingProduct[];
  regions: Region[];
  instituciones: InstitucionEducativa[];
  onSubmit?: (data: LeadFormData) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  campaign,
  products,
  regions,
  instituciones,
  onSubmit,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const provincias = selectedRegion?.provincias || [];

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const handleInputChange = (field: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset provincia when region changes
      ...(field === 'regionId' ? { provinciaId: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onSubmit?.(formData);
    setIsSubmitting(false);
  };

  const currentProduct = products[currentSlide];

  return (
    <section className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Left: Product Carousel (60%) */}
          <div className="lg:col-span-3 relative">
            {/* Title */}
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 mb-3">
                {campaign.titulo}
              </h1>
              <p className="text-lg text-neutral-500">{campaign.subtitulo}</p>
            </div>

            {/* Carousel */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {/* Product Image */}
                  <div className="relative w-full aspect-[4/3] mb-4">
                    <img
                      src={currentProduct.imagen}
                      alt={currentProduct.nombre}
                      className="w-full h-full object-contain"
                    />
                    {currentProduct.destacado && (
                      <div
                        className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: campaign.colorPrimario }}
                      >
                        Destacado
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h3 className="text-lg font-semibold text-neutral-800 text-center mb-2">
                    {currentProduct.nombre}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-neutral-400">Desde</span>
                    <span
                      className="text-3xl font-black"
                      style={{ color: campaign.colorPrimario }}
                    >
                      S/{currentProduct.cuotaMensual}
                    </span>
                    <span className="text-sm text-neutral-500">/mes</span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Precio total: S/{currentProduct.precioTotal.toLocaleString()}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-600" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 text-neutral-600" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      index === currentSlide
                        ? 'w-6 bg-[#4654CD]'
                        : 'bg-neutral-200 hover:bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Lead Form (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-2">
                  ¡Solicita tu equipo ahora!
                </h2>
                <p className="text-sm text-neutral-500">
                  Completa tus datos y te contactamos en minutos
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Correo */}
                <Input
                  type="email"
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  value={formData.correo}
                  onValueChange={(v) => handleInputChange('correo', v)}
                  variant="bordered"
                  radius="lg"
                  isRequired
                  classNames={{
                    inputWrapper: 'border-neutral-200 hover:border-[#4654CD] focus-within:border-[#4654CD]',
                  }}
                />

                {/* WhatsApp */}
                <Input
                  type="tel"
                  label="WhatsApp"
                  placeholder="999 999 999"
                  value={formData.whatsapp}
                  onValueChange={(v) => handleInputChange('whatsapp', v)}
                  variant="bordered"
                  radius="lg"
                  isRequired
                  startContent={<span className="text-neutral-400 text-sm">+51</span>}
                  classNames={{
                    inputWrapper: 'border-neutral-200 hover:border-[#4654CD] focus-within:border-[#4654CD]',
                  }}
                />

                {/* DNI */}
                <Input
                  type="text"
                  label="DNI"
                  placeholder="12345678"
                  value={formData.dni}
                  onValueChange={(v) => handleInputChange('dni', v.replace(/\D/g, '').slice(0, 8))}
                  variant="bordered"
                  radius="lg"
                  isRequired
                  maxLength={8}
                  classNames={{
                    inputWrapper: 'border-neutral-200 hover:border-[#4654CD] focus-within:border-[#4654CD]',
                  }}
                />

                {/* Región y Provincia */}
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Región"
                    placeholder="Selecciona"
                    selectedKeys={formData.regionId ? [formData.regionId] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange('regionId', selected || '');
                    }}
                    variant="bordered"
                    radius="lg"
                    isRequired
                    classNames={{
                      trigger: 'border-neutral-200 hover:border-[#4654CD] data-[focus=true]:border-[#4654CD]',
                    }}
                  >
                    {regions.map((region) => (
                      <SelectItem key={region.id}>{region.nombre}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Provincia"
                    placeholder="Selecciona"
                    selectedKeys={formData.provinciaId ? [formData.provinciaId] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange('provinciaId', selected || '');
                    }}
                    variant="bordered"
                    radius="lg"
                    isRequired
                    isDisabled={!formData.regionId}
                    classNames={{
                      trigger: 'border-neutral-200 hover:border-[#4654CD] data-[focus=true]:border-[#4654CD]',
                    }}
                  >
                    {provincias.map((prov) => (
                      <SelectItem key={prov.id}>{prov.nombre}</SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Institución */}
                <Select
                  label="¿Dónde estudias?"
                  placeholder="Selecciona tu institución"
                  selectedKeys={formData.institucionId ? [formData.institucionId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleInputChange('institucionId', selected || '');
                  }}
                  variant="bordered"
                  radius="lg"
                  isRequired
                  classNames={{
                    trigger: 'border-neutral-200 hover:border-[#4654CD] data-[focus=true]:border-[#4654CD]',
                  }}
                >
                  {instituciones.map((inst) => (
                    <SelectItem key={inst.id}>{inst.nombre}</SelectItem>
                  ))}
                </Select>

                {/* Checkboxes */}
                <div className="space-y-2 pt-2">
                  <Checkbox
                    isSelected={formData.aceptaTerminos}
                    onValueChange={(v) => handleInputChange('aceptaTerminos', v)}
                    size="sm"
                    classNames={{
                      wrapper: 'before:border-neutral-300 group-data-[selected=true]:before:border-[#4654CD] group-data-[selected=true]:before:bg-[#4654CD]',
                    }}
                  >
                    <span className="text-xs text-neutral-500">
                      Acepto los{' '}
                      <a href="#" className="text-[#4654CD] underline">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="#" className="text-[#4654CD] underline">
                        política de privacidad
                      </a>
                    </span>
                  </Checkbox>

                  <Checkbox
                    isSelected={formData.aceptaPromociones}
                    onValueChange={(v) => handleInputChange('aceptaPromociones', v)}
                    size="sm"
                    classNames={{
                      wrapper: 'before:border-neutral-300 group-data-[selected=true]:before:border-[#4654CD] group-data-[selected=true]:before:bg-[#4654CD]',
                    }}
                  >
                    <span className="text-xs text-neutral-500">
                      Quiero recibir ofertas y promociones por WhatsApp
                    </span>
                  </Checkbox>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full font-semibold text-white cursor-pointer"
                  style={{ backgroundColor: campaign.colorPrimario }}
                  radius="lg"
                  size="lg"
                  isLoading={isSubmitting}
                  isDisabled={!formData.aceptaTerminos}
                  startContent={!isSubmitting && <Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar ahora'}
                </Button>

                {/* Trust badges */}
                <p className="text-xs text-neutral-400 text-center pt-2">
                  Tus datos están seguros. No los compartimos con terceros.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
