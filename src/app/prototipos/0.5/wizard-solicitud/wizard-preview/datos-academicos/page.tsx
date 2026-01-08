'use client';

/**
 * Datos Académicos - Step 2
 * Academic information form
 */

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { WizardLayout } from '../../components/wizard-solicitud/wizard';
import { RadioGroup, SelectInput, FileUpload } from '../../components/wizard-solicitud/fields';
import { datosAcademicosTooltips } from '../../data/fieldTooltips';
import { StepSuccessMessage } from '../../components/wizard-solicitud/celebration/StepSuccessMessage';
import { useWizard } from '../../context/WizardContext';
import { getStepById } from '../../data/wizardSteps';
import { Loader2, Code, ArrowLeft } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { FeedbackButton } from '@/app/prototipos/_shared';
import { TokenCounter } from '@/components/ui/TokenCounter';

const WIZARD_CONFIG = {
  section: 'wizard-solicitud',
  step: 'datos-academicos',
  version: '0.5',
};

function DatosAcademicosContent() {
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

  const step = getStepById('datos-academicos')!;

  const handleFieldChange = (fieldId: string, value: string | unknown[]) => {
    updateField(fieldId, value as string);
    setFieldError(fieldId, '');
    // Mark as touched when value changes (for selects)
    if (value) {
      setTouched((prev) => ({ ...prev, [fieldId]: true }));
    }
  };

  const isFieldValid = (fieldId: string) => {
    const value = getFieldValue(fieldId);
    const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
    return touched[fieldId] && hasValue && !getFieldError(fieldId);
  };

  const handleNext = () => {
    markStepCompleted('datos-academicos');
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/datos-economicos';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const handleBack = () => {
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/datos-personales';
    const url = isCleanMode ? `${baseUrl}?mode=clean` : baseUrl;
    router.push(url);
  };

  const cicloOptions = [
    { value: '1', label: '1er Ciclo' },
    { value: '2', label: '2do Ciclo' },
    { value: '3', label: '3er Ciclo' },
    { value: '4', label: '4to Ciclo' },
    { value: '5', label: '5to Ciclo' },
    { value: '6', label: '6to Ciclo' },
    { value: '7', label: '7mo Ciclo' },
    { value: '8', label: '8vo Ciclo' },
    { value: '9', label: '9no Ciclo' },
    { value: '10', label: '10mo Ciclo' },
    { value: 'egresado', label: 'Egresado' },
  ];

  // Opciones de universidades peruanas
  const universidadOptions = [
    { value: 'unmsm', label: 'Universidad Nacional Mayor de San Marcos' },
    { value: 'pucp', label: 'Pontificia Universidad Católica del Perú' },
    { value: 'uni', label: 'Universidad Nacional de Ingeniería' },
    { value: 'ulima', label: 'Universidad de Lima' },
    { value: 'up', label: 'Universidad del Pacífico' },
    { value: 'upc', label: 'Universidad Peruana de Ciencias Aplicadas' },
    { value: 'usil', label: 'Universidad San Ignacio de Loyola' },
    { value: 'esan', label: 'Universidad ESAN' },
    { value: 'ucv', label: 'Universidad César Vallejo' },
    { value: 'utp', label: 'Universidad Tecnológica del Perú' },
    { value: 'unsa', label: 'Universidad Nacional de San Agustín' },
    { value: 'unprg', label: 'Universidad Nacional Pedro Ruiz Gallo' },
    { value: 'unt', label: 'Universidad Nacional de Trujillo' },
    { value: 'ucsm', label: 'Universidad Católica de Santa María' },
    { value: 'upao', label: 'Universidad Privada Antenor Orrego' },
    { value: 'otra', label: 'Otra institución' },
  ];

  // Opciones de institutos
  const institutoOptions = [
    { value: 'senati', label: 'SENATI' },
    { value: 'tecsup', label: 'TECSUP' },
    { value: 'cibertec', label: 'CIBERTEC' },
    { value: 'idat', label: 'IDAT' },
    { value: 'sise', label: 'SISE' },
    { value: 'isil', label: 'ISIL' },
    { value: 'toulouse', label: 'Toulouse Lautrec' },
    { value: 'ipae', label: 'IPAE' },
    { value: 'certus', label: 'Certus' },
    { value: 'otro', label: 'Otro instituto' },
  ];

  // Opciones de carreras
  const carreraOptions = [
    { value: 'ing_sistemas', label: 'Ingeniería de Sistemas' },
    { value: 'ing_software', label: 'Ingeniería de Software' },
    { value: 'ing_industrial', label: 'Ingeniería Industrial' },
    { value: 'ing_civil', label: 'Ingeniería Civil' },
    { value: 'ing_electronica', label: 'Ingeniería Electrónica' },
    { value: 'ing_mecatronica', label: 'Ingeniería Mecatrónica' },
    { value: 'administracion', label: 'Administración de Empresas' },
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'economia', label: 'Economía' },
    { value: 'derecho', label: 'Derecho' },
    { value: 'medicina', label: 'Medicina Humana' },
    { value: 'psicologia', label: 'Psicología' },
    { value: 'arquitectura', label: 'Arquitectura' },
    { value: 'comunicaciones', label: 'Ciencias de la Comunicación' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'diseno_grafico', label: 'Diseño Gráfico' },
    { value: 'otra', label: 'Otra carrera' },
  ];

  // Seleccionar opciones de institución según el tipo
  const tipoInstitucion = getFieldValue('tipoInstitucion') as string;
  const institucionOptions = tipoInstitucion === 'instituto' ? institutoOptions : universidadOptions;

  const pageContent = (
    <>
      <AnimatePresence>
        {showCelebration && (
          <StepSuccessMessage
            stepName="Datos Académicos"
            stepNumber={2}
            onComplete={handleCelebrationComplete}
          />
        )}
      </AnimatePresence>

      <WizardLayout
        currentStep="datos-academicos"
        title={step.title}
        description={step.description}
        onBack={handleBack}
        onNext={handleNext}
        canProceed={true}
      >
        <div className="space-y-6">
          <RadioGroup
            id="tipoInstitucion"
            label="Tipo de Institución"
            value={(getFieldValue('tipoInstitucion') as string) || ''}
            onChange={(v) => {
              handleFieldChange('tipoInstitucion', v);
              // Limpiar institución al cambiar tipo
              handleFieldChange('institucion', '');
            }}
            options={[
              { value: 'universidad', label: 'Universidad' },
              { value: 'instituto', label: 'Instituto' },
              { value: 'colegio', label: 'Colegio' },
            ]}
            error={getFieldError('tipoInstitucion')}
            tooltip={datosAcademicosTooltips.tipoInstitucion}
            required={false}
          />

          <SelectInput
            id="institucion"
            label="Institución Educativa"
            value={(getFieldValue('institucion') as string) || ''}
            onChange={(v) => handleFieldChange('institucion', v)}
            options={institucionOptions}
            placeholder="Busca tu institución..."
            error={getFieldError('institucion')}
            success={isFieldValid('institucion')}
            tooltip={datosAcademicosTooltips.institucion}
            required={false}
            searchable
          />

          <SelectInput
            id="carrera"
            label="Carrera o Especialidad"
            value={(getFieldValue('carrera') as string) || ''}
            onChange={(v) => handleFieldChange('carrera', v)}
            options={carreraOptions}
            placeholder="Busca tu carrera..."
            error={getFieldError('carrera')}
            success={isFieldValid('carrera')}
            tooltip={datosAcademicosTooltips.carrera}
            required={false}
            searchable
          />

          <SelectInput
            id="ciclo"
            label="Ciclo Actual"
            value={(getFieldValue('ciclo') as string) || ''}
            onChange={(v) => handleFieldChange('ciclo', v)}
            options={cicloOptions}
            placeholder="Selecciona tu ciclo"
            error={getFieldError('ciclo')}
            success={isFieldValid('ciclo')}
            tooltip={datosAcademicosTooltips.ciclo}
            required={false}
          />

          <FileUpload
            id="constanciaEstudios"
            label="Constancia de Estudios"
            value={(getFieldValue('constanciaEstudios') as unknown[]) as never || []}
            onChange={(files) => handleFieldChange('constanciaEstudios', files as unknown[])}
            accept=".pdf,.jpg,.jpeg,.png"
            maxFiles={1}
            helpText="Sube tu constancia de estudios (PDF o imagen)"
            error={getFieldError('constanciaEstudios')}
            tooltip={datosAcademicosTooltips.constanciaEstudios}
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
          sectionId="wizard-solicitud-datos-academicos"
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

export default function DatosAcademicosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DatosAcademicosContent />
    </Suspense>
  );
}
