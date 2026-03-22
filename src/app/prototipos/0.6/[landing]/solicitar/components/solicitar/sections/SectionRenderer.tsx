'use client';

/**
 * SectionRenderer - Renders a section dynamically based on type
 * Used by Preview page and Complementos page to render sections in configured order
 * Both AccessoriesSection and InsuranceSection use ProductContext for state management
 */

import React from 'react';
import { AccessoriesSection } from './AccessoriesSection';
import { InsuranceSection } from './InsuranceSection';
import type { SolicitarSectionType } from '@/app/prototipos/0.6/services/landingApi';

interface SectionRendererProps {
  /**
   * Type of section to render
   */
  type: SolicitarSectionType;
  /**
   * Optional: Custom class name for the section
   */
  className?: string;
}

export function SectionRenderer({
  type,
  className = '',
}: SectionRendererProps) {
  switch (type) {
    case 'accessories':
      return <AccessoriesSection className={className} />;

    case 'insurance':
      return <InsuranceSection className={className} />;

    case 'wizard_steps':
      // wizard_steps are rendered by the wizard pages, not by SectionRenderer
      return null;

    default:
      return null;
  }
}
