'use client';

/**
 * SolicitudIntroV1 - Intro dinamico
 * Responde a config.headerVersion, heroVersion, ctaVersion
 * Cada seccion tiene 6 variantes visuales
 */

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { Clock, Shield, CheckCircle, ArrowRight, Zap, Star, Sparkles } from 'lucide-react';
import type { WizardSolicitudConfig, SelectedProduct } from '../../../types/wizard-solicitud';

const BALDI_IMAGE = 'https://storage.googleapis.com/storage.botmaker.com/public/res/baldecash/20231006-v5kUqtWC54hBNKGTh66ZRy1bd7T2-KU0KM-.png';

interface SolicitudIntroV1Props {
  config: WizardSolicitudConfig;
  selectedProduct?: SelectedProduct;
  onStart: () => void;
}

// ============================================
// B.1 HEADER VARIANTS
// ============================================

const HeaderV1 = () => (
  <div className="border-b border-neutral-200 px-4 py-3 bg-white">
    <div className="max-w-lg mx-auto">
      <p className="text-center text-lg font-semibold text-neutral-800">Solicita tu laptop</p>
    </div>
  </div>
);

const HeaderV2 = ({ product }: { product: SelectedProduct }) => (
  <div className="border-b border-neutral-200 px-4 py-3 bg-white">
    <div className="max-w-lg mx-auto flex items-center gap-3">
      <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">{product.name}</p>
        <p className="text-xs text-neutral-500">S/{product.monthlyQuota}/mes</p>
      </div>
    </div>
  </div>
);

const HeaderV3 = ({ product }: { product: SelectedProduct }) => (
  <div className="border-b border-neutral-200 px-4 py-4 bg-gradient-to-r from-[#4654CD]/5 to-transparent">
    <div className="max-w-lg mx-auto flex items-center gap-4">
      <div className="w-16 h-16 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 p-2">
        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain" />
      </div>
      <div>
        <p className="font-semibold text-neutral-800">{product.name}</p>
        <p className="text-sm text-[#4654CD] font-medium">S/{product.monthlyQuota}/mes x {product.months} meses</p>
      </div>
    </div>
  </div>
);

const HeaderV4 = ({ product }: { product: SelectedProduct }) => (
  <div className="border-b border-neutral-200 px-4 py-4 bg-[#4654CD]">
    <div className="max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-[#03DBD0]" />
        <span className="text-white font-medium">{product.name}</span>
      </div>
      <span className="text-white/80 text-sm">S/{product.monthlyQuota}/mes</span>
    </div>
  </div>
);

const HeaderV5 = ({ product }: { product: SelectedProduct }) => (
  <div className="border-b border-neutral-200 px-4 py-3 bg-white">
    <div className="max-w-lg mx-auto flex items-center justify-between">
      <img src={product.thumbnail} alt={product.name} className="w-10 h-10 object-contain" />
      <div className="text-right">
        <p className="text-sm font-medium text-neutral-800">{product.name}</p>
        <p className="text-xs text-neutral-500">S/{product.monthlyQuota}/mes</p>
      </div>
    </div>
  </div>
);

const HeaderV6 = () => (
  <div className="border-b border-neutral-200 px-4 py-6 bg-white">
    <div className="max-w-lg mx-auto">
      <p className="text-center text-2xl font-bold text-neutral-800">Completa tu solicitud</p>
    </div>
  </div>
);

// ============================================
// B.5 HERO VARIANTS
// ============================================

const HeroV1 = ({ product }: { product?: SelectedProduct }) => (
  <div className="w-64 h-48 mb-6 bg-neutral-50 rounded-xl overflow-hidden shadow-sm">
    {product ? (
      <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-4" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-neutral-300">
        <span>Laptop</span>
      </div>
    )}
  </div>
);

const HeroV2 = () => (
  <div className="w-64 h-48 mb-6 bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
    <div className="text-center p-4">
      <Star className="w-12 h-12 text-[#4654CD] mx-auto mb-2" />
      <p className="text-sm text-neutral-600">Tu laptop ideal te espera</p>
    </div>
  </div>
);

const HeroV3 = () => (
  <div className="w-48 h-48 mb-6 relative">
    <div className="absolute inset-0 bg-[#4654CD]/10 rounded-full blur-2xl" />
    <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain relative z-10" />
  </div>
);

const HeroV4 = () => (
  <div className="w-64 h-48 mb-6 bg-gradient-to-br from-[#4654CD] to-[#03DBD0] rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
    <div className="text-center text-white">
      <Zap className="w-16 h-16 mx-auto mb-2" />
      <p className="font-bold text-lg">Financiamiento Express</p>
    </div>
  </div>
);

