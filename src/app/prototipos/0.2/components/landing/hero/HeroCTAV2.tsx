"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import { QuestionIcon, CheckIcon } from "./Icons";

/**
 * HeroCTA - Versión B (Enfoque en beneficio/precio)
 *
 * Características:
 * - CTAs que destacan el precio accesible
 * - "Laptops desde S/49/mes" (primario)
 * - "¿Cómo funciona?" (secundario)
 * - Ideal para: conversión price-sensitive, estudiantes con presupuesto limitado
 * - Trade-off: puede atraer solo a usuarios enfocados en precio
 */

export const HeroCTAV2 = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Price Highlight Card */}
      <Card className="mb-6 bg-[#4247d2]/5 border-2 border-[#4247d2]/20">
        <CardBody className="p-6">
          <div className="text-center">
            <p
              className="text-sm text-[#737373] mb-2"
              style={{ fontFamily: "'Asap', sans-serif" }}
            >
              Financia tu laptop desde
            </p>
            <div
              className="text-5xl md:text-6xl font-bold text-[#4247d2] mb-2"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              S/49
              <span className="text-3xl md:text-4xl">/mes</span>
            </div>
            <p
              className="text-xs text-[#737373]"
              style={{ fontFamily: "'Asap', sans-serif" }}
            >
              Sin cuota inicial • Sin historial crediticio
            </p>
          </div>
        </CardBody>
      </Card>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Primary CTA */}
        <Button
          href="/productos"
          as="a"
          className="w-full sm:w-auto bg-[#4247d2] text-white font-bold text-lg px-8 py-6 hover:bg-[#4247d2]/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          size="lg"
          endContent={
            <span className="text-xl">→</span>
          }
        >
          Ver catálogo completo
        </Button>

        {/* Secondary CTA */}
        <Button
          href="/como-funciona"
          as="a"
          className="w-full sm:w-auto text-[#4247d2] font-semibold text-lg px-8 py-6 hover:bg-[#F5F5F5] transition-all"
          variant="light"
          size="lg"
          endContent={
            <QuestionIcon size={20} />
          }
        >
          ¿Cómo funciona?
        </Button>
      </div>

      {/* Benefits list */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <div className="flex items-center gap-2 text-sm text-[#737373]">
          <CheckIcon size={18} className="text-[#4247d2]" />
          <span>Aprobación en 24h</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#737373]">
          <CheckIcon size={18} className="text-[#4247d2]" />
          <span>Envío gratis</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#737373]">
          <CheckIcon size={18} className="text-[#4247d2]" />
          <span>Sin sorpresas</span>
        </div>
      </div>
    </div>
  );
};
