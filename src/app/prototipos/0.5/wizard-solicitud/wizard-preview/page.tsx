'use client';

/**
 * Wizard Preview - Intro Page
 * Landing page before starting the wizard flow
 */

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, Loader2, Code, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { useProduct, SelectedProduct } from '../context/ProductContext';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';

// Upsell components
import { AccessoryIntro, AccessoryCard } from '@/app/prototipos/0.5/upsell/components/upsell';
import { mockAccessories } from '@/app/prototipos/0.5/upsell/data/mockUpsellData';

// Fixed config for wizard
const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  version: '0.5',
  steps: ['intro', 'datos-personales', 'datos-academicos', 'datos-economicos', 'resumen'],
};

// Mock product for testing
const MOCK_PRODUCT: SelectedProduct = {
  id: 'macbook-air-m3',
  name: 'MacBook Air 13" M3',
  shortName: 'MacBook Air M3',
  brand: 'Apple',
  price: 5499,
  monthlyPayment: 458,
  months: 12,
  image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=400&hei=400&fmt=jpeg&qlt=95&.v=1708367688034',
  specs: {
    processor: 'Apple M3 8-core',
    ram: '8GB RAM',
    storage: '256GB SSD',
  },
};

function WizardPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const { setSelectedProduct, selectedAccessories, toggleAccessory } = useProduct();
  const [showConfig, setShowConfig] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(true);

  // Set mock product on mount for testing purposes
  useEffect(() => {
    setSelectedProduct(MOCK_PRODUCT);
  }, [setSelectedProduct]);

  const handleStart = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/datos-personales';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  // Checkbox component
  const Checkbox = ({
    id,
    checked,
    onChange,
    label,
    description,
  }: {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 w-full text-left cursor-pointer"
    >
      <div
        className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
          transition-all duration-200
          ${checked
            ? 'bg-[#4654CD] border-[#4654CD]'
            : 'bg-white border-neutral-300 hover:border-[#4654CD]/50'
          }
        `}
      >
        {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
    </button>
  );

  // Logo URL de BaldeCash
  const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

  // Content component to avoid duplication
  const PageContent = () => (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Header con fondo primario - fixed con sombra */}
      <div className="bg-[#4654CD] py-5 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-[#4654CD]/20">
        <div className="flex justify-center">
          <img
            src={BALDECASH_LOGO}
            alt="BaldeCash"
            className="h-12 object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[68px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-14 pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#4654CD]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#4654CD]" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">
            Solicitud de Financiamiento
          </h1>
          <p className="text-neutral-600 text-lg">
            Completa el formulario para solicitar tu equipo tecnológico
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <Clock className="w-6 h-6 text-[#4654CD] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">5-10 minutos</p>
            <p className="text-xs text-neutral-500">Tiempo estimado</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <FileText className="w-6 h-6 text-[#4654CD] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">4 pasos</p>
            <p className="text-xs text-neutral-500">Proceso simple</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <Shield className="w-6 h-6 text-[#4654CD] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">100% Seguro</p>
            <p className="text-xs text-neutral-500">Datos protegidos</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Lo que necesitarás
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#4654CD]">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Documento de identidad</p>
                <p className="text-xs text-neutral-500">DNI, CE o Pasaporte vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#4654CD]">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Constancia de estudios</p>
                <p className="text-xs text-neutral-500">Documento que acredite tu matrícula vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#4654CD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#4654CD]">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Información de contacto</p>
                <p className="text-xs text-neutral-500">Teléfono y correo electrónico activos</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Accessories Upsell Section */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8">
          <AccessoryIntro />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAccessories.map((accessory) => (
              <AccessoryCard
                key={accessory.id}
                accessory={accessory}
                isSelected={selectedAccessories.some((a) => a.id === accessory.id)}
                onToggle={() => toggleAccessory(accessory)}
              />
            ))}
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8">
          <h3 className="font-semibold text-neutral-800 mb-4">Términos y Condiciones</h3>
          <div className="space-y-4">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onChange={setAcceptTerms}
              label="Acepto los términos y condiciones"
              description="He leído y acepto los términos de uso y la política de privacidad"
            />
            <Checkbox
              id="acceptPromos"
              checked={acceptPromos}
              onChange={setAcceptPromos}
              label="Quiero recibir promociones"
              description="Acepto recibir ofertas y novedades por correo electrónico"
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={!acceptTerms}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     ${acceptTerms
                       ? 'bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-[#4654CD]/25 cursor-pointer'
                       : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-neutral-300/25'
                     }`}
        >
          <span>Comenzar Solicitud</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        <PageContent />
        <FeedbackButton
          sectionId="wizard-solicitud-intro"
          config={WIZARD_CONFIG as unknown as Record<string, unknown>}
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      <PageContent />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <TokenCounter sectionId="PROMPT_WIZARD" version="0.5" />
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => setShowConfig(!showConfig)}
        >
          <Code className="w-5 h-5 text-neutral-600" />
        </Button>
        <Button
          isIconOnly
          radius="md"
          className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          onPress={() => router.push('/prototipos/0.5')}
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
      </div>

      {/* Config Badge */}
      {showConfig && (
        <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm">
          <p className="text-xs text-neutral-500 mb-2">Configuración v0.5:</p>
          <pre className="text-xs bg-neutral-50 p-2 rounded overflow-auto max-h-40 text-neutral-600">
            {JSON.stringify(WIZARD_CONFIG, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#4654CD]" />
    </div>
  );
}

export default function WizardPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WizardPreviewContent />
    </Suspense>
  );
}
