'use client';

/**
 * ConvenioNavbarV5 - Navbar con countdown de oferta
 * Version: V5 - Incluye contador regresivo para urgencia
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { Menu, X, Clock, ArrowRight } from 'lucide-react';
import { ConvenioNavbarProps } from '../../types/convenio';

const BALDECASH_LOGO = 'https://cdn.prod.website-files.com/62141f21700a64ab3f816206/621cec3ede9cbc00d538e2e4_logo-2%203.png';

// Countdown hook
const useCountdown = (targetDays: number = 3) => {
  const [timeLeft, setTimeLeft] = useState({
    dias: targetDays,
    horas: 12,
    minutos: 30,
    segundos: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { dias, horas, minutos, segundos } = prev;
        segundos--;

        if (segundos < 0) {
          segundos = 59;
          minutos--;
        }
        if (minutos < 0) {
          minutos = 59;
          horas--;
        }
        if (horas < 0) {
          horas = 23;
          dias--;
        }
        if (dias < 0) {
          dias = targetDays;
          horas = 23;
          minutos = 59;
          segundos = 59;
        }

        return { dias, horas, minutos, segundos };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDays]);

  return timeLeft;
};

export const ConvenioNavbarV5: React.FC<ConvenioNavbarProps> = ({ convenio, onVerEquipos }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const countdown = useCountdown(2);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="sticky top-0 z-50">
      {/* Countdown banner */}
      <div
        className="py-2 px-4 text-white"
        style={{ backgroundColor: convenio.colorPrimario }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Oferta exclusiva {convenio.nombreCorto} termina en</span>
          <div className="flex items-center gap-1 font-mono font-bold text-lg">
            <span className="bg-white/20 px-2 py-0.5 rounded">{formatNumber(countdown.dias)}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded">{formatNumber(countdown.horas)}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded">{formatNumber(countdown.minutos)}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded">{formatNumber(countdown.segundos)}</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logos */}
          <div className="flex items-center gap-3">
            <img
              src={BALDECASH_LOGO}
              alt="BaldeCash"
              className="h-8 object-contain"
            />
            <div className="w-px h-6 bg-neutral-200 hidden sm:block" />
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

          {/* Desktop: CTA */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-neutral-600">
              {convenio.descuentoCuota}% de descuento
            </span>
            <Button
              className="bg-[#4654CD] text-white px-6 rounded-xl cursor-pointer hover:bg-[#3a47b3] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={onVerEquipos}
            >
              ¡Aprovecha ahora!
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
            <div className="text-center py-2 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Oferta termina en</p>
              <div className="flex items-center justify-center gap-1 font-mono font-bold text-lg text-[#4654CD]">
                <span>{formatNumber(countdown.dias)}d</span>
                <span>:</span>
                <span>{formatNumber(countdown.horas)}h</span>
                <span>:</span>
                <span>{formatNumber(countdown.minutos)}m</span>
              </div>
            </div>
            <Button
              className="bg-[#4654CD] text-white rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-all w-full font-semibold"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={() => {
                onVerEquipos?.();
                setIsMenuOpen(false);
              }}
            >
              ¡Aprovecha ahora!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvenioNavbarV5;
