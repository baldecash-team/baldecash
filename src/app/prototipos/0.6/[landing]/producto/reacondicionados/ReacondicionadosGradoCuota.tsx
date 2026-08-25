'use client';

/**
 * Selector de grado del detalle de reacondicionados (BAL-3344).
 *
 * Tres columnas de grado con el diseño que entregó Haru (`haru-prototipo.html`,
 * pantalla `#scr-detalle`): tarjeta neutra, check azul en la esquina del
 * elegido, precio "Desde S/X" y los agotados atenuados.
 *
 * SOLO los grados. El prototipo dibujaba la calculadora de cuota dentro de la
 * misma card, pero esa parte NO se reimplementa: `PricingCalculator` ya la
 * resuelve y además alimenta el carrito (`onSelectionChange` lleva plazo,
 * inicial, cuota y frecuencia al checkout). Duplicarla rompería ese flujo por
 * un detalle visual. Es el mismo criterio que siguen las otras landings con
 * grados: selector arriba, pricing de siempre abajo.
 *
 * Tampoco reutiliza `FamilyFarmGradeSelector`: aquel pinta una lista vertical
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

export interface ReacondicionadosGradoCuotaProps {
  /** Grados hermanos del equipo (`grade_siblings`). Vacío = no se pinta nada. */
  gradeSiblings: GradeSibling[];
  /** Grado que se está viendo ahora. */
  selectedGrade: string;
  /** Al elegir otro grado se navega a SU slug: cada grado es un producto. */
  onSelectGrade: (grade: string) => void;
  /** Sufijo de la cuota. Sale del payload que trajo los números, no de la UI. */
  paymentFrequency?: string;
}

const HEADING = 'Elige el estado de tu equipo';
const SUBHEADING = 'Compara la cuota según el grado que elijas';
const ASSURE = 'Todos los grados son 100% funcionales y revisados por técnicos certificados.';
const NO_DISPONIBLE = 'No disponible';

/** Sufijos del repo (`PricingCalculator`): una misma frecuencia, una etiqueta. */
const FREQ_SUFFIX: Record<string, string> = {
  semanal: '/sem',
  quincenal: '/qcn',
  mensual: '/mes',
};

export const ReacondicionadosGradoCuota: React.FC<ReacondicionadosGradoCuotaProps> = ({
  gradeSiblings,
  selectedGrade,
  onSelectGrade,
  paymentFrequency,
}) => {
  // Ordenados A→D. El backend no garantiza orden y la comparación visual solo
  // funciona si la gama se lee de mejor a más económica.
  const grados = useMemo(
    () => [...gradeSiblings].sort((a, b) => a.grade.localeCompare(b.grade)),
    [gradeSiblings],
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

      {/* La nota "Cuota referencial según evaluación…" NO va acá: habla de las
          cuotas, y las cuotas las pinta `PricingCalculator` más abajo, que ya
          trae su propia advertencia. Repetirla aquí diría lo mismo dos veces en
          la misma pantalla. */}
      <div className={styles.assure}>
        <span className={styles.assureIcon} aria-hidden="true">
          <ShieldCheck size={18} strokeWidth={1.8} />
        </span>
        {ASSURE}
      </div>
    </section>
  );
};
