'use client';

/**
 * Datos Personales - Step 1
 * Personal information form
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../../components/wizard-solicitud/wizard';
import { TextInput, RadioGroup } from '../../components/wizard-solicitud/fields';
import { datosPersonalesTooltips } from '../../data/fieldTooltips';
import { StepSuccessMessage } from '../../components/wizard-solicitud/celebration/StepSuccessMessage';
import { useWizard } from '../../context/WizardContext';
import { getStepById } from '../../data/wizardSteps';
import { Loader2, Code, ArrowLeft } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'datos-personales',
  version: '0.5',
};

function DatosPersonalesContent() {
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
    markStepCompleted,
  } = useWizard();

  const step = getStepById('datos-personales')!;

  const handleFieldChange = (fieldId: string, value: string) => {
    updateField(fieldId, value);
    setFieldError(fieldId, '');
  };

  const handleFieldBlur = (fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  };

  const isFieldValid = (fieldId: string) => {
    const value = getFieldValue(fieldId) as string;
    return touched[fieldId] && !!value && !getFieldError(fieldId);
  };

  // Solo validar nombres, apellidos y tipo de documento
  const validateStep = (): boolean => {
    let isValid = true;

    const nombres = getFieldValue('nombres') as string;
    if (!nombres || !nombres.trim()) {
      setFieldError('nombres', 'Este campo es requerido');
      isValid = false;
    }

    const apellidos = getFieldValue('apellidos') as string;
    if (!apellidos || !apellidos.trim()) {
      setFieldError('apellidos', 'Este campo es requerido');
      isValid = false;
    }

    const tipoDocumento = getFieldValue('tipoDocumento') as string;
    if (!tipoDocumento) {
      setFieldError('tipoDocumento', 'Selecciona un tipo de documento');
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      markStepCompleted('datos-personales');
      setShowCelebration(true);
    }
  };

  const handleCelebrationComplete = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/datos-academicos';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const handleBack = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          <StepSuccessMessage
            stepName="Datos Personales"
            stepNumber={1}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        currentStep="datos-personales"
        title={step.title}
        description={step.description}
        onBack={handleBack}
        onNext={handleNext}
        isFirstStep={false}
        canProceed={true}
      >
        <div className="space-y-6">
          <TextInput
            id="nombres"
            label="Nombres"
            value={(getFieldValue('nombres') as string) || ''}
            onChange={(v) => handleFieldChange('nombres', v)}
            onBlur={() => handleFieldBlur('nombres')}
            placeholder="Ej: Juan Carlos"
            error={getFieldError('nombres')}
            success={isFieldValid('nombres')}
            tooltip={datosPersonalesTooltips.nombres}
            required
          />

          <TextInput
            id="apellidos"
            label="Apellidos"
            value={(getFieldValue('apellidos') as string) || ''}
            onChange={(v) => handleFieldChange('apellidos', v)}
            onBlur={() => handleFieldBlur('apellidos')}
            placeholder="Ej: Pérez García"
            error={getFieldError('apellidos')}
            success={isFieldValid('apellidos')}
            tooltip={datosPersonalesTooltips.apellidos}
            required
          />

          <RadioGroup
            id="tipoDocumento"
            label="Tipo de Documento"
            value={(getFieldValue('tipoDocumento') as string) || ''}
            onChange={(v) => handleFieldChange('tipoDocumento', v)}
            options={[
              { value: 'dni', label: 'DNI' },
              { value: 'ce', label: 'Carnet de Extranjería' },
              { value: 'pasaporte', label: 'Pasaporte' },
            ]}
            error={getFieldError('tipoDocumento')}
            tooltip={datosPersonalesTooltips.tipoDocumento}
            required
          />

          <TextInput
            id="numeroDocumento"
            label="Número de Documento"
            value={(getFieldValue('numeroDocumento') as string) || ''}
            onChange={(v) => handleFieldChange('numeroDocumento', v)}
            onBlur={() => handleFieldBlur('numeroDocumento')}
            placeholder="Ej: 12345678"
            error={getFieldError('numeroDocumento')}
            success={isFieldValid('numeroDocumento')}
            tooltip={datosPersonalesTooltips.numeroDocumento}
            maxLength={12}
            required={false}
          />

          <TextInput
            id="fechaNacimiento"
            label="Fecha de Nacimiento"
            type="date"
            value={(getFieldValue('fechaNacimiento') as string) || ''}
            onChange={(v) => handleFieldChange('fechaNacimiento', v)}
            onBlur={() => handleFieldBlur('fechaNacimiento')}
            error={getFieldError('fechaNacimiento')}
            success={isFieldValid('fechaNacimiento')}
            tooltip={datosPersonalesTooltips.fechaNacimiento}
            required={false}
          />

          <TextInput
            id="celular"
            label="Celular"
            type="tel"
            value={(getFieldValue('celular') as string) || ''}
            onChange={(v) => handleFieldChange('celular', v)}
            onBlur={() => handleFieldBlur('celular')}
            placeholder="Ej: 999 999 999"
            error={getFieldError('celular')}
            success={isFieldValid('celular')}
            tooltip={datosPersonalesTooltips.celular}
            maxLength={9}
            required={false}
          />

          <TextInput
            id="email"
            label="Correo Electrónico"
            type="email"
            value={(getFieldValue('email') as string) || ''}
            onChange={(v) => handleFieldChange('email', v)}
            onBlur={() => handleFieldBlur('email')}
            placeholder="Ej: juan@universidad.edu.pe"
            error={getFieldError('email')}
            success={isFieldValid('email')}
            tooltip={datosPersonalesTooltips.email}
            required={false}
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
        <FeedbackButton
          sectionId="wizard-solicitud-datos-personales"
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

export default function DatosPersonalesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DatosPersonalesContent />
    </Suspense>
  );
}
