'use client';

import React from 'react';
import {
  EmptyStateProps,
  EmptyStateConfig,
  defaultEmptyStateConfig,
} from '../../types/empty';

// Illustrations
import { EmptyIllustrationV1 } from './illustration/EmptyIllustrationV1';
import { EmptyIllustrationV2 } from './illustration/EmptyIllustrationV2';
import { EmptyIllustrationV3 } from './illustration/EmptyIllustrationV3';
import { EmptyIllustrationV4 } from './illustration/EmptyIllustrationV4';
import { EmptyIllustrationV5 } from './illustration/EmptyIllustrationV5';
import { EmptyIllustrationV6 } from './illustration/EmptyIllustrationV6';

// Actions
import { EmptyActionsV1 } from './actions/EmptyActionsV1';
import { EmptyActionsV2 } from './actions/EmptyActionsV2';
import { EmptyActionsV3 } from './actions/EmptyActionsV3';
import { EmptyActionsV4 } from './actions/EmptyActionsV4';
import { EmptyActionsV5 } from './actions/EmptyActionsV5';
import { EmptyActionsV6 } from './actions/EmptyActionsV6';

/**
 * EmptyState - Wrapper principal
 * Combina ilustración + acciones según configuración
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  appliedFilters,
  onClearFilters,
  onRemoveFilter,
  suggestedProducts,
  totalProductsIfExpanded,
  config = defaultEmptyStateConfig,
}) => {
  // Seleccionar versión de ilustración
  const renderIllustration = () => {
    const illustrationProps = { className: 'mb-8' };

    switch (config.illustrationVersion) {
      case 1:
        return <EmptyIllustrationV1 {...illustrationProps} />;
      case 2:
        return <EmptyIllustrationV2 {...illustrationProps} />;
      case 3:
        return <EmptyIllustrationV3 {...illustrationProps} />;
      case 4:
        return <EmptyIllustrationV4 {...illustrationProps} />;
      case 5:
        return <EmptyIllustrationV5 {...illustrationProps} />;
      case 6:
        return <EmptyIllustrationV6 {...illustrationProps} />;
      default:
        return <EmptyIllustrationV1 {...illustrationProps} />;
    }
  };

  // Seleccionar versión de acciones
  const renderActions = () => {
    const actionsProps = {
      appliedFilters,
      onClearFilters,
      onRemoveFilter,
      totalProductsIfExpanded,
    };

    switch (config.actionsVersion) {
      case 1:
        return <EmptyActionsV1 {...actionsProps} />;
      case 2:
        return <EmptyActionsV2 {...actionsProps} />;
      case 3:
        return <EmptyActionsV3 {...actionsProps} />;
      case 4:
        return <EmptyActionsV4 {...actionsProps} />;
      case 5:
        return <EmptyActionsV5 {...actionsProps} />;
      case 6:
        return <EmptyActionsV6 {...actionsProps} />;
      default:
        return <EmptyActionsV1 {...actionsProps} />;
    }
  };

  // Para V5 la ilustración ya incluye el layout split, no agregar mb-8
  const isV5Illustration = config.illustrationVersion === 5;

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
      {/* Ilustración */}
      {isV5Illustration ? (
        <div className="mb-8 w-full max-w-2xl">
          <EmptyIllustrationV5 />
        </div>
      ) : (
        renderIllustration()
      )}

      {/* Acciones */}
      <div className="w-full">
        {renderActions()}
      </div>
    </div>
  );
};

export default EmptyState;
