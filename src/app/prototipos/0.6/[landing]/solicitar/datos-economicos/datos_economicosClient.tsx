'use client';

/**
 * Datos Económicos - Step 3
 * Financial information form
 */

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../components/solicitar/wizard';
import { WizardStepId } from '../types/solicitar';
import { TextInput, RadioGroup, TextArea } from '../components/solicitar/fields';
import { datosEconomicosTooltips } from '../data/fieldTooltips';
import { StepSuccessMessage } from '../components/solicitar/celebration/StepSuccessMessage';
import { useWizard } from '../context/WizardContext';
import { getStepById } from '../data/wizardSteps';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

function DatosEconomicosContent() {
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

  // Validar campos requeridos - retorna el primer campo con error o null
  const validateStep = (): string | null => {
    let firstErrorField: string | null = null;

    const situacionLaboral = getFieldValue('situacionLaboral') as string;
    if (!situacionLaboral) {
      setFieldError('situacionLaboral', 'Selecciona tu situación laboral');
      if (!firstErrorField) firstErrorField = 'situacionLaboral';
    }

    const ingresoMensual = getFieldValue('ingresoMensual') as string;
    if (!ingresoMensual || !ingresoMensual.trim()) {
      setFieldError('ingresoMensual', 'Este campo es requerido');
      if (!firstErrorField) firstErrorField = 'ingresoMensual';
    } else if (isNaN(Number(ingresoMensual)) || Number(ingresoMensual) < 0) {
      setFieldError('ingresoMensual', 'Ingresa un monto válido');
      if (!firstErrorField) firstErrorField = 'ingresoMensual';
    }

    // comentarios es opcional, no validar

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
    markStepCompleted('datos-economicos');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    router.push(`/prototipos/0.6/${landing}/solicitar/resumen`);
  };

  const handleBack = () => {
    router.push(`/prototipos/0.6/${landing}/solicitar/datos-academicos`);
  };

  const handleStepClick = (stepId: WizardStepId) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepId}`);
  };

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
        onStepClick={handleStepClick}
        canProceed={canProceed}
        navbarProps={navbarProps}
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
            error={submitted ? getFieldError('situacionLaboral') : undefined}
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
            error={submitted ? getFieldError('ingresoMensual') : undefined}
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
            error={submitted ? getFieldError('comentarios') : undefined}
            success={isFieldValid('comentarios')}
            tooltip={datosEconomicosTooltips.comentarios}
            maxLength={500}
            rows={4}
            required={false}
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

export default function DatosEconomicosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DatosEconomicosContent />
    </Suspense>
  );
}
