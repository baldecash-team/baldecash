'use client';

import { useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';

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

export default function ProductLimitationsV4({ limitations }: ProductLimitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!limitations || limitations.length === 0) return null;

  const getSeverityColors = (severity: 'info' | 'warning') => {
    return severity === 'warning'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <>
      {/* Floating Badge */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="
            flex items-center gap-2 px-5 py-3
            bg-[#4654CD] text-white rounded-full shadow-lg
            hover:bg-[#3544BD] transition-all transform hover:scale-105
            cursor-pointer font-semibold
          "
        >
          <AlertCircle className="w-5 h-5" />
          <span>Info importante</span>
          {limitations.length > 0 && (
            <span className="bg-white text-[#4654CD] rounded-full px-2 py-0.5 text-xs font-bold">
              {limitations.length}
            </span>
          )}
        </button>
      </div>

      {/* Overlay Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#4654CD] to-[#5664DD] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-7 h-7" />
                    <h3 className="text-2xl font-bold">Información importante</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm mt-2 text-white/90">
                  Considera estas limitaciones antes de tu decisión
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="space-y-4">
                  {limitations.map((limitation, index) => {
                    const IconComponent = iconMap[limitation.icon] || Info;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${getSeverityColors(limitation.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{limitation.category}</h4>
                            <p className="text-sm mb-2">{limitation.description}</p>
                            {limitation.alternative && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-current/30">
                                <p className="text-sm font-medium">
                                  💡 Alternativa: {limitation.alternative}
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
          </div>
        </>
      )}
    </>
  );
}
