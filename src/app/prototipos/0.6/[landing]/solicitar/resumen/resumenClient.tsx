'use client';

/**
 * Resumen - Step 4
 * Summary and submission page
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WizardLayout } from '../components/solicitar/wizard';
import { WizardStepId } from '../types/solicitar';
import { useWizard } from '../context/WizardContext';
import { User, GraduationCap, Wallet, AlertCircle, Edit2, CreditCard } from 'lucide-react';
import { SelectInput } from '../components/solicitar/fields';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Opciones para selectores de preferencias de pago
const PAYMENT_DAY_OPTIONS = [
  { value: '3', label: 'Día 3 de cada mes' },
  { value: '10', label: 'Día 10 de cada mes' },
  { value: '18', label: 'Día 18 de cada mes' },
  { value: '25', label: 'Día 25 de cada mes' },
];

const REFERRAL_SOURCE_OPTIONS = [
  { value: '1', label: 'Grupo de Facebook de mi universidad/instituto' },
  { value: '2', label: 'Anuncio de Facebook' },
  { value: '3', label: 'Anuncio de Instagram' },
  { value: '4', label: 'Me refirió un amigo(a)' },
  { value: '5', label: 'Anuncio por correo electrónico' },
  { value: '7', label: 'Intranet de mi universidad/instituto' },
  { value: '8', label: 'Activación en campus' },
  { value: '12', label: 'Panel publicitario en vía pública' },
  { value: '13', label: 'Aviso por mensaje de texto' },
  { value: '14', label: 'Activación en sede' },
  { value: '15', label: 'Activación en un colegio o evento' },
  { value: '16', label: 'Anuncio en Tik Tok' },
  { value: '17', label: 'Aviso por Whatsapp' },
  { value: '18', label: 'Llamada telefónica' },
  { value: '6', label: 'Otros' },
];

function ResumenContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const { getFieldValue } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState('');
  const [paymentTermError, setPaymentTermError] = useState<string | null>(null);
  const [referralSource, setReferralSource] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading } = useLayout();

  // Cargar valores desde localStorage al montar
  useEffect(() => {
    try {
      const savedPaymentTerm = localStorage.getItem('wizard_paymentTerm');
      const savedReferralSource = localStorage.getItem('wizard_referralSource');
      if (savedPaymentTerm !== null) {
        setPaymentTerm(savedPaymentTerm);
      }
      if (savedReferralSource !== null) {
        setReferralSource(savedReferralSource);
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Guardar paymentTerm en localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('wizard_paymentTerm', paymentTerm);
    } catch {}
  }, [paymentTerm, isHydrated]);

  // Guardar referralSource en localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('wizard_referralSource', referralSource);
    } catch {}
  }, [referralSource, isHydrated]);

  const handleBack = () => {
    router.push(`/prototipos/0.6/${landing}/solicitar/datos-economicos`);
  };

  const handleSubmit = async () => {
    // Validar campo requerido
    if (!paymentTerm) {
      setPaymentTermError('Selecciona un día de pago');
      document.getElementById('paymentDay')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPaymentTermError(null);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/prototipos/0.6/${landing}/solicitar/seguros`);
  };

  const navigateToStep = (stepPath: string) => {
    router.push(`/prototipos/0.6/${landing}/solicitar/${stepPath}`);
  };

  const handleStepClick = (stepId: WizardStepId) => {
    navigateToStep(stepId);
  };

  const getDocumentoLabel = (value: string) => {
    const labels: Record<string, string> = {
      dni: 'DNI',
      ce: 'CE',
      pasaporte: 'Pasaporte',
    };
    return labels[value] || value;
  };

  const getSexoLabel = (value: string) => {
    const labels: Record<string, string> = {
      masculino: 'Masculino',
      femenino: 'Femenino',
      otro: 'Otro',
    };
    return labels[value] || value;
  };

  const formatFechaNacimiento = (value: string) => {
    if (!value) return '-';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  };

  const getTipoInstitucionLabel = (value: string) => {
    const labels: Record<string, string> = {
      universidad: 'Universidad',
      instituto: 'Instituto',
      colegio: 'Colegio',
    };
    return labels[value] || value;
  };

  const getSituacionLaboralLabel = (value: string) => {
    const labels: Record<string, string> = {
      empleado: 'Empleado',
      independiente: 'Independiente',
      practicante: 'Practicante',
      desempleado: 'Sin empleo actual',
    };
    return labels[value] || value;
  };

  const getCicloLabel = (value: string) => {
    if (value === 'egresado') return 'Egresado';
    const cicloLabels: Record<string, string> = {
      '1': '1er Ciclo',
      '2': '2do Ciclo',
      '3': '3er Ciclo',
      '4': '4to Ciclo',
      '5': '5to Ciclo',
      '6': '6to Ciclo',
      '7': '7mo Ciclo',
      '8': '8vo Ciclo',
      '9': '9no Ciclo',
      '10': '10mo Ciclo',
    };
    return cicloLabels[value] || value;
  };

  const getInstitucionLabel = (value: string) => {
    const labels: Record<string, string> = {
      unmsm: 'Universidad Nacional Mayor de San Marcos',
      pucp: 'Pontificia Universidad Católica del Perú',
      uni: 'Universidad Nacional de Ingeniería',
      ulima: 'Universidad de Lima',
      up: 'Universidad del Pacífico',
      upc: 'Universidad Peruana de Ciencias Aplicadas',
      usil: 'Universidad San Ignacio de Loyola',
      esan: 'Universidad ESAN',
      ucv: 'Universidad César Vallejo',
      utp: 'Universidad Tecnológica del Perú',
      unsa: 'Universidad Nacional de San Agustín',
      unprg: 'Universidad Nacional Pedro Ruiz Gallo',
      unt: 'Universidad Nacional de Trujillo',
      ucsm: 'Universidad Católica de Santa María',
      upao: 'Universidad Privada Antenor Orrego',
      senati: 'SENATI',
      tecsup: 'TECSUP',
      cibertec: 'CIBERTEC',
      idat: 'IDAT',
      sise: 'SISE',
      isil: 'ISIL',
      toulouse: 'Toulouse Lautrec',
      ipae: 'IPAE',
      certus: 'Certus',
      markham: 'Colegio Markham',
      newton: 'Colegio Newton',
      santamaria: 'Colegio Santa María Marianistas',
      sanjose: 'Colegio San José de Monterrico',
      trilce: 'Colegio Trilce',
      pamer: 'Colegio Pamer',
      saco_oliveros: 'Colegio Saco Oliveros',
      innova: 'Innova Schools',
      fe_alegria: 'Fe y Alegría',
    };
    return labels[value] || value;
  };

  const getCarreraLabel = (value: string) => {
    const labels: Record<string, string> = {
      ing_sistemas: 'Ingeniería de Sistemas',
      ing_software: 'Ingeniería de Software',
      ing_industrial: 'Ingeniería Industrial',
      ing_civil: 'Ingeniería Civil',
      ing_electronica: 'Ingeniería Electrónica',
      ing_mecatronica: 'Ingeniería Mecatrónica',
      administracion: 'Administración de Empresas',
      contabilidad: 'Contabilidad',
      economia: 'Economía',
      derecho: 'Derecho',
      medicina: 'Medicina Humana',
      psicologia: 'Psicología',
      arquitectura: 'Arquitectura',
      comunicaciones: 'Ciencias de la Comunicación',
      marketing: 'Marketing',
      diseno_grafico: 'Diseño Gráfico',
    };
    return labels[value] || value;
  };

  const SummarySection = ({
    icon: Icon,
    title,
    onEdit,
    children,
  }: {
    icon: React.ElementType;
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-neutral-50 rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#4654CD]" />
          <h3 className="font-semibold text-neutral-800">{title}</h3>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-[#4654CD] hover:text-[#3a47b3] transition-colors cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Editar</span>
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-neutral-500 flex-shrink-0">{label}</span>
      <span className="text-neutral-800 font-medium text-right break-words min-w-0">{value || '-'}</span>
    </div>
  );

  const isDataComplete = true;

  const pageContent = (
    <WizardLayout
      currentStep="resumen"
      title="Resumen"
      description="Revisa tu información antes de enviar"
      onBack={handleBack}
      onSubmit={handleSubmit}
      onStepClick={handleStepClick}
      isLastStep
      isSubmitting={isSubmitting}
      canProceed={true}
      navbarProps={navbarProps}
    >
      {!isDataComplete ? (
        <div className="flex flex-col items-center py-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          <p className="text-neutral-600 text-center mb-4">
            Parece que no has completado todos los pasos anteriores.
          </p>
          <button
            onClick={() => navigateToStep('datos-personales')}
            className="text-[#4654CD] font-medium hover:underline"
          >
            Comenzar desde el inicio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <SummarySection
            icon={User}
            title="Datos Personales"
            onEdit={() => navigateToStep('datos-personales')}
          >
            <SummaryItem
              label="Nombre completo"
              value={`${getFieldValue('nombres')} ${getFieldValue('apellidos')}`}
            />
            <SummaryItem
              label="Documento"
              value={`${getDocumentoLabel(getFieldValue('tipoDocumento') as string)} ${getFieldValue('numeroDocumento')}`}
            />
            {getFieldValue('sexo') && (
              <SummaryItem
                label="Sexo"
                value={getSexoLabel(getFieldValue('sexo') as string)}
              />
            )}
            <SummaryItem
              label="Fecha de nacimiento"
              value={formatFechaNacimiento(getFieldValue('fechaNacimiento') as string)}
            />
            <SummaryItem label="Celular" value={getFieldValue('celular') as string} />
            <SummaryItem label="Email" value={getFieldValue('email') as string} />
          </SummarySection>

          <SummarySection
            icon={GraduationCap}
            title="Datos Académicos"
            onEdit={() => navigateToStep('datos-academicos')}
          >
            <SummaryItem
              label="Institución"
              value={
                (getFieldValue('institucion') === 'otra' || getFieldValue('institucion') === 'otro') && getFieldValue('otraInstitucion')
                  ? `${getFieldValue('otraInstitucion')} (${getTipoInstitucionLabel(getFieldValue('tipoInstitucion') as string)})`
                  : `${getInstitucionLabel(getFieldValue('institucion') as string)} (${getTipoInstitucionLabel(getFieldValue('tipoInstitucion') as string)})`
              }
            />
            <SummaryItem
              label="Carrera"
              value={
                getFieldValue('carrera') === 'otra' && getFieldValue('otraCarrera')
                  ? getFieldValue('otraCarrera') as string
                  : getCarreraLabel(getFieldValue('carrera') as string)
              }
            />
            <SummaryItem
              label="Ciclo"
              value={
                getFieldValue('ciclo') === 'otro' && getFieldValue('otroCiclo')
                  ? `${getFieldValue('otroCiclo')}° Ciclo`
                  : getCicloLabel(getFieldValue('ciclo') as string)
              }
            />
            <SummaryItem
              label="Constancia"
              value={
                Array.isArray(getFieldValue('constanciaEstudios')) &&
                (getFieldValue('constanciaEstudios') as unknown[]).length > 0
                  ? 'Archivo adjunto'
                  : 'No adjunto'
              }
            />
          </SummarySection>

          <SummarySection
            icon={Wallet}
            title="Datos Económicos"
            onEdit={() => navigateToStep('datos-economicos')}
          >
            <SummaryItem
              label="Situación laboral"
              value={getSituacionLaboralLabel(getFieldValue('situacionLaboral') as string)}
            />
            <SummaryItem
              label="Ingreso mensual"
              value={`S/ ${getFieldValue('ingresoMensual') || '0'}`}
            />
            {getFieldValue('comentarios') && (
              <div className="pt-2 border-t border-neutral-200 mt-2">
                <p className="text-xs text-neutral-500 mb-1">Comentarios:</p>
                <p className="text-sm text-neutral-700 break-words">{getFieldValue('comentarios') as string}</p>
              </div>
            )}
          </SummarySection>

          <div className="bg-neutral-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#4654CD]" />
              <h3 className="font-semibold text-neutral-800">Información adicional</h3>
            </div>
            <div className="space-y-4">
              <SelectInput
                id="paymentDay"
                label="¿Qué día del mes prefieres pagar?"
                value={paymentTerm}
                onChange={(value) => {
                  setPaymentTerm(value);
                  if (value) setPaymentTermError(null);
                }}
                options={PAYMENT_DAY_OPTIONS}
                placeholder="Selecciona un día"
                error={paymentTermError || undefined}
                success={!!paymentTerm && !paymentTermError}
                required={true}
                tooltip={{
                  title: '¿Por qué elegir un día?',
                  description: 'Selecciona el día del mes que te resulte más cómodo para realizar tus pagos mensuales.',
                  recommendation: 'Te recomendamos elegir una fecha cercana a cuando recibes tus ingresos.',
                }}
              />
              <SelectInput
                id="referralSource"
                label="¿Cómo te enteraste de nosotros?"
                value={referralSource}
                onChange={setReferralSource}
                options={REFERRAL_SOURCE_OPTIONS}
                placeholder="Selecciona una opción"
                success={!!referralSource}
                required={false}
                tooltip={{
                  title: '¿Para qué sirve esto?',
                  description: 'Esta información nos ayuda a mejorar nuestros canales de comunicación para llegar a más estudiantes.',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </WizardLayout>
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

export default function ResumenPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResumenContent />
    </Suspense>
  );
}
