'use client';

import React from 'react';
import { Check, Star, ShieldCheck } from 'lucide-react';
import styles from './familyFarmGrades.module.css';
import {
  GRADE_COPY,
  GRADE_HEADING,
  GRADE_NOTE,
  GRADE_SAVINGS_LABEL,
  GRADE_SUBHEADING,
  type GradeKey,
  type GradeOption,
} from './familyFarmGrades';
import { gradeSavings } from './gradeSavings';
import { formatMoneyNoDecimals } from '../utils/formatMoney';

export type { GradeOption };

interface FamilyFarmGradeSelectorProps {
  /** Los grados que existen para este equipo. El catálogo decide cuáles son. */
  grades: GradeOption[];
  selected: GradeKey;
  onSelect: (grade: GradeKey) => void;
  /**
   * En mobile el bloque vive dentro de un acordeón que ya trae su propio título;
   * repetirlo dejaría el encabezado dos veces, uno encima del otro.
   */
  showHeading?: boolean;
  /**
   * Frecuencia en la que vienen las cuotas de `grades`, para elegir el sufijo.
   * Sale del MISMO payload que trajo las cuotas, no de la selección de la
   * calculadora: si no, la etiqueta cambiaría y el número no.
   */
  paymentFrequency?: string;
}

const PALETTE: Record<GradeKey, string> = {
  A: styles.gradeA,
  B: styles.gradeB,
  C: styles.gradeC,
};

function formatPrice(price: number): string {
  return `S/${Math.round(price).toLocaleString('es-PE')}`;
}

/** Sufijos del repo (`PricingCalculator`), para no mostrar dos etiquetas
 *  distintas de la misma frecuencia en una misma pantalla. */
const FREQ_SUFFIX: Record<string, string> = {
  semanal: '/sem',
  quincenal: '/qcn',
  mensual: '/mes',
};

/** Cuota del plazo más corto, con el sufijo de su frecuencia.
 *
 *  Trunca, no redondea: es lo que hace el resto de esta pantalla, a favor del
 *  usuario. Hoy los valores llegan enteros, así que no cambia nada — pero fija
 *  la dirección si algún día dejan de serlo. */
function formatQuota(quota: number, frequency?: string): string {
  const suffix = FREQ_SUFFIX[frequency ?? 'mensual'] ?? FREQ_SUFFIX.mensual;
  return `S/${formatMoneyNoDecimals(Math.floor(quota))}${suffix}`;
}

/**
 * Selector de grados de Family Farms: una tarjeta por grado con su color, y
 * debajo un cuadro que describe el elegido.
 *
 * Muestra solo los grados que el equipo tiene de verdad. En producción el
 * iPhone 13 Midnight solo trae B y C: rellenar el Grado A que falta sería
 * ofrecer algo que nadie puede comprar.
 */
export const FamilyFarmGradeSelector: React.FC<FamilyFarmGradeSelectorProps> = ({
  grades,
  selected,
  onSelect,
  showHeading = true,
  paymentFrequency,
}) => {
  if (grades.length === 0) return null;

  const copy = GRADE_COPY[selected];
  const savings = gradeSavings(grades, selected);

  return (
    <div>
      {showHeading && (
        <>
          <h3 className={styles.heading}>{GRADE_HEADING}</h3>
          <p className={styles.subheading}>{GRADE_SUBHEADING}</p>
        </>
      )}

      <div className={styles.cards} role="radiogroup" aria-label={GRADE_HEADING}>
        {grades.map((option) => {
          const isSelected = option.grade === selected;
          return (
            <button
              key={option.grade}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!option.isAvailable}
              onClick={() => {
                if (!isSelected) onSelect(option.grade);
              }}
              className={`${styles.card} ${PALETTE[option.grade]}`}
            >
              <span className={styles.cardTitle}>Grado {option.grade}</span>
              <span className={styles.cardMeta}>
                {GRADE_COPY[option.grade].titulo}
                {/* La cuota, no el precio de lista: el precio sugiere un total
                    a pagar y ese total cambia con el plazo elegido.
                    `typeof` y no `!== undefined`: el API puede mandar null, y
                    `null !== undefined` es true. El `> 0` descarta el 0 que
                    anunciaría un equipo regalado. */}
                {typeof option.minTermQuota === 'number' && option.minTermQuota > 0 &&
                  ` · ${formatQuota(option.minTermQuota, paymentFrequency)}`}
              </span>
              {isSelected && (
                <span className={styles.tick} aria-hidden="true">
                  <Check size={13} strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={`${styles.box} ${PALETTE[selected]}`} data-testid="grade-box">
        <div className={styles.boxId}>
          <span className={styles.boxStar} aria-hidden="true">
            <Star size={16} fill="currentColor" strokeWidth={0} />
          </span>
          <div>
            <span className={styles.boxTitle}>
              Grado {selected} · {copy.titulo}
            </span>
            <p className={styles.boxSummary}>{copy.resumen}</p>
          </div>
        </div>

        <div className={styles.boxExpect}>
          <b>¿Qué puedes esperar?</b>
          <ul>
            {copy.espera.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {savings && (
          <div className={styles.boxSave}>
            <small>{GRADE_SAVINGS_LABEL}</small>
            <b>{formatPrice(savings.amount)}</b>
            <em>{savings.percent}% menos</em>
          </div>
        )}
      </div>

      <div className={styles.note}>
        <ShieldCheck size={16} />
        {GRADE_NOTE}
      </div>
    </div>
  );
};
