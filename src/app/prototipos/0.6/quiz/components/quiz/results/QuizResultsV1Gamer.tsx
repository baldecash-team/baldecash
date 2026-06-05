'use client';

/**
 * QuizResultsV1Gamer - Resultados del quiz con tema gamer dark/light
 * Misma lógica que V1 pero con estética del GamerTheme.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import {
  Check, Star, ShoppingCart, RefreshCw, Sparkles,
  ChevronRight, ArrowRight, X,
} from 'lucide-react';
import { QuizResultsProps, QuizResult, QuizProduct } from '../../../types/quiz';
import { useIsMobile } from '@/app/prototipos/_shared';
import { useAnalytics } from '@/app/prototipos/0.6/analytics/useAnalytics';
import type { GamerTheme } from '@/app/prototipos/0.6/[landing]/catalogo/components/gamer/gamerTheme';

const F_RAJ = "'Rajdhani', sans-serif";
const F_ORB = "'Orbitron', sans-serif";

interface QuizResultsV1GamerProps extends QuizResultsProps {
  T: GamerTheme;
  isDark: boolean;
}

export const QuizResultsV1Gamer: React.FC<QuizResultsV1GamerProps> = ({
  results,
  onViewProduct,
  onRestartQuiz,
  onViewOtherOptions,
  onAddToCart,
  cartItems = [],
  T,
  isDark,
}) => {
  const isMobile = useIsMobile();
  const analytics = useAnalytics();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<QuizProduct | null>(null);

  const handleOpenModal = (product: QuizProduct) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductForModal(null);
  };

  const topResult = results[0];
  const secondaryResults = results.slice(1);

  if (!topResult) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <p style={{ color: T.textMuted, fontFamily: F_RAJ, marginBottom: 16 }}>No encontramos resultados</p>
        <button
          onClick={onRestartQuiz}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.textSecondary, fontFamily: F_RAJ, fontSize: 14, fontWeight: 600,
          }}
        >
          <RefreshCw size={14} />
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const formatRam = () => {
    const ram = topResult.product.specs?.ram;
    const ramType = topResult.product.specs?.ramType;
    if (!ram) return 'N/A';
    return ramType ? `${ram}GB ${ramType}` : `${ram}GB`;
  };

  const formatStorage = () => {
    const storage = topResult.product.specs?.storage;
    const storageType = topResult.product.specs?.storageType;
    if (!storage) return 'N/A';
    return `${storage}GB ${storageType || 'SSD'}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Success header */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: '50%',
            background: `${T.neonCyan}14`,
            marginBottom: 12,
          }}
        >
          <Sparkles size={28} style={{ color: T.neonCyan }} />
        </motion.div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, margin: '0 0 4px', fontFamily: F_RAJ }}>
          ¡Encontramos tu equipo ideal!
        </h2>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>
          Basado en tus respuestas, esta es nuestra recomendación
        </p>
      </motion.div>

      {/* Main product card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          borderRadius: 16, overflow: 'hidden',
          border: `2px solid ${T.neonCyan}`,
          boxShadow: `0 0 20px ${T.neonCyan}20`,
        }}
      >
        {/* Match badge header */}
        <div style={{
          background: T.neonCyan,
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={14} style={{ color: isDark ? '#0a0a0a' : '#fff', fill: 'currentColor' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#0a0a0a' : '#fff', fontFamily: F_RAJ }}>
              Perfecto para ti
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: isDark ? '#0a0a0a' : '#fff',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
            borderRadius: 6, padding: '2px 8px', fontFamily: F_RAJ,
          }}>
            {topResult.matchScore}% match
          </span>
        </div>

        <div style={{ background: T.bgCard }}>
          {/* Product image */}
          <div style={{
            background: isDark ? '#111' : '#f5f5f5',
            padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={topResult.product.image}
              alt={topResult.product.name}
              style={{ width: 160, height: 160, objectFit: 'contain' }}
              loading="lazy"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23222'%3E%3Crect width='160' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='12'%3ESin imagen%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Product info */}
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.neonCyan, margin: '0 0 4px', fontFamily: F_RAJ, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {topResult.product.brand}
            </p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: '0 0 12px', fontFamily: F_RAJ }}>
              {topResult.product.displayName}
            </h3>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'RAM', value: formatRam() },
                { label: 'Almacenamiento', value: formatStorage() },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 10, padding: '8px 12px', textAlign: 'center',
                  border: `1px solid ${T.border}`,
                }}>
                  <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', fontFamily: F_RAJ }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, margin: 0, fontFamily: F_RAJ }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Match reasons */}
            {topResult.reasons.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {topResult.reasons.map((reason, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={13} style={{ color: T.neonCyan, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: F_RAJ }}>{reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              marginBottom: 14, paddingBottom: 14,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <div>
                <p style={{ fontSize: 11, color: T.textMuted, margin: '0 0 2px', fontFamily: F_RAJ }}>Desde</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: T.neonCyan, fontFamily: F_ORB }}>
                    S/{topResult.product.lowestQuota}
                  </span>
                  <span style={{ fontSize: 13, color: T.textMuted, fontFamily: F_RAJ }}>/mes</span>
                </div>
                <p style={{ fontSize: 10, color: T.textMuted, margin: '2px 0 0', fontFamily: F_RAJ }}>
                  {topResult.product.termMonths} meses · {topResult.product.initialPercent}% inicial
                </p>
              </div>
              <p style={{ fontSize: 12, color: T.textMuted, fontFamily: F_RAJ }}>
                Total: S/{topResult.product.price.toLocaleString('en-US')}
              </p>
            </div>

            {/* CTA */}
            {(() => {
              const isInCart = !!onAddToCart && cartItems.includes(topResult.product.id);
              return (
                <button
                  onClick={() => {
                    if (isInCart) return;
                    analytics.trackQuizResultClick({ product_id: topResult.product.id, position: 0 });
                    if (onAddToCart) {
                      handleOpenModal(topResult.product);
                    } else {
                      onViewProduct(topResult.product.id);
                    }
                  }}
                  disabled={isInCart}
                  style={{
                    width: '100%', height: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 15, fontWeight: 700, fontFamily: F_RAJ,
                    border: isInCart ? `1.5px solid ${T.neonCyan}` : 'none',
                    background: isInCart ? 'transparent' : T.neonCyan,
                    color: isInCart ? T.neonCyan : (isDark ? '#0a0a0a' : '#ffffff'),
                    borderRadius: 10, cursor: isInCart ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isInCart ? 'none' : `0 0 12px ${T.neonCyan}40`,
                  }}
                >
                  {isInCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                  {isInCart ? 'En el carrito' : 'Lo quiero'}
                </button>
              );
            })()}
          </div>
        </div>
      </motion.div>

      {/* Secondary results */}
      {secondaryResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p style={{ fontSize: 12, color: T.textMuted, margin: '0 0 10px', fontFamily: F_RAJ, fontWeight: 600 }}>
            TAMBIÉN TE PUEDEN INTERESAR:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {secondaryResults.map((result, index) => (
              <SecondaryCardGamer
                key={result.product.id}
                result={result}
                T={T}
                isDark={isDark}
                delay={0.5 + index * 0.1}
                isInCart={!!onAddToCart && cartItems.includes(result.product.id)}
                onOpenModal={onAddToCart ? (product) => {
                  analytics.trackQuizResultClick({ product_id: product.id, position: index + 1 });
                  handleOpenModal(product);
                } : undefined}
                onDirectSelect={!onAddToCart ? (productId) => {
                  analytics.trackQuizResultClick({ product_id: productId, position: index + 1 });
                  onViewProduct(productId);
                } : undefined}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Other options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + secondaryResults.length * 0.1 }}
        style={{ textAlign: 'center', paddingBottom: 8 }}
      >
        <button
          onClick={onViewOtherOptions || onRestartQuiz}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: T.textMuted, cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: F_RAJ,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.neonCyan; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = T.textMuted; }}
        >
          <RefreshCw size={13} />
          Ver más en el catálogo
        </button>
      </motion.div>

      {/* Cart selection modal */}
      {onAddToCart && selectedProductForModal && (
        isMobile ? (
          <GamerQuizMobileModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            T={T}
            isDark={isDark}
            onRequestEquipment={() => { onViewProduct(selectedProductForModal.id); handleCloseModal(); }}
            onAddToCart={() => { onAddToCart(selectedProductForModal); handleCloseModal(); }}
          />
        ) : (
          <GamerQuizDesktopModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={selectedProductForModal}
            T={T}
            isDark={isDark}
            onRequestEquipment={() => { onViewProduct(selectedProductForModal.id); handleCloseModal(); }}
            onAddToCart={() => { onAddToCart(selectedProductForModal); handleCloseModal(); }}
          />
        )
      )}
    </div>
  );
};

// ============================================================
// Secondary card
// ============================================================
const SecondaryCardGamer: React.FC<{
  result: QuizResult;
  T: GamerTheme;
  isDark: boolean;
  delay: number;
  isInCart: boolean;
  onOpenModal?: (product: QuizProduct) => void;
  onDirectSelect?: (productId: string) => void;
}> = ({ result, T, isDark, delay, isInCart, onOpenModal, onDirectSelect }) => {
  const { product, matchScore } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={() => {
          if (isInCart) return;
          if (onOpenModal) onOpenModal(product);
          else if (onDirectSelect) onDirectSelect(product.id);
        }}
        disabled={isInCart}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 14px', borderRadius: 12,
          background: T.bgCard,
          border: isInCart ? `1px solid ${T.neonCyan}50` : `1px solid ${T.border}`,
          cursor: isInCart ? 'default' : 'pointer',
          transition: 'border-color 0.2s',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => { if (!isInCart) (e.currentTarget as HTMLButtonElement).style.borderColor = T.neonCyan; }}
        onMouseLeave={(e) => { if (!isInCart) (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; }}
      >
        {/* Image */}
        <div style={{
          width: 64, height: 64, borderRadius: 10, flexShrink: 0,
          background: isDark ? '#111' : '#f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${T.border}`,
          overflow: 'hidden',
        }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.neonCyan, fontFamily: F_RAJ, textTransform: 'uppercase' }}>
              {product.brand}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: F_RAJ,
              color: T.neonCyan,
              background: `${T.neonCyan}14`,
              borderRadius: 4, padding: '1px 6px', flexShrink: 0,
            }}>
              {matchScore}%
            </span>
          </div>
          <p style={{
            fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: '0 0 6px',
            fontFamily: F_RAJ, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {product.displayName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: isInCart ? '#22c55e' : T.neonCyan, fontFamily: F_ORB }}>
                S/{product.lowestQuota}
              </span>
              <span style={{ fontSize: 11, color: T.textMuted, fontFamily: F_RAJ }}>/mes</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 700, fontFamily: F_RAJ,
              padding: '4px 10px', borderRadius: 6,
              background: isInCart ? '#22c55e' : T.neonCyan,
              color: isInCart ? '#fff' : (isDark ? '#0a0a0a' : '#fff'),
            }}>
              {isInCart ? <><span>En carrito</span><Check size={12} /></> : <><span>Lo quiero</span><ChevronRight size={12} /></>}
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
};

