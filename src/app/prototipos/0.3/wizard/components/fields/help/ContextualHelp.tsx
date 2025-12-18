'use client';

/**
 * ContextualHelp - Ayuda expandible
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ContextualHelpProps {
  title?: string;
  content: string;
  defaultExpanded?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title = '¿Necesitas ayuda?',
  content,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#4654CD]" />
          <span className="text-sm font-medium text-neutral-700">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
          <p className="text-sm text-neutral-600">{content}</p>
        </div>
      )}
    </div>
  );
};

export default ContextualHelp;
