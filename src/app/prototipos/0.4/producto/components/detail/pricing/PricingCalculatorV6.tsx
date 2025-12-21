'use client';

import { useState } from 'react';
import { Button, Select, SelectItem } from '@nextui-org/react';

export interface PricingCalculatorProps {
  monthlyQuota: number;
  originalQuota?: number;
  defaultTerm?: number;
}

const TERMS = [12, 18, 24, 36, 48];
const INITIAL_PAYMENT_OPTIONS = [
  { value: '0', label: '0%', color: 'bg-neutral-100' },
  { value: '10', label: '10%', color: 'bg-blue-100' },
  { value: '20', label: '20%', color: 'bg-green-100' },
  { value: '30', label: '30%', color: 'bg-purple-100' },
];

export default function PricingCalculatorV6({
  monthlyQuota,
  originalQuota,
  defaultTerm = 36,
}: PricingCalculatorProps) {
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [initialPayment, setInitialPayment] = useState('0');
  const [step, setStep] = useState(1);

  const calculateQuota = () => {
    const initialPercent = parseInt(initialPayment);
    if (initialPercent === 0) return monthlyQuota;

    const reduction = (monthlyQuota * initialPercent) / 100 / selectedTerm;
    return monthlyQuota - reduction;
  };

  const calculatedQuota = calculateQuota();
  const calculatedOriginalQuota = originalQuota
    ? originalQuota - ((originalQuota * parseInt(initialPayment)) / 100 / selectedTerm)
    : undefined;

  // Calculate progress
  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  // Calculate savings
  const savings = originalQuota
    ? ((originalQuota - calculatedQuota) / originalQuota) * 100
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-neutral-800">
            Calcula tu cuota mensual
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Paso {step} de {totalSteps}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4654CD] to-[#6B7AE5] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1: Term Selection */}
      {step === 1 && (
        <div className="mb-6 animate-fade-in">
          <label className="block text-lg font-medium text-neutral-700 mb-4">
            ¿En cuánto tiempo quieres pagarlo?
          </label>
          <div className="grid grid-cols-5 gap-3">
            {TERMS.map((term) => {
              const isSelected = selectedTerm === term;
              return (
                <button
                  key={term}
                  onClick={() => {
                    setSelectedTerm(term);
                    setTimeout(() => setStep(2), 300);
                  }}
                  className={`
                    relative p-6 rounded-xl cursor-pointer transition-all duration-300
                    ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#4654CD] to-[#3644BD] text-white shadow-xl scale-110'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:scale-105'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">{term}</p>
                    <p className="text-xs opacity-80">meses</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Initial Payment */}
      {step === 2 && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-medium text-neutral-700">
              ¿Cuánto quieres dar de inicial?
            </label>
            <Button
              size="sm"
              variant="light"
              onClick={() => setStep(1)}
              className="cursor-pointer text-[#4654CD]"
            >
              ← Cambiar plazo
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {INITIAL_PAYMENT_OPTIONS.map((option) => {
              const isSelected = initialPayment === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setInitialPayment(option.value)}
                  className={`
                    relative p-6 rounded-xl cursor-pointer transition-all duration-300
                    ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#4654CD] to-[#3644BD] text-white shadow-xl scale-110'
                        : `${option.color} hover:scale-105 text-neutral-700`
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">{option.value}</p>
                    <p className="text-xs opacity-80">por ciento</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {step === 2 && (
        <div className="mt-8 animate-fade-in">
          {/* Main Quote Display */}
          <div className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-[#4654CD]/20 mb-6">
            <div className="text-center">
              <p className="text-sm uppercase tracking-wide text-neutral-600 mb-2">
                Tu cuota mensual será
              </p>

              {calculatedOriginalQuota && (
                <div className="mb-2">
                  <p className="line-through text-neutral-400 text-2xl">
                    S/{calculatedOriginalQuota.toFixed(2)}/mes
                  </p>
                  {savings > 0 && (
                    <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      Ahorras {savings.toFixed(0)}%
                    </span>
                  )}
                </div>
              )}

              <p className="text-5xl font-bold text-[#4654CD] mb-2">
                S/{calculatedQuota.toFixed(2)}
              </p>

              <p className="text-neutral-600">
                durante <span className="font-bold text-[#4654CD]">{selectedTerm} meses</span>
              </p>
            </div>
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border-2 border-green-200 rounded-xl text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-xs text-neutral-600 mb-1">Plazo elegido</p>
              <p className="text-lg font-bold text-neutral-800">{selectedTerm} meses</p>
            </div>

            <div className="p-4 bg-white border-2 border-blue-200 rounded-xl text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-xs text-neutral-600 mb-1">Cuota inicial</p>
              <p className="text-lg font-bold text-neutral-800">{initialPayment}%</p>
            </div>

            <div className="p-4 bg-white border-2 border-purple-200 rounded-xl text-center">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-xs text-neutral-600 mb-1">Ahorro total</p>
              <p className="text-lg font-bold text-green-600">
                S/{((monthlyQuota - calculatedQuota) * selectedTerm).toFixed(0)}
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          {parseInt(initialPayment) > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <p className="text-center text-green-800 font-medium">
                ¡Excelente decisión! Con {initialPayment}% de inicial, pagas menos cada mes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Hint for Step 1 */}
      {step === 1 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Selecciona un plazo para continuar
          </p>
        </div>
      )}
    </div>
  );
}
