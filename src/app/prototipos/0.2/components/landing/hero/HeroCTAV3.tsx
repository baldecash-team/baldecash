"use client";

import { Button } from "@nextui-org/react";
import { CalculatorIcon, LaptopIcon, LightningIcon, LockIcon, SparkleIcon } from "./Icons";

/**
 * HeroCTA - Versión C (Enfoque en capacidad del usuario)
 *
 * Características:
 * - CTAs que empoderan al usuario
 * - "Conoce tu capacidad de crédito" (primario)
 * - "Explorar catálogo" (secundario)
 * - Ideal para: engagement inicial, usuarios que quieren descubrir sus opciones
 * - Trade-off: requiere un paso adicional antes de ver productos
 */

export const HeroCTAV3 = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Headline */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl md:text-4xl font-bold text-[#262626] mb-3"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Descubre cuánto puedes financiar
        </h2>
        <p
          className="text-lg text-[#737373] max-w-xl mx-auto"
          style={{ fontFamily: "'Asap', sans-serif" }}
        >
          Calcula tu capacidad de crédito en menos de 2 minutos, sin afectar tu historial
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Primary CTA */}
        <Button
          href="/calculadora"
          as="a"
          className="w-full sm:w-auto bg-[#4247d2] text-white font-bold text-lg px-8 py-6 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          size="lg"
          endContent={
            <CalculatorIcon size={20} className="text-white" />
          }
        >
          Conoce tu capacidad de crédito
        </Button>

        {/* Secondary CTA */}
        <Button
          href="/productos"
          as="a"
          className="w-full sm:w-auto border-2 border-[#4247d2] text-[#4247d2] font-semibold text-lg px-8 py-6 hover:bg-[#4247d2] hover:text-white transition-all"
          variant="bordered"
          size="lg"
          endContent={
            <LaptopIcon size={20} />
          }
        >
          Explorar catálogo
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#4247d2]/10 flex items-center justify-center">
            <LightningIcon size={24} className="text-[#4247d2]" />
          </div>
          <p
            className="text-sm font-semibold text-[#262626] mb-1"
            style={{ fontFamily: "'Asap', sans-serif" }}
          >
            Resultado inmediato
          </p>
          <p className="text-xs text-[#737373]">Sin papeleos ni esperas</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#4247d2]/10 flex items-center justify-center">
            <LockIcon size={24} className="text-[#4247d2]" />
          </div>
          <p
            className="text-sm font-semibold text-[#262626] mb-1"
            style={{ fontFamily: "'Asap', sans-serif" }}
          >
            100% seguro
          </p>
          <p className="text-xs text-[#737373]">Datos protegidos</p>
        </div>

        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#4247d2]/10 flex items-center justify-center">
            <SparkleIcon size={24} className="text-[#4247d2]" />
          </div>
          <p
            className="text-sm font-semibold text-[#262626] mb-1"
            style={{ fontFamily: "'Asap', sans-serif" }}
          >
            Sin compromiso
          </p>
          <p className="text-xs text-[#737373]">Consulta gratis</p>
        </div>
      </div>
    </div>
  );
};
