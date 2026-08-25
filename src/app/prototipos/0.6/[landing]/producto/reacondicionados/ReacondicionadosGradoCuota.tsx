'use client';

/**
 * Card de grado y cuota del detalle de reacondicionados (BAL-3344).
 *
 * Reproduce el diseño que entregó Haru (`haru-prototipo.html`, pantalla
 * `#scr-detalle`): tres columnas de grado arriba y, tras una línea, la
 * calculadora de cuota. Es UN solo bloque a propósito — elegir grado cambia la
 * cuota, así que separarlos en dos cards rompería la relación.
 *
 * No reutiliza `FamilyFarmGradeSelector` porque aquel pinta una lista vertical
 * con color por grado y un cuadro de "¿Qué puedes esperar?" + ahorro debajo.
 * Son formas distintas del mismo dato; unificarlas con props volvería ilegible
 * un componente que ya está en producción.
 *
 * El botón "Ver detalle" que el prototipo mostraba dentro del grado activo
 * quedó FUERA por decisión de negocio: la tarjeta solo elige el grado.
 */

import React, { useMemo } from 'react';
import { Check, Star, ShieldCheck } from 'lucide-react';
import { GRADE_COPY, type GradeKey, isGradeKey } from '../family-farm/familyFarmGrades';
import { formatMoneyNoDecimals } from '../utils/formatMoney';
import type { GradeSibling } from '../types/detail';
import styles from './reacondicionadosGrados.module.css';

/** Una opción de plazo con su cuota, ya resuelta por el backend. */
export interface TermOption {
  termMonths: number;
  monthlyQuota: number;
}

/** Una opción de inicial con su monto. */
export interface InitialOption {
  percent: number;
  amount: number;
}

export interface ReacondicionadosGradoCuotaProps {
  /** Grados hermanos del equipo (`grade_siblings`). Vacío = no se pinta nada. */
  gradeSiblings: GradeSibling[];
  /** Grado que se está viendo ahora. */
  selectedGrade: string;
  /** Al elegir otro grado se navega a SU slug: cada grado es un producto. */
  onSelectGrade: (grade: string) => void;

  initialOptions: InitialOption[];
  selectedInitialPercent: number;
  onSelectInitial: (percent: number) => void;

  termOptions: TermOption[];
  selectedTermMonths: number;
  onSelectTerm: (termMonths: number) => void;

  /** Sufijo de la cuota. Sale del payload que trajo los números, no de la UI. */
  paymentFrequency?: string;
}

const HEADING = 'Elige el estado de tu equipo';
const SUBHEADING = 'Compara la cuota según el grado que elijas';
const CALC_HEADING = 'Selecciona tu cuota';
const INITIAL_LABEL = 'Cuota inicial (opcional)';
const LEGAL = 'Cuota referencial según evaluación y condiciones de financiamiento.';
const ASSURE = 'Todos los grados son 100% funcionales y revisados por técnicos certificados.';
const NO_DISPONIBLE = 'No disponible';

/** Sufijos del repo (`PricingCalculator`): una misma frecuencia, una etiqueta. */
const FREQ_SUFFIX: Record<string, string> = {
  semanal: '/sem',
  quincenal: '/qcn',
  mensual: '/mes',
};

/**
 * Cuota con el sufijo de su frecuencia. Trunca en vez de redondear, como el
 * resto de la pantalla: a favor del usuario.
 */
function formatQuota(quota: number, frequency?: string): string {
  const suffix = FREQ_SUFFIX[frequency ?? 'mensual'] ?? FREQ_SUFFIX.mensual;
  return `S/${formatMoneyNoDecimals(Math.floor(quota))}${suffix}`;
}

