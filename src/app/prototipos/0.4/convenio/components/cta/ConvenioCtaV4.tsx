'use client';

/**
 * ConvenioCtaV4 - CTA split (info + botón)
 * Version: V4 - Layout dividido con información y CTA
 */

import React from 'react';
import { Button, Chip } from '@nextui-org/react';
import { ArrowRight, CheckCircle, Percent } from 'lucide-react';
import { ConvenioCtaProps } from '../../types/convenio';
import { calcularCuotaConDescuento } from '../../data/mockConvenioData';

export const ConvenioCtaV4: React.FC<ConvenioCtaProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaDesde, convenio.descuentoCuota);
  const ahorroPorCuota = cuotaDesde - cuotaConDescuento;

  const beneficios = [
    'Sin historial crediticio',
    'Aprobación en 24 horas',
    'Entrega gratis a domicilio',
    'Hasta 24 cuotas',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-50 rounded-2xl overflow-hidden">
          {/* Left: Info */}
          <div className="p-8 md:p-12">
            <Chip
              radius="sm"
              startContent={<Percent className="w-3 h-3" />}
              classNames={{
                base: 'px-3 py-1 h-auto mb-4',
                content: 'text-white text-xs font-medium',
              }}
              style={{ backgroundColor: convenio.colorPrimario }}
            >
              {convenio.descuentoCuota}% de descuento
            </Chip>

            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
              Tu equipo te espera
            </h2>
            <p className="text-neutral-600 mb-6">
              Aprovecha las ventajas exclusivas de tu convenio {convenio.nombreCorto} y
              financia tu equipo en cuotas accesibles.
            </p>

            {/* Benefits */}
            <ul className="space-y-3 mb-6">
              {beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-center gap-2 text-neutral-700">
                  <CheckCircle className="w-5 h-5 text-[#22c55e]" />
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Price + CTA */}
          <div
            className="p-8 md:p-12 text-white"
            style={{ backgroundColor: convenio.colorPrimario }}
          >
            <div className="text-center">
              <p className="text-white/70 mb-2">Cuotas desde</p>
              <p className="text-5xl md:text-6xl font-bold font-['Baloo_2'] mb-1">
                S/{cuotaConDescuento}
              </p>
              <p className="text-white/70 mb-2">/mes</p>

              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm mb-6">
                <span>Ahorras S/{ahorroPorCuota} cada mes</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-white text-[#4654CD] font-bold rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={onVerEquipos}
              >
                Ver equipos disponibles
              </Button>

              <p className="text-xs text-white/60 mt-4">
                Válido para estudiantes con correo @{convenio.dominioEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCtaV4;
