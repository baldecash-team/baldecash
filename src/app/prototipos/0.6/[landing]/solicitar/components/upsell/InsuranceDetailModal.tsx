'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { ShieldCheck, Lock, Check, Plus, X, Users, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';
import { isGamerLanding } from '@/app/prototipos/0.6/utils/theme';
import { useParams } from 'next/navigation';

interface InsuranceDetailModalProps {
  plan: InsurancePlan | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
  badgeText?: string | null;
}

function useGamerTheme() {
  const params = useParams<{ landing?: string }>();
  const landing = params?.landing ?? '';
  const isGamer = isGamerLanding(landing);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!isGamer) return;
    const read = () => {
      const saved = localStorage.getItem('baldecash-zona-gamer-theme');
      setIsDark(saved !== 'light');
    };
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, [isGamer]);

  return { isGamer, isDark };
}

const MODAL_CONFIG: Record<string, {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  coverageItems: string[];
  legalText?: string;
  conditionsText?: string;
}> = {
  garantia_extendida: {
    icon: ShieldCheck,
    title: 'Extensión de Garantía',
    description: 'Protección completa contra cualquier falla técnica o defecto de fábrica. Reparación o reposición gratuita.',
    coverageItems: [
      'Garantía extendida por 3 años adicionales',
      'Cobertura de fallas y defectos de fábrica',
      'Sin deducible ni franquicia',
      'Reparación en centros autorizados',
      'Cobertura válida a nivel mundial',
      'Gestión 100% digital sin papeleos',
    ],
    legalText: 'Baldecash podrá compartir los datos personales de sus clientes con Insurama Perú S.A.C. para fines de comercialización de productos de seguro.',
  },
  seguro_robo: {
    icon: Lock,
    title: 'Seguro contra Robo',
    description: 'Te devolvemos el valor completo de tu laptop en caso de robo. Protección nacional e internacional.',
    coverageItems: [
      'Cobertura contra robo y hurto mundial',
      'Sin deducible en caso de siniestro',
      'Reposición con equipo igual o similar',
      'Cobertura inmediata sin periodo de espera',
      'Proceso de reclamo 100% digital',
    ],
    legalText: 'Al contratar esta cobertura adicional, no adquieres un seguro a tu nombre. Balde K S.A.C. contrata una póliza contra robo con Insurama, respaldada por Protecta Compañía de Seguros S.A., entidad supervisada por la SBS, a nombre de Balde K. Con esta póliza como respaldo, Balde K se compromete contractualmente a reponer tu equipo en caso de robo, siempre que: estés al día en tus pagos, y presentes los documentos que la aseguradora solicite (por ejemplo, denuncia policial). Importante: La reposición se rige por los términos de la póliza (límites, exclusiones y deducibles aplicables) y puede realizarse con un equipo igual o equivalente.',
    conditionsText: 'Seguro contra Robo para Equipos Móviles o Portátiles, con código SBS N° RG0415900249, comercializado por Insurama Perú S.A.C. Contratación sujeta a evaluación de Insurama y/o La Positiva. Más información en baldecash.com/seguros',
  },
};

const DEFAULT_MODAL = MODAL_CONFIG.garantia_extendida;

function getModalConfig(type: string) {
  return MODAL_CONFIG[type] || DEFAULT_MODAL;
}

