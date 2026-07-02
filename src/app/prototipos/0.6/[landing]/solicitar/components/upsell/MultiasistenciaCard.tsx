'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Scale, Laptop, Plus, X, FileText } from 'lucide-react';
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

export const MultiasistenciaCard: React.FC<MultiasistenciaCardProps> = ({ plan, isSelected, onToggle, onSeeMore }) => {
  const price = Math.floor(plan.monthlyPrice ?? 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`h-full rounded-2xl border-2 overflow-hidden transition-all ${
        isSelected ? 'border-[var(--color-secondary)] shadow-lg' : 'border-neutral-200'
      }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#b4341e]">💙 Asistencia integral</p>
            <h3 className="text-base font-bold text-neutral-800">Multiasistencia BaldeCash</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xl">
              Cubre a titular, cónyuge, hijos menores de 18 y padres del mismo hogar (hasta 4 personas) · todo el plazo del crédito
            </p>
          </div>
          <div className="bg-[rgba(var(--color-primary-rgb),0.06)] rounded-xl px-4 py-2 min-w-[140px]">
            <span className="text-2xl font-bold text-[var(--color-primary)]">S/ {formatMoneyNoDecimals(price)}</span>
            <span className="text-sm text-neutral-500"> /mes</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
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

        {/* Mismo formato de acciones que los seguros de equipo. */}
        <button onClick={onToggle}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isSelected
              ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              : 'bg-[var(--color-primary)] text-white hover:brightness-90'
          }`}>
          {isSelected ? (<><X className="w-4 h-4" /> Quitar protección</>) : (<><Plus className="w-4 h-4" /> Agregar protección</>)}
        </button>
        <button onClick={onSeeMore}
          className="w-full py-1.5 mt-1 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer flex items-center justify-center gap-1">
          <FileText className="w-3 h-3" />
          Ver términos y condiciones
        </button>
      </div>
    </motion.div>
  );
};

export default MultiasistenciaCard;
