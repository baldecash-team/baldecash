'use client';

/**
 * ConditionBadge — el badge de condición de las cards del catálogo.
 *
 * Solo pinta. Texto y color llegan resueltos del backend
 * (`catalog_rules.condition_badges`, BAL-3261), la misma función que usan
 * los tres modales de pricing del admin.
 *
 * Antes este componente derivaba el badge por su cuenta: buscaba la condición
 * en el facet de filtros y tenía su propia lista de qué cuenta como «nuevo».
 * Esa regla vivía duplicada, y el admin —que no lee el facet— mostraba las
 * cards sin badge.
 */

import React from 'react';
import { CardBadge } from './CardBadge';

/** Gris de respaldo: sin color, el badge saldría sin fondo y no se leería. */
const FALLBACK_COLOR = '#6b7280';

interface ConditionBadgeProps {
  /** El texto ya resuelto por el backend. `null` = esta card no lleva badge de condición. */
  conditionLabelText?: string | null;
  conditionLabelColor?: string | null;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  conditionLabelText,
  conditionLabelColor,
}) => {
  if (!conditionLabelText) return null;

  return (
    <CardBadge backgroundColor={conditionLabelColor || FALLBACK_COLOR}>
      {conditionLabelText}
    </CardBadge>
  );
};

export default ConditionBadge;
