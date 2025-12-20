'use client';

/**
 * ConvenioCtaV3 - CTA con countdown urgencia
 * Version: V3 - Incluye contador regresivo para generar urgencia
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { ConvenioCtaProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

const useCountdown = (targetDays: number = 2) => {
  const [timeLeft, setTimeLeft] = useState({
    dias: targetDays,
    horas: 18,
    minutos: 45,
    segundos: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { dias, horas, minutos, segundos } = prev;
        segundos--;
        if (segundos < 0) { segundos = 59; minutos--; }
        if (minutos < 0) { minutos = 59; horas--; }
        if (horas < 0) { horas = 23; dias--; }
        if (dias < 0) { dias = targetDays; horas = 23; minutos = 59; segundos = 59; }
        return { dias, horas, minutos, segundos };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDays]);

  return timeLeft;
};

export const ConvenioCtaV3: React.FC<ConvenioCtaProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
  showCountdown = true,
}) => {
  const countdown = useCountdown(2);
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <section
      className="py-12"
      style={{ backgroundColor: convenio.colorPrimario }}
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Countdown banner */}
        {showCountdown && (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-300" />
                <span className="text-white font-medium">
                  ¡Oferta exclusiva termina pronto!
                </span>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-3xl font-bold text-white font-mono">
                    {formatNumber(countdown.dias)}
                  </div>
                  <span className="text-xs text-white/70">días</span>
                </div>
                <span className="text-2xl text-white/50">:</span>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-3xl font-bold text-white font-mono">
                    {formatNumber(countdown.horas)}
                  </div>
                  <span className="text-xs text-white/70">horas</span>
                </div>
                <span className="text-2xl text-white/50">:</span>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-3xl font-bold text-white font-mono">
                    {formatNumber(countdown.minutos)}
                  </div>
                  <span className="text-xs text-white/70">min</span>
                </div>
                <span className="text-2xl text-white/50">:</span>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-4 py-2 text-3xl font-bold text-white font-mono">
                    {formatNumber(countdown.segundos)}
                  </div>
                  <span className="text-xs text-white/70">seg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Baloo_2']">
            {convenio.descuentoCuota}% de descuento solo para {convenio.nombreCorto}
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
            No dejes pasar esta oportunidad. Cuotas desde S/{cuotaConDescuento}/mes con tu
            beneficio de estudiante.
          </p>

          <Button
            size="lg"
            className="bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors px-10 py-6 text-lg"
            endContent={<ArrowRight className="w-5 h-5" />}
            onPress={onVerEquipos}
          >
            ¡Aprovecha ahora!
          </Button>

          <p className="text-white/60 text-sm mt-4 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Proceso 100% en línea, aprobación en 24h
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCtaV3;
