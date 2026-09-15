'use client';

/**
 * El formulario de entrega dentro de la pantalla final del KYC.
 *
 * Después de firmar electrónicamente, coordinar la entrega es lo único que
 * queda por hacer, y hasta acá había que esperar el WhatsApp con el enlace para
 * poder hacerlo. La persona está en pantalla y con la dirección fresca: el
 * formulario va acá mismo.
 *
 * El token lo deja el cierre del KYC (`/completar` lo devuelve y `kycClient` lo
 * guarda). Si no está —otro dispositivo, modo privado, o una solicitud con
 * cuota inicial pendiente, donde el siguiente paso es pagar— esta sección no
 * se pinta y no pasa nada: el enlace igual llega por WhatsApp.
 */

import { useEffect, useState } from 'react';
import { EntregaTokenClient } from '@/app/prototipos/0.6/entrega/components/EntregaTokenClient';
import {
  leerEntregaToken,
  olvidarEntregaToken,
} from '@/app/prototipos/0.6/[landing]/solicitar/kyc/entregaStorage';

export interface EntregaIncrustadaProps {
  landing: string;
  applicationCode: string;
}

export function EntregaIncrustada({ landing, applicationCode }: EntregaIncrustadaProps) {
  // El token vive en `localStorage`, que no existe en el servidor: se lee
  // después de montar para que el HTML del servidor y el del cliente coincidan.
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(leerEntregaToken(landing, applicationCode));
  }, [landing, applicationCode]);

  if (!token) return null;

  return (
    <section
      data-testid="entrega-incrustada"
      className="mx-auto w-full max-w-3xl px-4 pt-8 pb-4"
      aria-label="Coordina la entrega de tu equipo"
    >
      <div className="mb-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8B99]">
          Falta un paso
        </p>
        <h2 className="mt-1 text-lg font-bold text-[#222226]">
          Dinos a dónde enviamos tu equipo
        </h2>
      </div>
      <div className="rounded-2xl border border-[#E3E4EC] bg-white p-4 sm:p-6">
        <EntregaTokenClient
          token={token}
          // Completado el envío, el token ya cumplió: no tiene que reaparecer
          // si la persona vuelve a esta pantalla.
          onVerSolicitud={() => olvidarEntregaToken(landing, applicationCode)}
        />
      </div>
    </section>
  );
}

export default EntregaIncrustada;
