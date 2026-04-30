'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal, ModalContent, ModalBody } from '@nextui-org/react';
import { X, Check, Plus, Package, Users, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { Accessory } from '@/app/prototipos/0.6/[landing]/solicitar/types/upsell';
import { formatMoneyNoDecimals } from '@/app/prototipos/0.6/[landing]/solicitar/utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface GamerTheme {
  bg: string;
  bgCard: string;
  bgSurface: string;
  neonCyan: string;
  neonPurple: string;
  neonRed?: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

const F_RAJ = "'Rajdhani', sans-serif";

interface GamerAccessoryDetailModalProps {
  accessory: Accessory | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
  badgeText?: string | null;
  T: GamerTheme;
  isDark: boolean;
}

function parseDescriptionBullets(description: string): string[] {
  // Solo dividir en bullets si la descripción trae saltos de línea explícitos.
  // Párrafos continuos se respetan como párrafo plano (no se trocean en oraciones).
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);
  if (lines.length >= 2) return lines.slice(0, 6);
  return [];
}

const ModalContentShared: React.FC<{
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
  badgeText?: string | null;
  T: GamerTheme;
  isDark: boolean;
  hideHeader?: boolean;
}> = ({ accessory, isSelected, onToggle, onClose, badgeText, T, isDark, hideHeader }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

  const bullets = parseDescriptionBullets(accessory.description ?? '');
  const hasBullets = bullets.length >= 2;
  const term = accessory.term || 24;
  const hasSpecs = !!(accessory.specs && accessory.specs.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {!hideHeader && (
        <div
          style={{
            background: T.bgSurface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${T.neonCyan}1F`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={20} style={{ color: T.neonCyan }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.textPrimary,
                margin: 0,
                fontFamily: F_RAJ,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {accessory.name}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: T.textMuted,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {accessory.brand?.name || accessory.category?.name || ''}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle del accesorio"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              color: T.textSecondary,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <img
            src={accessory.image || accessory.thumbnailUrl}
            alt={accessory.name}
            style={{ maxHeight: 112, maxWidth: '100%', objectFit: 'contain' }}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {hasBullets ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: 8 }}>
            {bullets.map((bullet, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check size={14} style={{ color: T.neonCyan, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{bullet}</span>
              </div>
            ))}
          </div>
        ) : accessory.description ? (
          <p
            style={{
              fontSize: 13,
              color: T.textSecondary,
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-line',
            }}
          >
            {accessory.description}
          </p>
        ) : null}

        {hasSpecs && (
          <>
            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {accessory.specs!.map((spec) => (
                  <div
                    key={spec.label}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        background: T.neonCyan,
                        borderRadius: 1,
                        marginTop: 7,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
                      <strong style={{ color: T.textPrimary, fontWeight: 600 }}>
                        {spec.label}:
                      </strong>{' '}
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: 'transparent',
                border: 'none',
                color: T.neonCyan,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: F_RAJ,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                alignSelf: 'flex-end',
                marginTop: -10,
              }}
            >
              {expanded ? 'Ver menos' : 'Ver más detalles'}
              <ChevronDown
                size={14}
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
          </>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: 20,
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <div
          style={{
            background: `${T.neonCyan}14`,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: T.neonCyan, fontFamily: F_RAJ }}>
              S/ {formatMoneyNoDecimals(Math.floor(accessory.monthlyQuota))}
            </span>
            <span style={{ fontSize: 14, color: T.textMuted, marginLeft: 4 }}>/mes</span>
          </div>
          <span style={{ fontSize: 12, color: T.textMuted }}>
            S/ {formatMoneyNoDecimals(Math.floor(accessory.price))} · {term} cuotas
          </span>
        </div>

        <button
          onClick={handleToggleAndClose}
          style={{
            width: '100%',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: F_RAJ,
            border: isSelected ? `1.5px solid ${T.neonCyan}` : 'none',
            background: isSelected ? 'transparent' : T.neonCyan,
            color: isSelected ? T.neonCyan : isDark ? '#0a0a0a' : '#ffffff',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, border 0.2s',
          }}
        >
          {isSelected ? <X size={16} /> : <Plus size={16} />}
          {isSelected ? 'Quitar accesorio' : 'Agregar accesorio'}
        </button>

        {badgeText && (
          <p
            style={{
              fontSize: 12,
              color: T.textMuted,
              textAlign: 'center',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Users size={14} />
            {badgeText}
          </p>
        )}
      </div>
    </div>
  );
};

const DesktopModal: React.FC<GamerAccessoryDetailModalProps & { accessory: Accessory }> = ({
  accessory,
  isOpen,
  onClose,
  isSelected,
  onToggle,
  badgeText,
  T,
  isDark,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    placement="center"
    scrollBehavior="inside"
    classNames={{
      wrapper: 'z-[200] py-8',
      backdrop: 'bg-black/60 backdrop-blur-sm z-[199]',
      base: `rounded-2xl max-h-[calc(100vh-8rem)] ${isDark ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-[#e0e0e0]'}`,
      body: 'p-0 flex flex-col',
      closeButton: 'hidden',
    }}
  >
    <ModalContent style={{ marginTop: 'auto', marginBottom: 'auto' }}>
      <ModalBody style={{ padding: 0, flex: 1, minHeight: 0 }}>
        <ModalContentShared
          accessory={accessory}
          isSelected={isSelected}
          onToggle={onToggle}
          onClose={onClose}
          badgeText={badgeText}
          T={T}
          isDark={isDark}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const MobileBottomSheet: React.FC<GamerAccessoryDetailModalProps> = ({
  accessory,
  isOpen,
  onClose,
  isSelected,
  onToggle,
  badgeText,
  T,
  isDark,
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && accessory;

  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (document.body.style.position !== 'fixed') {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      didLockRef.current = true;
    }

    return () => {
      if (!didLockRef.current) return;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current);
      didLockRef.current = false;
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {shouldShow && (
        <>
          <motion.div
            key="gamer-accessory-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 10000,
              touchAction: 'none',
            }}
          />

          <motion.div
            key="gamer-accessory-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: T.bgCard,
              color: T.textPrimary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              border: `1px solid ${T.border}`,
              borderBottom: 'none',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '50vh',
              maxHeight: '70vh',
              overscrollBehavior: 'contain',
            }}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '12px 0',
                cursor: 'grab',
              }}
            >
              <div style={{ width: 40, height: 4, background: T.border, borderRadius: 999 }} />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: `${T.neonCyan}1F`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Package size={16} style={{ color: T.neonCyan }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.textPrimary,
                      margin: 0,
                      fontFamily: F_RAJ,
                    }}
                  >
                    Características
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: T.textMuted,
                      margin: 0,
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {accessory!.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: T.textSecondary,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ModalContentShared
                accessory={accessory!}
                isSelected={isSelected}
                onToggle={onToggle}
                onClose={onClose}
                badgeText={badgeText}
                T={T}
                isDark={isDark}
                hideHeader
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const GamerAccessoryDetailModal: React.FC<GamerAccessoryDetailModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileBottomSheet {...props} />;
  }

  if (!props.accessory) return null;
  return <DesktopModal {...props} accessory={props.accessory} />;
};

export default GamerAccessoryDetailModal;
