'use client';

import { useState } from 'react';
import { AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

export interface ProductLimitation {
  category: string;
  description: string;
  severity: 'info' | 'warning';
  alternative?: string;
  icon: string;
}

export interface ProductLimitationsProps {
  limitations: ProductLimitation[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  Info,
};

export default function ProductLimitationsV6({ limitations }: ProductLimitationsProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!limitations || limitations.length === 0) return null;

  const handleToggle = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const allChecked = limitations.every((_, index) => checkedItems[index]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#4654CD] rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">¿Es para ti?</h3>
          </div>
          <p className="text-sm text-gray-600 ml-14">
            Marca cada consideración que hayas revisado
          </p>

          {/* Progress */}
          <div className="mt-4 ml-14">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#4654CD] h-full transition-all duration-300"
                  style={{ width: `${(checkedCount / limitations.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {checkedCount}/{limitations.length}
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3">
          {limitations.map((limitation, index) => {
            const IconComponent = iconMap[limitation.icon] || Info;
            const isChecked = checkedItems[index] || false;

            return (
              <div
                key={index}
                onClick={() => handleToggle(index)}
                className={`
                  p-5 rounded-xl border-2 cursor-pointer transition-all
                  ${isChecked
                    ? 'bg-white border-[#4654CD] shadow-md'
                    : limitation.severity === 'warning'
                      ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                      : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="mt-0.5">
                    {isChecked ? (
                      <CheckCircle className="w-6 h-6 text-[#4654CD] fill-current" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <IconComponent
                        className={`w-5 h-5 mt-0.5 ${
                          limitation.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                        }`}
                      />
                      <h4 className={`font-bold ${isChecked ? 'text-gray-800' : 'text-gray-700'}`}>
                        {limitation.category}
                      </h4>
                    </div>

                    <p className={`text-sm leading-relaxed ml-8 ${
                      isChecked ? 'text-gray-600' : 'text-gray-700'
                    }`}>
                      {limitation.description}
                    </p>

                    {limitation.alternative && (
                      <div className="mt-3 ml-8 p-3 bg-white rounded-lg border border-[#4654CD]/30">
                        <p className="text-sm">
                          <span className="font-semibold text-[#4654CD]">💡 Alternativa:</span>{' '}
                          <span className="text-gray-700">{limitation.alternative}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Message */}
        {allChecked && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 fill-current" />
              <p className="text-sm font-semibold text-green-800">
                ¡Genial! Has revisado todas las consideraciones importantes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
