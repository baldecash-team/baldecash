"use client";

import { Card, CardBody } from "@nextui-org/react";
import type { ProfileIdentificationProps } from "./types";
import { GraduationCapIcon, EyeIcon } from "./Icons";

/**
 * ProfileIdentification - Versión B (Inline destacado)
 *
 * Características:
 * - Pregunta integrada en el hero como sección destacada
 * - Cards o botones grandes para seleccionar
 * - Sin interrumpir el flujo visual
 * - Ideal para: experiencia menos invasiva pero visible
 * - Trade-off: puede ser ignorado por algunos usuarios
 */

export const ProfileIdentificationV2 = ({ onResponse }: ProfileIdentificationProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold text-[#262626] mb-2"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          ¿Eres estudiante?
        </h2>
        <p className="text-[#737373]" style={{ fontFamily: "'Asap', sans-serif" }}>
          Selecciona tu perfil para continuar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opción: Sí, soy estudiante */}
        <Card
          isPressable
          onPress={() => onResponse?.(true)}
          className="border-2 border-[#E5E5E5] hover:border-[#4247d2] hover:shadow-lg transition-all cursor-pointer group"
        >
          <CardBody className="p-6 text-center flex flex-col h-full">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[#4247d2] p-1 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <GraduationCapIcon size={36} className="text-[#4247d2]" />
                </div>
              </div>
            </div>
            <h3
              className="text-xl font-bold text-[#262626] mb-2"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Soy estudiante
            </h3>
            <p className="text-sm text-[#737373] mb-4 flex-grow" style={{ fontFamily: "'Asap', sans-serif" }}>
              Accede a financiamiento especial para tu laptop
            </p>
            <div className="bg-[#4247d2] text-white font-semibold w-full py-2 px-4 rounded-lg text-center">
              Continuar
            </div>
          </CardBody>
        </Card>

        {/* Opción: Solo estoy explorando */}
        <Card
          isPressable
          onPress={() => onResponse?.(false)}
          className="border-2 border-[#E5E5E5] hover:border-[#4247d2] hover:shadow-lg transition-all cursor-pointer group"
        >
          <CardBody className="p-6 text-center flex flex-col h-full">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[#4247d2] p-1 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <EyeIcon size={36} className="text-[#4247d2]" />
                </div>
              </div>
            </div>
            <h3
              className="text-xl font-bold text-[#262626] mb-2"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Estoy explorando
            </h3>
            <p className="text-sm text-[#737373] mb-4 flex-grow" style={{ fontFamily: "'Asap', sans-serif" }}>
              Conoce cómo funciona BaldeCash
            </p>
            <div className="border-2 border-[#4247d2] text-[#4247d2] font-semibold w-full py-2 px-4 rounded-lg text-center">
              Ver información
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
