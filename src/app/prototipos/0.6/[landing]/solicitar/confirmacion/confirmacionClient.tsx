'use client';

/**
 * Confirmacion - Página de confirmación de solicitud
 *
 * Comportamiento:
 * - Si hay ?code= en URL: Muestra confirmación real con código de solicitud
 * - Si NO hay ?code=: Muestra vista de demostración con opciones de resultado
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Copy, Check, Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { getApplicationStatus } from '../../../services/applicationApi';

// Types
interface ApplicationStatusData {
  code: string;
  status: string;
  submitted_at: string | null;
  evaluated_at: string | null;
  status_history: {
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }[];
}

// Status labels in Spanish
const STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  pending: 'Pendiente',
  in_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

// Demo options for testing
const RESULT_OPTIONS = [
  {
    id: 'aprobacion',
    title: 'Aprobación',
    description: 'Solicitud aprobada exitosamente',
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    path: '/prototipos/0.5/aprobacion/aprobado-preview',
  },
  {
    id: 'rechazo',
    title: 'Rechazo',
    description: 'Solicitud rechazada con alternativas',
    icon: XCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    path: '/prototipos/0.5/rechazo/rechazado-preview',
  },
  {
    id: 'recibido',
    title: 'Recibido',
    description: 'Solicitud en revisión (24-48h)',
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    path: '/prototipos/0.5/recibido/recibido-preview',
  },
];

/**
 * Real Confirmation View - Shown when ?code= is present
 */
function RealConfirmationContent({
  applicationCode,
  applicationData,
  isLoading,
  hasError,
  onGoHome,
}: {
  applicationCode: string;
  applicationData: ApplicationStatusData | null;
  isLoading: boolean;
  hasError: boolean;
  onGoHome: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(applicationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const statusLabel = applicationData?.status
    ? STATUS_LABELS[applicationData.status] || applicationData.status
    : 'Enviada';

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-32 lg:pb-16">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
          ¡Solicitud Enviada!
        </h1>
        <p className="text-neutral-600">
          Hemos recibido tu solicitud correctamente
        </p>
      </motion.div>

      {/* Application Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6 mb-6"
      >
        <p className="text-sm text-neutral-500 text-center mb-3">
          Tu código de solicitud es:
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl md:text-3xl font-mono font-bold text-neutral-800 tracking-wider">
            {applicationCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
            aria-label={copied ? 'Copiado' : 'Copiar código'}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-neutral-600" />
            )}
          </button>
        </div>

        {/* Status Badge */}
        {isLoading ? (
          <div className="mt-4 flex justify-center">
            <div className="animate-pulse bg-neutral-200 h-6 w-24 rounded-full" />
          </div>
        ) : hasError ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Código no encontrada</span>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Estado: {statusLabel}
            </span>
          </div>
        )}
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-neutral-50 rounded-xl p-6 mb-6"
      >
        <h3 className="font-semibold text-neutral-800 mb-3">Próximos pasos:</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            <span>Revisaremos tu solicitud en las próximas 24-48 horas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            <span>Te contactaremos por WhatsApp o correo electrónico</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            <span>Guarda tu código de solicitud para consultas</span>
          </li>
        </ul>
      </motion.div>

      {/* Go Home Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center"
      >
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          aria-label="Volver al inicio"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </button>
      </motion.div>
    </div>
  );
}

/**
 * Demo View - Shown when no ?code= in URL (for testing)
 */
function DemoContent({ onSelectResult }: { onSelectResult: (path: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-32 lg:pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
          Solicitud Enviada
        </h1>
        <p className="text-neutral-600">
          Selecciona un resultado para ver la pantalla correspondiente
        </p>
      </motion.div>

      {/* Result Options */}
      <div className="space-y-4">
        {RESULT_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => onSelectResult(option.path)}
              className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-5
                         hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer
                         flex items-center gap-4 text-left"
            >
              <div className={`w-14 h-14 ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${option.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-800">{option.title}</h3>
                <p className="text-sm text-neutral-500">{option.description}</p>
              </div>
              <div className="px-4 py-2 bg-neutral-200 text-neutral-700 hover:bg-[var(--color-primary)] hover:text-white rounded-lg font-medium text-sm transition-colors">
                Ver
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 p-4 bg-neutral-100 rounded-xl"
      >
        <p className="text-sm text-neutral-600 text-center">
          Esta página es solo para demostración. En producción, el sistema determinará automáticamente el resultado.
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Main Confirmation Content
 */
function ConfirmacionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'home';

  // Get application code from URL
  const applicationCode = searchParams.get('code');

  // State for API data
  const [applicationData, setApplicationData] = useState<ApplicationStatusData | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [hasStatusError, setHasStatusError] = useState(false);

  // Scroll to top on page load
  useScrollToTop();

  // Get layout data from context
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Fetch application status when code is present
  useEffect(() => {
    if (applicationCode) {
      setIsLoadingStatus(true);
      setHasStatusError(false);

      getApplicationStatus(applicationCode)
        .then((data) => {
          if (data) {
            setApplicationData(data);
          } else {
            setHasStatusError(true);
          }
        })
        .catch(() => {
          setHasStatusError(true);
        })
        .finally(() => {
          setIsLoadingStatus(false);
        });
    }
  }, [applicationCode]);

  // Navigation handlers
  const handleSelectResult = (path: string) => {
    router.push(path);
  };

  const handleGoHome = () => {
    router.push(`/prototipos/0.6/${landing}`);
  };

  // Show loading while layout data is loading
  if (isLayoutLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 relative">
        <Navbar {...navbarProps} />
        <div className="h-[104px]" />

        {applicationCode ? (
          <RealConfirmationContent
            applicationCode={applicationCode}
            applicationData={applicationData}
            isLoading={isLoadingStatus}
            hasError={hasStatusError}
            onGoHome={handleGoHome}
          />
        ) : (
          <DemoContent onSelectResult={handleSelectResult} />
        )}
      </div>
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

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmacionContent />
    </Suspense>
  );
}
