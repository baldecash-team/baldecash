'use client';

import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react';
import { ShieldCheck, Lock, Check, Plus, X, ExternalLink, Users } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';
import { useIsMobile } from '@/app/prototipos/_shared';

interface InsuranceDetailModalProps {
  plan: InsurancePlan | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggle: () => void;
  badgeText?: string | null;
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
}> = ({ plan, isSelected, onToggle, onClose, badgeText }) => {
  const config = getModalConfig(plan.insuranceType);
  const Icon = config.icon;

  const handleToggleAndClose = () => {
    onToggle();
    onClose();
  };

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
const DesktopModal: React.FC<InsuranceDetailModalProps & { plan: InsurancePlan }> = ({
  plan, isOpen, onClose, isSelected, onToggle, badgeText,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="md"
    scrollBehavior="inside"
    classNames={{
      wrapper: 'z-[100]',
      backdrop: 'bg-black/60 backdrop-blur-sm z-[99]',
      base: 'bg-white rounded-2xl overflow-hidden',
      body: 'p-0',
      closeButton: 'top-3 right-3 z-10 bg-white/30 backdrop-blur hover:bg-white/50 text-white cursor-pointer',
    }}
  >
    <ModalContent>
      <ModalBody>
        <ModalContentShared plan={plan} isSelected={isSelected} onToggle={onToggle} onClose={onClose} badgeText={badgeText} />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Mobile Bottom Sheet
const MobileBottomSheet: React.FC<InsuranceDetailModalProps> = ({
  plan, isOpen, onClose, isSelected, onToggle, badgeText,
}) => {
  const dragControls = useDragControls();
  const shouldShow = isOpen && plan;

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
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
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[9999] flex flex-col max-h-[80vh]"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-neutral-300 rounded-full" />
            </div>
            <div
              className="flex-1 overflow-y-auto"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <ModalContentShared plan={plan} isSelected={isSelected} onToggle={onToggle} onClose={onClose} badgeText={badgeText} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const InsuranceDetailModal: React.FC<InsuranceDetailModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) return <MobileBottomSheet {...props} />;
  if (!props.plan) return null;
  return <DesktopModal {...props} plan={props.plan} />;
};

export default InsuranceDetailModal;
