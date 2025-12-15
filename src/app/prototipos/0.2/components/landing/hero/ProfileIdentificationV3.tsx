"use client";

import { useState } from "react";
import { Button, Chip } from "@nextui-org/react";
import type { ProfileIdentificationProps } from "./types";

/**
 * ProfileIdentification - Versión C (Floating/Sticky)
 *
 * Características:
 * - Banner flotante o sticky en la parte superior
 * - Diseño minimalista que no obstruye
 * - Dismissible después de responder
 * - Ideal para: balance entre visibilidad y no invasividad
 * - Trade-off: puede pasar desapercibido inicialmente
 */

export const ProfileIdentificationV3 = ({ onResponse }: ProfileIdentificationProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResponse = (isStudent: boolean) => {
    onResponse?.(isStudent);
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 animate-slide-down">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg border border-[#E5E5E5] rounded-2xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Icon + Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4654CD] to-[#03DBD0] p-0.5 flex-shrink-0">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-[#262626]"
                  style={{ fontFamily: "'Baloo 2', cursive" }}
                >
                  ¿Eres estudiante?
                </h3>
                <p
                  className="text-sm text-[#737373] hidden md:block"
                  style={{ fontFamily: "'Asap', sans-serif" }}
                >
                  Personaliza tu experiencia
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                className="bg-[#4654CD] text-white font-semibold hover:bg-[#3544A8] transition-colors"
                size="md"
                onPress={() => handleResponse(true)}
              >
                Sí, soy estudiante
              </Button>
              <Button
                className="border-2 border-[#E5E5E5] text-[#737373] font-medium hover:border-[#4654CD] hover:text-[#4654CD] transition-colors"
                variant="bordered"
                size="md"
                onPress={() => handleResponse(false)}
              >
                Solo exploro
              </Button>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsDismissed(true)}
                className="text-[#737373] hover:text-[#262626]"
                aria-label="Cerrar"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
