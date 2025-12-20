'use client';

/**
 * ConvenioCtaV2 - CTA con calculadora inline
 * Version: V2 - Incluye mini calculadora de cuotas
 */

import React, { useState } from 'react';
import { Button, Slider, Card, CardBody } from '@nextui-org/react';
import { ArrowRight, Calculator } from 'lucide-react';
import { ConvenioCtaProps } from '../../types/convenio';
import { calcularCuotaConDescuento, calcularAhorroTotal } from '../../data/mockConvenioData';

export const ConvenioCtaV2: React.FC<ConvenioCtaProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const [monto, setMonto] = useState(2500);
  const [plazo, setPlazo] = useState(12);

  const cuotaBase = Math.round(monto / plazo * 1.15);
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaBase, convenio.descuentoCuota);
  const ahorroTotal = calcularAhorroTotal(cuotaBase, convenio.descuentoCuota, plazo);

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 font-['Baloo_2']">
              Calcula tu cuota con descuento
            </h2>
            <p className="text-neutral-600 mb-6">
              Usa la calculadora para ver cuánto pagarías mensualmente con tu descuento
              de convenio {convenio.nombreCorto}.
            </p>

            <div className="flex items-center gap-3 p-4 bg-[#03DBD0]/10 rounded-xl">
              <Calculator className="w-6 h-6 text-[#03DBD0]" />
              <div>
                <p className="text-sm text-neutral-600">Ahorro total estimado</p>
                <p className="text-2xl font-bold text-[#03DBD0] font-['Baloo_2']">S/{ahorroTotal}</p>
              </div>
            </div>
          </div>

          {/* Right: Calculator */}
          <Card className="border border-neutral-200 shadow-lg">
            <CardBody className="p-6">
              {/* Monto slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-neutral-600">Precio del equipo</label>
                  <span className="text-sm font-semibold text-neutral-800">S/{monto.toLocaleString()}</span>
                </div>
                <Slider
                  size="sm"
                  step={100}
                  minValue={1500}
                  maxValue={5000}
                  value={monto}
                  onChange={(val) => setMonto(val as number)}
                  classNames={{
                    filler: 'bg-[#4654CD]',
                    thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-lg cursor-pointer',
                    track: 'bg-neutral-200 h-1.5',
                  }}
                />
              </div>

              {/* Plazo slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-neutral-600">Plazo</label>
                  <span className="text-sm font-semibold text-neutral-800">{plazo} meses</span>
                </div>
                <Slider
                  size="sm"
                  step={6}
                  minValue={6}
                  maxValue={24}
                  value={plazo}
                  onChange={(val) => setPlazo(val as number)}
                  classNames={{
                    filler: 'bg-[#4654CD]',
                    thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-lg cursor-pointer',
                    track: 'bg-neutral-200 h-1.5',
                  }}
                />
              </div>

              {/* Result */}
              <div
                className="rounded-xl p-4 mb-6 text-center"
                style={{ backgroundColor: convenio.colorPrimario }}
              >
                <p className="text-white/80 text-sm mb-1">Tu cuota mensual</p>
                <p className="text-4xl font-bold text-white font-['Baloo_2']">
                  S/{cuotaConDescuento}
                  <span className="text-lg font-normal text-white/80">/mes</span>
                </p>
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full bg-[#4654CD] text-white font-bold rounded-xl cursor-pointer hover:bg-[#3a47b3] transition-colors"
                endContent={<ArrowRight className="w-5 h-5" />}
                onPress={onVerEquipos}
              >
                Ver equipos disponibles
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ConvenioCtaV2;
