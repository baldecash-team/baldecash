'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Scale, Laptop, Plus, X, Check, Eye, FileText } from 'lucide-react';
import type { InsurancePlan } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface MultiasistenciaCardProps {
  plan: InsurancePlan;
  isSelected: boolean;
  onToggle: () => void;
  onSeeMore: () => void;
}

/** Landing informativa de Multiasistencia (se abre en pestaña nueva desde el T&C). */
const MULTIASISTENCIA_URL = '/multiasistencia';

const COLUMNS = [
  {
    icon: HeartPulse,
    title: 'Médico',
    items: [
      'Orientación médica telefónica y telemedicina 24/7.',
      'Acompañamiento psicológico.',
      'Orientación para encontrar especialistas, clínicas y hospitales.',
    ],
  },
  {
    icon: Scale,
    title: 'Legal',
    items: ['Asesoría legal telefónica para consultas familiares, civiles y penales.'],
  },
  {
    icon: Laptop,
    title: 'Tecnológico',
    items: [
      'Soporte técnico especializado.',
      'Diagnóstico de equipos.',
      'Configuración de dispositivos.',
    ],
  },
];

/**
 * Tarjeta a todo el ancho de Multiasistencia (A365). A diferencia de los seguros
 * de equipo (Insurama), NO comparte la grilla de 2 columnas: es su propia sección.
 *
 * Layout tomado del mockup "Personaliza tu solicitud" (bloque `.card.ma`): la
 * cabecera, el precio y el texto de cobertura van APILADOS a todo el ancho
 * (`.ma .top-row{display:block}`), luego las tres columnas de coberturas y un pie
 * con dos botones del mismo ancho + el enlace de términos y condiciones.
 */
export const MultiasistenciaCard: React.FC<MultiasistenciaCardProps> = ({ plan, isSelected, onToggle, onSeeMore }) => {
  const price = Math.floor(plan.monthlyPrice ?? 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isSelected ? 'border-[var(--color-secondary)] shadow-lg' : 'border-neutral-200'
      }`}>
      <div className="p-5 sm:p-6">
        {/* Cabecera: ícono + tag + título. */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-[23px] h-[23px] text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.6px] text-[var(--color-secondary)]">
              Asistencia integral
            </p>
            <h3 className="font-semibold text-neutral-800 text-[16.5px] leading-tight mt-0.5">
              Multiasistencia BaldeCash
            </h3>
          </div>
          {isSelected && (
            <div className="w-6 h-6 bg-[var(--color-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Precio: bloque a todo el ancho, debajo de la cabecera. */}
        <div className="bg-[rgba(var(--color-primary-rgb),0.06)] rounded-[14px] px-[18px] py-4 mb-3.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-[var(--color-primary)] leading-none">
              S/ {formatMoneyNoDecimals(price)}
            </span>
            <span className="text-[15px] font-semibold text-neutral-500">/mes</span>
          </div>
          <p className="text-[12.5px] text-neutral-500 mt-1.5">
            Total S/ {formatMoneyNoDecimals(plan.totalPrice ?? 0)} en {plan.paymentMonths} cuotas
          </p>
        </div>

        {/* A quién cubre y por cuánto tiempo. */}
        <p className="text-[13.5px] text-neutral-500 leading-relaxed mb-4">
          Asistencia médica, legal y tecnológica para ti y hasta 3 familiares durante todo el plazo
          de tu crédito. Titular, cónyuge, hijos menores de 18 años y padres del mismo hogar.
        </p>

        {/* Tres columnas de coberturas lado a lado (en desktop). */}
        <div className="flex flex-wrap gap-4 mb-[18px]">
          {COLUMNS.map(({ icon: Icon, title, items }) => (
            <div key={title} className="flex-1 min-w-[190px] bg-neutral-50 border border-neutral-200 rounded-[14px] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2.5">
                <Icon className="w-[18px] h-[18px] text-[var(--color-primary)]" /> {title}
              </div>
              <ul>
                {items.map((it) => (
                  <li key={it} className="text-[13px] text-neutral-500 leading-snug py-1 pl-4 relative before:content-['·'] before:absolute before:left-0.5 before:-top-0.5 before:text-base before:font-extrabold before:text-[var(--color-primary)]">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pie: los dos botones ocupan el mismo ancho; en móvil se apilan. */}
        <div className="flex flex-wrap gap-4">
          <button onClick={onToggle}
            className={`flex-1 min-w-[180px] px-4 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSelected
                ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                : 'bg-[var(--color-primary)] text-white hover:brightness-90'
            }`}>
            {isSelected ? (<><X className="w-4 h-4" /> Quitar asistencia</>) : (<><Plus className="w-4 h-4" /> Agregar asistencia</>)}
          </button>
          <button onClick={onSeeMore}
            className="flex-1 min-w-[180px] px-4 py-3.5 rounded-xl border-[1.6px] border-[var(--color-primary)] bg-white text-[var(--color-primary)] font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:bg-[rgba(var(--color-primary-rgb),0.06)]">
            <Eye className="w-[17px] h-[17px]" /> Ver todo lo que incluye
          </button>
        </div>

        <a
          href={MULTIASISTENCIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 flex items-center justify-center gap-1.5 text-[13px] text-neutral-400 hover:text-[var(--color-primary)] hover:underline transition-colors cursor-pointer"
        >
          <FileText className="w-[15px] h-[15px]" />
          Ver términos y condiciones
        </a>
      </div>
    </motion.div>
  );
};

export default MultiasistenciaCard;
