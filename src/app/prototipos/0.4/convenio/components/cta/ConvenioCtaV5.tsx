'use client';

/**
 * ConvenioCtaV5 - CTA con cupos limitados
 * Version: V5 - Muestra escasez con barra de progreso de cupos
 */

import React from 'react';
import { Button, Progress } from '@nextui-org/react';
import { ArrowRight, Users, AlertTriangle } from 'lucide-react';
import { ConvenioCtaProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioCtaV5: React.FC<ConvenioCtaProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);

  // Mock data for scarcity
  const totalCupos = 50;
  const cuposUsados = 42;
  const cuposDisponibles = totalCupos - cuposUsados;
  const porcentajeUsado = (cuposUsados / totalCupos) * 100;

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-4xl mx-auto px-4">
        {/* Scarcity alert */}
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-white font-medium">Cupos limitados para {convenio.nombreCorto}</p>
                <p className="text-sm text-neutral-400">
                  Solo {cuposDisponibles} cupos disponibles este mes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-[150px]">
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>Cupos usados</span>
                  <span>{cuposUsados}/{totalCupos}</span>
                </div>
                <Progress
                  value={porcentajeUsado}
                  classNames={{
                    track: 'bg-neutral-700',
                    indicator: porcentajeUsado > 80 ? 'bg-red-500' : 'bg-amber-500',
                  }}
                />
              </div>
              <Users className="w-5 h-5 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['Baloo_2']">
            No te quedes sin tu cupo
          </h2>
          <p className="text-lg text-neutral-400 mb-6 max-w-2xl mx-auto">
            El convenio {convenio.nombreCorto} tiene cupos limitados cada mes. Aprovecha
            el {convenio.descuentoCuota}% de descuento en cuotas desde S/{cuotaConDescuento}/mes.
          </p>

          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-white text-sm">
              {cuposDisponibles} estudiantes pueden aplicar ahora
            </span>
          </div>

          <div>
            <Button
              size="lg"
              className="text-white font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity px-10 py-6 text-lg"
              style={{ backgroundColor: convenio.colorPrimario }}
              endContent={<ArrowRight className="w-5 h-5" />}
              onPress={onVerEquipos}
            >
              Reservar mi cupo
            </Button>
          </div>

          <p className="text-neutral-500 text-sm mt-6">
            Los cupos se renuevan el 1ro de cada mes
          </p>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCtaV5;