// Shared modal content
const ModalContentShared: React.FC<{
  plan: InsurancePlan;
  isSelected: boolean;
  onToggle: () => void;
  onClose: () => void;
  badgeText?: string | null;
  isGamer?: boolean;
  isDark?: boolean;
}> = ({ plan, isSelected, onToggle, onClose, badgeText, isGamer = false, isDark = true }) => {
  const config = getModalConfig(plan.insuranceType);
  const Icon = config.icon;
  const CYAN = isDark ? '#00ffd5' : '#00897a';

  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

  if (isGamer) {
    const bg = isDark ? '#141414' : '#f0f0f0';
    const cardBg = isDark ? '#1e1e1e' : '#ffffff';
    const border = isDark ? 'rgba(0,255,213,0.15)' : 'rgba(0,137,122,0.2)';
    const text = isDark ? '#f0f0f0' : '#1a1a1a';
    const muted = isDark ? '#a0a0a0' : '#666';
    const legalBg = isDark ? 'rgba(0,255,213,0.05)' : 'rgba(0,137,122,0.05)';

    return (
      <div className="flex flex-col" style={{ background: bg, color: text, fontFamily: "'Rajdhani', sans-serif" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)`, borderBottom: `1px solid ${border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: `rgba(0,255,213,0.1)`, border: `1px solid ${border}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 18, height: 18, color: CYAN }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: CYAN, fontFamily: "'Orbitron', sans-serif", letterSpacing: 1 }}>{config.title}</h2>
            <p style={{ fontSize: 11, color: muted, fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.name}</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{config.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px' }}>
            {config.coverageItems.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <Check style={{ width: 14, height: 14, color: CYAN, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: muted }}>{item}</span>
              </div>
            ))}
          </div>

          {(config.legalText || config.conditionsText) && (
            <details style={{ fontSize: 11 }}>
              <summary style={{ color: muted, cursor: 'pointer', userSelect: 'none' }}>Información legal</summary>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {config.legalText && (
                  <p style={{ color: muted, background: legalBg, borderRadius: 6, padding: 10, lineHeight: 1.7 }}>{config.legalText}</p>
                )}
                {config.conditionsText && (
                  <p style={{ color: isDark ? '#b8860b' : '#856404', background: isDark ? 'rgba(184,134,11,0.08)' : 'rgba(255,243,205,0.8)', borderRadius: 6, padding: 10, lineHeight: 1.7 }}>{config.conditionsText}</p>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Footer - Price + CTA */}
        <div style={{ padding: '4px 20px 20px' }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: CYAN, fontFamily: "'Orbitron', sans-serif" }}>
                S/ {formatMoneyNoDecimals(Math.floor(plan.monthlyPrice))}
              </span>
              <span style={{ fontSize: 11, color: muted }}>/mes</span>
            </div>
            <span style={{ fontSize: 11, color: muted }}>
              S/ {formatMoneyNoDecimals(plan.totalPrice)} · {plan.paymentMonths} cuotas
            </span>
          </div>

          <button
            onClick={handleToggleAndClose}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: "'Share Tech Mono', monospace", letterSpacing: 1,
              border: isSelected ? `1px solid ${border}` : 'none',
              background: isSelected ? 'transparent' : CYAN,
              color: isSelected ? muted : '#0e0e0e',
              transition: 'opacity 0.15s',
            }}
          >
            {isSelected ? (
              <><X style={{ width: 16, height: 16 }} /> QUITAR PROTECCIÓN</>
            ) : (
              <><Plus style={{ width: 16, height: 16 }} /> AGREGAR PROTECCIÓN</>
            )}
          </button>

          {badgeText && (
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 10, color: muted, marginTop: 12 }}>
              <Users style={{ width: 12, height: 12 }} />
              {badgeText}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-primary)] px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white">{config.title}</h2>
          <p className="text-xs text-white/60 truncate">{plan.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-neutral-600">
          {config.description}
        </p>

        {/* Coverage - compact two-column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {config.coverageItems.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
              <span className="text-xs text-neutral-600">{item}</span>
            </div>
          ))}
        </div>

        {/* Legal - collapsed */}
        {(config.legalText || config.conditionsText) && (
          <details className="group text-xs">
            <summary className="text-neutral-400 cursor-pointer hover:text-neutral-500 select-none">
              Información legal
            </summary>
            <div className="mt-2 space-y-2 text-[11px] leading-relaxed">
              {config.legalText && (
                <p className="text-neutral-400 bg-neutral-50 rounded-lg p-3">
                  {config.legalText}
                </p>
              )}
              {config.conditionsText && (
                <p className="text-amber-600/80 bg-amber-50/50 rounded-lg p-3">
                  {config.conditionsText}
                </p>
              )}
            </div>
          </details>
        )}

        {plan.insuranceType === 'garantia_extendida' && (
          <a
            href="https://baldecash.com/seguros"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            baldecash.com/seguros
          </a>
        )}
      </div>

      {/* Footer - Price + CTA */}
      <div className="px-5 pb-5 pt-1">
        <div className="bg-[rgba(var(--color-primary-rgb),0.05)] rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[var(--color-primary)]">
              S/ {formatMoneyNoDecimals(Math.floor(plan.monthlyPrice))}
            </span>
            <span className="text-xs text-neutral-500">/mes</span>
          </div>
          <span className="text-[11px] text-neutral-400">
            S/ {formatMoneyNoDecimals(plan.totalPrice)} · {plan.paymentMonths} cuotas
          </span>
        </div>

        <button
          onClick={handleToggleAndClose}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              : 'bg-[var(--color-primary)] text-white hover:brightness-90'
          }`}
        >
          {isSelected ? (
            <><X className="w-4 h-4" /> Quitar protección</>
          ) : (
            <><Plus className="w-4 h-4" /> Agregar protección</>
          )}
        </button>

        {badgeText && (
          <p className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 mt-3">
            <Users className="w-3 h-3" />
            {badgeText}
          </p>
        )}
      </div>
    </div>
  );
};

// Desktop Modal
const DesktopModal: React.FC<InsuranceDetailModalProps & { plan: InsurancePlan; isGamer: boolean; isDark: boolean }> = ({
  plan, isOpen, onClose, isSelected, onToggle, badgeText, isGamer, isDark,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    scrollBehavior="inside"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/60 backdrop-blur-sm z-[99]',
      base: `rounded-2xl overflow-hidden ${isGamer ? (isDark ? 'bg-[#141414]' : 'bg-[#f0f0f0]') : 'bg-white'}`,
      body: 'p-0',
      closeButton: `top-3 right-3 z-10 backdrop-blur cursor-pointer ${isGamer ? 'bg-black/30 hover:bg-black/50 text-[#00ffd5]' : 'bg-white/30 hover:bg-white/50 text-white'}`,
    }}
  >
    <ModalContent>
      <ModalBody>
        <ModalContentShared plan={plan} isSelected={isSelected} onToggle={onToggle} onClose={onClose} badgeText={badgeText} isGamer={isGamer} isDark={isDark} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet
const MobileBottomSheet: React.FC<InsuranceDetailModalProps & { isGamer: boolean; isDark: boolean }> = ({
  plan, isOpen, onClose, isSelected, onToggle, badgeText, isGamer, isDark,
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && plan;

  // Block body scroll while open — cleanup pattern ensures unlock always runs
  // on unmount OR when isOpen flips to false (same fix as LocationModal/CartDrawer).
  // The old if/else + return cleanup was double-unlocking and breaking scroll
  // when two drawers overlapped.
  const scrollYRef = useRef<number>(0);
  const didLockRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Only lock if not already locked by a parent/sibling drawer
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

  return (
    <AnimatePresence mode="wait">
      {shouldShow && plan && (
        <>
          <motion.div
            key="insurance-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ touchAction: 'none' }}
          />
          <motion.div
            key="insurance-sheet"
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
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-[9999] flex flex-col max-h-[80vh]"
            style={{ overscrollBehavior: 'contain', background: isGamer ? (isDark ? '#141414' : '#f0f0f0') : '#ffffff' }}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 rounded-full" style={{ background: isGamer ? 'rgba(0,255,213,0.3)' : '#d4d4d4' }} />
            </div>
            <div
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <ModalContentShared plan={plan} isSelected={isSelected} onToggle={onToggle} onClose={onClose} badgeText={badgeText} isGamer={isGamer} isDark={isDark} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const InsuranceDetailModal: React.FC<InsuranceDetailModalProps> = (props) => {
  const isMobile = useIsMobile();
  const { isGamer, isDark } = useGamerTheme();

  if (isMobile) return <MobileBottomSheet {...props} isGamer={isGamer} isDark={isDark} />;
  if (!props.plan) return null;
  return <DesktopModal {...props} plan={props.plan} isGamer={isGamer} isDark={isDark} />;
};

export default InsuranceDetailModal;
