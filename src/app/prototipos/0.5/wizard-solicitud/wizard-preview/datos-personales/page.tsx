'use client';

/**
 * Datos Personales - Step 1
 * Personal information form
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../../components/wizard-solicitud/wizard';
import { WizardStepId } from '../../types/wizard-solicitud';
import { TextInput, DateInput, SegmentedControl } from '../../components/wizard-solicitud/fields';
import { datosPersonalesTooltips } from '../../data/fieldTooltips';
import { StepSuccessMessage } from '../../components/wizard-solicitud/celebration/StepSuccessMessage';
import { useWizard } from '../../context/WizardContext';
import { getStepById } from '../../data/wizardSteps';
import { Code, ArrowLeft } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackButton, CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';
import { Footer } from '@/app/prototipos/0.5/hero/components/hero/Footer';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'datos-personales',
  version: '0.5',
};

function DatosPersonalesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';

  // Scroll to top on page load
  useScrollToTop();

  const [showCelebration, setShowCelebration] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const {
    getFieldValue,
    getFieldError,
    updateField,
    setFieldError,
    markStepCompleted,
  } = useWizard();

  const step = getStepById('datos-personales')!;

  // Inicializar touched para campos que ya tienen valor (desde localStorage)
  React.useEffect(() => {
    const fieldsToCheck = ['nombres', 'apellidos', 'tipoDocumento', 'numeroDocumento', 'sexo', 'fechaNacimiento', 'celular', 'email'];
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

  const handleFieldBlur = (fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
  };

  const isFieldValid = (fieldId: string) => {
    const value = getFieldValue(fieldId) as string;
    return touched[fieldId] && !!value && !getFieldError(fieldId);
  };

  // Validar número de documento según tipo
  const validateNumeroDocumento = (tipo: string, numero: string): string | null => {
    if (!numero || !numero.trim()) {
      return 'Este campo es requerido';
    }

    const cleaned = numero.trim();

    switch (tipo) {
      case 'dni':
        if (!/^\d+$/.test(cleaned)) {
          return 'El DNI solo debe contener números';
        }
        if (cleaned.length !== 8) {
          return 'El DNI debe tener exactamente 8 dígitos';
        }
        break;
      case 'ce':
        if (!/^\d+$/.test(cleaned)) {
          return 'El CE solo debe contener números';
        }
        if (cleaned.length !== 9) {
          return 'El Carnet de Extranjería debe tener 9 dígitos';
        }
        break;
      case 'pasaporte':
        if (!/^[a-zA-Z0-9]+$/.test(cleaned)) {
          return 'El pasaporte solo debe contener letras y números';
        }
        if (cleaned.length < 6 || cleaned.length > 12) {
          return 'El pasaporte debe tener entre 6 y 12 caracteres';
        }
        break;
      default:
        return 'Selecciona un tipo de documento primero';
    }

    return null;
  };

  // Validar campos requeridos
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

    const numeroDocumento = getFieldValue('numeroDocumento') as string;
    const docError = validateNumeroDocumento(tipoDocumento, numeroDocumento);
    if (docError) {
      setFieldError('numeroDocumento', docError);
      isValid = false;
    }

    const sexo = getFieldValue('sexo') as string;
    if (!sexo) {
      setFieldError('sexo', 'Selecciona una opción');
      isValid = false;
    }

    const fechaNacimiento = getFieldValue('fechaNacimiento') as string;
    if (!fechaNacimiento) {
      setFieldError('fechaNacimiento', 'Este campo es requerido');
      isValid = false;
    }

    const celular = getFieldValue('celular') as string;
    if (!celular || !celular.trim()) {
      setFieldError('celular', 'Este campo es requerido');
      isValid = false;
    } else if (!/^\d{9}$/.test(celular.trim())) {
      setFieldError('celular', 'El celular debe tener 9 dígitos');
      isValid = false;
    }

    const email = getFieldValue('email') as string;
    if (!email || !email.trim()) {
      setFieldError('email', 'Este campo es requerido');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError('email', 'Ingresa un correo electrónico válido');
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    setSubmitted(true);
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

  const handleStepClick = (stepId: WizardStepId) => {
    const baseUrl = `/prototipos/0.5/wizard-solicitud/wizard-preview/${stepId}`;
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
        onStepClick={handleStepClick}
        isFirstStep={false}
        canProceed={true}
        isCleanMode={isCleanMode}
      >
        <div className="space-y-6">
          <TextInput
            id="nombres"
            label="Nombres"
            value={(getFieldValue('nombres') as string) || ''}
            onChange={(v) => handleFieldChange('nombres', v)}
            onBlur={() => handleFieldBlur('nombres')}
            placeholder="Ej: Juan Carlos"
            error={submitted ? getFieldError('nombres') : undefined}
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
            error={submitted ? getFieldError('apellidos') : undefined}
            success={isFieldValid('apellidos')}
            tooltip={datosPersonalesTooltips.apellidos}
            required
          />

          <SegmentedControl
            id="tipoDocumento"
            label="Tipo de Documento"
            value={(getFieldValue('tipoDocumento') as string) || ''}
            onChange={(v) => {
              handleFieldChange('tipoDocumento', v);
              // Limpiar número de documento al cambiar tipo
              handleFieldChange('numeroDocumento', '');
            }}
            options={[
              { value: 'dni', label: 'DNI' },
              { value: 'ce', label: 'CE' },
              { value: 'pasaporte', label: 'Pasaporte' },
            ]}
            error={submitted ? getFieldError('tipoDocumento') : undefined}
            success={isFieldValid('tipoDocumento')}
            tooltip={datosPersonalesTooltips.tipoDocumento}
            required
          />

          <TextInput
            id="numeroDocumento"
            label="Número de Documento"
            value={(getFieldValue('numeroDocumento') as string) || ''}
            onChange={(v) => handleFieldChange('numeroDocumento', v)}
            onBlur={() => {
              handleFieldBlur('numeroDocumento');
              const tipoDoc = getFieldValue('tipoDocumento') as string;
              const numDoc = getFieldValue('numeroDocumento') as string;
              const error = validateNumeroDocumento(tipoDoc, numDoc);
              if (error) {
                setFieldError('numeroDocumento', error);
              }
            }}
            placeholder={
              (getFieldValue('tipoDocumento') as string) === 'dni' ? 'Ej: 12345678' :
              (getFieldValue('tipoDocumento') as string) === 'ce' ? 'Ej: 123456789' :
              (getFieldValue('tipoDocumento') as string) === 'pasaporte' ? 'Ej: AB123456' :
              'Selecciona tipo de documento'
            }
            error={submitted ? getFieldError('numeroDocumento') : undefined}
            success={isFieldValid('numeroDocumento')}
            tooltip={datosPersonalesTooltips.numeroDocumento}
            maxLength={12}
            required
          />

          <SegmentedControl
            id="sexo"
            label="Sexo"
            value={(getFieldValue('sexo') as string) || ''}
            onChange={(v) => handleFieldChange('sexo', v)}
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'femenino', label: 'Femenino' },
              { value: 'otro', label: 'Otro' },
            ]}
            error={submitted ? getFieldError('sexo') : undefined}
            success={isFieldValid('sexo')}
            required
          />

          <DateInput
            id="fechaNacimiento"
            label="Fecha de Nacimiento"
            value={(getFieldValue('fechaNacimiento') as string) || ''}
            onChange={(v) => handleFieldChange('fechaNacimiento', v)}
            onBlur={() => handleFieldBlur('fechaNacimiento')}
            error={submitted ? getFieldError('fechaNacimiento') : undefined}
            success={isFieldValid('fechaNacimiento')}
            tooltip={datosPersonalesTooltips.fechaNacimiento}
            required
          />

          <TextInput
            id="celular"
            label="Celular"
            type="tel"
            value={(getFieldValue('celular') as string) || ''}
            onChange={(v) => handleFieldChange('celular', v)}
            onBlur={() => handleFieldBlur('celular')}
            placeholder="Ej: 999 999 999"
            error={submitted ? getFieldError('celular') : undefined}
            success={isFieldValid('celular')}
            tooltip={datosPersonalesTooltips.celular}
            maxLength={9}
            required
          />

          <TextInput
            id="email"
            label="Correo Electrónico"
            type="email"
            value={(getFieldValue('email') as string) || ''}
            onChange={(v) => handleFieldChange('email', v)}
            onBlur={() => handleFieldBlur('email')}
            placeholder="Ej: juan@universidad.edu.pe"
            error={submitted ? getFieldError('email') : undefined}
            success={isFieldValid('email')}
            tooltip={datosPersonalesTooltips.email}
            required
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
          sectionId="wizard-solicitud-datos-personales"
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
      <CubeGridSpinner />
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
