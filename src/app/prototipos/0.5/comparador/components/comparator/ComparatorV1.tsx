'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { Trash2, Scale, ArrowRight, Trophy } from 'lucide-react';
import { ComparatorLayoutProps, compareSpecs, calculatePriceDifference, ComparisonProduct, getDisplayQuota } from '../../types/comparator';
import { DesignStyleA } from './DesignStyleA';
import { DesignStyleB } from './DesignStyleB';
import { DesignStyleC } from './DesignStyleC';
import { calculateQuotaWithInitial } from '@/app/prototipos/0.5/catalogo/types/catalog';
import { useProduct } from '@/app/prototipos/0.5/wizard-solicitud/context/ProductContext';

// Configuración para cálculo de cuota
const WIZARD_SELECTED_TERM = 24;
const WIZARD_SELECTED_INITIAL = 10;

/**
 * ComparatorV1 - Modal Fullscreen
 * Modal inmersivo con overlay oscuro
 * Referencia: Amazon, Best Buy comparison modal
 */
export const ComparatorV1: React.FC<ComparatorLayoutProps & { isOpen: boolean; onClose: () => void }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const { setSelectedProduct } = useProduct();
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);
  const [showBestOption, setShowBestOption] = useState(false);

  // Helper to save product to context
  const selectProductForWizard = useCallback((product: ComparisonProduct) => {
    const { quota } = calculateQuotaWithInitial(product.price, WIZARD_SELECTED_TERM, WIZARD_SELECTED_INITIAL);

    setSelectedProduct({
      id: product.id,
      name: product.displayName,
      shortName: product.name,
      brand: product.brand,
      price: product.price,
      monthlyPayment: quota,
      months: WIZARD_SELECTED_TERM,
      image: product.thumbnail,
      specs: {
        processor: product.specs?.processor?.model || '',
        ram: product.specs?.ram ? `${product.specs.ram.size}GB RAM` : '',
        storage: product.specs?.storage ? `${product.specs.storage.size}GB ${product.specs.storage.type}` : '',
      },
    });
  }, [setSelectedProduct]);

  // Reset showBestOption when comparator opens
  useEffect(() => {
    if (isOpen) {
      setShowBestOption(false);
    }
  }, [isOpen]);

  // Find the best option (lowest monthly quota using calculated value)
  const bestProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.reduce((best, current) =>
      getDisplayQuota(current) < getDisplayQuota(best) ? current : best
    , products[0]);
  }, [products]);

  const bestProductIndex = useMemo(() => {
    if (!bestProduct) return -1;
    return products.findIndex(p => p.id === bestProduct.id);
  }, [products, bestProduct]);

  const handleShowBestOption = () => {
    setShowBestOption(true);
  };

  const handleContinueWithBest = () => {
    // Guardar el mejor producto antes de navegar
    if (bestProduct) {
      selectProductForWizard(bestProduct);
    }
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
    router.push(isCleanMode ? `${baseUrl}?mode=clean` : baseUrl);
  };

  // Filter specs based on fieldsVersion
  const getFilteredSpecs = () => {
    if (config.fieldsVersion === 1) {
      // V1: Solo specs principales
      const allowedFields = ['processor', 'ram', 'storage', 'displaySize', 'quota'];
      return specs.filter(s => allowedFields.includes(s.key));
    }
    // V2: Todos los campos
    return specs;
  };

  const filteredSpecs = comparisonState.showOnlyDifferences
    ? getFilteredSpecs().filter(s => s.isDifferent)
    : getFilteredSpecs();

  // Handler for selecting a product from DesignStyleB/C
  const handleSelectProduct = (productId: string) => {
    // Guardar el producto seleccionado antes de navegar
    const product = products.find((p) => p.id === productId);
    if (product) {
      selectProductForWizard(product);
    }
    const baseUrl = '/prototipos/0.5/wizard-solicitud/wizard-preview/';
    router.push(isCleanMode ? `${baseUrl}?mode=clean` : baseUrl);
  };

  // Render the appropriate design style
  const renderDesignStyle = () => {
    const commonProps = {
      products,
      specs: filteredSpecs,
      config,
      showBestOption,
      bestProductIndex,
      onRemoveProduct,
      priceDiff,
    };

    switch (config.designStyle) {
      case 1:
        return <DesignStyleA {...commonProps} />;
      case 2:
        return <DesignStyleB {...commonProps} onSelectProduct={handleSelectProduct} />;
      case 3:
        return (
          <DesignStyleC
            {...commonProps}
            onSelectProduct={handleSelectProduct}
            showOnlyDifferences={comparisonState.showOnlyDifferences}
            onToggleDifferences={(value) => onStateChange({
              ...comparisonState,
              showOnlyDifferences: value,
            })}
          />
        );
      default:
        return <DesignStyleA {...commonProps} />;
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="outside"
      backdrop="blur"
      isDismissable={false}
      classNames={{
        base: 'bg-white m-0 rounded-none h-screen',
        wrapper: 'p-0 z-[100]',
        backdrop: 'bg-black/70 z-[99]',
        header: 'border-b border-neutral-200 bg-white py-4 flex-shrink-0',
        body: 'bg-neutral-50 py-6 px-4 md:px-8 flex-1 overflow-y-auto',
        footer: 'border-t border-neutral-200 bg-white flex-shrink-0',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 font-['Baloo_2']">
                Comparador de Equipos
              </h2>
              <p className="text-sm text-neutral-500">
                {products.length} equipos seleccionados
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Toggle for differences - Oculto para DesignStyleC (tiene su propio checkbox) */}
          {config.designStyle !== 3 && (
            <div className="flex items-center justify-start gap-4 mb-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparisonState.showOnlyDifferences}
                  onChange={(e) => onStateChange({
                    ...comparisonState,
                    showOnlyDifferences: e.target.checked,
                  })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#4654CD] focus:ring-[#4654CD] cursor-pointer"
                />
                <span className="text-sm text-neutral-600">Solo mostrar diferencias</span>
              </label>
            </div>
          )}

          {/* Design Style Content */}
          {renderDesignStyle()}
        </ModalBody>

        <ModalFooter className="flex flex-col-reverse md:flex-row md:justify-between gap-3">
          <Button
            variant="light"
            isIconOnly
            onPress={onClearAll}
            className="cursor-pointer text-neutral-600 hover:text-red-500 hidden md:flex"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
            {!showBestOption ? (
              <Button
                className="bg-[#4654CD] text-white cursor-pointer font-semibold w-full md:w-auto order-1 md:order-2"
                onPress={handleShowBestOption}
                startContent={<Trophy className="w-4 h-4" />}
              >
                Ver mejor opción
              </Button>
            ) : (
              <Button
                className="bg-[#22c55e] text-white cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all w-full md:w-auto order-1 md:order-2"
                onPress={handleContinueWithBest}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Elegir ganador
              </Button>
            )}
            <Button
              variant="bordered"
              onPress={onClose}
              className="cursor-pointer border-neutral-200 w-full md:w-auto order-2 md:order-1"
            >
              Cerrar
            </Button>
          </div>
          {/* Mobile: Limpiar button at bottom */}
          <Button
            variant="light"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={onClearAll}
            className="cursor-pointer text-neutral-600 hover:text-red-500 md:hidden w-full"
          >
            Limpiar comparación
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
