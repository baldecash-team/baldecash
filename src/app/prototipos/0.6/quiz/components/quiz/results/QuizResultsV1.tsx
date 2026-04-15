'use client';

/**
 * QuizResultsV1 - Producto destacado + opciones secundarias
 * Muestra el mejor match como recomendación principal con énfasis visual,
 * y los demás resultados como alternativas en cards más pequeñas.
 *
 * v0.6.1: Agregado CartSelectionModal para ofrecer opción de carrito
 */

import React, { useState } from 'react';
import { Card, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Check,
  Star,
  ShoppingCart,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react';
import { QuizResultsProps, QuizResult, QuizProduct } from '../../../types/quiz';
import { useIsMobile } from '@/app/prototipos/_shared';
import { ALLOW_MULTI_PRODUCT } from '@/app/prototipos/0.6/utils/featureFlags';

export const QuizResultsV1: React.FC<QuizResultsProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
  onViewOtherOptions,
  onAddToCart,
  cartItems = [],
}) => {
  const isMobile = useIsMobile();

  // Modal state for cart selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<QuizProduct | null>(null);

  // Open modal when clicking "Lo quiero"
  const handleOpenModal = (product: QuizProduct) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductForModal(null);
  };
  const topResult = results[0];
  const secondaryResults = results.slice(1); // Productos secundarios

  if (!topResult) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">No encontramos resultados</p>
        <Button
          variant="light"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={onRestartQuiz}
          className="mt-4 cursor-pointer"
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  // Formatear RAM con tipo si está disponible
  const formatRam = () => {
    const ram = topResult.product.specs?.ram;
    const ramType = topResult.product.specs?.ramType;
    if (!ram) return 'N/A';
    return ramType ? `${ram}GB ${ramType}` : `${ram}GB`;
  };

  // Formatear almacenamiento
  const formatStorage = () => {
    const storage = topResult.product.specs?.storage;
    const storageType = topResult.product.specs?.storageType;
    if (!storage) return 'N/A';
    // storageType ya viene formateado desde quizApi (e.g., "UFS 2.2", "SSD M.2 PCIe NVMe")
    return `${storage}GB ${storageType || 'SSD'}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Success header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-center justify-center w-16 h-16 bg-[#22c55e]/10 rounded-full mb-4"
        >
          <Sparkles className="w-8 h-8 text-[#22c55e]" />
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-1">
          ¡Encontramos tu producto ideal!
        </h2>
        <p className="text-neutral-500">
          Basado en tus respuestas, esta es nuestra recomendación
        </p>
      </motion.div>

      {/* Main product card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className="border-2 overflow-hidden shadow-lg"
          style={{ borderColor: 'var(--color-primary)' }}
        >
          {/* Match badge header */}
          <div
            className="text-white px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">Perfecto para ti</span>
            </div>
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-white/20 px-2 py-0.5 h-auto',
                content: 'text-white text-xs font-medium',
              }}
            >
              {topResult.matchScore}% match
            </Chip>
          </div>

          <CardBody className="p-0">
            {/* Product image */}
            <div className="bg-neutral-50 p-6 flex items-center justify-center">
              <img
                src={topResult.product.image}
                alt={topResult.product.name}
                className="w-48 h-48 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='%23f5f5f5'%3E%3Crect width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a3a3a3' font-family='sans-serif' font-size='14'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Product info */}
            <div className="p-5">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
                {topResult.product.brand}
              </p>
              <h3 className="text-lg font-bold text-neutral-800 mb-3">
                {topResult.product.displayName}
              </h3>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">RAM</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {formatRam()}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-neutral-500">Almacenamiento</p>
                  <p className="text-sm font-semibold text-neutral-700">
                    {formatStorage()}
                  </p>
                </div>
              </div>

              {/* Match reasons */}
              <div className="space-y-2 mb-4">
                {topResult.reasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-end justify-between mb-4 pb-4 border-b border-neutral-100">
                <div>
                  <p className="text-sm text-neutral-500">Desde</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    S/{topResult.product.lowestQuota}
                    <span className="text-base font-normal text-neutral-500">/mes</span>
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {topResult.product.termMonths} meses · {topResult.product.initialPercent}% inicial
                  </p>
                </div>
                <p className="text-sm text-neutral-400">
                  Total: S/{topResult.product.price.toLocaleString('en-US')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {(() => {
                  const isInCart = ALLOW_MULTI_PRODUCT && cartItems.includes(topResult.product.id);
                  return (
                    <Button
                      className={`flex-1 font-semibold cursor-pointer ${
                        isInCart
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'text-white'
                      }`}
                      style={isInCart ? {} : { backgroundColor: 'var(--color-primary)' }}
                      size="lg"
                      endContent={isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      onPress={() => {
                        if (isInCart) return;
                        if (ALLOW_MULTI_PRODUCT && onAddToCart) {
                          handleOpenModal(topResult.product);
                        } else {
                          onViewProduct(topResult.product.id);
                        }
                      }}
                      isDisabled={isInCart}
                    >
                      {isInCart ? 'En el carrito' : 'Lo quiero'}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Secondary results */}
      {secondaryResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <p className="text-sm text-neutral-500 font-medium mb-3">
            También te pueden interesar:
          </p>
          <div className="flex flex-col gap-3 w-full">
            {secondaryResults.map((result, index) => (
              <SecondaryProductCard
                key={result.product.id}
                result={result}
                onOpenModal={ALLOW_MULTI_PRODUCT && onAddToCart ? handleOpenModal : undefined}
                onDirectSelect={!ALLOW_MULTI_PRODUCT || !onAddToCart ? onViewProduct : undefined}
                isInCart={ALLOW_MULTI_PRODUCT && cartItems.includes(result.product.id)}
                delay={0.5 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Other options link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + secondaryResults.length * 0.1 }}
        className="text-center pb-6"
      >
        <button
          onClick={onViewOtherOptions || onRestartQuiz}
          className="text-sm text-neutral-500 cursor-pointer transition-colors inline-flex items-center gap-1"
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
        >
          <RefreshCw className="w-4 h-4" />
          Ver más en el catálogo
        </button>
      </motion.div>

      {/* Cart Selection Modal — only when multi-product is enabled */}
      {ALLOW_MULTI_PRODUCT && onAddToCart && selectedProductForModal && (
        isMobile ? (
          <QuizProductMobileModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            onRequestEquipment={() => {
              onViewProduct(selectedProductForModal.id);
              handleCloseModal();
            }}
            onAddToCart={() => {
              onAddToCart(selectedProductForModal);
              handleCloseModal();
            }}
          />
        ) : (
          <QuizProductDesktopModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            onRequestEquipment={() => {
              onViewProduct(selectedProductForModal.id);
              handleCloseModal();
            }}
            onAddToCart={() => {
              onAddToCart(selectedProductForModal);
              handleCloseModal();
            }}
          />
        )
      )}
    </div>
  );
};

/**
 * Card horizontal para productos secundarios (layout de fila completa)
 */
const SecondaryProductCard: React.FC<{
  result: QuizResult;
  onOpenModal?: (product: QuizProduct) => void;
  onDirectSelect?: (productId: string) => void;
  isInCart: boolean;
  delay: number;
}> = ({ result, onOpenModal, onDirectSelect, isInCart, delay }) => {
  const { product, matchScore } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <Card
        isPressable
        isDisabled={isInCart}
        onPress={() => {
          if (isInCart) return;
          if (onOpenModal) {
            onOpenModal(product);
          } else if (onDirectSelect) {
            onDirectSelect(product.id);
          }
        }}
        className={`border transition-colors w-full ${
          isInCart
            ? 'border-emerald-300 bg-emerald-50/50 cursor-default'
            : 'border-neutral-200 hover:border-[var(--color-primary)]'
        }`}
      >
        <CardBody className="p-3 sm:p-4">
          <div className="flex items-center gap-4">
            {/* Product image */}
            <div className="bg-neutral-50 rounded-lg p-2 flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' fill='%23f5f5f5'%3E%3Crect width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a3a3a3' font-family='sans-serif' font-size='10'%3ESin imagen%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                  {product.brand}
                </span>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: 'h-5 px-1.5 flex-shrink-0',
                    content: 'text-[10px] font-medium',
                  }}
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {matchScore}% match
                </Chip>
              </div>
              <p className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-2">
                {product.displayName}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold" style={{ color: isInCart ? '#10b981' : 'var(--color-primary)' }}>
                    S/{product.lowestQuota}
                    <span className="text-xs font-normal text-neutral-400">/mes</span>
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {product.termMonths} meses · {product.initialPercent}% inicial
                  </p>
                </div>
                {/* Visual indicator instead of nested button */}
                <div
                  className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-white ${
                    isInCart ? 'bg-emerald-500' : ''
                  }`}
                  style={isInCart ? {} : { backgroundColor: 'var(--color-primary)' }}
                >
                  {isInCart ? (
                    <>
                      En el carrito
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lo quiero
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// ============================================
// Cart Selection Modal Components for QuizProduct
// ============================================

interface QuizProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: QuizProduct;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
}

// Shared content for both mobile and desktop modals
const QuizModalContentShared: React.FC<{
  product: QuizProduct;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
  onClose: () => void;
}> = ({ product, onRequestEquipment, onAddToCart, onClose }) => {
  return (
    <div className="space-y-4">
      {/* Product Preview */}
      <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-200">
          <img
            src={product.thumbnail || product.image}
            alt={product.displayName}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="text-sm lg:text-base font-semibold text-neutral-800 line-clamp-2">
            {product.displayName}
          </h3>
          <p className="text-base lg:text-lg font-bold text-[var(--color-primary)] mt-0.5">
            S/{product.lowestQuota}/mes
          </p>
          <p className="text-xs text-neutral-400">
            {product.termMonths} meses · {product.initialPercent}% inicial
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {/* Option 1: Request Equipment */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onRequestEquipment();
            onClose();
          }}
          className="w-full p-4 bg-[var(--color-primary)] text-white rounded-xl flex items-center gap-4 cursor-pointer hover:brightness-90 transition-colors"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">Solicitar equipo</p>
            <p className="text-sm text-white/80">
              Iniciar proceso de solicitud ahora
            </p>
          </div>
        </motion.button>

        {/* Option 2: Add to Cart */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onAddToCart();
          }}
          className="w-full p-4 bg-white border-2 border-neutral-200 text-neutral-800 rounded-xl flex items-center gap-4 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[rgba(var(--color-primary-rgb),0.05)] transition-all"
        >
          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-neutral-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-base">Añadir al carrito</p>
            <p className="text-sm text-neutral-500">
              Guardar y seguir explorando
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

// Desktop Modal (NextUI)
const QuizProductDesktopModal: React.FC<QuizProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    backdrop="blur"
    placement="center"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/50 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl shadow-2xl border border-neutral-200',
      header: 'border-b border-neutral-100 pb-4',
      body: 'p-0',
      closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800">¿Qué deseas hacer?</h2>
          <p className="text-sm text-neutral-500">Elige una opción</p>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <QuizModalContentShared
          product={product}
          onRequestEquipment={onRequestEquipment}
          onAddToCart={onAddToCart}
          onClose={onClose}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet (Framer Motion)
const QuizProductMobileModal: React.FC<QuizProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onRequestEquipment,
  onAddToCart,
}) => {
  const dragControls = useDragControls();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="quiz-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="quiz-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col"
          >
            {/* Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[rgba(var(--color-primary-rgb),0.1)] flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-800">
                    ¿Qué deseas hacer?
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Elige una opción
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-4 pb-8">
              <QuizModalContentShared
                product={product}
                onRequestEquipment={onRequestEquipment}
                onAddToCart={onAddToCart}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizResultsV1;
