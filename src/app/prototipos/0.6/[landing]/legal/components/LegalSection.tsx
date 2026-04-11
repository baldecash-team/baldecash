'use client';

/**
 * LegalSection - Shared helper for building legal document sections.
 * Used by Términos y Condiciones and Política de Privacidad so both pages
 * share the same spacing, typography and anchor support without duplicating
 * code.
 */

import React from 'react';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
  /** Optional id so users can link to a specific section with #anchor. */
  id?: string;
}

export function LegalSection({ title, children, id }: LegalSectionProps) {
  return (
    <section id={id} className="mb-6 sm:mb-8 scroll-mt-32">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3 font-['Asap',_sans-serif] leading-tight">
        {title}
      </h3>
      <div className="text-sm sm:text-base text-neutral-600 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default LegalSection;
