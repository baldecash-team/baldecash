'use client';

import { useState } from 'react';
import { AlertCircle, Info, ChevronRight, X } from 'lucide-react';

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

export default function ProductLimitationsV5({ limitations }: ProductLimitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!limitations || limitations.length === 0) return null;

  const getSeverityColors = (severity: 'info' | 'warning') => {
    return severity === 'warning'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          w-full flex items-center justify-between gap-3 p-4
          bg-gray-100 hover:bg-gray-200 rounded-lg
          border-2 border-gray-300 transition-colors cursor-pointer
        "
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-800">Consideraciones importantes</h4>
            <p className="text-sm text-gray-600">{limitations.length} limitaciones a considerar</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Side Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-7 h-7" />
                  <h3 className="text-2xl font-bold">Consideraciones</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-white/90">
                Revisa estos puntos antes de tomar tu decisión
              </p>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-140px)] overflow-y-auto p-6">
              <div className="space-y-4">
                {limitations.map((limitation, index) => {
                  const IconComponent = iconMap[limitation.icon] || Info;

                  return (
                    <div
                      key={index}
                      className={`p-5 rounded-xl border-2 ${getSeverityColors(limitation.severity)} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${limitation.severity === 'warning' ? 'bg-amber-200' : 'bg-blue-200'}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2">{limitation.category}</h4>
                          <p className="text-sm leading-relaxed mb-3">
                            {limitation.description}
                          </p>
                          {limitation.alternative && (
                            <div className="mt-3 p-3 bg-white rounded-lg border-2 border-[#4654CD]/30">
                              <p className="text-sm font-semibold text-gray-800">
                                <span className="text-[#4654CD]">💡 Alternativa:</span>
                                <br />
                                <span className="font-normal">{limitation.alternative}</span>
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

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-[#4654CD] text-white rounded-lg font-semibold hover:bg-[#3544BD] transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
