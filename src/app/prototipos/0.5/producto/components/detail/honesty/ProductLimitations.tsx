'use client';

/**
 * ProductLimitations - Descriptive Limitations Display (basado en V6)
 * Simple descriptive layout focusing on content.
 */

import { AlertCircle, Info, Lightbulb } from 'lucide-react';
import { ProductLimitationsProps, ProductLimitation } from '../../../types/detail';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  Info,
};

export const ProductLimitations: React.FC<ProductLimitationsProps> = ({ limitations }) => {
  if (!limitations || limitations.length === 0) return null;

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#4654CD] rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Consideraciones importantes</h3>
          </div>
          <p className="text-sm text-gray-600 ml-14">
            Información que debes tener en cuenta antes de decidir
          </p>
        </div>

        {/* Limitation Items */}
        <div className="space-y-3">
          {limitations.map((limitation, index) => {
            const IconComponent = iconMap[limitation.icon] || Info;

            return (
              <div
                key={index}
                className={`
                  p-5 rounded-xl border-2 transition-all
                  ${limitation.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    limitation.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    <IconComponent
                      className={`w-5 h-5 ${
                        limitation.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">
                      {limitation.category}
                    </h4>

                    <p className="text-sm leading-relaxed text-gray-700">
                      {limitation.description}
                    </p>

                    {limitation.alternative && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-[#4654CD]/30 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-[#4654CD] mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          <span className="font-semibold text-[#4654CD]">Alternativa:</span>{' '}
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
      </div>
    </div>
  );
};

export default ProductLimitations;
