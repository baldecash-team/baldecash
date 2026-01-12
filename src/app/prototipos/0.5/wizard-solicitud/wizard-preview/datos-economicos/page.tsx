'use client';

/**
 * Datos Económicos - Step 3
 * Financial information form
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../../components/wizard-solicitud/wizard';
import { TextInput, RadioGroup, TextArea } from '../../components/wizard-solicitud/fields';
import { datosEconomicosTooltips } from '../../data/fieldTooltips';
import { StepSuccessMessage } from '../../components/wizard-solicitud/celebration/StepSuccessMessage';
import { useWizard } from '../../context/WizardContext';
import { getStepById } from '../../data/wizardSteps';
import { Loader2, Code, ArrowLeft } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'datos-economicos',
  version: '0.5',
};

function DatosEconomicosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const [showCelebration, setShowCelebration] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showConfig, setShowConfig] = useState(false);

  const {
    getFieldValue,
    getFieldError,
    updateField,
    setFieldError,
    validateField,
    markStepCompleted,
  } = useWizard();

  const step = getStepById('datos-economicos')!;

  // Inicializar touched para campos que ya tienen valor (desde localStorage)
  React.useEffect(() => {
    const fieldsToCheck = ['situacionLaboral', 'ingresoMensual', 'comentarios'];
    const initialTouched: Record<string, boolean> = {};

    fieldsToCheck.forEach((fieldId) => {
      const value = getFieldValue(fieldId) as string;
      if (value && value.trim()) {
        initialTouched[fieldId] = true;
      }
    });

    if (Object.keys(initialTouched).length > 0) {
      setTouched((prev) => ({ ...prev, ...initialTouched }));
    }
  }, [getFieldValue]);

  const handleFieldChange = (fieldId: string, value: string) => {
    updateField(fieldId, value);
    setFieldError(fieldId, '');
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handleFieldBlur = (fieldId: string, rules?: unknown) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
    const value = getFieldValue(fieldId) as string;
    const error = validateField(fieldId, value, rules as never);
    if (error) {
      setFieldError(fieldId, error);
    }
  };

  const isFieldValid = (fieldId: string) => {
    const value = getFieldValue(fieldId) as string;
    return touched[fieldId] && !!value && !getFieldError(fieldId);
  };

  const handleNext = () => {
    markStepCompleted('datos-economicos');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/resumen';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const handleBack = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/datos-academicos';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  // Sin validación para fines prácticos
  const canProceed = true;

  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          <StepSuccessMessage
            stepName="Datos Económicos"
            stepNumber={3}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        currentStep="datos-economicos"
        title={step.title}
        description={step.description}
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed}
      >
        <div className="space-y-6">
          <RadioGroup
            id="situacionLaboral"
            label="Situación Laboral"
            value={(getFieldValue('situacionLaboral') as string) || ''}
            onChange={(v) => handleFieldChange('situacionLaboral', v)}
            options={[
              { value: 'empleado', label: 'Empleado' },
              { value: 'independiente', label: 'Independiente' },
              { value: 'practicante', label: 'Practicante' },
              { value: 'desempleado', label: 'Sin empleo actual' },
            ]}
            error={getFieldError('situacionLaboral')}
            success={isFieldValid('situacionLaboral')}
            tooltip={datosEconomicosTooltips.situacionLaboral}
            required
          />

          <TextInput
            id="ingresoMensual"
            label="Ingreso Mensual Aproximado (S/)"
            type="number"
            value={(getFieldValue('ingresoMensual') as string) || ''}
            onChange={(v) => handleFieldChange('ingresoMensual', v)}
            onBlur={() => handleFieldBlur('ingresoMensual', step.fields.find((f) => f.id === 'ingresoMensual')?.validation)}
            placeholder="0.00"
            error={getFieldError('ingresoMensual')}
            success={isFieldValid('ingresoMensual')}
            tooltip={datosEconomicosTooltips.ingresoMensual}
            required
          />

          <TextArea
            id="comentarios"
            label="Comentarios Adicionales"
            value={(getFieldValue('comentarios') as string) || ''}
            onChange={(v) => handleFieldChange('comentarios', v)}
            onBlur={() => handleFieldBlur('comentarios')}
            placeholder="Cuéntanos más sobre tu situación..."
            helpText="Opcional: cualquier información que consideres relevante"
            error={getFieldError('comentarios')}
            success={isFieldValid('comentarios')}
            tooltip={datosEconomicosTooltips.comentarios}
            maxLength={500}
            rows={4}
          />
        </div>
      </WizardLayout>
    </>
  );

  // Clean mode: only content + feedback button
  if (isCleanMode) {
    return (
      <>
        {pageContent}
        <Footer isCleanMode={isCleanMode} />
        <FeedbackButton
          sectionId="wizard-solicitud-datos-economicos"
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

export default function DatosEconomicosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DatosEconomicosContent />
    </Suspense>
  );
}
