'use client';

import { useState } from 'react';
import { Tabs, Tab, Select, SelectItem } from '@nextui-org/react';

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

const TERMS = [12, 18, 24, 36, 48];
const INITIAL_PAYMENT_OPTIONS = [
  { value: '0', label: '0%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
  { value: '30', label: '30%' },
];

export default function PricingCalculatorV1({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm.toString());
  const [initialPayment, setInitialPayment] = useState('0');

  const calculateQuota = () => {
    const initialPercent = parseInt(initialPayment);
    if (initialPercent === 0) return monthlyQuota;

    // Adjust quota based on initial payment
    const reduction = (monthlyQuota * initialPercent) / 100 / parseInt(selectedTerm);
    return monthlyQuota - reduction;
  };

  const calculatedQuota = calculateQuota();
  const calculatedOriginalQuota = originalQuota
    ? originalQuota - ((originalQuota * parseInt(initialPayment)) / 100 / parseInt(selectedTerm))
    : undefined;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-semibold text-neutral-800 mb-6">
        Calcula tu cuota mensual
      </h3>

      {/* Term Selection - Compact Tabs */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Selecciona el plazo
        </label>
        <Tabs
          selectedKey={selectedTerm}
          onSelectionChange={(key) => setSelectedTerm(key.toString())}
          variant="bordered"
          classNames={{
            tabList: 'gap-2 w-full',
            tab: 'h-10 cursor-pointer',
            cursor: 'bg-[#4654CD]',
          }}
        >
          {TERMS.map((term) => (
            <Tab key={term.toString()} title={`${term} meses`} />
          ))}
        </Tabs>
      </div>

      {/* Quota Display */}
      <div className="mb-6 text-center py-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        {calculatedOriginalQuota && (
          <p className="line-through text-neutral-400 text-xl mb-1">
            S/{calculatedOriginalQuota.toFixed(2)}/mes
          </p>
        )}
        <p className="text-4xl font-bold text-[#4654CD]">
          S/{calculatedQuota.toFixed(2)}/mes
        </p>
        <p className="text-sm text-neutral-500 mt-2">x {selectedTerm} meses</p>
      </div>

      {/* Initial Payment Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Cuota inicial (opcional)
        </label>
        <Select
          selectedKeys={[initialPayment]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;
            setInitialPayment(value);
          }}
          placeholder="Selecciona cuota inicial"
          classNames={{
            trigger: 'cursor-pointer',
          }}
        >
          {INITIAL_PAYMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {parseInt(initialPayment) > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Con {initialPayment}% de cuota inicial, pagas menos cada mes
          </p>
        </div>
      )}
    </div>
  );
}
