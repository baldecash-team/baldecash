'use client';

/**
 * SelectedProductBar - Mobile-first sticky bar showing selected product
 *
 * Mobile: Bottom fixed bar, collapsible with tap
 * Tablet: Bottom bar with more info visible
 * Desktop: Top bar below stepper
 */

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Package, Plus, Tag, AlertTriangle, ShoppingCart, Shield } from 'lucide-react';
import { useProduct } from '../../../context/ProductContext';
import { useLayout } from '@/app/prototipos/0.6/[landing]/context/LayoutContext';
import { formatCuotaDeLanding } from '@/app/prototipos/0.6/utils/formatCuota';
import { LANDING_IDS } from '@/app/prototipos/0.6/utils/landingIds';
import { TermSelect, getTermUnit } from './TermSelect';
import { useSolicitudCongelada } from '../../../hooks/useSolicitudCongelada';
import { etiquetasDePlazo, ordenarTerms } from './etiquetaDePlazo';
import Image from 'next/image';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';

/**
 * Lo que mide la barra plegada con la imagen del producto puesta (48px de
 * miniatura + 24px de padding). Es el valor que antes estaba hardcodeado en
 * `SelectedProductBar` y en `MobileStickyCta`; ahora solo se usa de respaldo.
 */
const ALTO_POR_DEFECTO = 72;

interface SelectedProductBarProps {
  mobileOnly?: boolean;
  /** Hide insurance and accessories cards in desktop view (e.g., on complementos page where they're shown separately) */
  hideAddons?: boolean;
  /**
   * Las condiciones de la operación no se pueden mover: se esconden el
   * selector de plazo y el de inicial.
   *
   * Es para el flujo con contrato: el documento se emite con ESTE plazo y ESTA
   * inicial y el hash lo sella, así que cambiarlos dejaría la pantalla diciendo
   * una cuota y el contrato otra. Lo decide quien monta el wizard, que es quien
   * conoce la config del flujo; la barra no la consulta —se monta en todas las
   * pantallas y no va a arrastrar un fetch para pintar un selector—.
   */
  condicionesFijas?: boolean;
  /**
   * Desplaza la barra fija hacia arriba, para dejar lugar a algo pegado al
   * borde inferior. Valor CSS; lo normal es la variable que publica quien está
   * abajo, con fallback a 0: `'var(--sticky-cta-height, 0px)'`.
   * @default '0px'
   */
  offsetInferior?: string;
}

