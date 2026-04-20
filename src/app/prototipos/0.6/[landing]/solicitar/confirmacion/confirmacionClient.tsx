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
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';
import { ConvenioFooter } from '@/app/prototipos/0.6/components/hero/convenio';
import { GamerNavbar } from '@/app/prototipos/0.6/components/zona-gamer/GamerNavbar';
import { GamerFooter } from '@/app/prototipos/0.6/components/zona-gamer/GamerFooter';
import { GamerNewsletter } from '@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { LANDING_IDS } from '@/app/prototipos/0.6/utils/landingIds';
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
    // v0.6.1: Variant/color info
    variant?: {
      id: number;
      color_name: string;
      color_hex: string;
    } | null;
    // v0.6.1: Per-product initial payment
    initial_payment_percent?: number;
    initial_payment?: number;
  }>;

  term_months?: number;

  // v0.6.1: Initial payment info for data coherence
  initial_payment_percent?: number;
  initial_payment?: number;

  accessories?: Array<{
    name: string;
    monthly_quota: number;
  }> | null;

  insurance?: {
    name: string;
    monthly_price: number;
  } | null;

  insurances?: Array<{
    name: string;
    monthly_price: number;
  }> | null;

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

  // Mapear productos desde API (v0.6.1: incluye variant info y initial payment)
  const products = applicationData?.products?.map((p) => ({
    name: p.name,
    brand: p.brand || undefined,
    image: p.image || '',
    quantity: p.quantity || 1,
    unitPrice: p.unit_price,
    finalPrice: p.final_price,
    monthlyQuota: p.monthly_quota,
    specs: p.specs || undefined,
    // v0.6.1: Map variant/color info
    variant: p.variant
      ? {
          id: p.variant.id,
          colorName: p.variant.color_name,
          colorHex: p.variant.color_hex,
        }
      : undefined,
    // v0.6.1: Per-product initial payment
    initialPaymentPercent: p.initial_payment_percent || 0,
    initialPayment: p.initial_payment || 0,
  })) || [];

  // Mapear accesorios desde API
  const accessories = applicationData?.accessories?.map((acc) => ({
    name: acc.name,
    monthlyQuota: acc.monthly_quota,
  }));

  // Mapear seguro(s) desde API — soporta array (insurances) y singular (insurance)
  const insurancesArray = applicationData?.insurances?.map((ins) => ({
    name: ins.name,
    monthlyPrice: ins.monthly_price,
  }));

  const insuranceSingle = applicationData?.insurance
    ? [{
        name: applicationData.insurance.name,
        monthlyPrice: applicationData.insurance.monthly_price,
      }]
    : undefined;

  const allInsurances = insurancesArray?.length ? insurancesArray : insuranceSingle;
  const insurance = allInsurances?.[0];

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
    // v0.6.1: Initial payment info
    initialPaymentPercent: applicationData?.initial_payment_percent || 0,
    initialPayment: applicationData?.initial_payment || 0,
    accessories,
    insurance,
    insurances: allInsurances,
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 lg:pt-14 pb-32 lg:pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-10"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 mb-2 font-['Baloo_2',_sans-serif] leading-tight">
          Solicitud Enviada
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 px-2">
          Selecciona un resultado para ver la pantalla correspondiente
        </p>
      </motion.div>

      {/* Result Options */}
      <div className="space-y-3 sm:space-y-4">
        {RESULT_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => onSelectResult(option.path)}
              className="w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-5
                         hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer
                         flex items-center gap-3 sm:gap-4 text-left"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${option.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${option.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-800 break-words">{option.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 break-words">{option.description}</p>
              </div>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 min-h-[36px] sm:min-h-[44px] flex items-center justify-center bg-neutral-200 text-neutral-700 hover:bg-[var(--color-primary)] hover:text-white rounded-lg font-medium text-xs sm:text-sm transition-colors flex-shrink-0">
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
        className="mt-6 sm:mt-8 p-3 sm:p-4 bg-neutral-100 rounded-xl"
      >
        <p className="text-xs sm:text-sm text-neutral-600 text-center">
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
  const { navbarProps, footerData, agreementData, landingId, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

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
    router.push(routes.landingHome(landing));
  };

  const isGamer = landingId === LANDING_IDS.ZONA_GAMER;

  // Zona Gamer: wrap antes de checks de layout para asegurar tema dark siempre
  if (isGamer) {
    if (isLoadingStatus) {
      return (
        <GamerConfirmacionWrapper>
          <GamerLoadingFallback />
        </GamerConfirmacionWrapper>
      );
    }
    return (
      <GamerConfirmacionWrapper>
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
      </GamerConfirmacionWrapper>
    );
  }

  // Show loading while layout data is loading
  if (isLayoutLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl={routes.home()} />;
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 relative">
        <Navbar {...navbarProps} landing={landing} />
        {/* Spacer — dynamic height driven by --header-total-height CSS variable. */}
        <div style={{ height: 'var(--header-total-height, 6.5rem)' }} />

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
      {agreementData ? <ConvenioFooter data={footerData} agreementData={agreementData} landing={landing} /> : <Footer data={footerData} landing={landing} />}
    </>
  );
}

