'use client';

/**
 * CronogramaV5 - Progress Bar Gamificado Premium
 *
 * Enhanced gamified experience with animated progress,
 * achievement unlocks, confetti effects simulation,
 * and engaging milestone celebrations.
 *
 * UX Features:
 * - Interactive slider to simulate payment progress
 * - Milestone unlock animations
 * - Visual feedback for achieved milestones
 */

import React, { useState, useMemo } from 'react';
import { Trophy, Star, Gift, Sparkles, Target, Medal, Crown, Lock, Unlock, Play, Pause } from 'lucide-react';

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
  const [currentPayment, setCurrentPayment] = useState(0); // Simula cuotas pagadas
  const [isAnimating, setIsAnimating] = useState(false);

  // Calcular progreso actual
  const progressPercent = useMemo(() =>
    (currentPayment / selectedTerm) * 100,
    [currentPayment, selectedTerm]
  );

  // Auto-animación de progreso
  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      let payment = currentPayment;
      const interval = setInterval(() => {
        payment++;
        if (payment > selectedTerm) {
          payment = 0;
        }
        setCurrentPayment(payment);
      }, 300);

      // Guardar interval ID para poder detenerlo
      setTimeout(() => {
        clearInterval(interval);
        setIsAnimating(false);
      }, (selectedTerm - currentPayment + 1) * 300);
    }
  };

  const milestones = [
    {
      percent: 25,
      icon: Star,
      label: 'Primer Logro',
      subtitle: 'Ya eres parte del equipo',
      reward: 'Badge Principiante',
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      percent: 50,
      icon: Trophy,
      label: 'Medio Camino',
      subtitle: '¡Increíble progreso!',
      reward: 'Badge Comprometido',
      gradient: 'from-blue-400 to-indigo-500'
    },
    {
      percent: 75,
      icon: Medal,
      label: 'Casi Campeón',
      subtitle: 'Falta poco para la meta',
      reward: 'Badge Experto',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      percent: 100,
      icon: Crown,
      label: '¡Campeón!',
      subtitle: 'Lo lograste',
      reward: 'Badge Leyenda + Descuento próxima compra',
      gradient: 'from-emerald-400 to-teal-500'
    },
  ];

  const getMilestoneMonth = (percent: number) => Math.ceil((selectedTerm * percent) / 100);
  const getMilestoneDate = (percent: number) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + getMilestoneMonth(percent) - 1);
    return date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Tu Aventura de Pagos
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h3>
            <p className="text-sm text-slate-400">Desbloquea logros y recompensas</p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm">
          {TERMS.map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTerm(t); setCurrentPayment(0); }}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedTerm === t
                  ? 'bg-gradient-to-r from-[#4654CD] to-[#6B7AE5] text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Progress Simulator */}
      <div className="relative z-10 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAnimation}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isAnimating
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isAnimating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <div>
              <p className="text-sm font-medium text-white">Simula tu progreso</p>
              <p className="text-xs text-slate-400">Cuota {currentPayment} de {selectedTerm}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {progressPercent.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-400">completado</p>
          </div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max={selectedTerm}
          value={currentPayment}
          onChange={(e) => setCurrentPayment(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-500">Inicio</span>
          <span className="text-[10px] text-slate-500">Cuota {selectedTerm}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative z-10 mb-8">
        {/* Main Progress Bar */}
        <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-purple-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Milestone markers on the bar */}
          {milestones.map((m) => {
            const isUnlocked = progressPercent >= m.percent;
            return (
              <div
                key={m.percent}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-white border-white scale-110 shadow-lg'
                    : 'bg-slate-600 border-slate-500'
                }`}
                style={{ left: `calc(${m.percent}% - 8px)` }}
              >
                {isUnlocked && (
                  <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-50" />
                )}
              </div>
            );
          })}
        </div>

        {/* Milestone Labels */}
        <div className="flex justify-between mt-3 px-0">
          {milestones.map((m) => {
            const isUnlocked = progressPercent >= m.percent;
            return (
              <div key={m.percent} className="flex flex-col items-center" style={{ width: '25%' }}>
                <span className={`text-xs font-bold transition-colors ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`}>
                  {m.percent}%
                </span>
                <span className={`text-[10px] transition-colors ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones Cards */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {milestones.map((milestone, idx) => {
          const Icon = milestone.icon;
          const cuotaNum = getMilestoneMonth(milestone.percent);
          const amountPaid = monthlyQuota * cuotaNum;
          const isUnlocked = progressPercent >= milestone.percent;
          const isNext = !isUnlocked && (idx === 0 || progressPercent >= milestones[idx - 1].percent);

          return (
            <div
              key={milestone.percent}
              className={`group relative backdrop-blur-sm rounded-xl p-4 border transition-all cursor-pointer ${
                isUnlocked
                  ? `bg-gradient-to-br ${milestone.gradient} border-transparent shadow-xl scale-[1.02]`
                  : isNext
                    ? 'bg-slate-800/60 border-amber-500/50 ring-2 ring-amber-500/20'
                    : 'bg-slate-800/40 border-slate-700/50 opacity-60'
              } ${!isUnlocked && 'hover:opacity-80 hover:border-slate-600'}`}
            >
              {/* Unlock Badge */}
              {isUnlocked && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Unlock className="w-4 h-4 text-emerald-500" />
                </div>
              )}
              {isNext && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 shadow-lg flex items-center justify-center animate-pulse">
                  <Target className="w-4 h-4 text-white" />
                </div>
              )}
              {!isUnlocked && !isNext && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-700 shadow-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg transition-transform ${
                isUnlocked
                  ? 'bg-white/20'
                  : `bg-gradient-to-br ${milestone.gradient} ${isNext ? '' : 'grayscale opacity-50'}`
              }`}>
                <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-white'}`} />
              </div>

              {/* Content */}
              <h4 className={`text-sm font-bold mb-0.5 ${isUnlocked ? 'text-white' : 'text-white'}`}>
                {milestone.label}
              </h4>
              <p className={`text-[10px] mb-2 ${isUnlocked ? 'text-white/70' : 'text-slate-400'}`}>
                {isUnlocked ? '¡Desbloqueado!' : milestone.subtitle}
              </p>

              {/* Stats */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] ${isUnlocked ? 'text-white/60' : 'text-slate-500'}`}>Cuota</span>
                  <span className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-white'}`}>#{cuotaNum}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] ${isUnlocked ? 'text-white/60' : 'text-slate-500'}`}>Pagado</span>
                  <span className={`text-xs font-bold ${isUnlocked ? 'text-white' : 'text-emerald-400'}`}>S/{amountPaid.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] ${isUnlocked ? 'text-white/60' : 'text-slate-500'}`}>Fecha</span>
                  <span className={`text-xs ${isUnlocked ? 'text-white/80' : 'text-slate-300'}`}>{getMilestoneDate(milestone.percent)}</span>
                </div>
              </div>

              {/* Reward Tag */}
              <div className={`mt-3 pt-2 border-t ${isUnlocked ? 'border-white/20' : 'border-slate-700/50'}`}>
                <div className="flex items-center gap-1.5">
                  <Gift className={`w-3 h-3 ${isUnlocked ? 'text-white' : 'text-amber-400'}`} />
                  <span className={`text-[9px] font-medium ${isUnlocked ? 'text-white/80' : 'text-amber-400/80'}`}>
                    {milestone.reward}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Goal Section */}
      <div className="relative z-10 mt-6 p-5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                Meta Final
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                  {selectedTerm} cuotas
                </span>
              </p>
              <p className="text-xs text-slate-400">Completa tu aventura y gana todas las recompensas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              S/{(monthlyQuota * selectedTerm).toFixed(0)}
            </p>
            <p className="text-xs text-slate-400">Total inversión</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronogramaV5;
