'use client';

/**
 * Wizard Preview - Intro Page
 * Landing page before starting the wizard flow
 */

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useProduct } from './context/ProductContext';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Upsell components
import { AccessoryIntro, AccessoryCard, AccessoryDetailModal } from './components/upsell';
import { mockAccessories } from './data/mockUpsellData';
import type { Accessory } from './types/upsell';

// Coupon component
import { CouponInput } from './components/solicitar/coupon';

function WizardPreviewContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const { selectedProduct, setSelectedProduct, selectedAccessories, toggleAccessory, isHydrated } = useProduct();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);
  const [isTermsHydrated, setIsTermsHydrated] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

  // Cargar valores desde localStorage al montar
  useEffect(() => {
    try {
      const savedAcceptTerms = localStorage.getItem('wizard_acceptTerms');
      const savedAcceptPromos = localStorage.getItem('wizard_acceptPromos');
      if (savedAcceptTerms !== null) setAcceptTerms(savedAcceptTerms === 'true');
      if (savedAcceptPromos !== null) setAcceptPromos(savedAcceptPromos === 'true');
    } catch {}
    setIsTermsHydrated(true);
  }, []);

  // Guardar acceptTerms en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem('wizard_acceptTerms', String(acceptTerms));
    } catch {}
  }, [acceptTerms, isTermsHydrated]);

  // Guardar acceptPromos en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem('wizard_acceptPromos', String(acceptPromos));
    } catch {}
  }, [acceptPromos, isTermsHydrated]);

  // Redirect to catalog if no product was selected
  useEffect(() => {
    // Wait for hydration from localStorage before deciding
    if (!isHydrated) return;

    // If no product was selected, redirect to catalog
    if (!selectedProduct) {
      router.replace(`/prototipos/0.6/${landing}/catalogo`);
    }
  }, [isHydrated, selectedProduct, router, landing]);

  const handleStart = () => {
    // Validar términos antes de continuar
    if (!acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones para continuar');
      // Scroll al checkbox de términos
      document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setTermsError(null);
    router.push(`/prototipos/0.6/${landing}/solicitar/datos-personales`);
  };

  // Checkbox component
  const Checkbox = ({
    id,
    checked,
    onChange,
    label,
    description,
    error,
  }: {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
    error?: string | null;
  }) => (
    <div>
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
              : error
                ? 'bg-white border-red-500 ring-2 ring-red-500/20'
                : 'bg-white border-neutral-300 hover:border-[#4654CD]/50'
            }
          `}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-neutral-800'}`}>{label}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-9">{error}</p>
      )}
    </div>
  );

  // Content JSX (no es componente para evitar remount en cada render)
  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq']}
      />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

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
            <p className="text-sm font-medium text-neutral-800">1-2 minutos</p>
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
                onViewDetails={() => setDetailAccessory(accessory)}
              />
            ))}
          </div>
        </div>

        {/* Accessory Detail Modal */}
        <AccessoryDetailModal
          accessory={detailAccessory}
          isOpen={!!detailAccessory}
          onClose={() => setDetailAccessory(null)}
          isSelected={detailAccessory ? selectedAccessories.some((a) => a.id === detailAccessory.id) : false}
          onToggle={() => {
            if (detailAccessory) {
              toggleAccessory(detailAccessory);
            }
          }}
        />

        {/* Términos y Condiciones */}
        <div id="terms-section" className={`bg-white rounded-xl p-6 border mb-8 transition-colors ${termsError ? 'border-red-300 bg-red-50/30' : 'border-neutral-200'}`}>
          <h3 className="font-semibold text-neutral-800 mb-4">Términos y Condiciones</h3>
          <div className="space-y-4">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(checked) => {
                setAcceptTerms(checked);
                if (checked) setTermsError(null); // Limpiar error al marcar
              }}
              label="Acepto los términos y condiciones"
              description="He leído y acepto los términos de uso y la política de privacidad"
              error={termsError}
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

        {/* Cupón de Descuento */}
        <div className="mb-8">
          <CouponInput />
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     bg-[#4654CD] text-white hover:bg-[#3a47b3] shadow-[#4654CD]/25 cursor-pointer"
        >
          <span>Comenzar Solicitud</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Back to catalog link */}
        <button
          onClick={() => router.push(`/prototipos/0.6/${landing}/catalogo`)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-neutral-500 hover:text-[#4654CD] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al catálogo</span>
        </button>
      </div>
    </div>
  );

  // Show loading while checking hydration, layout loading, or if no product selected (redirect will happen)
  if (!isHydrated || !selectedProduct || isLayoutLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="relative">
      {pageContent}
      <Footer data={footerData} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
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
