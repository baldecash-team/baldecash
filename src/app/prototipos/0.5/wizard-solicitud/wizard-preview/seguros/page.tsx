'use client';

/**
 * Seguros - Paso de selección de seguros (opcional)
 * Muestra producto + accesorios seleccionados y opciones de seguro
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@nextui-org/react';
import { ArrowLeft, ChevronDown, ChevronUp, Code, Loader2, Package, Plus, Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useProduct } from '../../context/ProductContext';
import { formatMoney } from '../../../utils/formatMoney';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

// Upsell components
import {
  InsuranceIntro,
  PlanComparison,
} from '../../../upsell/components/upsell';

// Data
import { mockInsurancePlans } from '../../../upsell/data/mockUpsellData';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'seguros',
  version: '0.5',
};

// Logo URL de BaldeCash
const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

function SegurosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showConfig, setShowConfig] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccessoriesExpanded, setIsAccessoriesExpanded] = useState(true);

  const { selectedProduct, selectedAccessories, getTotalMonthlyPayment } = useProduct();

  const handleBack = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/resumen';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/resultados';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  // Calculate total with insurance
  const insuranceMonthly = selectedInsurance
    ? mockInsurancePlans.find((p) => p.id === selectedInsurance)?.monthlyPrice || 0
    : 0;
  const totalMonthly = getTotalMonthlyPayment() + insuranceMonthly;

  const pageContent = (
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

      <div className="max-w-3xl mx-auto px-4 pt-14 pb-32 lg:pb-6">
        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">
                Accidentes pasan. Protege tu equipo desde S/15/mes
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Selecciona un seguro para mayor tranquilidad (opcional)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Selected Product Card */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-neutral-200 p-4 mb-4"
          >
            <div className="flex items-center gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedProduct.image ? (
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <Package className="w-8 h-8 text-neutral-300" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 uppercase tracking-wide">
                  {selectedProduct.brand}
                </p>
                <p className="text-base font-semibold text-neutral-800">
                  {selectedProduct.name}
                </p>
                {selectedProduct.specs && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {[
                      selectedProduct.specs.processor,
                      selectedProduct.specs.ram,
                      selectedProduct.specs.storage
                    ].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-[#4654CD]">
                  S/{formatMoney(selectedProduct.monthlyPayment)}/mes
                </p>
                <p className="text-sm text-neutral-500">
                  {selectedProduct.months} meses
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Accessories Accordion */}
        {selectedAccessories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#4654CD]/5 rounded-xl border border-[#4654CD]/10 overflow-hidden mb-6"
          >
            {/* Accordion Header */}
            <button
              onClick={() => setIsAccessoriesExpanded(!isAccessoriesExpanded)}
              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-[#4654CD]/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#4654CD]" />
                <p className="text-sm font-semibold text-neutral-800">
                  Accesorios ({selectedAccessories.length})
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isAccessoriesExpanded && (
                  <span className="text-sm font-medium text-[#4654CD]">
                    +S/{formatMoney(selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0))}/mes
                  </span>
                )}
                {isAccessoriesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isAccessoriesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-4 border-t border-[#4654CD]/10">
                    <div className="space-y-2">
                      {selectedAccessories.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Plus className="w-3 h-3 text-[#4654CD] flex-shrink-0" />
                            <span className="text-neutral-700 truncate">{acc.name}</span>
                          </div>
                          <span className="text-[#4654CD] font-medium flex-shrink-0 ml-4">
                            +S/{formatMoney(acc.monthlyQuota)}/mes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Insurance Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-neutral-200"
        >
          <InsuranceIntro />
          <PlanComparison
            plans={mockInsurancePlans}
            selectedPlan={selectedInsurance}
            onSelect={(planId) =>
              setSelectedInsurance(planId === selectedInsurance ? null : planId)
            }
          />
        </motion.div>

        {/* Total Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 bg-white rounded-xl border border-neutral-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Cuota mensual total</p>
              {selectedInsurance && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3" />
                  Incluye seguro
                </p>
              )}
            </div>
            <p className="text-2xl font-bold text-[#4654CD]">
              S/{formatMoney(totalMonthly)}/mes
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex gap-3"
        >
          <Button
            size="lg"
            variant="bordered"
            className="flex-1 border-neutral-300 text-neutral-700 cursor-pointer"
            onPress={handleBack}
          >
            Atrás
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-[#4654CD] text-white font-semibold cursor-pointer hover:bg-[#3a47b3]"
            onPress={handleContinue}
            isLoading={isSubmitting}
            spinner={<Loader2 className="w-5 h-5 animate-spin" />}
          >
            Enviar Solicitud
          </Button>
        </motion.div>

        {/* Optional Note */}
        <p className="text-xs text-neutral-400 text-center mt-4">
          La selección de seguro es opcional. Puedes continuar sin seleccionar ninguno.
        </p>
      </div>
    </div>
  );

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        {pageContent}
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="wizard-solicitud-seguros"
          config={WIZARD_CONFIG as unknown as Record<string, unknown>}
          className="bottom-24 lg:bottom-6"
        />
      </>
    );
  }

  // Normal mode: content + floating controls
  return (
    <div className="relative">
      {pageContent}
      <Footer isCleanMode={isCleanMode} />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 lg:bottom-6">
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
        <div className="fixed bottom-24 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 border border-neutral-200 max-w-sm lg:bottom-6">
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

export default function SegurosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SegurosContent />
    </Suspense>
  );
}
