'use client';

/**
 * ConvenioHeroV3 - Hero Split con Calculadora
 * Version: V3 - Mitad información, mitad calculadora interactiva
 */

import React, { useState } from 'react';
import { Button, Slider, Card, CardBody, Chip } from '@nextui-org/react';
import { Calculator, ArrowRight, Percent } from 'lucide-react';
import { ConvenioHeroProps } from '../../types/convenio';
import { calcularCuotaConDescuento, calcularAhorroTotal } from '../../data/mockConvenioData';

export const ConvenioHeroV3: React.FC<ConvenioHeroProps> = ({
  convenio,
  cuotaDesde = 49,
  onVerEquipos,
}) => {
  const [monto, setMonto] = useState(2500);
  const [plazo, setPlazo] = useState(12);

  // Calculate quote based on amount and term
  const cuotaBase = Math.round(monto / plazo * 1.15); // Simple calculation with interest
  const cuotaConDescuento = calcularCuotaConDescuento(cuotaBase, convenio.descuentoCuota);
  const ahorroTotal = calcularAhorroTotal(cuotaBase, convenio.descuentoCuota, plazo);

  return (
    <div className="grid md:grid-cols-2 min-h-[80vh]">
      {/* Left: Information */}
      <div
        className="text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center"
        style={{ backgroundColor: convenio.colorPrimario }}
      >
        {/* Logo */}
        <img
          src={convenio.logo}
          alt={convenio.nombre}
          className="h-12 object-contain object-left mb-6"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        <Chip
          radius="sm"
          classNames={{
            base: 'bg-white/20 px-3 py-1 h-auto mb-4 w-fit',
            content: 'text-white text-xs font-medium',
          }}
        >
          Convenio exclusivo
        </Chip>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-['Baloo_2']">
          {convenio.descuentoCuota}% menos en cada cuota
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Usa la calculadora para ver cuánto ahorras por ser estudiante de {convenio.nombreCorto}.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-bold text-sm">1</span>
            </div>
            <span>Elige tu equipo favorito</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-bold text-sm">2</span>
            </div>
            <span>Verifica tu correo institucional</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-bold text-sm">3</span>
            </div>
            <span>Recibe tu descuento automáticamente</span>
          </div>
        </div>
      </div>

      {/* Right: Calculator */}
      <div className="bg-neutral-50 p-8 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">Calculadora de cuotas</h3>
                <p className="text-xs text-neutral-500">Con descuento {convenio.nombreCorto}</p>
              </div>
            </div>

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
                  base: 'max-w-full',
                  filler: 'bg-[#4654CD]',
                  thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-lg cursor-pointer',
                  track: 'bg-neutral-200 h-1.5',
                }}
              />
            </div>

            {/* Plazo slider */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm text-neutral-600">Plazo de financiamiento</label>
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
                  base: 'max-w-full',
                  filler: 'bg-[#4654CD]',
                  thumb: 'bg-white border-2 border-[#4654CD] w-4 h-4 shadow-lg cursor-pointer',
                  track: 'bg-neutral-200 h-1.5',
                }}
              />
            </div>

            {/* Results */}
            <div className="bg-neutral-100 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-600">Cuota sin descuento</span>
                <span className="text-neutral-400 line-through">S/{cuotaBase}/mes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Tu cuota con convenio</span>
                <span className="text-2xl font-bold text-[#4654CD] font-['Baloo_2']">
                  S/{cuotaConDescuento}/mes
                </span>
              </div>
            </div>

            {/* Savings badge */}
            <div
              className="rounded-xl p-4 mb-6 text-white"
              style={{ backgroundColor: convenio.colorPrimario }}
            >
              <div className="flex items-center gap-3">
                <Percent className="w-6 h-6" />
                <div>
                  <p className="text-sm text-white/80">Ahorro total en {plazo} meses</p>
                  <p className="text-xl font-bold font-['Baloo_2']">S/{ahorroTotal}</p>
                </div>
              </div>
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
  );
};

export default ConvenioHeroV3;