export const ReacondicionadosGradoCuota: React.FC<ReacondicionadosGradoCuotaProps> = ({
  gradeSiblings,
  selectedGrade,
  onSelectGrade,
  initialOptions,
  selectedInitialPercent,
  onSelectInitial,
  termOptions,
  selectedTermMonths,
  onSelectTerm,
  paymentFrequency,
}) => {
  // Ordenados A→D. El backend no garantiza orden y la comparación visual solo
  // funciona si la gama se lee de mejor a más económica.
  const grados = useMemo(
    () => [...gradeSiblings].sort((a, b) => a.grade.localeCompare(b.grade)),
    [gradeSiblings],
  );

  const cuotaElegida = useMemo(
    () => termOptions.find((t) => t.termMonths === selectedTermMonths),
    [termOptions, selectedTermMonths],
  );

  // Sin grados que comparar no hay nada que decidir: la sección no se dibuja.
  // Es el caso de un equipo nuevo, o de un reacondicionado sin familia cargada.
  if (grados.length === 0) return null;

  return (
    <section className={styles.card} data-testid="reacond-grado-cuota">
      <div className={styles.head}>
        <span className={styles.star} aria-hidden="true">
          <Star size={22} strokeWidth={1.8} />
        </span>
        <div>
          <h3 className={styles.title}>{HEADING}</h3>
          <p className={styles.subtitle}>{SUBHEADING}</p>
        </div>
      </div>

      <div className={styles.cols} role="radiogroup" aria-label={HEADING}>
        {grados.map((sib) => {
          const elegido = sib.grade === selectedGrade;
          const agotado = !sib.isAvailable;
          // El copy solo existe para A/B/C. Un grado D —que en producción existe
          // en varios equipos— se pinta igual, sin descripción, en vez de
          // reventar por un acceso a undefined.
          const nombre = isGradeKey(sib.grade)
            ? GRADE_COPY[sib.grade as GradeKey].titulo
            : '';

          return (
            <button
              key={sib.grade}
              type="button"
              role="radio"
              aria-checked={elegido}
              disabled={agotado}
              onClick={() => {
                if (!elegido) onSelectGrade(sib.grade);
              }}
              className={`${styles.col} ${elegido ? styles.colOn : ''} ${agotado ? styles.colOff : ''}`}
            >
              {elegido && (
                <span className={styles.colCheck} aria-hidden="true">
                  <Check size={11} strokeWidth={3.5} />
                </span>
              )}
              <span className={styles.colGrade}>Grado {sib.grade}</span>
              <span className={styles.colName}>{nombre}</span>

              {agotado ? (
                <span className={styles.colNa}>{NO_DISPONIBLE}</span>
              ) : (
                // `typeof` y no `!== undefined`: el API puede mandar null, y
                // `null !== undefined` es true. El `> 0` descarta el cero que
                // anunciaría un equipo regalado.
                typeof sib.minTermQuota === 'number' && sib.minTermQuota > 0 && (
                  <span className={styles.colQuota}>
                    Desde
                    <br />
                    <b>S/{formatMoneyNoDecimals(Math.floor(sib.minTermQuota))}</b>
                    {FREQ_SUFFIX[paymentFrequency ?? 'mensual'] ?? FREQ_SUFFIX.mensual}
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      <h4 className={styles.mergeSub}>{CALC_HEADING}</h4>

      {initialOptions.length > 0 && (
        <>
          <div className={styles.calcLabel}>{INITIAL_LABEL}</div>
          <div className={styles.pills} role="radiogroup" aria-label={INITIAL_LABEL}>
            {initialOptions.map((op) => (
              <button
                key={op.percent}
                type="button"
                role="radio"
                aria-checked={op.percent === selectedInitialPercent}
                onClick={() => onSelectInitial(op.percent)}
                className={`${styles.pill} ${op.percent === selectedInitialPercent ? styles.pillOn : ''}`}
              >
                {op.amount > 0 ? `S/${formatMoneyNoDecimals(op.amount)}` : 'Sin inicial'}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={styles.terms} role="radiogroup" aria-label={CALC_HEADING}>
        {termOptions.map((op) => {
          const elegido = op.termMonths === selectedTermMonths;
          return (
            <button
              key={op.termMonths}
              type="button"
              role="radio"
              aria-checked={elegido}
              onClick={() => onSelectTerm(op.termMonths)}
              className={`${styles.term} ${elegido ? styles.termOn : ''}`}
            >
              <span className={styles.termCheck} aria-hidden="true">
                <Check size={12} strokeWidth={3.5} />
              </span>
              <span className={styles.termMonths}>
                {op.termMonths}
                <br />
                meses
              </span>
              <span className={styles.termQuota}>
                S/{formatMoneyNoDecimals(Math.floor(op.monthlyQuota))}
              </span>
              <span className={styles.termPer}>al mes</span>
            </button>
          );
        })}
      </div>

      {cuotaElegida && (
        <div className={styles.summary} data-testid="reacond-resumen">
          <div className={styles.summaryLabel}>Tu cuota mensual · Grado {selectedGrade}</div>
          <div className={styles.summaryQuota}>
            {formatQuota(cuotaElegida.monthlyQuota, paymentFrequency)}
          </div>
          <div className={styles.summaryTerm}>durante {cuotaElegida.termMonths} meses</div>
        </div>
      )}

      <p className={styles.legal}>{LEGAL}</p>

      <div className={styles.assure}>
        <span className={styles.assureIcon} aria-hidden="true">
          <ShieldCheck size={18} strokeWidth={1.8} />
        </span>
        {ASSURE}
      </div>
    </section>
  );
};