// ============================================================
// Cart selection modals (gamer theme)
// ============================================================
interface GamerQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: QuizProduct;
  T: GamerTheme;
  isDark: boolean;
  onRequestEquipment: () => void;
  onAddToCart: () => void;
}

const GamerQuizModalContent: React.FC<Omit<GamerQuizModalProps, 'isOpen'>> = ({
  product, T, isDark, onRequestEquipment, onAddToCart, onClose,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {/* Product preview */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 12, borderRadius: 12,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      border: `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 10, flexShrink: 0,
        background: isDark ? '#111' : '#f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <img src={product.thumbnail || product.image} alt={product.displayName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: T.neonCyan, fontFamily: F_RAJ, fontWeight: 600, margin: '0 0 2px', textTransform: 'uppercase' }}>{product.brand}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: F_RAJ, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.displayName}</p>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.neonCyan, fontFamily: F_ORB }}>S/{product.lowestQuota}</span>
        <span style={{ fontSize: 12, color: T.textMuted, fontFamily: F_RAJ }}>/mes</span>
      </div>
    </div>

    {/* Options */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => { onRequestEquipment(); onClose(); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
          background: T.neonCyan, border: 'none',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowRight size={22} style={{ color: isDark ? '#0a0a0a' : '#fff' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#0a0a0a' : '#fff', margin: 0, fontFamily: F_RAJ }}>Solicitar equipo</p>
          <p style={{ fontSize: 12, color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)', margin: 0, fontFamily: F_RAJ }}>Iniciar proceso de solicitud ahora</p>
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onAddToCart}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
          background: 'transparent', border: `1.5px solid ${T.border}`,
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShoppingCart size={20} style={{ color: T.textSecondary }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F_RAJ }}>Añadir al carrito</p>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>Guardar y seguir explorando</p>
        </div>
      </motion.button>
    </div>
  </div>
);

const GamerQuizDesktopModal: React.FC<GamerQuizModalProps> = ({ isOpen, onClose, product, T, isDark, onRequestEquipment, onAddToCart }) => (
  <Modal
    isOpen={isOpen} onClose={onClose} size="md" backdrop="blur" placement="center"
    classNames={{ wrapper: 'z-[200]', backdrop: 'bg-black/70 z-[199]', body: 'p-0', base: 'rounded-2xl' }}
  >
    <ModalContent style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.neonCyan}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingCart size={18} style={{ color: T.neonCyan }} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F_RAJ }}>¿Qué deseas hacer?</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>Elige una opción</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textSecondary }}>
          <X size={14} />
        </button>
      </div>
      <ModalBody style={{ padding: 20 }}>
        <GamerQuizModalContent product={product} T={T} isDark={isDark} onRequestEquipment={onRequestEquipment} onAddToCart={onAddToCart} onClose={onClose} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const GamerQuizMobileModal: React.FC<GamerQuizModalProps> = ({ isOpen, onClose, product, T, isDark, onRequestEquipment, onAddToCart }) => {
  const dragControls = useDragControls();
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div key="gqm-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9998 }} />
          <motion.div
            key="gqm-sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y" dragControls={dragControls} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 9999, border: `1px solid ${T.border}`, borderBottom: 'none', display: 'flex', flexDirection: 'column' }}
          >
            <div onPointerDown={(e) => dragControls.start(e)} style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', cursor: 'grab' }}>
              <div style={{ width: 40, height: 5, borderRadius: 3, background: T.border }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${T.neonCyan}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={16} style={{ color: T.neonCyan }} />
                </div>
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0, fontFamily: F_RAJ }}>¿Qué deseas hacer?</h2>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0, fontFamily: F_RAJ }}>Elige una opción</p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.textSecondary }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: '0 16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
              <GamerQuizModalContent product={product} T={T} isDark={isDark} onRequestEquipment={onRequestEquipment} onAddToCart={onAddToCart} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuizResultsV1Gamer;
