'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Scale, Laptop, Check, Plus, X, FileText } from 'lucide-react';
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

// ⚠️ PLACEHOLDER pendiente de legal: URL del condicionado/T&C de la
// Multiasistencia A365. Reemplazar por la URL final aprobada por legal (o
// resolver por config/landing) antes del go-live.
const CONDICIONADO_URL = '#';

export const MultiasistenciaCard: React.FC<MultiasistenciaCardProps> = ({ plan, isSelected, onToggle, onSeeMore }) => {
  const price = Math.floor(plan.monthlyPrice ?? 0);
  // Consentimiento legal: gatea el "Agregar" (T&C/condicionado + tratamiento de
  // datos con A365). Quitar no requiere aceptación.
  const [accepted, setAccepted] = useState(false);
  const canAdd = isSelected || accepted;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
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

        {/* Legal — ⚠️ copy/URL placeholder pendiente de legal: condicionado/T&C,
            consentimiento de tratamiento de datos con A365. */}
        <label className="flex items-start gap-2 text-xs text-neutral-600 mb-3 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 accent-[var(--color-primary)]" />
          <span>
            He leído y acepto el{' '}
            <a href={CONDICIONADO_URL} target="_blank" rel="noopener noreferrer"
              className="text-[var(--color-primary)] underline inline-flex items-center gap-0.5">
              condicionado y términos y condiciones<FileText className="w-3 h-3" />
            </a>{' '}
            de la Multiasistencia, y autorizo el tratamiento de mis datos y su compartición con A365 para activar el servicio.
          </span>
        </label>

        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={onToggle} disabled={!canAdd}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              !canAdd
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : isSelected
                  ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer'
                  : 'bg-[var(--color-primary)] text-white hover:brightness-90 cursor-pointer'
            }`}>
            {isSelected ? (<><X className="w-4 h-4" /> Quitar asistencia</>) : (<><Plus className="w-4 h-4" /> Agregar asistencia</>)}
          </button>
          <button onClick={onSeeMore} className="text-sm font-semibold text-[var(--color-primary)] underline cursor-pointer">
            Ver todo lo que incluye
          </button>
          {isSelected && <Check className="w-5 h-5 text-[var(--color-secondary)]" />}
        </div>

        {/* Certificado de afiliación (lo emite BaldeCash) */}
        <p className="text-[11px] text-neutral-400 mt-2">
          BaldeCash emitirá tu certificado de afiliación una vez activada la asistencia.
        </p>
      </div>
    </motion.div>
  );
};

export default MultiasistenciaCard;
