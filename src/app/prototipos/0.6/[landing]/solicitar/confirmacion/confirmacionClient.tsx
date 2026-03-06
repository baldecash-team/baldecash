'use client';

/**
 * Confirmacion - Página de confirmación de solicitud
 *
 * Comportamiento:
 * - Si hay ?code= en URL: Muestra confirmación real con diseño ReceivedScreen
 * - Si NO hay ?code=: Muestra vista de demostración con opciones de resultado
 */

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { getApplicationStatus } from '../../../services/applicationApi';
import { ReceivedScreen } from './components/received';
import type { ReceivedData } from './types/received';

// Types
interface ApplicationStatusData {
  code: string;
  status: string;
  submitted_at: string | null;
  evaluated_at?: string | null;
  approved_at?: string | null;
  applicant_name?: string | null;

  // Products array (multiple products support)
  products?: Array<{
    name: string;
    brand?: string | null;
    image: string | null;
    quantity: number;
    unit_price: number;
    final_price: number;
    monthly_quota: number;
    specs?: {
      processor?: string;
      ram?: string;
      storage?: string;
    } | null;
  }>;

  term_months?: number;

  accessories?: Array<{
    name: string;
    monthly_quota: number;
  }> | null;

  insurance?: {
    name: string;
    monthly_price: number;
  } | null;

  coupon?: {
    code: string;
    discount_amount: number;
  } | null;

  total_monthly_payment?: number;

  status_history: Array<{
    previous_status: string | null;
    new_status: string;
    reason_code: string | null;
    reason_text: string | null;
    changed_at: string | null;
  }>;
}

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
 * Build ReceivedData from API response (preferred) or URL params (fallback)
 */
function buildReceivedData(
  applicationCode: string,
  applicationData: ApplicationStatusData | null,
  searchParams: URLSearchParams
): ReceivedData {
  const termMonths = applicationData?.term_months || 12;
  const userName = applicationData?.applicant_name || searchParams.get('name') || 'Usuario';

  // Mapear productos desde API
  const products = applicationData?.products?.map((p) => ({
    name: p.name,
    brand: p.brand || undefined,
    image: p.image || '',
    quantity: p.quantity || 1,
    unitPrice: p.unit_price,
    finalPrice: p.final_price,
    monthlyQuota: p.monthly_quota,
    specs: p.specs || undefined,
  })) || [];

  // Mapear accesorios desde API
  const accessories = applicationData?.accessories?.map((acc) => ({
    name: acc.name,
    monthlyQuota: acc.monthly_quota,
  }));

  // Mapear seguro desde API
  const insurance = applicationData?.insurance
    ? {
        name: applicationData.insurance.name,
        monthlyPrice: applicationData.insurance.monthly_price,
      }
    : undefined;

  // Mapear cupón desde API
  const coupon = applicationData?.coupon
    ? {
        code: applicationData.coupon.code,
        discountAmount: applicationData.coupon.discount_amount,
      }
    : undefined;

  return {
    applicationId: applicationData?.code || applicationCode,
    userName,
    submittedAt: applicationData?.submitted_at
      ? new Date(applicationData.submitted_at)
      : new Date(),
    estimatedResponseHours: 24,
    products,
    termMonths,
    accessories,
    insurance,
    coupon,
    totalMonthlyQuota: applicationData?.total_monthly_payment || 0,
    notificationChannels: ['whatsapp', 'email'],
  };
}

/**
 * Real Confirmation View - Shown when ?code= is present
 */
function RealConfirmationContent({
  applicationCode,
  applicationData,
  isLoading,
  searchParams,
  onGoHome,
}: {
  applicationCode: string;
  applicationData: ApplicationStatusData | null;
  isLoading: boolean;
  searchParams: URLSearchParams;
  onGoHome: () => void;
}) {
  if (isLoading) {
    return <LoadingFallback />;
  }

  const receivedData = buildReceivedData(applicationCode, applicationData, searchParams);

  return <ReceivedScreen data={receivedData} onGoToHome={onGoHome} />;
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

  // Scroll to top on page load
  useScrollToTop();

  // Get layout data from context
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Fetch application status when code is present
  useEffect(() => {
    if (applicationCode) {
      setIsLoadingStatus(true);

      getApplicationStatus(applicationCode)
        .then((data) => {
          if (data) {
            setApplicationData(data);
          }
        })
        .catch(() => {
          // Silently fail - we'll show the page anyway with available data
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
        <div className="h-[68px]" />

        {applicationCode ? (
          <RealConfirmationContent
            applicationCode={applicationCode}
            applicationData={applicationData}
            isLoading={isLoadingStatus}
            searchParams={searchParams}
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
