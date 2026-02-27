'use client';

/**
 * Wizard Preview - Intro Page
 * Landing page before starting the wizard flow
 */

import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Clock, Shield, ArrowRight, ArrowLeft, Check, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useProduct } from './context/ProductContext';
import { CubeGridSpinner, useScrollToTop } from '@/app/prototipos/_shared';
import { NotFoundContent } from '@/app/prototipos/0.6/components/NotFoundContent';

// Hero components (Navbar & Footer)
import { Navbar } from '@/app/prototipos/0.6/components/hero/Navbar';
import { Footer } from '@/app/prototipos/0.6/components/hero/Footer';

// Layout context for shared data
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';

// Upsell components
import { AccessoryIntro, AccessoryCard, AccessoryDetailModal } from './components/upsell';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';
import type { Accessory, AccessoryCategory } from './types/upsell';

// Coupon component
import { CouponInput } from './components/solicitar/coupon';

function WizardPreviewContent() {
  const router = useRouter();
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // Scroll to top on page load
  useScrollToTop();

  const { selectedProduct, setSelectedProduct, cartProducts, selectedAccessories, toggleAccessory, isHydrated, isOverQuotaLimit, maxMonthlyQuota, getTotalMonthlyPayment } = useProduct();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPromos, setAcceptPromos] = useState(true);
  const [detailAccessory, setDetailAccessory] = useState<Accessory | null>(null);
  const [isTermsHydrated, setIsTermsHydrated] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Accesorios desde API (con fallback a mock data)
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [isLoadingAccessories, setIsLoadingAccessories] = useState(true);

  // Get layout data from context (fetched once at [landing] level)
  const { navbarProps, footerData, isLoading: isLayoutLoading, hasError: hasLayoutError } = useLayout();

  // Cargar valores desde localStorage al montar
  useEffect(() => {
    try {
      const savedAcceptTerms = localStorage.getItem('wizard_acceptTerms');
      const savedAcceptPromos = localStorage.getItem('wizard_acceptPromos');
      if (savedAcceptTerms !== null) setAcceptTerms(savedAcceptTerms === 'true');
      if (savedAcceptPromos !== null) setAcceptPromos(savedAcceptPromos === 'true');
    } catch {}
    setIsTermsHydrated(true);
  }, []);

  // Guardar acceptTerms en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem('wizard_acceptTerms', String(acceptTerms));
    } catch {}
  }, [acceptTerms, isTermsHydrated]);

  // Guardar acceptPromos en localStorage
  useEffect(() => {
    if (!isTermsHydrated) return;
    try {
      localStorage.setItem('wizard_acceptPromos', String(acceptPromos));
    } catch {}
  }, [acceptPromos, isTermsHydrated]);

  // Redirect to catalog if no product was selected
  useEffect(() => {
    // Wait for hydration from localStorage before deciding
    if (!isHydrated) return;

    // If no product was selected, redirect to catalog
    if (!selectedProduct) {
      router.replace(`/prototipos/0.6/${landing}/catalogo`);
    }
  }, [isHydrated, selectedProduct, router, landing]);

  // Cargar accesorios desde API (sin fallback a mock data)
  useEffect(() => {
    async function fetchAccessories() {
      setIsLoadingAccessories(true);
      try {
        const apiAccessories = await getLandingAccessories(landing);
        if (apiAccessories && apiAccessories.length > 0) {
          // Transformar datos de API al formato del frontend
          const transformedAccessories: Accessory[] = apiAccessories.map((acc) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || '',
            price: acc.price,
            monthlyQuota: acc.monthlyQuota,
            image: acc.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
            category: (acc.category || 'protección') as AccessoryCategory,
            isRecommended: acc.isRecommended || false,
            compatibleWith: acc.compatibleWith || ['all'],
            specs: acc.specs || [],
          }));
          setAccessories(transformedAccessories);
        } else {
          // Sin accesorios disponibles
          setAccessories([]);
        }
      } catch (error) {
        console.error('Error loading accessories:', error);
        setAccessories([]);
      } finally {
        setIsLoadingAccessories(false);
      }
    }

    fetchAccessories();
  }, [landing]);

  const handleStart = () => {
    // Validar términos antes de continuar
    if (!acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones para continuar');
      // Scroll al checkbox de términos
      document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setTermsError(null);
    router.push(`/prototipos/0.6/${landing}/solicitar/datos-personales`);
  };

  // Checkbox component
  const Checkbox = ({
    id,
    checked,
    onChange,
    label,
    description,
    error,
  }: {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
    error?: string | null;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex items-start gap-3 w-full text-left cursor-pointer"
      >
        <div
          className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5
            transition-all duration-200
            ${checked
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
              : error
                ? 'bg-white border-red-500 ring-2 ring-red-500/20'
                : 'bg-white border-neutral-300 hover:border-[rgba(var(--color-primary-rgb),0.5)]'
            }
          `}
        >
          {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-neutral-800'}`}>{label}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-2 ml-9">{error}</p>
      )}
    </div>
  );

  // Content JSX (no es componente para evitar remount en cada render)
  const pageContent = (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Navbar del Hero */}
      <Navbar
        landing={landing}
        promoBannerData={navbarProps?.promoBannerData}
        logoUrl={navbarProps?.logoUrl}
        customerPortalUrl={navbarProps?.customerPortalUrl}
        navbarItems={navbarProps?.navbarItems}
        megamenuItems={navbarProps?.megamenuItems}
        activeSections={['convenios', 'como-funciona', 'faq', 'testimonios']}
      />

      {/* Spacer for fixed navbar + promo banner */}
      <div className="h-[104px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-14 pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[rgba(var(--color-primary-rgb),0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">
            Solicitud de Financiamiento
          </h1>
          <p className="text-neutral-600 text-lg">
            Completa el formulario para solicitar tu equipo tecnológico
          </p>
        </div>

        {/* Products Card - Shows all cart products or single selected product */}
        {(() => {
          const productsToShow = cartProducts.length > 0 ? cartProducts : (selectedProduct ? [selectedProduct] : []);
          if (productsToShow.length === 0) return null;

          const totalMonthly = productsToShow.reduce((sum, p) => sum + p.monthlyPayment, 0);

          return (
            <div className="bg-white rounded-xl border border-neutral-200 mb-8 overflow-hidden">
              {/* Header */}
              {productsToShow.length > 1 && (
                <div className="px-5 py-3 bg-[rgba(var(--color-primary-rgb),0.05)] border-b border-neutral-200 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-sm font-semibold text-neutral-800">
                    {productsToShow.length} productos seleccionados
                  </span>
                </div>
              )}

              {/* Product List */}
              <div className="p-5 space-y-4">
                {productsToShow.map((product, index) => (
                  <div key={`${product.id}-${index}`} className={`flex items-start gap-4 ${index > 0 ? 'pt-4 border-t border-neutral-100' : ''}`}>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <h3 className="text-sm font-bold text-neutral-800 line-clamp-2 mt-0.5">
                        {product.name}
                      </h3>
                      {product.specs && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {product.specs.processor && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.processor}
                            </span>
                          )}
                          {product.specs.ram && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.ram}
                            </span>
                          )}
                          {product.specs.storage && (
                            <span className="text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                              {product.specs.storage}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-base font-bold text-[var(--color-primary)] mt-1.5">
                        S/{product.monthlyPayment}/mes
                        <span className="text-xs text-neutral-500 font-normal ml-1">
                          x {product.months} meses
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + Accessories + Quota Warning */}
              {(productsToShow.length >= 1) && (
                <div className="px-5 pb-5 space-y-3">
                  {/* Accessories */}
                  {selectedAccessories.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                        Accesorios seleccionados
                      </p>
                      <div className="space-y-1.5">
                        {selectedAccessories.map((acc) => (
                          <div key={acc.id} className="flex items-center justify-between text-sm">
                            <span className="text-neutral-700">{acc.name}</span>
                            <span className="text-[var(--color-primary)] font-medium">+S/{acc.monthlyQuota}/mes</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-neutral-800">Cuota total</span>
                    <span className={`text-lg font-bold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                      S/{totalMonthly + selectedAccessories.reduce((s, a) => s + a.monthlyQuota, 0)}/mes
                    </span>
                  </div>

                  {/* Quota limit warning */}
                  {isOverQuotaLimit && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Cuota mensual excedida</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          La cuota mensual supera el límite de S/{maxMonthlyQuota}/mes.
                          Quita algún producto o accesorio para continuar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <Clock className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">1-2 minutos</p>
            <p className="text-xs text-neutral-500">Tiempo estimado</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <FileText className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">4 pasos</p>
            <p className="text-xs text-neutral-500">Proceso simple</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-center">
            <Shield className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-800">100% Seguro</p>
            <p className="text-xs text-neutral-500">Datos protegidos</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">
            Lo que necesitarás
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Documento de identidad</p>
                <p className="text-xs text-neutral-500">DNI, CE o Pasaporte vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Constancia de estudios</p>
                <p className="text-xs text-neutral-500">Documento que acredite tu matrícula vigente</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[var(--color-primary)]">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">Información de contacto</p>
                <p className="text-xs text-neutral-500">Teléfono y correo electrónico activos</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Accessories Upsell Section */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8">
          <AccessoryIntro />
          {isLoadingAccessories ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[rgba(var(--color-primary-rgb),0.2)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : accessories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessories.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
                  accessory={accessory}
                  isSelected={selectedAccessories.some((a) => a.id === accessory.id)}
                  onToggle={() => toggleAccessory(accessory)}
                  onViewDetails={() => setDetailAccessory(accessory)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-4">No hay accesorios disponibles</p>
          )}
        </div>

        {/* Accessory Detail Modal */}
        <AccessoryDetailModal
          accessory={detailAccessory}
          isOpen={!!detailAccessory}
          onClose={() => setDetailAccessory(null)}
          isSelected={detailAccessory ? selectedAccessories.some((a) => a.id === detailAccessory.id) : false}
          onToggle={() => {
            if (detailAccessory) {
              toggleAccessory(detailAccessory);
            }
          }}
        />

        {/* Términos y Condiciones */}
        <div id="terms-section" className={`bg-white rounded-xl p-6 border mb-8 transition-colors ${termsError ? 'border-red-300 bg-red-50/30' : 'border-neutral-200'}`}>
          <h3 className="font-semibold text-neutral-800 mb-4">Términos y Condiciones</h3>
          <div className="space-y-4">
            <Checkbox
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(checked) => {
                setAcceptTerms(checked);
                if (checked) setTermsError(null); // Limpiar error al marcar
              }}
              label="Acepto los términos y condiciones"
              description="He leído y acepto los términos de uso y la política de privacidad"
              error={termsError}
            />
            <Checkbox
              id="acceptPromos"
              checked={acceptPromos}
              onChange={setAcceptPromos}
              label="Quiero recibir promociones"
              description="Acepto recibir ofertas y novedades por correo electrónico"
            />
          </div>
        </div>

        {/* Cupón de Descuento */}
        <div className="mb-8">
          <CouponInput />
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={isOverQuotaLimit}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-semibold text-lg transition-colors shadow-lg
                     ${isOverQuotaLimit
                       ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                       : 'bg-[var(--color-primary)] text-white hover:brightness-90 shadow-[rgba(var(--color-primary-rgb),0.25)] cursor-pointer'
                     }`}
        >
          <span>Comenzar Solicitud</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Back to catalog link */}
        <button
          onClick={() => router.push(`/prototipos/0.6/${landing}/catalogo`)}
          className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al catálogo</span>
        </button>
      </div>
    </div>
  );

  // Show loading while checking hydration, layout loading, or if no product selected (redirect will happen)
  if (!isHydrated || !selectedProduct || isLayoutLoading) {
    return <LoadingFallback />;
  }

  // Show 404 if landing not found (paused, archived, or doesn't exist)
  if (hasLayoutError || !navbarProps) {
    return <NotFoundContent homeUrl="/prototipos/0.6/home" />;
  }

  return (
    <div className="relative">
      {pageContent}
      <Footer data={footerData} />
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

export default function WizardPreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WizardPreviewContent />
    </Suspense>
  );
}
