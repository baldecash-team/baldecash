'use client';

/**
 * CronogramaV5 - Progress Bar con Hitos
 *
 * Vertical progress bar with milestone achievements.
 * Gamified approach with achievements unlocked.
 */

import React, { useState } from 'react';
import { Calendar, Trophy, Star, Gift, CheckCircle2, Lock } from 'lucide-react';

export interface CronogramaProps {
  monthlyQuota: number;
  term?: number;
  startDate?: Date;
}

const TERMS = [12, 18, 24, 36, 48];

export const CronogramaV5: React.FC<CronogramaProps> = ({
  monthlyQuota,
  term = 36,
  startDate = new Date(),
}) => {
  const [selectedTerm, setSelectedTerm] = useState(term);

  const milestones = [
    { percent: 25, icon: Star, label: 'Primer cuarto', color: 'amber' },
    { percent: 50, icon: Trophy, label: 'Mitad del camino', color: 'blue' },
    { percent: 75, icon: Gift, label: 'Casi terminando', color: 'purple' },
    { percent: 100, icon: CheckCircle2, label: '¡Completado!', color: 'green' },
  ];

  const getMilestoneMonth = (percent: number) => Math.ceil((selectedTerm * percent) / 100);
  const getMilestoneDate = (percent: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + getMilestoneMonth(percent) - 1);
    return date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#4654CD]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Tu Progreso</h3>
            <p className="text-sm text-neutral-500">Hitos de tu financiamiento</p>
          </div>
        </div>

        <div className="flex gap-1">
          {TERMS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                selectedTerm === t
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-neutral-200 rounded-full" />

        <div className="space-y-6">
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const colors = colorClasses[milestone.color];
            const cuotaNum = getMilestoneMonth(milestone.percent);
            const amountPaid = monthlyQuota * cuotaNum;

            return (
              <div key={milestone.percent} className="relative flex items-start gap-4 pl-12">
                {/* Icon Badge */}
                <div className={`absolute left-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 ${colors.bg} ${colors.border} z-10`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* Content Card */}
                <div className={`flex-1 p-4 rounded-xl border ${colors.border} ${colors.bg}/30`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className={`font-semibold ${colors.text}`}>{milestone.label}</p>
                      <p className="text-xs text-neutral-500">Cuota #{cuotaNum} • {getMilestoneDate(milestone.percent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-800">S/{amountPaid.toFixed(0)}</p>
                      <p className="text-xs text-neutral-500">{milestone.percent}% pagado</p>
                    </div>
                  </div>

                  {/* Mini Progress */}
                  <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.bg.replace('100', '500').replace('bg-', 'bg-')}`}
                      style={{ width: `${milestone.percent}%`, backgroundColor: milestone.color === 'amber' ? '#f59e0b' : milestone.color === 'blue' ? '#3b82f6' : milestone.color === 'purple' ? '#8b5cf6' : '#22c55e' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Summary */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Meta final</p>
              <p className="text-sm text-green-600">{selectedTerm} cuotas completadas</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-700">
            S/{(monthlyQuota * selectedTerm).toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV5;
