'use client';

import React from 'react';
import { Calendar, Bell } from 'lucide-react';

interface RetryTimelineV6Props {
  daysUntilRetry?: number;
}

/**
 * RetryTimelineV6 - Calendario Visual
 * Tiempo prominente con visualización de calendario
 */
export const RetryTimelineV6: React.FC<RetryTimelineV6Props> = ({
  daysUntilRetry = 90,
}) => {
  const retryDate = new Date();
  retryDate.setDate(retryDate.getDate() + daysUntilRetry);

  const day = retryDate.getDate();
  const month = retryDate.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase();
  const year = retryDate.getFullYear();

  return (
    <div className="bg-gradient-to-br from-[#4654CD] to-[#3a47b3] rounded-2xl p-6 text-white">
      <div className="flex items-start gap-4">
        {/* Calendario visual */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg flex-shrink-0">
          <div className="bg-red-500 text-white text-center py-1 px-6">
            <span className="text-xs font-bold tracking-wider">{month}</span>
          </div>
          <div className="bg-white text-center py-3 px-6">
            <span className="text-4xl font-bold text-neutral-800">{day}</span>
            <p className="text-xs text-neutral-500">{year}</p>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <p className="text-white/70 text-sm mb-1">Marca esta fecha</p>
          <h3 className="text-xl font-bold mb-2">Podrás volver a aplicar</h3>
          <p className="text-white/60 text-sm mb-4">
            En {daysUntilRetry} días tu solicitud podrá ser evaluada nuevamente
          </p>

          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Bell className="w-4 h-4" />
            Recordarme esa fecha
          </button>
        </div>
      </div>
    </div>
  );
};
