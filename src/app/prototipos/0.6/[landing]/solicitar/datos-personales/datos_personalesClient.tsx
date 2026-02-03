'use client';

/**
 * Datos Personales - Step 1
 * Personal information form
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../components/solicitar/wizard';
import { WizardStepId } from '../types/solicitar';
import { TextInput, DateInput, SegmentedControl } from '../components/solicitar/fields';
import { datosPersonalesTooltips } from '../data/fieldTooltips';
import { StepSuccessMessage } from '../components/solicitar/celebration/StepSuccessMessage';
import { useWizard } from '../context/WizardContext';
import { getStepById } from '../data/wizardSteps';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

function DatosPersonalesContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const [showCelebration, setShowCelebration] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

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

  // Validar campos requeridos - retorna el primer campo con error o null
  const validateStep = (): string | null => {
    let firstErrorField: string | null = null;

    const nombres = getFieldValue('nombres') as string;
    if (!nombres || !nombres.trim()) {
      setFieldError('nombres', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'nombres';
    }

    const apellidos = getFieldValue('apellidos') as string;
    if (!apellidos || !apellidos.trim()) {
      setFieldError('apellidos', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'apellidos';
    }

    const tipoDocumento = getFieldValue('tipoDocumento') as string;
    if (!tipoDocumento) {
      setFieldError('tipoDocumento', 'Selecciona un tipo de documento');
      if (!firstErrorField) firstErrorField = 'tipoDocumento';
    }

    const numeroDocumento = getFieldValue('numeroDocumento') as string;
    const docError = validateNumeroDocumento(tipoDocumento, numeroDocumento);
    if (docError) {
      setFieldError('numeroDocumento', docError);
      if (!firstErrorField) firstErrorField = 'numeroDocumento';
    }

    const sexo = getFieldValue('sexo') as string;
    if (!sexo) {
      setFieldError('sexo', 'Selecciona una opción');
      if (!firstErrorField) firstErrorField = 'sexo';
    }

    const fechaNacimiento = getFieldValue('fechaNacimiento') as string;
    if (!fechaNacimiento) {
      setFieldError('fechaNacimiento', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'fechaNacimiento';
    }

    const celular = getFieldValue('celular') as string;
    if (!celular || !celular.trim()) {
      setFieldError('celular', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'celular';
    } else if (!/^\d{9}$/.test(celular.trim())) {
      setFieldError('celular', 'El celular debe tener 9 dígitos');
      if (!firstErrorField) firstErrorField = 'celular';
    }

    const email = getFieldValue('email') as string;
    if (!email || !email.trim()) {
      setFieldError('email', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError('email', 'Ingresa un correo electrónico válido');
      if (!firstErrorField) firstErrorField = 'email';
    }

    return firstErrorField;
  };

  const handleNext = () => {
    setSubmitted(true);
    const firstErrorField = validateStep();
    if (firstErrorField) {
      // Scroll al primer campo con error
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    markStepCompleted('datos-personales');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    router.push(`/prototipos/0.6/${landing}/solicitar/datos-academicos`);
  };

  const handleBack = () => {
    router.push(`/prototipos/0.6/${landing}/solicitar`);
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepId}`);
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
        navbarProps={navbarProps}
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

  // Show loading while layout data is loading
  if (isLayoutLoading) {
    return <LoadingFallback />;
  }

  return (
    <>
      {pageContent}
      <Footer data={footerData} />
    </>
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
