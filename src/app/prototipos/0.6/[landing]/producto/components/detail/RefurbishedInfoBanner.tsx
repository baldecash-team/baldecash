'use client';

/**
 * RefurbishedInfoBanner — Tarjeta informativa (estilo "Combo incluye") que
 * explica que el equipo es reacondicionado. Se muestra en el detalle, junto al
 * banner de combos, cuando el producto tiene condición reacondicionada.
 */

import React from 'react';
import { Recycle, Sparkles, ShieldCheck, Tag } from 'lucide-react';

const POINTS: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
    title: 'Certificado',
    description: 'Revisado, probado y reparado por técnicos certificados.',
  },
  {
    icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
    title: 'Con garantía',
    description: 'Incluye garantía, igual que un equipo nuevo.',
  },
  {
    icon: <Tag className="w-4 h-4 text-amber-600" />,
    title: 'Mejor precio',
    description: 'Ahorra sin sacrificar calidad ni rendimiento.',
  },
  {
    icon: <Recycle className="w-4 h-4 text-amber-600" />,
    title: 'Señales de uso',
    description: 'Puede presentar marcas mínimas por su uso previo.',
  },
];

export const RefurbishedInfoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-50/40 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Recycle className="w-5 h-5 text-amber-600" />
        <span className="font-semibold text-neutral-800">Producto semi nuevo</span>
      </div>
      <p className="text-sm text-neutral-600 mb-3">
        Equipo revisado y restaurado a su funcionamiento óptimo. Funciona como nuevo,
        con garantía y a un precio más accesible.
      </p>
      <div className="space-y-2">
        {POINTS.map((p) => (
          <div
            key={p.title}
            className="flex items-start gap-3 bg-white rounded-lg p-3 border border-amber-100"
          >
            <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              {p.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800">{p.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RefurbishedInfoBanner;
