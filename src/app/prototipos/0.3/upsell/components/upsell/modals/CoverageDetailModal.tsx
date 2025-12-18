'use client';

/**
 * CoverageDetailModal - Detalles de cobertura del seguro
 *
 * Muestra informacion detallada de que cubre y que no cubre
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Droplet,
  Search,
  Clock,
  FileText,
} from 'lucide-react';
import { InsurancePlan } from '../../../types/upsell';

interface CoverageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InsurancePlan | null;
  onSelectPlan?: () => void;
}

const getIconComponent = (iconName: string, className: string) => {
  const icons: Record<string, React.ReactNode> = {
    Shield: <Shield className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    Droplet: <Droplet className={className} />,
    Search: <Search className={className} />,
    Clock: <Clock className={className} />,
  };
  return icons[iconName] || <Shield className={className} />;
};

export const CoverageDetailModal: React.FC<CoverageDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSelectPlan,
}) => {
  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        backdrop: 'bg-black/50',
        base: 'border border-neutral-200',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#4654CD]" />
            <span>{plan.name}</span>
          </div>
          <p className="text-sm font-normal text-neutral-500">
            S/{plan.monthlyPrice}/mes - S/{plan.yearlyPrice}/ano
          </p>
        </ModalHeader>

        <ModalBody className="py-4">
          {/* Coverage Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Que cubre este plan
            </h4>
            <div className="space-y-3">
              {plan.coverage.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      {getIconComponent(item.icon, 'w-4 h-4 text-green-600')}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-green-800">{item.name}</h5>
                      <p className="text-sm text-green-600 mt-0.5">
                        {item.description}
                      </p>
                      {item.maxAmount && (
                        <p className="text-xs text-green-500 mt-1">
                          Cobertura maxima: S/{item.maxAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Exclusions Section */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500" />
              Que NO cubre
            </h4>
            <div className="space-y-2">
              {plan.exclusions.map((exclusion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"
                >
                  <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-700">{exclusion}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Terms note */}
          <div className="mt-6 p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-neutral-600">
                  Los terminos y condiciones completos estan disponibles en el
                  contrato de seguro. El seguro es proporcionado por nuestra
                  aseguradora asociada.
                </p>
                <button className="text-xs text-[#4654CD] hover:underline mt-1 cursor-pointer">
                  Ver terminos completos
                </button>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} className="cursor-pointer">
            Cerrar
          </Button>
          {onSelectPlan && (
            <Button
              color="primary"
              className="bg-[#4654CD] cursor-pointer"
              onPress={() => {
                onSelectPlan();
                onClose();
              }}
            >
              Seleccionar este plan
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CoverageDetailModal;
