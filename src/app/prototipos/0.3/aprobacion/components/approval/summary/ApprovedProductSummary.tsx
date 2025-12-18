'use client';

/**
 * ApprovedProductSummary - Resumen del producto aprobado
 *
 * F.7: Tres versiones de visualizacion
 * V1: Card con producto + cuota + plazo
 * V2: Solo texto resumen
 * V3: Expandible "Ver detalles"
 */

import React, { useState } from 'react';
import { Card, CardBody, Divider, Button } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Laptop, Package, Shield } from 'lucide-react';
import { ApprovalData, ApprovalConfig } from '../../../types/approval';

interface ApprovedProductSummaryProps {
  data: ApprovalData;
  version: ApprovalConfig['summaryVersion'];
}

export const ApprovedProductSummary: React.FC<ApprovedProductSummaryProps> = ({
  data,
  version,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // V1: Full card with image
  if (version === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-neutral-200 shadow-sm">
          <CardBody className="p-4">
            <div className="flex gap-4">
              {/* Product image */}
              <div className="w-24 h-24 flex-shrink-0 bg-neutral-50 rounded-lg p-2 flex items-center justify-center">
                <img
                  src={data.product.thumbnail}
                  alt={data.product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <Laptop className="w-12 h-12 text-neutral-300 hidden" />
              </div>

              {/* Product details */}
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-800 mb-1">
                  {data.product.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                    S/{data.totalMonthlyQuota}
                  </span>
                  <span className="text-neutral-500">/mes</span>
                </div>
                <p className="text-sm text-neutral-500">
                  {data.product.term} cuotas - Total S/
                  {data.product.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Accessories and insurance */}
            {(data.accessories?.length || data.insurance) && (
              <>
                <Divider className="my-3" />
                <div className="space-y-2">
                  {data.accessories?.map((acc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Package className="w-4 h-4" />
                        <span>{acc.name}</span>
                      </div>
                      <span className="text-neutral-500">+S/{acc.monthlyQuota}/mes</span>
                    </div>
                  ))}
                  {data.insurance && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Shield className="w-4 h-4" />
                        <span>{data.insurance.name}</span>
                      </div>
                      <span className="text-neutral-500">
                        +S/{data.insurance.monthlyPrice}/mes
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // V2: Text summary only
  if (version === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center p-4 bg-neutral-50 rounded-xl"
      >
        <p className="text-neutral-700">
          <span className="font-semibold">{data.product.name}</span>
          {' - '}
          <span className="text-[#4654CD] font-bold font-['Baloo_2']">
            S/{data.totalMonthlyQuota}/mes
          </span>
          {' en '}
          <span className="font-medium">{data.product.term} cuotas</span>
        </p>
        {data.accessories?.length && (
          <p className="text-sm text-neutral-500 mt-1">
            + {data.accessories.length} accesorio
            {data.accessories.length > 1 ? 's' : ''}
            {data.insurance && ' + seguro'}
          </p>
        )}
      </motion.div>
    );
  }

  // V3: Expandable details
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-neutral-50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-neutral-200">
            <Laptop className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-neutral-800">{data.product.name}</p>
            <p className="text-[#4654CD] font-bold font-['Baloo_2']">
              S/{data.totalMonthlyQuota}/mes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <span className="text-sm">Ver detalles</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white border border-t-0 border-neutral-200 rounded-b-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Producto</span>
                <span className="font-medium">S/{data.product.monthlyQuota}/mes</span>
              </div>
              {data.accessories?.map((acc, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{acc.name}</span>
                  <span className="font-medium">+S/{acc.monthlyQuota}/mes</span>
                </div>
              ))}
              {data.insurance && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{data.insurance.name}</span>
                  <span className="font-medium">+S/{data.insurance.monthlyPrice}/mes</span>
                </div>
              )}
              <Divider />
              <div className="flex justify-between">
                <span className="font-semibold">Total mensual</span>
                <span className="font-bold text-[#4654CD] font-['Baloo_2']">
                  S/{data.totalMonthlyQuota}/mes
                </span>
              </div>
              <p className="text-xs text-neutral-500 text-center">
                {data.product.term} cuotas - Total S/
                {data.product.totalAmount.toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApprovedProductSummary;