const HeroV5 = ({ product }: { product?: SelectedProduct }) => (
  <div className="flex items-center gap-6 mb-6">
    <div className="w-24 h-24">
      <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain" />
    </div>
    <div className="w-32 h-24 bg-neutral-50 rounded-lg overflow-hidden">
      {product && <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-2" />}
    </div>
  </div>
);

const HeroV6 = () => (
  <div className="w-56 h-56 mb-6 relative">
    <div className="absolute inset-0 bg-gradient-to-br from-[#4654CD]/20 to-[#03DBD0]/20 rounded-full animate-pulse" />
    <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
    <Sparkles className="absolute top-2 right-2 w-8 h-8 text-[#03DBD0] animate-spin" style={{ animationDuration: '3s' }} />
  </div>
);

// ============================================
// B.6 CTA VARIANTS
// ============================================

const CtaV1 = ({ onStart }: { onStart: () => void }) => (
  <Button
    size="lg"
    className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold px-8 py-6 text-lg"
    endContent={<ArrowRight className="w-5 h-5" />}
    onPress={onStart}
  >
    Empezar solicitud
  </Button>
);

const CtaV2 = ({ onStart }: { onStart: () => void }) => (
  <div className="text-center">
    <Button
      size="lg"
      className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold px-8 py-6 text-lg mb-3"
      endContent={<ArrowRight className="w-5 h-5" />}
      onPress={onStart}
    >
      Empezar solicitud
    </Button>
    <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
      <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> Datos protegidos</div>
      <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sin compromiso</div>
    </div>
  </div>
);

const CtaV3 = ({ onStart, product }: { onStart: () => void; product?: SelectedProduct }) => (
  <Card className="w-full max-w-sm border-2 border-[#4654CD]/20 shadow-lg">
    <CardBody className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3">
        <img src={BALDI_IMAGE} alt="Baldi" className="w-full h-full object-contain" />
      </div>
      <p className="text-sm text-neutral-600 mb-4">Respuesta en menos de 24 horas</p>
      <Button
        size="lg"
        className="w-full bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-6"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onStart}
      >
        Empezar solicitud
      </Button>
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-neutral-500">
        <Shield className="w-3 h-3" />
        <span>Tus datos estan protegidos</span>
      </div>
    </CardBody>
  </Card>
);

const CtaV4 = ({ onStart }: { onStart: () => void }) => (
  <Button
    size="lg"
    className="bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold px-10 py-7 text-xl shadow-xl shadow-[#4654CD]/30"
    endContent={<Zap className="w-6 h-6" />}
    onPress={onStart}
  >
    Solicitar ahora
  </Button>
);

const CtaV5 = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg">
    <div className="max-w-lg mx-auto">
      <Button
        size="lg"
        className="w-full bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-6"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onStart}
      >
        Empezar solicitud
      </Button>
    </div>
  </div>
);

