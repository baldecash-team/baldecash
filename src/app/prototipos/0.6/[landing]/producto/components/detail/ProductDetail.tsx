'use client';

/**
 * ProductDetail - Wrapper component v0.6
 * Data from API only (NO mock data fallback)
 *
 * Layout: 2 columnas
 * - Izquierda: Card unificada (Gallery + Brand + Rating + Nombre + ColorSelector)
 * - Derecha: Pricing sticky + CTA + Certifications
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Check, Heart, Package, Gift } from 'lucide-react';
import {
  DeviceType,
  CronogramaVersion,
  ProductDetail as ProductDetailType,
  PaymentPlan,
  SimilarProduct,
  ProductLimitation,
  Certification,
  ComboInfo,
} from '../../types/detail';
import type { SelectedProduct } from '@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext';
import type { CartItem, WishlistItem, TermMonths, InitialPaymentPercent, CartPaymentPlan } from '@/app/prototipos/0.6/[landing]/catalogo/types/catalog';
import { routes } from '@/app/prototipos/0.6/utils/routes';

// Dynamic storage keys based on landing slug (same pattern as ProductContext)
const getStorageKey = (landing: string) => `baldecash-${landing}-solicitar-selected-product`;
const getCartProductsKey = (landing: string) => `baldecash-${landing}-solicitar-cart-products`;

import {
  ProductGallery,
  DetailTabs,
  SpecsDisplay,
  PricingCalculator,
  Cronograma,
  SimilarProducts,
  ProductLimitations,
  Certifications,
  PortsDisplay,
  SpecSheetDownload,
} from './index';
import type { PricingSelection } from './pricing/PricingCalculator';

interface ProductDetailProps {
  // Data props (from API - required, no fallback to mock)
  product: ProductDetailType;
  combo?: ComboInfo;
  paymentPlans: PaymentPlan[];
  similarProducts?: SimilarProduct[];
  limitations?: ProductLimitation[];
  certifications?: Certification[];
  // Config props
  deviceType?: DeviceType;
  cronogramaVersion?: CronogramaVersion;
  // v0.6.1: onAddToCart now receives CartItem with full config (variant, pricing)
  onAddToCart?: (cartItem: CartItem) => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateCart?: (productId: string, updates: Partial<CartItem>) => void;
  cartItem?: CartItem;  // Current cart item for comparison
  isInCart?: boolean;
  // Wishlist props
  onToggleWishlist?: (wishlistItem: WishlistItem) => void;
  isInWishlist?: boolean;
  // Cart props for similar products - v0.6.2: receives SimilarProduct
  onSimilarAddToCart?: (product: SimilarProduct) => void;
  cartItems?: string[];
  // Availability flag - when false, disables cart/solicitar actions
  isAvailable?: boolean;
  // Default pricing from catalog card
  defaultTerm?: number;
  defaultInitialPercent?: number;
  // Payment frequencies (e.g. ['quincenal', 'semanal'] for celulares)
  paymentFrequencies?: string[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  // API data props (required)
  product,
  combo,
  paymentPlans,
  similarProducts = [],
  limitations = [],
  certifications = [],
  // Config props
  deviceType = 'laptop',
  cronogramaVersion = 1,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCart,
  cartItem,
  isInCart = false,
  // Wishlist props
  onToggleWishlist,
  isInWishlist = false,
  // Cart props for similar products
  onSimilarAddToCart,
  cartItems = [],
  isAvailable = true,
  defaultTerm,
  defaultInitialPercent,
  paymentFrequencies,
}) => {
  const router = useRouter();
  const params = useParams();
  const landing = params.landing as string || 'home';

  // Color siblings: use family siblings if available, otherwise variant colors
  const hasSiblings = product.colorSiblings && product.colorSiblings.length > 1;

  // Build colors from siblings for the ColorSelector
  const siblingColors = useMemo(() => {
    if (!hasSiblings) return null;
    return product.colorSiblings.map(sib => ({
      id: String(sib.productId),
      name: sib.color,
      hex: sib.colorHex,
    }));
  }, [hasSiblings, product.colorSiblings]);

  // Use sibling colors if available, otherwise variant colors
  const displayColors = siblingColors || product.colors;

  // Color state - default to current product
  const defaultColorId = useMemo(() => {
    if (hasSiblings) {
      // Find current product in siblings
      const currentSibling = product.colorSiblings.find(
        sib => sib.slug === product.slug
      );
      return currentSibling ? String(currentSibling.productId) : String(product.colorSiblings[0].productId);
    }
    return product.colors && product.colors.length > 0 ? product.colors[0].id : '';
  }, [product.colors, product.colorSiblings, product.slug, hasSiblings]);

  const [selectedColorId, setSelectedColorId] = useState(defaultColorId);

  // Navigate to sibling product when color is selected
  const handleColorSelect = useCallback((colorId: string) => {
    if (hasSiblings) {
      const sibling = product.colorSiblings.find(sib => String(sib.productId) === colorId);
      if (sibling && sibling.slug !== product.slug) {
        router.push(routes.producto(landing, sibling.slug));
        return;
      }
    }
    setSelectedColorId(colorId);
  }, [hasSiblings, product.colorSiblings, product.slug, landing, router]);

  // Pricing selection state (from PricingCalculator)
  const [pricingSelection, setPricingSelection] = useState<PricingSelection | null>(null);

  // Handle pricing selection changes from PricingCalculator
  const handlePricingSelectionChange = useCallback((selection: PricingSelection) => {
    setPricingSelection(selection);
  }, []);

  // Transform PaymentPlan[] to CartPaymentPlan[] format
  const cartPaymentPlans: CartPaymentPlan[] = useMemo(() => {
    return paymentPlans.map(plan => ({
      term: plan.term,
      options: plan.options.map(opt => ({
        initialPercent: opt.initialPercent,
        initialAmount: opt.initialAmount,
        monthlyQuota: opt.monthlyQuota,
        originalQuota: opt.originalQuota,
      })),
    }));
  }, [paymentPlans]);

  // v0.6.1: Build CartItem with full product config and call onAddToCart
  const handleAddToCart = useCallback(() => {
    if (!onAddToCart || !pricingSelection) return;

    // Find selected color info
    const selectedColor = displayColors?.find(c => c.id === selectedColorId);

    // Build CartItem with full config
    const cartItem: CartItem = {
      productId: product.id,
      slug: product.slug,  // For API calls when fetching payment plans
      name: product.displayName,  // Full name for cart display
      shortName: product.name,    // Short name for compact views
      brand: product.brand,
      price: product.price,
      image: productThumbnail,
      type: product.deviceType as CartItem['type'],  // Product type for accessory/insurance compatibility
      months: pricingSelection.term as TermMonths,
      initialPercent: pricingSelection.initialPercent as InitialPaymentPercent,
      initialAmount: pricingSelection.initialAmount,
      monthlyPayment: pricingSelection.monthlyQuota,
      addedAt: Date.now(),
      // Variant/color info
      variantId: selectedColorId || undefined,
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      // Payment plans for term standardization
      paymentPlans: cartPaymentPlans,
    };

    onAddToCart(cartItem);
  }, [onAddToCart, pricingSelection, displayColors, selectedColorId, product, cartPaymentPlans]);

  // Build WishlistItem with pricing config and toggle wishlist
  const handleToggleWishlist = useCallback(() => {
    if (!onToggleWishlist || !pricingSelection) return;

    const selectedColor = displayColors?.find(c => c.id === selectedColorId);

    const wishlistItem: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      image: productThumbnail,
      lowestQuota: pricingSelection.monthlyQuota,
      type: product.deviceType as WishlistItem['type'],
      months: pricingSelection.term as TermMonths,
      initialPercent: pricingSelection.initialPercent as InitialPaymentPercent,
      initialAmount: pricingSelection.initialAmount,
      monthlyPayment: pricingSelection.monthlyQuota,
      variantId: selectedColorId || undefined,
      colorName: selectedColor?.name,
      colorHex: selectedColor?.hex,
      addedAt: Date.now(),
    };

    onToggleWishlist(wishlistItem);
  }, [onToggleWishlist, pricingSelection, displayColors, selectedColorId, product]);

  // Only show ports for laptops
  const showPorts = deviceType === 'laptop' && product.ports.length > 0;

  // Derived section flags (single source of truth for nav + DOM sections)
  const GENERIC_TIERS = new Set(['Básica', 'Intermedia', 'Potente', 'medio']);
  const shortDesc = product.shortDescription?.trim();
  const longDesc = product.description?.trim();
  const displayShortDesc =
    shortDesc && !GENERIC_TIERS.has(shortDesc) && shortDesc !== longDesc
      ? product.shortDescription
      : null;
  const hasDescription = !!(product.description || displayShortDesc);
  const hasSimilar = similarProducts.length > 0;
  const hasLimitations = limitations.length > 0;

  // First non-video image URL (for thumbnails in cart, solicitar, spec-sheet, etc.)
  const productThumbnail = useMemo(() => {
    const img = product.images.find(i => i.type !== 'video' && !/\.(mp4|webm|ogg)(\?|$)/i.test(i.url));
    return img?.url || product.images[0]?.url || '';
  }, [product.images]);

  // Helper to extract spec value
  const getSpecValue = (category: string, label: string): string | undefined => {
    const specCategory = product.specs.find((s) => s.category.toLowerCase() === category.toLowerCase());
    if (!specCategory) return undefined;
    const spec = specCategory.specs.find((s) => s.label.toLowerCase().includes(label.toLowerCase()));
    return spec?.value;
  };

  const handleSolicitar = () => {
    // Use the user's selection from PricingCalculator, or fallback to defaults
    // Round to whole numbers to match the display format
    const monthlyQuota = Math.floor(pricingSelection?.monthlyQuota ?? product.lowestQuota);
    const months = pricingSelection?.term ?? 24;
    const initialPercent = pricingSelection?.initialPercent ?? 0; // Default 0% (Sin inicial)
    const initialAmount = Math.floor(pricingSelection?.initialAmount ?? (product.price * initialPercent / 100));

    // Build SelectedProduct from current product
    const selectedProduct: SelectedProduct = {
      id: product.id,
      slug: product.slug,  // For API calls when fetching payment plans
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: Math.floor(product.price),
      monthlyPayment: monthlyQuota,
      months: months,
      initialPercent: initialPercent,
      initialAmount: initialAmount,
      image: productThumbnail,
      specs: {
        processor: getSpecValue('procesador', 'modelo') || getSpecValue('processor', 'model') || '',
        ram: getSpecValue('memoria', 'capacidad') || getSpecValue('ram', 'size') || '',
        storage: getSpecValue('almacenamiento', 'capacidad') || getSpecValue('storage', 'size') || '',
      },
      // Payment plans for term standardization
      paymentPlans: cartPaymentPlans,
    };

    // Save to localStorage
    try {
      localStorage.setItem(getStorageKey(landing), JSON.stringify(selectedProduct));
      // Clear cart products since this is a single product selection
      localStorage.removeItem(getCartProductsKey(landing));
    } catch {
      // localStorage not available
    }

    // Navigate to solicitar flow in 0.6
    router.push(routes.solicitar(landing));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* pb-32 en mobile para dejar espacio al bottom CTA bar fijo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 lg:pb-6">
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Unified Product Card (Gallery + Info) */}
          <div id="section-gallery" className="order-1 lg:order-1">
            <ProductGallery
              images={product.images}
              productName={product.displayName}
              brand={product.brand}
              rating={product.rating}
              reviewCount={product.reviewCount}
              displayName={product.displayName}
              colors={displayColors}
              selectedColorId={selectedColorId}
              onColorSelect={handleColorSelect}
            />
          </div>

          {/* Right Column - Pricing (Sticky).
              top offset tracks --header-total-height + --catalog-secondary-height
              so it stays correctly positioned regardless of promo banner state. */}
          <div
            className="order-2 lg:order-2 lg:sticky space-y-6"
            style={{
              top: 'calc(var(--header-total-height, 6.5rem) + var(--catalog-secondary-height, 3.5rem) + 0.5rem)',
            }}
          >
            {/* Combo Banner */}
            {combo && combo.accessories.length > 0 && (
              <div className="bg-gradient-to-r from-[rgba(var(--color-primary-rgb),0.05)] to-[rgba(var(--color-primary-rgb),0.02)] border border-[rgba(var(--color-primary-rgb),0.2)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-[var(--color-primary)]" />
                  <span className="font-semibold text-neutral-800">Combo incluye</span>
                </div>
                <div className="space-y-3">
                  {combo.accessories.map((accessory) => (
                    <div
                      key={accessory.productId}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-neutral-100"
                    >
                      {accessory.imageUrl && (
                        <img
                          src={accessory.imageUrl}
                          alt={accessory.productName}
                          className="w-12 h-12 object-contain rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 line-clamp-2 break-words">
                          {accessory.productName}
                        </p>
                        {accessory.isIncludedFree ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Gift className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs font-semibold text-green-600">
                              ¡Gratis!
                            </span>
                            {accessory.unitPrice > 0 && (
                              <span className="text-xs text-neutral-400 line-through ml-1">
                                S/ {accessory.unitPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 mt-0.5">
                            S/ {accessory.unitPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Calculator + CTA */}
            <div id="section-pricing" className="space-y-4">
              <PricingCalculator
                paymentPlans={paymentPlans}
                defaultTerm={defaultTerm}
                defaultInitialPercent={defaultInitialPercent ?? 0}
                productPrice={product.price}
                paymentFrequencies={paymentFrequencies}
                landing={landing}
                productSlug={product.slug}
                onSelectionChange={handlePricingSelectionChange}
              />
              {/* CTA Buttons or Unavailable banner */}
              {!isAvailable ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-amber-800 font-medium text-sm">Este producto no se encuentra disponible actualmente</p>
                </div>
              ) : (
              // Mobile: fixed bottom CTA bar (e-commerce convention).
              // Desktop (lg+): inline flex inside the sticky pricing column.
              // We inject the inline safe-area padding via a data attribute so
              // it only applies below lg via a tiny style helper below.
              <div
                className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 sm:gap-3 bg-white border-t border-neutral-200 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:static lg:z-auto lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none"
              >
                <button
                  onClick={handleSolicitar}
                  className="flex-1 bg-[var(--color-primary)] text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:brightness-90 transition-all cursor-pointer shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]"
                >
                  ¡Lo quiero!
                </button>
                {onAddToCart && (() => {
                  // Determine cart button state
                  const configChanged = isInCart && cartItem && pricingSelection && (
                    cartItem.months !== pricingSelection.term ||
                    cartItem.initialPercent !== pricingSelection.initialPercent
                  );

                  const handleCartAction = () => {
                    if (!isInCart) {
                      handleAddToCart();
                    } else if (configChanged && onUpdateCart && pricingSelection) {
                      onUpdateCart(product.id, {
                        months: pricingSelection.term as TermMonths,
                        initialPercent: pricingSelection.initialPercent as InitialPaymentPercent,
                        initialAmount: pricingSelection.initialAmount,
                        monthlyPayment: pricingSelection.monthlyQuota,
                      });
                    } else if (onRemoveFromCart) {
                      onRemoveFromCart(product.id);
                    }
                  };

                  const getButtonStyle = () => {
                    if (!isInCart) {
                      return 'text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-[rgba(var(--color-primary-rgb),0.2)]';
                    }
                    if (configChanged) {
                      return 'text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-[rgba(var(--color-primary-rgb),0.2)]';
                    }
                    return 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20 hover:bg-red-50 hover:text-red-500 hover:border-red-200';
                  };

                  const getButtonContent = () => {
                    if (!isInCart) {
                      return { icon: <ShoppingCart className="w-5 h-5" />, text: 'Al carrito' };
                    }
                    if (configChanged) {
                      return { icon: <ShoppingCart className="w-5 h-5" />, text: 'Actualizar carrito' };
                    }
                    return { icon: <Check className="w-5 h-5" />, text: 'Quitar del carrito' };
                  };

                  const { icon, text } = getButtonContent();

                  return (
                    <button
                      onClick={handleCartAction}
                      disabled={!isInCart && !pricingSelection}
                      className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors cursor-pointer border flex-shrink-0 ${getButtonStyle()}`}
                    >
                      {icon}
                      <span className="hidden sm:inline">{text}</span>
                    </button>
                  );
                })()}
                {onToggleWishlist && (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={!pricingSelection}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors cursor-pointer border flex-shrink-0 ${
                      isInWishlist
                        ? 'text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                        : 'text-neutral-500 bg-neutral-50 border-neutral-200 hover:text-[var(--color-primary)] hover:border-[rgba(var(--color-primary-rgb),0.2)] hover:bg-[rgba(var(--color-primary-rgb),0.05)]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
              )}
            </div>

            {/* Certifications */}
            <div id="section-certifications">
              <Certifications certifications={certifications} />
            </div>
          </div>
        </div>

        {/* Section Navigation (Sidebar desktop / Bottom bar mobile) */}
        <DetailTabs
          product={product}
          hasLimitations={hasLimitations}
          hasDescription={hasDescription}
          hasSimilar={hasSimilar}
        />

        {/* Description Section - Full Width */}
        {hasDescription && (
          <div id="section-description" className="mt-12">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-900">Descripción</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                {displayShortDesc && (
                  <p className="text-base font-semibold text-[var(--color-primary)]">
                    {displayShortDesc}
                  </p>
                )}
                {product.description && (
                  <p className="text-neutral-600 leading-relaxed text-sm">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Specs Section - Full Width */}
        <div id="section-specs" className="mt-12">
          <SpecsDisplay specs={product.specs} />
        </div>

        {/* Ports Display - Full Width (Only for Laptops) */}
        {showPorts && (
          <div id="section-ports" className="mt-4">
            <PortsDisplay ports={product.ports} />
          </div>
        )}

        {/* Spec Sheet Download - All products */}
        <div id="section-spec-sheet" className="mt-6">
          <SpecSheetDownload
            specs={product.specs}
            ports={product.ports}
            productName={product.displayName}
            productBrand={product.brand}
            productImage={productThumbnail}
            description={product.description || undefined}
            shortDescription={displayShortDesc || undefined}
          />
        </div>

        {/* Cronograma Section - Full Width */}
        <div id="section-cronograma" className="mt-12">
          <Cronograma
            paymentPlans={paymentPlans}
            term={36}
            startDate={new Date()}
            version={cronogramaVersion}
            productName={product.displayName}
            productBrand={product.brand}
            productPrice={product.price}
            // Sincronizar con PricingCalculator
            selectedTerm={pricingSelection?.term}
            selectedInitialPercent={pricingSelection?.initialPercent}
            financialData={product.tea != null && product.tcea != null ? { tea: product.tea, tcea: product.tcea } : undefined}
          />
        </div>

        {/* Similar Products - Full Width */}
        {hasSimilar && (
          <div id="section-similar" className="mt-12">
            <SimilarProducts
              products={similarProducts}
              currentQuota={product.lowestQuota}
              onAddToCart={onSimilarAddToCart}
              cartItems={cartItems}
            />
          </div>
        )}

        {/* Limitations */}
        {hasLimitations && (
          <div id="section-limitations" className="mt-8">
            <ProductLimitations limitations={limitations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
