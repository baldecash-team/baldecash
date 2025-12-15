"use client";

import { Button } from "@nextui-org/react";

/**
 * HeroCTA - Versión A (Enfoque en acción directa)
 *
 * Características:
 * - CTAs que invitan a acciones concretas
 * - "Ver laptops disponibles" (primario)
 * - "Conocer requisitos" (secundario)
 * - Ideal para: usuarios que quieren explorar productos inmediatamente
 * - Trade-off: menos énfasis en beneficios o precios
 */

export const HeroCTAV1 = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Primary CTA */}
        <Button
          href="/productos"
          as="a"
          className="w-full sm:w-auto bg-[#4654CD] text-white font-bold text-lg px-8 py-6 hover:bg-[#3544A8] transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          size="lg"
          endContent={
            <span className="text-xl">💻</span>
          }
        >
          Ver laptops disponibles
        </Button>

        {/* Secondary CTA */}
        <Button
          href="/requisitos"
          as="a"
          className="w-full sm:w-auto border-2 border-[#4654CD] text-[#4654CD] font-semibold text-lg px-8 py-6 hover:bg-[#4654CD] hover:text-white transition-all"
          variant="bordered"
          size="lg"
          endContent={
            <span className="text-xl">📋</span>
          }
        >
          Conocer requisitos
        </Button>
      </div>

      {/* Supporting text */}
      <div className="text-center mt-4">
        <p className="text-sm text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
          Sin historial crediticio • Aprobación en 24 horas • Desde S/49/mes
        </p>
      </div>
    </div>
  );
};
