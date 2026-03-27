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
import { ShoppingCart, Check, Heart } from 'lucide-react';
import {
  DeviceType,
  CronogramaVersion,
  ProductDetail as ProductDetailType,
  PaymentPlan,
  SimilarProduct,
  ProductLimitation,
  Certification,
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
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  // API data props (required)
  product,
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
      image: product.images[0]?.url || '',
      type: product.category as CartItem['type'],  // Product type for accessory compatibility
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
      image: product.images[0]?.url || '',
      lowestQuota: pricingSelection.monthlyQuota,
      type: product.category as WishlistItem['type'],
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
      image: product.images[0]?.url || '',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
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

          {/* Right Column - Pricing (Sticky) */}
          <div className="order-2 lg:order-2 lg:sticky lg:top-[168px] space-y-6">
            {/* Pricing Calculator + CTA */}
            <div id="section-pricing" className="space-y-4">
              <PricingCalculator
                paymentPlans={paymentPlans}
                defaultTerm={defaultTerm}
                defaultInitialPercent={defaultInitialPercent ?? 0}
                productPrice={product.price}
                onSelectionChange={handlePricingSelectionChange}
              />
              {/* CTA Buttons or Unavailable banner */}
              {!isAvailable ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                  <p className="text-amber-800 font-medium text-sm">Este producto no se encuentra disponible actualmente</p>
                </div>
              ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSolicitar}
                  className="flex-1 bg-[var(--color-primary)] text-white py-4 rounded-xl font-semibold text-lg hover:brightness-90 transition-all cursor-pointer shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]"
                >
                  ¡Lo quiero! Solicitar ahora
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
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors cursor-pointer border ${getButtonStyle()}`}
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
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors cursor-pointer border ${
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
        <DetailTabs product={product} hasLimitations={limitations.length > 0} />

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
            productImage={product.images[0]?.url}
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
          />
        </div>

        {/* Similar Products - Full Width */}
        <div id="section-similar" className="mt-12">
          <SimilarProducts
            products={similarProducts}
            currentQuota={product.lowestQuota}
            onAddToCart={onSimilarAddToCart}
            cartItems={cartItems}
          />
        </div>

        {/* Limitations */}
        <div id="section-limitations" className="mt-8">
          <ProductLimitations limitations={limitations} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
