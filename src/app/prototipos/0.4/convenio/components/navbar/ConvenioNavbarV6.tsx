'use client';

/**
 * ConvenioNavbarV6 - Navbar con barra de progreso de cupos
 * Version: V6 - Muestra cupos limitados con barra de progreso
 */

import React, { useState } from 'react';
import { Button, Progress } from '@nextui-org/react';
import { Menu, X, Users, AlertCircle } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

export const ConvenioNavbarV6: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock data for available slots
  const totalCupos = 50;
  const cuposUsados = 38;
  const cuposDisponibles = totalCupos - cuposUsados;
  const porcentajeUsado = (cuposUsados / totalCupos) * 100;

  return (
    <div className="sticky top-0 z-50">
      {/* Progress banner */}
      <div className="bg-neutral-900 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <Users className="w-4 h-4 text-white" />
          <span className="text-white text-sm">
            Cupos {convenio.nombreCorto}:
          </span>
          <div className="flex items-center gap-2 min-w-[160px]">
            <Progress
              size="sm"
              value={porcentajeUsado}
              classNames={{
                base: 'w-24',
                track: 'bg-white/20',
                indicator: porcentajeUsado > 80 ? 'bg-red-500' : 'bg-[#03DBD0]',
              }}
            />
            <span className="text-white text-sm font-semibold">
              {cuposDisponibles} disponibles
            </span>
          </div>
          {porcentajeUsado > 75 && (
            <div className="hidden sm:flex items-center gap-1 text-amber-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>¡Últimos cupos!</span>
            </div>
          )}
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logos */}
          <div className="flex items-center gap-4">
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 object-contain"
            />
            <span className="text-neutral-300 text-lg hidden sm:inline">×</span>
            <img
              src={convenio.logo}
              alt={convenio.nombre}
              className="h-6 object-contain hidden sm:block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Desktop: Badge + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-700 font-medium">
                {cuposDisponibles} cupos restantes
              </span>
            </div>
            <Button
              className="bg-[#4654CD] text-white rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors font-semibold"
              onPress={onVerEquipos}
            >
              Reservar mi cupo
            </Button>
          </div>

          {/* Mobile: Menu toggle */}
          <button
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Cupos info */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-700 font-medium">
                  Cupos disponibles
                </span>
                <span className="text-lg font-bold text-amber-800">
                  {cuposDisponibles}/{totalCupos}
                </span>
              </div>
              <Progress
                size="md"
                value={porcentajeUsado}
                classNames={{
                  track: 'bg-amber-200',
                  indicator: porcentajeUsado > 80 ? 'bg-red-500' : 'bg-amber-500',
                }}
              />
            </div>
            <Button
              size="lg"
              className="bg-[#4654CD] text-white rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors w-full font-semibold"
              onPress={() => {
                onVerEquipos?.();
                setIsMenuOpen(false);
              }}
            >
              Reservar mi cupo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvenioNavbarV6;