export const SelectedProductBar: React.FC<SelectedProductBarProps> = ({ mobileOnly = false, hideAddons = false, condicionesFijas = false, offsetInferior = '0px' }) => {
  const { selectedAccessories, selectedInsurances, getTotalMonthlyPayment, appliedCoupon, isProductBarExpanded, setIsProductBarExpanded, getAllProducts, isOverQuotaLimit, maxMonthlyQuota, updateProductInitial, getInitialOptionsForProduct, getAvailableTerms, updateAllProductsToTerm } = useProduct();
  const { landingId, puedeCambiarPlazo, mostrarImagenProducto } = useLayout();
  const params = useParams();
  const landingSlug = (params?.landing as string) || '';
  const analytics = useAnalytics();
  /**
   * O bien la landing tiene el módulo del contrato (y entonces nunca se
   * eligieron acá), o bien la solicitud ya se creó y el contrato salió con
   * estos números. En los dos casos, no se tocan.
   */
  const yaEnviada = useSolicitudCongelada(landingSlug);
  const congelada = condicionesFijas || yaEnviada;

  // Wrappers que disparan analytics antes de mutar el state global
  const handleTermChange = (term: number) => {
    const primary = getAllProducts()[0];
    const from = primary?.term ?? primary?.months ?? 0;
    if (primary && from !== term) {
      analytics.trackPricingTermChange({
        product_id: primary.id,
        from,
        to: term,
        context: 'solicitar',
        frequency: primary.paymentFrequency,
      });
    }
    updateAllProductsToTerm(term);
  };

  const handleInitialChange = (productId: string, fromPercent: number, toPercent: number) => {
    if (fromPercent !== toPercent) {
      analytics.trackPricingInitialChange({
        product_id: productId,
        from: fromPercent,
        to: toPercent,
        context: 'solicitar',
      });
    }
    updateProductInitial(productId, toPercent);
  };

  // TODO: Quitar cuando zona-gamer tenga su propia config en el backend
  const isGamer = landingId === LANDING_IDS.ZONA_GAMER;

  // Usar el estado del contexto para la expansión
  const isExpanded = isProductBarExpanded;
  const setIsExpanded = setIsProductBarExpanded;
  const [isAccessoriesExpanded, setIsAccessoriesExpanded] = useState(true);
  const [isInsuranceExpanded, setIsInsuranceExpanded] = useState(true);

  // Get all products (cart or single)
  const allProducts = getAllProducts();

  /**
   * EL CONTRATO DE LOS DOS ALTOS MEDIDOS (referencia única; el resto del código
   * apunta acá).
   *
   * Hay tres elementos `fixed` peleando por el borde inferior en móvil: esta
   * barra, el CTA (`MobileStickyCta`) y el teclado virtual. Antes cada uno
   * suponía el alto del otro con un literal hardcodeado —`72px` para la barra,
   * `68px` para el CTA, duplicados en dos archivos—, y eran suposiciones: la
   * barra mide 72px SOLO con la imagen del producto puesta (48px de miniatura +
   * 24px de padding); con `mostrarImagenProducto` apagado mide menos y lo
   * apilado encima quedaba con un hueco. Así que cada uno publica su alto real
   * y el otro lo lee. Mismo patrón que `--referral-banner-offset` en
   * `ReferralBanner`.
   *
   * | Variable               | La publica        | La lee                            | Fallback |
   * |------------------------|-------------------|-----------------------------------|----------|
   * | `--product-bar-height` | esta barra        | el `bottom` de `MobileStickyCta`  | `72px`   |
   * |                        |                   | `SelectedProductSpacer`           | `72px`   |
   * | `--sticky-cta-height`  | `MobileStickyCta` | el `offsetInferior` de esta barra | `0px`    |
   * |                        |                   | `MobileStickyCtaSpacer`           | `68px`   |
   *
   * QUÉ SE MIDE: el botón plegado, no el panel que lo envuelve. El panel se
   * pone el safe-area de padding cuando toca el borde, y los lectores le SUMAN
   * ese mismo inset, así que medir el panel lo contaría dos veces.
   *
   * QUÉ PASA CUANDO FALTAN: el valor cae al fallback, que es el literal viejo.
   * Y faltan a propósito: cada elemento borra su variable al desmontarse. El
   * caso que importa es el CTA, que se desmonta con el teclado, con el drawer y
   * con la celebración — ahí `--sticky-cta-height` desaparece, el
   * `var(--sticky-cta-height, 0px)` de `offsetInferior` cae a `0px` y la barra
   * vuelve al borde en vez de quedarse flotando sobre un hueco. Por eso ese
   * lector —y solo ese— usa `0px` de fallback en vez del alto por defecto: no
   * quiere el alto del CTA, quiere «no hay CTA».
   *
   * NUNCA SE PUBLICA `0`: en escritorio los nodos son `lg:hidden` y miden 0, y
   * un `0px` publicado le ganaría al fallback para cualquier lector que no sea
   * `lg:hidden`. Por eso el `|| ALTO_POR_DEFECTO`, igual que
   * `ReferralBanner.tsx:118`.
   *
   * El efecto va ANTES del early return de «sin productos»: los hooks no pueden
   * quedar detrás de un return condicional. Por eso contempla que el nodo no
   * exista, y por eso depende de si hay productos: cuando aparecen, el nodo
   * recién existe y hay que medirlo.
   */
  const barraRef = useRef<HTMLButtonElement>(null);
  const hayProductos = allProducts.length > 0;
  useEffect(() => {
    const raiz = document.documentElement;
    const nodo = barraRef.current;
    if (!nodo) {
      raiz.style.removeProperty('--product-bar-height');
      return;
    }
    const medir = () =>
      raiz.style.setProperty('--product-bar-height', `${nodo.offsetHeight || ALTO_POR_DEFECTO}px`);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(nodo);
    return () => {
      ro.disconnect();
      raiz.style.removeProperty('--product-bar-height');
    };
  }, [hayProductos]);

  if (allProducts.length === 0) return null;

  // For display purposes, use first product as main product
  const mainProduct = allProducts[0];

  // El resumen tiene que decir lo mismo que la tarjeta y que el contrato: en
  // Family Farms las cuotas tienen centavos reales (S/15,20 la cuota y S/71,75
  // la armada), y truncarlos acá prometía S/15 sobre un contrato de S/15,20.
  // El resto del catálogo sigue truncando, que es lo que hacía siempre.
  const formatPrice = (price: number) => `S/${formatCuotaDeLanding(price, landingSlug)}`;

  const freqSuffix = (freq?: string) =>
    freq === 'semanal' ? '/sem' : freq === 'quincenal' ? '/qcn' : '/mes';

  const totalMonthlyPayment = getTotalMonthlyPayment();
  const hasAccessories = selectedAccessories.length > 0;
  const hasInsurance = selectedInsurances.length > 0;
  const hasCoupon = !!appliedCoupon;
  const availableTerms = getAvailableTerms();

  // Con la inicial fraccionada el `term` son las cuotas, no el plazo que la
  // persona vive: el rotulo lo traduce a «17 semanas · 4 armadas» y ordena por
  // plazo total. Sin armadas el mapa viene vacio y el selector no cambia.
  const planesDelPrincipal = mainProduct?.paymentPlans ?? [];
  const termLabels = etiquetasDePlazo(planesDelPrincipal, mainProduct?.paymentFrequency);
  const termOptions = ordenarTerms(planesDelPrincipal, availableTerms);

  // Calculate total initial payment from all products
  const totalInitialPayment = allProducts.reduce((sum, p) => sum + (p.initialAmount || 0), 0);
  const hasInitialPayment = totalInitialPayment > 0;

  /**
   * La barra toca de verdad el borde inferior de la pantalla.
   *
   * O porque nadie la levantó (`offsetInferior` en su default), o porque el
   * drawer está abierto: ahí el offset se anula y el panel crece desde el borde.
   *
   * Importa por el safe-area: el inset del home indicator le corresponde a lo
   * que está último, no a cualquiera. En `renueva-*` debajo de la barra está el
   * CTA, que ya se pone el inset de padding propio; si la barra se lo pusiera
   * también, pintaría un rectángulo blanco vacío de ~34px entre su botón y el
   * CTA. Ver el contrato de los altos medidos, más arriba.
   */
  const pegadaAlBorde = isExpanded || offsetInferior === '0px';

  return (
    <>
      {/* Mobile & Tablet: Bottom Fixed Bar */}
      {/* `bottom-0` se conserva aunque el `bottom` lo fije el estilo inline:
          el CSS de las landings gamer engancha la barra por `.fixed.bottom-0`
          (`StepClient.tsx:1232`, `complementosClient.tsx:560-587`, `:638`) para
          pintarla en modo oscuro/claro. Sin la clase, esas landings perderían su
          tema. El inline gana por especificidad, así que la posición es la del
          `offsetInferior` igual. */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
        // Con el drawer abierto el offset se anula: el panel crece desde el borde y
        // lo que estaba pegado abajo (el CTA) ya se desmontó solo.
        style={{ bottom: isExpanded ? '0px' : offsetInferior }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="bg-white border-t border-neutral-200 shadow-lg relative z-50"
          style={{ paddingBottom: pegadaAlBorde ? 'env(safe-area-inset-bottom)' : '0px' }}
        >
          {/* Collapsed State */}
          {/* El ref mide ESTE botón y no el panel que lo envuelve, que lleva el
              safe-area de padding. Ver el contrato de los altos medidos, arriba. */}
          <button
            ref={barraRef}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            {/* Product Thumbnail */}
            {mostrarImagenProducto && (
            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {allProducts.length > 1 ? (
                <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary)]/10">
                  <ShoppingCart className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
              ) : mainProduct.image ? (
                <Image
                  src={mainProduct.image}
                  alt={mainProduct.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-neutral-400" />
              )}
            </div>
            )}

            {/* Product Info */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {allProducts.length > 1 ? `${allProducts.length} productos` : mainProduct.shortName}
                {(hasAccessories || hasInsurance) && (
                  <span className="text-xs text-neutral-500 ml-1">
                    {hasAccessories && `+${selectedAccessories.length} acc.`}
                    {hasAccessories && hasInsurance && ' '}
                    {hasInsurance && `+${selectedInsurances.length} seguro${selectedInsurances.length > 1 ? 's' : ''}`}
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">
                {(() => {
                  const displayTerm = mainProduct.term ?? mainProduct.months;
                  return `${displayTerm} ${getTermUnit(displayTerm, mainProduct.paymentFrequency)}`;
                })()}
              </p>
            </div>

            {/* Price & Expand Icon */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <span className={`text-sm font-semibold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                  {formatPrice(totalMonthlyPayment)}/mes
                </span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t border-neutral-100 max-h-[60vh] overflow-y-auto">
                  {/* Products List */}
                  <div className="space-y-3">
                    {allProducts.map((product, index) => (
                      <div key={`${product.id}-${index}`} className={`flex gap-4 ${index > 0 ? 'pt-3 border-t border-neutral-100' : ''}`}>
                        {mostrarImagenProducto && (
                        <div className="w-20 h-20 bg-neutral-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="object-contain"
                            />
                          ) : (
                            <Package className="w-10 h-10 text-neutral-300" />
                          )}
                        </div>
                        )}

                        {/* Full Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-500 uppercase tracking-wide">
                            {product.brand}
                          </p>
                          <p className="text-sm font-semibold text-neutral-800 mt-0.5">
                            {product.name}
                          </p>

                          {product.specs && (
                            <div className="mt-1 space-y-0.5">
                              {product.specs.processor && (
                                <p className="text-xs text-neutral-500">
                                  {product.specs.processor}
                                </p>
                              )}
                              {product.specs.ram && product.specs.storage && (
                                <p className="text-xs text-neutral-500">
                                  {product.specs.ram} • {product.specs.storage}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Initial Payment Selector - Mobile */}
                          {(() => {
                            const initialOptions = getInitialOptionsForProduct(product.id);
                            if (initialOptions.length === 0 || congelada) return null;
                            return (
                              <div className="mt-2">
                                <p className="text-[10px] text-neutral-400 mb-1">Inicial:</p>
                                <div className="flex flex-wrap gap-1">
                                  {initialOptions.map((option) => (
                                    <button
                                      key={option.percent}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInitialChange(product.id, product.initialPercent, option.percent);
                                      }}
                                      className={`text-[10px] px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                                        product.initialPercent === option.percent
                                          ? 'bg-[var(--color-primary)] text-white font-medium'
                                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          <p className="text-sm font-bold text-[var(--color-primary)] mt-1">
                            {formatPrice(product.monthlyPayment)}{freqSuffix(product.paymentFrequency)}
                          </p>
                          {product.initialAmount > 0 && (
                            <p className="text-xs text-neutral-400">
                              + {formatPrice(product.initialAmount)} inicial
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accessories List */}
                  {hasAccessories && (
                    <div className="mt-3 space-y-1">
                      {selectedAccessories.map((acc) => (
                        <div key={acc.id} className="flex items-center gap-2 text-xs text-neutral-600">
                          <Plus className="w-3 h-3 text-[var(--color-primary)]" />
                          <span className="flex-1 truncate">{acc.name}</span>
                          <span className="text-[var(--color-primary)] font-medium">+{formatPrice(acc.monthlyQuota)}{freqSuffix(mainProduct.paymentFrequency)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insurance Selected */}
                  {hasInsurance && (
                    <div className="mt-3 space-y-1.5">
                      {selectedInsurances.map((ins) => (
                        <div key={ins.id} className="flex items-center gap-2 text-xs text-neutral-600 bg-[var(--color-secondary)]/10 px-3 py-2 rounded-lg">
                          <Shield className="w-3 h-3 text-[var(--color-secondary)]" />
                          <span className="flex-1 truncate">{ins.name}</span>
                          <span className="text-[var(--color-secondary)] font-medium">+{formatPrice(ins.monthlyPrice)}/mes</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coupon Applied Badge */}
                  {hasCoupon && appliedCoupon && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Tag className="w-3 h-3" />
                      <span className="font-medium">{appliedCoupon.code}</span>
                      <span className="text-green-500">{appliedCoupon.label}</span>
                    </div>
                  )}

                  {/* Quota limit warning */}
                  {isOverQuotaLimit && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        La cuota mensual supera el límite de S/{maxMonthlyQuota}/mes.
                      </p>
                    </div>
                  )}

                  {/* Monthly Payment Summary */}
                  <div className={`mt-4 p-3 rounded-lg ${isOverQuotaLimit ? 'bg-red-50' : 'bg-[var(--color-primary)]/5'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-700">Cuota mensual total</span>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                          {formatPrice(totalMonthlyPayment)}/mes
                        </span>
                      </div>
                    </div>
                    {/* Term Selector - Mobile */}
                    {puedeCambiarPlazo && !congelada && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-500">Plazo:</span>
                      <TermSelect
                        value={mainProduct.term ?? mainProduct.months}
                        options={termOptions}
                        onChange={handleTermChange}
                        size="sm"
                        frequency={mainProduct.paymentFrequency}
                        labels={termLabels}
                      />
                    </div>
                    )}
                    {hasInitialPayment && !isGamer && (
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-neutral-100">
                        <span className="text-xs text-neutral-500">Inicial total</span>
                        <span className="text-sm font-medium text-neutral-600">
                          {formatPrice(totalInitialPayment)}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop: Top Bar - Hidden when mobileOnly is true */}
      {!mobileOnly && (
      <div className="hidden lg:block mb-6 space-y-3">
        {/* Quota limit warning - Desktop */}
        {isOverQuotaLimit && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
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

        {/* Products Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          {/* Header with term selector */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-semibold text-neutral-800">
                {allProducts.length > 1 ? `${allProducts.length} productos seleccionados` : 'Producto seleccionado'}
              </span>
            </div>
            {/* Term Selector - Desktop */}
            {puedeCambiarPlazo && !congelada && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Plazo:</span>
              <TermSelect
                value={mainProduct.term ?? mainProduct.months}
                options={termOptions}
                onChange={handleTermChange}
                frequency={mainProduct.paymentFrequency}
                labels={termLabels}
              />
            </div>
            )}
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {allProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className={`flex items-center gap-4 ${index > 0 ? 'pt-4 border-t border-neutral-100' : ''}`}>
                {/* Product Image */}
                {mostrarImagenProducto && (
                <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-neutral-300" />
                  )}
                </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">
                    {product.brand}
                  </p>
                  <p className="text-base font-semibold text-neutral-800">
                    {product.name}
                  </p>
                  {product.specs && (
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {[
                        product.specs.processor,
                        product.specs.ram,
                        product.specs.storage
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {/* Initial Payment Selector - Desktop */}
                  {(() => {
                    const initialOptions = getInitialOptionsForProduct(product.id);
                    if (initialOptions.length === 0 || congelada) return null;
                    return (
                      <div className="mt-2">
                        <p className="text-[11px] text-neutral-400 mb-1">Inicial:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {initialOptions.map((option) => (
                            <button
                              key={option.percent}
                              onClick={() => handleInitialChange(product.id, product.initialPercent, option.percent)}
                              className={`text-[11px] px-2 py-1 rounded-full transition-all cursor-pointer ${
                                product.initialPercent === option.percent
                                  ? 'bg-[var(--color-primary)] text-white font-medium'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Pricing - Monthly + Initial */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-[var(--color-primary)]">
                    {formatPrice(product.monthlyPayment)}{freqSuffix(product.paymentFrequency)}
                  </p>
                  {(() => {
                    const displayTerm = product.term ?? product.months;
                    return (
                      <p className="text-sm text-neutral-500">
                        {displayTerm} {getTermUnit(displayTerm, product.paymentFrequency)}
                      </p>
                    );
                  })()}
                  {product.initialAmount > 0 && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      + {formatPrice(product.initialAmount)} inicial
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Initial payment total - only show if applicable (hidden for zona-gamer) */}
          {hasInitialPayment && !isGamer && (
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Inicial total</span>
                <span className="text-sm font-medium text-neutral-600">
                  {formatPrice(totalInitialPayment)}
                </span>
              </div>
            </div>
          )}

          {/* Coupon Badge - Desktop */}
          {hasCoupon && appliedCoupon && (
            <div className="mt-3 flex items-center px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Tag className="w-4 h-4" />
                <span className="font-medium">{appliedCoupon.code}</span>
                <span className="text-green-600">{appliedCoupon.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Insurance Card with Accordion - Desktop - Only visible when insurance is selected */}
        {hasInsurance && !hideAddons && (
          <div className="bg-[var(--color-secondary)]/5 rounded-xl border border-[var(--color-secondary)]/10 overflow-hidden">
            <button
              onClick={() => setIsInsuranceExpanded(!isInsuranceExpanded)}
              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--color-secondary)]/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--color-secondary)]" />
                <p className="text-sm font-semibold text-neutral-800">
                  {selectedInsurances.length === 1 ? 'Seguro' : `Seguros (${selectedInsurances.length})`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isInsuranceExpanded && (
                  <span className="text-sm font-medium text-[var(--color-secondary)]">
                    +{formatPrice(selectedInsurances.reduce((sum, ins) => sum + ins.monthlyPrice, 0))}/mes
                  </span>
                )}
                {isInsuranceExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isInsuranceExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-4 border-t border-[var(--color-secondary)]/10">
                    <div className="space-y-2">
                      {selectedInsurances.map((ins) => (
                        <div key={ins.id} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700 truncate">{ins.name}</span>
                          <span className="text-[var(--color-secondary)] font-medium flex-shrink-0 ml-4">
                            +{formatPrice(ins.monthlyPrice)}/mes
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-secondary)]/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-700">Total seguros</span>
                        <span className="text-sm font-bold text-[var(--color-secondary)]">
                          +{formatPrice(selectedInsurances.reduce((sum, ins) => sum + ins.monthlyPrice, 0))}/mes
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Accessories Card with Accordion - Desktop - Only visible when accessories are selected */}
        {hasAccessories && !hideAddons && (
          <div className="bg-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/10 overflow-hidden">
            <button
              onClick={() => setIsAccessoriesExpanded(!isAccessoriesExpanded)}
              className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--color-primary)]" />
                <p className="text-sm font-semibold text-neutral-800">
                  Accesorios ({selectedAccessories.length})
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isAccessoriesExpanded && (
                  <span className="text-sm font-medium text-[var(--color-primary)]">
                    +{formatPrice(selectedAccessories.reduce((sum, acc) => sum + acc.monthlyQuota, 0))}{freqSuffix(mainProduct.paymentFrequency)}
                  </span>
                )}
                {isAccessoriesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isAccessoriesExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pt-2 pb-4 border-t border-[var(--color-primary)]/10">
                    <div className="space-y-2">
                      {selectedAccessories.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <Plus className="w-3 h-3 text-[var(--color-primary)] flex-shrink-0" />
                            <span className="text-neutral-700 truncate">{acc.name}</span>
                          </div>
                          <span className="text-[var(--color-primary)] font-medium flex-shrink-0 ml-4">
                            +{formatPrice(acc.monthlyQuota)}{freqSuffix(mainProduct.paymentFrequency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[var(--color-primary)]/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-700">Cuota mensual total</span>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${isOverQuotaLimit ? 'text-red-600' : 'text-[var(--color-primary)]'}`}>
                            {formatPrice(totalMonthlyPayment)}/mes
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
      )}

    </>
  );
};

// Spacer component to prevent content from being hidden behind fixed bar
// Uses safe-area-inset-bottom so iOS devices with home indicator don't overlap
export const SelectedProductSpacer: React.FC = () => {
  const { getAllProducts } = useProduct();

  if (getAllProducts().length === 0) return null;

  return (
    <div
      className="lg:hidden"
      style={{ height: 'calc(var(--product-bar-height, 72px) + env(safe-area-inset-bottom))' }}
    />
  );
};

export default SelectedProductBar;