const CtaV6 = ({ onStart }: { onStart: () => void }) => (
  <Button
    size="lg"
    className="w-full max-w-md bg-[#4654CD] hover:bg-[#3A47B8] text-white font-bold py-8 text-2xl"
    endContent={<ArrowRight className="w-7 h-7" />}
    onPress={onStart}
  >
    EMPEZAR
  </Button>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const SolicitudIntroV1: React.FC<SolicitudIntroV1Props> = ({
  config,
  selectedProduct,
  onStart,
}) => {
  // Detectar si estamos en modo oscuro (Layout V4)
  const isDarkMode = config.wizardLayoutVersion === 4;

  const renderHeader = () => {
    if (!selectedProduct && ![1, 6].includes(config.headerVersion)) {
      return <HeaderV1 />;
    }
    switch (config.headerVersion) {
      case 1: return <HeaderV1 />;
      case 2: return selectedProduct ? <HeaderV2 product={selectedProduct} /> : <HeaderV1 />;
      case 3: return selectedProduct ? <HeaderV3 product={selectedProduct} /> : <HeaderV1 />;
      case 4: return selectedProduct ? <HeaderV4 product={selectedProduct} /> : <HeaderV1 />;
      case 5: return selectedProduct ? <HeaderV5 product={selectedProduct} /> : <HeaderV1 />;
      case 6: return <HeaderV6 />;
      default: return <HeaderV1 />;
    }
  };

  const renderHero = () => {
    switch (config.heroVersion) {
      case 1: return <HeroV1 product={selectedProduct} />;
      case 2: return <HeroV2 />;
      case 3: return <HeroV3 />;
      case 4: return <HeroV4 />;
      case 5: return <HeroV5 product={selectedProduct} />;
      case 6: return <HeroV6 />;
      default: return <HeroV1 product={selectedProduct} />;
    }
  };

  const renderCta = () => {
    switch (config.ctaVersion) {
      case 1: return <CtaV1 onStart={onStart} />;
      case 2: return <CtaV2 onStart={onStart} />;
      case 3: return <CtaV3 onStart={onStart} product={selectedProduct} />;
      case 4: return <CtaV4 onStart={onStart} />;
      case 5: return <CtaV5 onStart={onStart} />;
      case 6: return <CtaV6 onStart={onStart} />;
      default: return <CtaV1 onStart={onStart} />;
    }
  };

  // Modo oscuro para Layout V4
  if (isDarkMode) {
    return (
      <div className="min-h-screen bg-[#151744] text-white relative overflow-hidden flex flex-col">
        {/* Fondo con shapes solidos (brandbook) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#4654CD]/20" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-[#03DBD0]/10" />
          <div className="absolute bottom-20 right-1/4 w-32 h-32 rounded-full bg-[#4654CD]/15" />
        </div>

        {/* Header dark mode */}
        <header className="relative z-10 border-b border-white/10 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <img
              src="https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png"
              alt="BaldeCash"
              className="h-8 object-contain brightness-0 invert"
            />
            {selectedProduct && (
              <div className="text-right">
                <p className="text-sm font-medium text-white/90">{selectedProduct.name}</p>
                <p className="text-xs text-[#03DBD0]">S/{selectedProduct.monthlyQuota}/mes</p>
              </div>
            )}
          </div>
        </header>

        {/* Contenido principal */}
        <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 ${config.ctaVersion === 5 ? 'pb-24' : ''}`}>
          {/* Hero - version dark */}
          <div className="w-64 h-48 mb-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
            {selectedProduct ? (
              <img src={selectedProduct.thumbnail} alt={selectedProduct.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <Zap className="w-12 h-12 text-[#03DBD0] mx-auto mb-2" />
                <p className="text-sm text-white/60">Tu laptop ideal</p>
              </div>
            )}
          </div>

          {/* Titulo */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
            {[3, 5, 6].includes(config.heroVersion) ? '¡Ya casi tienes tu laptop!' : 'Solicita tu laptop'}
          </h1>

          {/* Tiempo estimado */}
          <div className="flex items-center gap-2 text-white/60 mb-6">
            <Clock className="w-4 h-4 text-[#03DBD0]" />
            <span className="text-sm">Solo 5 minutos</span>
          </div>

          {/* Beneficios - dark mode */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
            <div className="flex items-center gap-1.5 bg-[#03DBD0]/10 border border-[#03DBD0]/20 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-[#03DBD0]" />
              <span className="text-sm text-white/80">Sin inicial</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#03DBD0]/10 border border-[#03DBD0]/20 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-[#03DBD0]" />
              <span className="text-sm text-white/80">Cuotas fijas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#03DBD0]/10 border border-[#03DBD0]/20 px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-[#03DBD0]" />
              <span className="text-sm text-white/80">Respuesta en 24h</span>
            </div>
          </div>

          {/* CTA - dark mode style */}
          <Button
            size="lg"
            className="bg-[#03DBD0] hover:brightness-110 text-[#151744] font-bold px-8 py-6 text-lg"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onStart}
          >
            Empezar solicitud
          </Button>

          {/* Trust */}
          <div className="flex items-center gap-2 mt-6 text-xs text-white/40">
            <Shield className="w-4 h-4" />
            <span>Tus datos estan protegidos</span>
          </div>
        </div>
      </div>
    );
  }

  // Modo normal (light)
  const bgClass = [3, 5, 6].includes(config.heroVersion)
    ? 'bg-gradient-to-b from-[#4654CD]/5 to-white'
    : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col`}>
      {/* Header dinamico */}
      {renderHeader()}

      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col items-center justify-center px-4 py-8 ${config.ctaVersion === 5 ? 'pb-24' : ''}`}>
        {/* Hero dinamico */}
        {renderHero()}

        {/* Titulo */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 mb-2">
          {[3, 5, 6].includes(config.heroVersion) ? '¡Ya casi tienes tu laptop!' : 'Solicita tu laptop'}
        </h1>

        {/* Tiempo estimado */}
        <div className="flex items-center gap-2 text-neutral-600 mb-6">
          <Clock className="w-4 h-4 text-[#4654CD]" />
          <span className="text-sm">Solo 5 minutos</span>
        </div>

        {/* Beneficios */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md">
          <div className="flex items-center gap-1.5 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm text-neutral-700">Sin inicial</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm text-neutral-700">Cuotas fijas</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#22c55e]/10 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm text-neutral-700">Respuesta en 24h</span>
          </div>
        </div>

        {/* CTA dinamico */}
        {renderCta()}

        {/* Trust (solo si CTA no es V2 o V3 que ya lo tienen) */}
        {![2, 3, 5].includes(config.ctaVersion) && (
          <div className="flex items-center gap-2 mt-6 text-xs text-neutral-500">
            <Shield className="w-4 h-4" />
            <span>Tus datos estan protegidos</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudIntroV1;
