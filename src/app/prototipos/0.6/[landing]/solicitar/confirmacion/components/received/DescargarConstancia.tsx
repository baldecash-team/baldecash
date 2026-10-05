'use client';

/**
 * La copia del contrato, a disposición apenas se cierra el KYC.
 *
 * Lo pide el §4 paso 12 de la propuesta de aceptación electrónica: hay que
 * remitir o poner inmediatamente a disposición copia del contrato y sus anexos.
 * Esta es la puesta a disposición del lado de la persona; del lado de Balde K
 * ya quedó registrada la fecha en la solicitud.
 *
 * Lo que se ofrece es la CONSTANCIA, no el contrato pelado: es el mismo
 * documento con la huella estampada en todas las hojas y la hoja que dice
 * quién aceptó, cuándo y con qué palabras. Bajarse el contrato sin eso sería
 * bajarse un PDF que no acredita nada.
 *
 * Si no hay link no se pinta: se llega acá también desde el submit de siempre,
 * y desde otro dispositivo, donde no hubo cierre de KYC que dejara nada.
 */
import React, { useEffect, useState } from 'react';

import { leerConstancia } from '../../../kyc/constanciaStorage';

export interface DescargarConstanciaProps {
  landing: string;
  applicationCode?: string | null;
  /** Se emite una vez, cuando la copia se le muestra a la persona. */
  onDisponible?: () => void;
  /** Se emite cuando la abre. */
  onDescargar?: () => void;
}

export const DescargarConstancia: React.FC<DescargarConstanciaProps> = ({
  landing,
  applicationCode,
  onDisponible,
  onDescargar,
}) => {
  // En estado y no leído en el render: `localStorage` no existe en el
  // servidor, y pintar distinto en los dos lados rompe la hidratación.
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationCode) return;
    const guardada = leerConstancia(landing, applicationCode);
    if (guardada) {
      setUrl(guardada);
      onDisponible?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landing, applicationCode]);

  if (!url) return null;

  return (
    <div
      data-testid="descargar-constancia"
      className="mt-6 rounded-xl border border-[#DDDFF7] bg-[#F9F9FE] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
    >
      <div>
        <p className="text-sm font-semibold text-[#1f2937]">Tu copia del contrato</p>
        <p className="mt-0.5 text-xs text-[#6b7280]">
          Incluye la constancia de tu aceptación electrónica. Guárdala: te sirve para verificar
          en cualquier momento que el documento no cambió.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onDescargar}
        className="mt-3 inline-block shrink-0 rounded-xl bg-[#4654CD] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:mt-0"
      >
        Descargar
      </a>
    </div>
  );
};

export default DescargarConstancia;
