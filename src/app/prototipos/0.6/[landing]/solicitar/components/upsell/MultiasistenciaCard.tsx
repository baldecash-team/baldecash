'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Scale, Laptop, Plus, X, Check } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface MultiasistenciaCardProps {
  plan: InsurancePlan;
  isSelected: boolean;
  onToggle: () => void;
  onSeeMore: () => void;
}

const COLUMNS = [
  { icon: HeartPulse, title: 'Médico', items: [
    'Orientación médica y telemedicina 24h', 'Médico a domicilio', 'Ambulancia y orientación psicológica' ] },
  { icon: Scale, title: 'Legal', items: [ 'Asesoría legal telefónica' ] },
  { icon: Laptop, title: 'Tecnológico', items: [
    'Soporte técnico ilimitado', 'Diagnóstico y configuración', 'Técnico a domicilio' ] },
];

/**
 * Tarjeta a todo el ancho de Multiasistencia (A365). A diferencia de los seguros
 * de equipo (Insurama), NO comparte la grilla de 2 columnas: es su propia sección
 * con cabecera + precio a la derecha, tres columnas de coberturas y un pie con el
 * CTA y el enlace "Ver todo lo que incluye". Estilo tomado del mockup
 * `flujo-solicitud-multiasistencia.html` (bloque `.ma`).
 */
export const MultiasistenciaCard: React.FC<MultiasistenciaCardProps> = ({ plan, isSelected, onToggle, onSeeMore }) => {
  const price = Math.floor(plan.monthlyPrice ?? 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isSelected ? 'border-[var(--color-secondary)] shadow-lg' : 'border-neutral-200'
      }`}>
      <div className="p-5 sm:p-6">
        {/* Cabecera: tag + título + a quién cubre a la izquierda, precio a la derecha. */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-[220px]">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-secondary)]">Asistencia integral</p>
              <h3 className="font-bold text-neutral-800 text-lg leading-tight mt-0.5">Multiasistencia BaldeCash</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Cubre a titular, cónyuge, hijos menores de 18 y padres del mismo hogar (hasta 4 personas) · todo el plazo del crédito
              </p>
            </div>
            {isSelected && (
              <div className="ml-1 w-6 h-6 bg-[var(--color-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="bg-[rgba(var(--color-primary-rgb),0.06)] rounded-xl px-4 py-3 min-w-[160px]">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--color-primary)]">S/ {formatMoneyNoDecimals(price)}</span>
              <span className="text-sm text-neutral-500">/mes</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Total S/ {formatMoneyNoDecimals(plan.totalPrice ?? 0)} en {plan.paymentMonths} cuotas
            </p>
          </div>
        </div>

        {/* Tres columnas de coberturas lado a lado (en desktop). */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {COLUMNS.map(({ icon: Icon, title, items }) => (
            <div key={title} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <Icon className="w-4 h-4 text-[var(--color-primary)]" /> {title}
              </div>
              <ul className="space-y-1">
                {items.map((it) => (
                  <li key={it} className="text-xs text-neutral-500 pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--color-primary)]">{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pie: CTA (ancho automático) + enlace "Ver todo lo que incluye". */}
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={onToggle}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                : 'bg-[var(--color-primary)] text-white hover:brightness-90'
            }`}>
            {isSelected ? (<><X className="w-4 h-4" /> Quitar asistencia</>) : (<><Plus className="w-4 h-4" /> Agregar asistencia</>)}
          </button>
          <button onClick={onSeeMore}
            className="text-sm font-semibold text-[var(--color-primary)] underline hover:brightness-90 transition-all cursor-pointer">
            Ver todo lo que incluye
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MultiasistenciaCard;
