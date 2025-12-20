'use client';

/**
 * ConvenioHeroV5 - Hero con Countdown de Urgencia
 * Version: V5 - Incluye contador regresivo para generar urgencia
 */

import React, { useState, useEffect } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, Clock, AlertCircle, Shield } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

// Countdown hook
const useCountdown = (targetDays: number = 2) => {
  const [timeLeft, setTimeLeft] = useState({
    dias: targetDays,
    horas: 15,
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

export const ConvenioHeroV5: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const countdown = useCountdown(2);
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);
  const ahorroPorCuota = cuotaDesde - cuotaConDescuento;

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-[#4654CD] relative overflow-hidden">
      {/* Urgency banner */}
      <div
        className="py-3 text-white text-center"
        style={{ backgroundColor: convenio.colorPrimario }}
      >
        <div className="flex items-center justify-center gap-3 flex-wrap px-4">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Oferta exclusiva {convenio.nombreCorto} termina en</span>
          <div className="flex items-center gap-1 font-mono font-bold text-xl">
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

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute top-40 -left-20 w-60 h-60 rounded-full bg-white/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <Chip
                radius="sm"
                classNames={{
                  base: 'bg-amber-400/20 px-3 py-1 h-auto',
                  content: 'text-amber-300 text-xs font-medium',
                }}
              >
                ¡Oferta por tiempo limitado!
              </Chip>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-['Baloo_2']">
              {convenio.descuentoCuota}% de descuento exclusivo {convenio.nombreCorto}
            </h1>

            <p className="text-lg text-white/80 mb-6">
              Aprovecha esta promoción especial para estudiantes. El descuento se aplica
              automáticamente en cada cuota mensual.
            </p>

            {/* Price comparison */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-8">
              <div className="flex items-end gap-4 mb-2">
                <div>
                  <p className="text-white/60 text-xs mb-1">Precio regular</p>
                  <p className="text-xl text-white/50 line-through">
                    S/{cuotaDesde}/mes
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs mb-1">Tu precio convenio</p>
                  <p className="text-4xl font-bold font-['Baloo_2']">
                    S/{cuotaConDescuento}
                    <span className="text-base font-normal text-white/80">/mes</span>
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/20">
                <p className="text-[#03DBD0] font-semibold">
                  Ahorras S/{ahorroPorCuota} cada mes
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={onVerEquipos}
            >
              ¡Aprovecha ahora!
            </Button>

            {/* Trust */}
            <div className="flex items-center gap-2 mt-4 text-white/70 text-sm">
              <Shield className="w-4 h-4" />
              <span>Proceso 100% en línea. Sin papeleos.</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden md:block">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=500&fit=crop"
                alt="Laptop para estudiantes"
                className="w-full rounded-2xl shadow-2xl"
                loading="lazy"
              />

              {/* Floating countdown card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Termina en</p>
                <div className="flex gap-2 font-mono font-bold text-[#4654CD]">
                  <span>{formatNumber(countdown.dias)}d</span>
                  <span>{formatNumber(countdown.horas)}h</span>
                  <span>{formatNumber(countdown.minutos)}m</span>
                </div>
              </div>

              {/* Discount badge */}
              <div
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: convenio.colorPrimario }}
              >
                <span className="text-2xl font-['Baloo_2']">{convenio.descuentoCuota}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvenioHeroV5;