function LoadingFallback() {
  const params = useParams();
  const isGamer = (params?.landing as string) === 'zona-gamer';

  if (isGamer) {
    return (
      <div className="gamer-loading-fallback">
        <CubeGridSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

function GamerLoadingFallback() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <CubeGridSpinner />
    </div>
  );
}

function GamerConfirmacionWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hydrated, setHydrated] = useState(false);
  const params = useParams();
  const landing = (params.landing as string) || 'zona-gamer';

  useEffect(() => {
    const saved = localStorage.getItem('baldecash-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
    setHydrated(true);
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('baldecash-theme', next);
  };
  const isDark = theme === 'dark';

  if (!hydrated) {
    return <div className="gamer-theme-bg" style={{ minHeight: '100vh' }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0e0e0e' : '#f5f5f5', color: isDark ? '#f0f0f0' : '#1a1a1a' }}>
      <style jsx global>{`
        /* Override CSS variables → neon cyan instead of landing purple */
        .gamer-confirmacion-dark {
          --color-primary: #00ffd5 !important;
          --color-primary-rgb: 0,255,213 !important;
          --color-secondary: #00ffd5 !important;
        }
        .gamer-confirmacion-light {
          --color-primary: #00897a !important;
          --color-primary-rgb: 0,179,150 !important;
          --color-secondary: #00897a !important;
        }
        .gamer-confirmacion-dark {
          background: #0e0e0e !important;
        }
        .gamer-confirmacion-dark .min-h-screen { background: #0e0e0e !important; }
        /* Override ReceivedScreen gradient */
        .gamer-confirmacion-dark .bg-gradient-to-b {
          background: #0e0e0e !important;
          background-image: none !important;
        }
        .gamer-confirmacion-dark .bg-white { background: #1a1a1a !important; }
        .gamer-confirmacion-dark .bg-neutral-50 { background: #0e0e0e !important; }
        .gamer-confirmacion-dark .bg-neutral-100 { background: #252525 !important; }
        .gamer-confirmacion-dark .bg-neutral-200 { background: #2a2a2a !important; }

        .gamer-confirmacion-dark .border-neutral-200,
        .gamer-confirmacion-dark .border-neutral-100,
        .gamer-confirmacion-dark .border-neutral-300 { border-color: #2a2a2a !important; }

        .gamer-confirmacion-dark .text-neutral-900,
        .gamer-confirmacion-dark .text-neutral-800 { color: #f0f0f0 !important; }
        .gamer-confirmacion-dark .text-neutral-700 { color: #d4d4d4 !important; }
        .gamer-confirmacion-dark .text-neutral-600 { color: #a0a0a0 !important; }
        .gamer-confirmacion-dark .text-neutral-500 { color: #707070 !important; }
        .gamer-confirmacion-dark .text-neutral-400 { color: #555 !important; }
        .gamer-confirmacion-dark .text-foreground { color: #f0f0f0 !important; }

        .gamer-confirmacion-dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important; }
        .gamer-confirmacion-dark .shadow-md { box-shadow: 0 4px 12px rgba(0,0,0,0.35) !important; }
        .gamer-confirmacion-dark .shadow-lg { box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important; }

        /* Primary color → neon cyan */
        .gamer-confirmacion-dark .bg-\\[var\\(--color-primary\\)\\] { background: #00ffd5 !important; color: #0a0a0a !important; }
        .gamer-confirmacion-dark .text-\\[var\\(--color-primary\\)\\] { color: #00ffd5 !important; }
        .gamer-confirmacion-dark .border-\\[var\\(--color-primary\\)\\] { border-color: #00ffd5 !important; }
        .gamer-confirmacion-dark .text-\\[var\\(--color-secondary\\)\\] { color: #00ffd5 !important; }
        .gamer-confirmacion-dark .bg-\\[var\\(--color-secondary\\)\\] { background: #00ffd5 !important; }
        .gamer-confirmacion-dark .border-\\[var\\(--color-secondary\\)\\] { border-color: #00ffd5 !important; }

        /* Success/green → neon cyan (dark) / teal (light) */
        .gamer-confirmacion-dark .bg-green-500,
        .gamer-confirmacion-dark .bg-green-600 { background: #00ffd5 !important; }
        .gamer-confirmacion-dark .text-green-500,
        .gamer-confirmacion-dark .text-green-600,
        .gamer-confirmacion-dark .text-green-700 { color: #00ffd5 !important; }
        .gamer-confirmacion-dark .bg-green-50,
        .gamer-confirmacion-dark .bg-green-100 { background: rgba(0,255,213,0.08) !important; }
        .gamer-confirmacion-dark .border-green-100,
        .gamer-confirmacion-dark .border-green-200 { border-color: rgba(0,255,213,0.2) !important; }

        .gamer-confirmacion-light .bg-green-500,
        .gamer-confirmacion-light .bg-green-600 { background: #00897a !important; }
        .gamer-confirmacion-light .text-green-500,
        .gamer-confirmacion-light .text-green-600,
        .gamer-confirmacion-light .text-green-700 { color: #00897a !important; }
        .gamer-confirmacion-light .bg-green-50,
        .gamer-confirmacion-light .bg-green-100 { background: rgba(0,179,150,0.1) !important; }
        .gamer-confirmacion-light .border-green-100,
        .gamer-confirmacion-light .border-green-200 { border-color: rgba(0,179,150,0.25) !important; }

        /* Amber (Clock badge on illustration) → neon cyan */
        .gamer-confirmacion-dark .bg-amber-500 { background: #00ffd5 !important; }
        .gamer-confirmacion-dark .bg-amber-100 { background: rgba(0,255,213,0.12) !important; }
        .gamer-confirmacion-dark .text-amber-600 { color: #00ffd5 !important; }

        .gamer-confirmacion-light .bg-amber-500 { background: #00897a !important; }
        .gamer-confirmacion-light .bg-amber-100 { background: rgba(0,179,150,0.12) !important; }
        .gamer-confirmacion-light .text-amber-600 { color: #00897a !important; }

        /* Red (XCircle option) → neon red for demo mode */
        .gamer-confirmacion-dark .bg-red-100,
        .gamer-confirmacion-light .bg-red-100 { background: rgba(255,0,85,0.12) !important; }
        .gamer-confirmacion-dark .text-red-600,
        .gamer-confirmacion-light .text-red-600 { color: #ff0055 !important; }

        /* WhatsApp button (hardcoded #25D366) → neon cyan from gamer palette */
        .gamer-confirmacion-dark [class*="bg-[#25D366]"] {
          background: #00ffd5 !important;
          color: #0a0a0a !important;
          border-color: #00ffd5 !important;
        }
        .gamer-confirmacion-dark [class*="bg-[#25D366]"]:hover {
          background: #00e6c0 !important;
          border-color: #00e6c0 !important;
        }
        .gamer-confirmacion-light [class*="bg-[#25D366]"] {
          background: #00897a !important;
          color: #ffffff !important;
          border-color: #00897a !important;
        }
        .gamer-confirmacion-light [class*="bg-[#25D366]"]:hover {
          background: #00997f !important;
          border-color: #00997f !important;
        }

        /* Card wrappers */
        .gamer-confirmacion-dark .bg-white.rounded-xl,
        .gamer-confirmacion-dark .bg-white.rounded-2xl { background: #1a1a1a !important; border-color: #2a2a2a !important; }

        /* Primary tinted backgrounds */
        .gamer-confirmacion-dark [class*="bg-[var(--color-primary)]/5"],
        .gamer-confirmacion-dark [class*="bg-[var(--color-primary)]/10"] {
          background: rgba(0,255,213,0.06) !important;
        }
        .gamer-confirmacion-dark [class*="border-[var(--color-primary)]/10"] {
          border-color: rgba(0,255,213,0.2) !important;
        }
        .gamer-confirmacion-dark [class*="bg-[var(--color-secondary)]/5"] {
          background: rgba(0,255,213,0.06) !important;
        }
        .gamer-confirmacion-dark [class*="border-[var(--color-secondary)]/10"] {
          border-color: rgba(0,255,213,0.2) !important;
        }
        .gamer-confirmacion-dark .bg-\\[rgba\\(var\\(--color-primary-rgb\\)\\,0\\.1\\)\\] {
          background: rgba(0,255,213,0.1) !important;
        }

        /* NextUI Card overrides */
        .gamer-confirmacion-dark [data-slot="base"].shadow-sm,
        .gamer-confirmacion-dark .shadow-sm.border.border-neutral-200 {
          background: #1a1a1a !important;
          border-color: #2a2a2a !important;
        }

        /* Scrollbar */
        .gamer-confirmacion-dark ::-webkit-scrollbar { width: 6px; }
        .gamer-confirmacion-dark ::-webkit-scrollbar-track { background: #0e0e0e; }
        .gamer-confirmacion-dark ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
      `}</style>
      <div className={isDark ? 'gamer-confirmacion-dark' : 'gamer-confirmacion-light'}>
        <GamerNavbar
          theme={theme}
          onToggleTheme={handleToggleTheme}
          catalogUrl={routes.catalogo(landing)}
          hideSecondaryBar
        />
        {children}
        <GamerNewsletter theme={theme} />
        <GamerFooter theme={theme} />
      </div>
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
