'use client';

/**
 * FieldTooltip - Ayuda contextual en tooltip
 */

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface FieldTooltipProps {
  content: string;
  imageUrl?: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({
  content,
  imageUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64">
          <div className="bg-neutral-800 text-white text-sm rounded-lg p-3 shadow-lg">
            {/* Close on mobile */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="sm:hidden absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Ejemplo"
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <p>{content}</p>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-neutral-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldTooltip;
