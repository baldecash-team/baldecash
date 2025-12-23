'use client';

/**
 * Wizard Solicitud Preview - PROMPT_18
 * Preview con Settings Modal para configurar versiones
 *
 * URL Params:
 * - ?estado=aprobado - Muestra pantalla de aprobación
 * - ?estado=rechazado - Muestra pantalla de rechazo
 *
 * Keyboard Shortcuts:
 * - 1-6: Cambiar versión del componente activo
 * - Tab: Siguiente componente
 * - Shift+Tab: Componente anterior
 * - S: Abrir/cerrar settings
 * - C: Abrir/cerrar quick switcher
 * - Esc: Cerrar modal
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@nextui-org/react';
import { Settings, ArrowLeft, Zap, Code, Layers, Navigation, Info, Keyboard, CheckCircle2, XCircle, PartyPopper, AlertTriangle, Home, RotateCcw, Phone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import { WizardSolicitudContainer } from '../components/wizard-solicitud/WizardSolicitudContainer';
import { WizardSolicitudSettingsModal } from '../components/wizard-solicitud/WizardSolicitudSettingsModal';
import { QuickComponentSwitcher } from '../components/wizard-solicitud/QuickComponentSwitcher';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { useKeyboardShortcuts } from '../hooks';

// Types & Data
import type { WizardSolicitudConfig } from '../types/wizard-solicitud';
import { defaultWizardSolicitudConfig } from '../types/wizard-solicitud';
import { MOCK_PRODUCT } from '../data/wizardSolicitudSteps';

// Pantalla de Aprobación
const AprobadoScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#22c55e]/10 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/images/logos/balde-cash-logo.svg" alt="BaldeCash" className="h-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#22c55e]/30"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          {/* Confetti */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <PartyPopper className="w-8 h-8 mx-auto text-amber-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-neutral-800 mb-2 font-['Baloo_2']"
          >
            ¡Felicidades!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#22c55e] font-semibold mb-4"
          >
            Tu solicitud ha sido aprobada
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 mb-6"
          >
            <p className="text-neutral-600 mb-4">
              En las próximas 24-48 horas nos comunicaremos contigo para coordinar la entrega de tu laptop.
            </p>
            <div className="bg-[#22c55e]/10 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Monto aprobado</p>
              <p className="text-2xl font-bold text-[#22c55e]">S/ 2,499</p>
              <p className="text-sm text-neutral-500">18 cuotas de S/ 149/mes</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
              startContent={<Home className="w-5 h-5" />}
              onPress={() => router.push('/prototipos/0.4')}
            >
              Volver al inicio
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="w-full border-2 border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
              startContent={<Phone className="w-5 h-5" />}
              onPress={() => window.open('https://wa.link/osgxjf', '_blank')}
            >
              Contactar por WhatsApp
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Pantalla de Recibido (Solicitud en evaluación)
const RecibidoScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4654CD]/10 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/images/logos/balde-cash-logo.svg" alt="BaldeCash" className="h-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-[#4654CD] rounded-full flex items-center justify-center shadow-lg shadow-[#4654CD]/30"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          {/* Confetti */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <PartyPopper className="w-8 h-8 mx-auto text-amber-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-neutral-800 mb-2 font-['Baloo_2']"
          >
            ¡Solicitud recibida!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#4654CD] font-semibold mb-4"
          >
            Estamos evaluando tu solicitud
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 mb-6"
          >
            <p className="text-neutral-600 mb-4">
              En las próximas <span className="font-semibold text-[#4654CD]">24 horas</span> recibirás una respuesta sobre tu solicitud.
            </p>
            <div className="bg-[#4654CD]/10 rounded-xl p-4">
              <p className="text-sm text-neutral-500 mb-1">Tu producto solicitado</p>
              <p className="text-xl font-bold text-[#4654CD]">Laptop HP ProBook</p>
              <p className="text-sm text-neutral-500">18 cuotas de S/ 149/mes</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
              startContent={<Home className="w-5 h-5" />}
              onPress={() => router.push('/prototipos/0.4')}
            >
              Volver al inicio
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="w-full border-2 border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
              startContent={<Phone className="w-5 h-5" />}
              onPress={() => window.open('https://wa.link/osgxjf', '_blank')}
            >
              Contactar por WhatsApp
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Pantalla de Rechazo
const RechazadoScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/images/logos/balde-cash-logo.svg" alt="BaldeCash" className="h-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-neutral-200 rounded-full flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-neutral-500" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-neutral-800 mb-2 font-['Baloo_2']"
          >
            Lo sentimos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-neutral-600 mb-6"
          >
            En esta oportunidad no podemos aprobar tu solicitud
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200 mb-6"
          >
            <div className="flex items-start gap-3 text-left mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-800 mb-1">¿Por qué fue rechazada?</p>
                <p className="text-sm text-neutral-600">
                  No cumples con alguno de los requisitos mínimos. Esto puede deberse a la información proporcionada o al historial crediticio.
                </p>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-sm text-neutral-500 mb-2">Puedes intentar nuevamente en:</p>
              <p className="text-xl font-bold text-neutral-800">30 días</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-[#4654CD] text-white font-semibold cursor-pointer"
              startContent={<Home className="w-5 h-5" />}
              onPress={() => router.push('/prototipos/0.4')}
            >
              Volver al inicio
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="w-full border-2 border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
              startContent={<Phone className="w-5 h-5" />}
              onPress={() => window.open('https://wa.link/osgxjf', '_blank')}
            >
              Contactar soporte
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Contenido principal con useSearchParams
function WizardPreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estado = searchParams.get('estado');
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Inicializar config desde URL params (lowercase for consistency)
  const [config, setConfig] = useState<WizardSolicitudConfig>(() => {
    const validVersions = [1, 2, 3, 4, 5, 6];
    const parseVersion = (param: string | null): 1 | 2 | 3 | 4 | 5 | 6 => {
      const val = parseInt(param || '1');
      return validVersions.includes(val) ? (val as 1 | 2 | 3 | 4 | 5 | 6) : 1;
    };

    return {
      ...defaultWizardSolicitudConfig,
      // Vista Solicitud (B.x)
      headerVersion: parseVersion(searchParams.get('header')),
      titleVersion: parseVersion(searchParams.get('title')),
      messageVersion: parseVersion(searchParams.get('message')),
      heroVersion: parseVersion(searchParams.get('hero')),
      ctaVersion: parseVersion(searchParams.get('cta')),
      // Wizard Estructura (C.x)
      wizardLayoutVersion: parseVersion(searchParams.get('wizardlayout')),
      progressVersion: parseVersion(searchParams.get('progress')),
      navigationVersion: parseVersion(searchParams.get('navigation')),
      stepLayoutVersion: parseVersion(searchParams.get('steplayout')),
      celebrationVersion: parseVersion(searchParams.get('celebration')),
      // Campos (C1.x)
      inputVersion: parseVersion(searchParams.get('input')),
      optionsVersion: parseVersion(searchParams.get('options')),
      uploadVersion: parseVersion(searchParams.get('upload')),
      datePickerVersion: parseVersion(searchParams.get('datepicker')),
      searchVersion: parseVersion(searchParams.get('search')),
      validationVersion: parseVersion(searchParams.get('validation')),
      errorVersion: parseVersion(searchParams.get('error')),
      helpVersion: parseVersion(searchParams.get('help')),
      docExamplesVersion: parseVersion(searchParams.get('docexamples')),
    };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [showConfigBadge, setShowConfigBadge] = useState(false);

  // Update URL when config changes (sync with settings modal)
  useEffect(() => {
    const params = new URLSearchParams();

    // Only include params that differ from defaults
    // Vista Solicitud (B.x)
    if (config.headerVersion !== defaultWizardSolicitudConfig.headerVersion) {
      params.set('header', config.headerVersion.toString());
    }
    if (config.titleVersion !== defaultWizardSolicitudConfig.titleVersion) {
      params.set('title', config.titleVersion.toString());
    }
    if (config.messageVersion !== defaultWizardSolicitudConfig.messageVersion) {
      params.set('message', config.messageVersion.toString());
    }
    if (config.heroVersion !== defaultWizardSolicitudConfig.heroVersion) {
      params.set('hero', config.heroVersion.toString());
    }
    if (config.ctaVersion !== defaultWizardSolicitudConfig.ctaVersion) {
      params.set('cta', config.ctaVersion.toString());
    }
    // Wizard Estructura (C.x)
    if (config.wizardLayoutVersion !== defaultWizardSolicitudConfig.wizardLayoutVersion) {
      params.set('wizardlayout', config.wizardLayoutVersion.toString());
    }
    if (config.progressVersion !== defaultWizardSolicitudConfig.progressVersion) {
      params.set('progress', config.progressVersion.toString());
    }
    if (config.navigationVersion !== defaultWizardSolicitudConfig.navigationVersion) {
      params.set('navigation', config.navigationVersion.toString());
    }
    if (config.stepLayoutVersion !== defaultWizardSolicitudConfig.stepLayoutVersion) {
      params.set('steplayout', config.stepLayoutVersion.toString());
    }
    if (config.celebrationVersion !== defaultWizardSolicitudConfig.celebrationVersion) {
      params.set('celebration', config.celebrationVersion.toString());
    }
    // Campos (C1.x)
    if (config.inputVersion !== defaultWizardSolicitudConfig.inputVersion) {
      params.set('input', config.inputVersion.toString());
    }
    if (config.optionsVersion !== defaultWizardSolicitudConfig.optionsVersion) {
      params.set('options', config.optionsVersion.toString());
    }
    if (config.uploadVersion !== defaultWizardSolicitudConfig.uploadVersion) {
      params.set('upload', config.uploadVersion.toString());
    }
    if (config.datePickerVersion !== defaultWizardSolicitudConfig.datePickerVersion) {
      params.set('datepicker', config.datePickerVersion.toString());
    }
    if (config.searchVersion !== defaultWizardSolicitudConfig.searchVersion) {
      params.set('search', config.searchVersion.toString());
    }
    if (config.validationVersion !== defaultWizardSolicitudConfig.validationVersion) {
      params.set('validation', config.validationVersion.toString());
    }
    if (config.errorVersion !== defaultWizardSolicitudConfig.errorVersion) {
      params.set('error', config.errorVersion.toString());
    }
    if (config.helpVersion !== defaultWizardSolicitudConfig.helpVersion) {
      params.set('help', config.helpVersion.toString());
    }
    if (config.docExamplesVersion !== defaultWizardSolicitudConfig.docExamplesVersion) {
      params.set('docexamples', config.docExamplesVersion.toString());
    }

    // Preserve clean mode if set
    if (isCleanMode) {
      params.set('mode', 'clean');
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  }, [config, router, isCleanMode]);

  const { activeComponent, setActiveComponent, componentLabel, toast } = useKeyboardShortcuts({
    config,
    onConfigChange: setConfig,
    onOpenSettings: () => setIsSettingsOpen(true),
    onCloseSettings: () => setIsSettingsOpen(false),
    isSettingsOpen,
    onOpenQuickSwitcher: () => setIsQuickSwitcherOpen(true),
    onCloseQuickSwitcher: () => setIsQuickSwitcherOpen(false),
    isQuickSwitcherOpen,
  });

  // Mostrar pantallas de resultado según el estado
  if (estado === 'aprobado') {
    return <AprobadoScreen onBack={() => router.push('/prototipos/0.4/wizard-solicitud/wizard-preview')} />;
  }

  if (estado === 'rechazado') {
    return <RechazadoScreen onBack={() => router.push('/prototipos/0.4/wizard-solicitud/wizard-preview')} />;
  }

  if (estado === 'recibido') {
    return <RecibidoScreen onBack={() => router.push('/prototipos/0.4/wizard-solicitud/wizard-preview')} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Main content - Wizard Container */}
      <div>
        <WizardSolicitudContainer
          config={config}
          selectedProduct={MOCK_PRODUCT}
          onComplete={(data) => {
            console.log('Solicitud completada:', data);
          }}
          onSave={(data) => {
            console.log('Guardado:', data);
          }}
          onAprobado={() => router.push('/prototipos/0.4/resultado/aprobado-preview/?celebration=1&confetti=1&sound=2&summary=1&time=3&share=6&referrals=1&mode=clean')}
          onRechazado={() => router.push('/prototipos/0.4/resultado/rechazado-preview/?mode=clean')}
          onRecibido={() => router.push('/prototipos/0.4/resultado/aprobado-preview/?celebration=1&confetti=1&sound=2&summary=1&time=3&share=6&referrals=1&mode=clean&type=recibido')}
        />
      </div>

      {/* Dev UI - Hidden in clean mode */}
      {!isCleanMode && (
        <>
          {/* Toast de shortcuts */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium ${
                  toast.type === 'version'
                    ? 'bg-[#4654CD] text-white'
                    : toast.type === 'navigation'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-white text-neutral-800 border border-neutral-200'
                }`}
              >
                {toast.type === 'version' && <Layers className="w-4 h-4" />}
                {toast.type === 'navigation' && <Navigation className="w-4 h-4" />}
                {toast.type === 'info' && <Info className="w-4 h-4" />}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shortcut Help Badge */}
          <div className="fixed top-20 right-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-md px-3 py-2 border border-neutral-200">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Press ? for help</span>
            </div>
            <div className="text-xs font-medium text-[#4654CD]">
              Activo: {componentLabel}
            </div>
          </div>

          {/* Floating controls */}
          <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
            <TokenCounter sectionId="PROMPT_18" version="0.4" />
            <Button
              isIconOnly
              className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
              onPress={() => setIsSettingsOpen(true)}
              aria-label="Configuración"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              className="bg-amber-500 text-white shadow-lg cursor-pointer hover:bg-amber-600 transition-colors"
              onPress={() => setIsQuickSwitcherOpen(true)}
              aria-label="Cambio rápido"
            >
              <Zap className="w-5 h-5" />
            </Button>
            <Button
              isIconOnly
              className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
              onPress={() => setShowConfigBadge(!showConfigBadge)}
              aria-label="Mostrar configuración"
            >
              <Code className="w-5 h-5 text-neutral-600" />
            </Button>
            <Button
              isIconOnly
              className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
              onPress={() => router.push('/prototipos/0.4')}
              aria-label="Volver al índice"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Button>
          </div>

          {/* Current Config Badge */}
          {showConfigBadge && (
            <div className="fixed bottom-6 left-6 z-[100] bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-2 border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">Configuración actual:</p>
              <p className="text-xs font-mono text-neutral-700">
                Header: V{config.headerVersion} | Hero: V{config.heroVersion} | CTA: V{config.ctaVersion} | Layout: V{config.wizardLayoutVersion} | Progress: V{config.progressVersion} | Nav: V{config.navigationVersion}
              </p>
            </div>
          )}

          {/* Settings Modal */}
          <WizardSolicitudSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            config={config}
            onConfigChange={setConfig}
          />

          {/* Quick Component Switcher */}
          <QuickComponentSwitcher
            isOpen={isQuickSwitcherOpen}
            onClose={() => setIsQuickSwitcherOpen(false)}
            config={config}
            onConfigChange={setConfig}
            activeComponent={activeComponent}
            onActiveComponentChange={setActiveComponent}
          />
        </>
      )}
    </div>
  );
}

// Export con Suspense para useSearchParams
export default function WizardSolicitudPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <WizardPreviewContent />
    </Suspense>
  );
}
