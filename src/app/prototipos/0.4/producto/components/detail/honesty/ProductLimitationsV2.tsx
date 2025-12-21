'use client';

import { AlertCircle, Info } from 'lucide-react';

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

export default function ProductLimitationsV2({ limitations }: ProductLimitationsProps) {
  if (!limitations || limitations.length === 0) return null;

  const getSeverityColors = (severity: 'info' | 'warning') => {
    return severity === 'warning'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-blue-50 border-blue-200';
  };

  const getSeverityTextColors = (severity: 'info' | 'warning') => {
    return severity === 'warning' ? 'text-amber-700' : 'text-blue-700';
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-6 h-6 text-gray-700" />
          <h3 className="text-xl font-bold text-gray-800">Considera que...</h3>
        </div>

        <div className="space-y-4">
          {limitations.map((limitation, index) => {
            const IconComponent = iconMap[limitation.icon] || Info;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColors(limitation.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${limitation.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <IconComponent className={`w-5 h-5 ${getSeverityTextColors(limitation.severity)}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${getSeverityTextColors(limitation.severity)}`}>
                      {limitation.category}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {limitation.description}
                    </p>
                    {limitation.alternative && (
                      <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="text-[#4654CD]">💡 Alternativa:</span> {limitation.alternative}
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
}
