'use client';

/**
 * F8 · Confirmación de Diseño 2 (BAL-4967) — la última pantalla del rediseño
 * de Brenda. Es solo presentación: usa los MISMOS datos que `ReceivedScreen`
 * (Diseño 1) — `ReceivedData`, construida por el mismo `buildReceivedData` de
 * siempre en `confirmacionClient.tsx` — y no llama ningún endpoint nuevo.
 *
 * Qué conserva de Diseño 1 (regla 8 del brief, "no se toca el orden"):
 * - El `otpCta` opcional (verificar correo) se sigue mostrando donde iba.
 * - `modoCierreKyc` / `cierre` deciden el mensaje (firmada, aprobada,
 *   completada) EXACTO que ya usa `ReceivedMessage` — ver `textoCabeceraV2`.
 * - Con esos estados, la línea de tiempo NO se pinta: Diseño 1 ya decidió
 *   (ver el comentario de `ReceivedScreen`) que mostrar "estamos revisando"
 *   después de una firma sería falso. `ConfirmacionV2` hereda esa regla.
 * - "Descargar constancia" y `ContactInfo` son los MISMOS componentes de
 *   Diseño 1 (sus colores ya son los de marca de Diseño 2); no se duplican.
 */
import React from 'react';
import { ContactInfo } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received';
import { DescargarConstancia } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received/DescargarConstancia';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';
import type { ModoCierreKyc } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/confirmacionClient';
import { CabeceraConfirmacionV2 } from './CabeceraConfirmacionV2';
import { LineaDeTiempoV2 } from './LineaDeTiempoV2';
import { TarjetaSolicitudV2 } from './TarjetaSolicitudV2';
import { textoCabeceraV2 } from './textoCabeceraV2';
import { horaDeEnvio } from './horaDeEnvio';
import type { OpcionesTarjetaV2 } from './resumenTarjetaV2';
import { hayEnvioADomicilio, nombreDelEquipoV2 } from '../textosQueAplicanV2';

export interface ConfirmacionV2Props {
  data: ReceivedData;
  /** `submitted_at` crudo (string ISO) del API, no el `ReceivedData.submittedAt` que cae a `new Date()` sin respuesta. */
  submittedAt?: string | null;
  onGoToHome?: () => void;
  otpCta?: React.ReactNode;
  modoCierreKyc?: ModoCierreKyc | null;
  cierre?: {
    firmada: boolean;
    pendiente: { pago_inicial: boolean; formulario: boolean };
  } | null;
  overlayVariant?: string | null;
  landing?: string;
  applicationCode?: string | null;
  onDescargarConstancia?: () => void;
  /**
   * Celular del titular para "al +51 …". Hoy siempre `undefined`: el
   * `/status` público no lo trae (ver `textoCabeceraV2`). Queda como prop
   * para cuando el backend lo agregue.
   */
  telefono?: string | null;
  /** Día de pago / entrega: ver nota de disponibilidad en `resumenTarjetaV2`. */
  tarjeta?: OpcionesTarjetaV2;
  /**
   * El formulario de la landing pide dirección (BAL-4969, casuísticas). Sin
   * el dato se asume que sí, como hasta ahora.
   */
  conDireccion?: boolean;
}

export function ConfirmacionV2({
  data,
  submittedAt,
  onGoToHome,
  otpCta,
  modoCierreKyc,
  cierre,
  overlayVariant,
  landing,
  applicationCode,
  onDescargarConstancia,
  telefono,
  tarjeta,
  conDireccion = true,
}: ConfirmacionV2Props) {
  const texto = textoCabeceraV2({
    userName: data.userName,
    estimatedResponseHours: data.estimatedResponseHours,
    telefono,
    modoCierreKyc,
    cierre,
    overlayVariant,
  });

  const fechaEnvio = submittedAt ? new Date(submittedAt) : null;
  const horaEnvioTexto = horaDeEnvio(fechaEnvio);
  const plazoWhatsApp = `Máx. ${data.estimatedResponseHours} h`;
  const tipoDeProducto = data.products?.[0]?.type ?? null;
  const conEnvio = conDireccion && hayEnvioADomicilio({ pasos: [], overlayVariant, tipoDeProducto });

  return (
    <div data-confirmacion-v2 className="bg-[#F7F8FC]">
      <CabeceraConfirmacionV2 titulo={texto.titulo} subtitulo={texto.subtitulo} numeroDeSolicitud={data.applicationId} />

      {/* Las tarjetas se montan sobre la banda (prototipo: -76 px, 980 px). */}
      <div className="relative mx-auto -mt-[76px] w-[980px] max-w-[calc(100%-32px)] pb-12 sm:max-w-[calc(100%-48px)]">
        {otpCta}

        {texto.mostrarLineaDeTiempo ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
            <LineaDeTiempoV2
              horaDeEnvio={horaEnvioTexto}
              plazoWhatsApp={plazoWhatsApp}
              conEnvio={conEnvio}
              equipo={nombreDelEquipoV2(tipoDeProducto) === 'equipo' ? 'laptop' : nombreDelEquipoV2(tipoDeProducto)}
            />
            <TarjetaSolicitudV2 data={data} landingSlug={landing ?? ''} opciones={tarjeta} />
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <TarjetaSolicitudV2 data={data} landingSlug={landing ?? ''} opciones={tarjeta} />
          </div>
        )}

        {landing && (
          <div className="mt-4">
            <DescargarConstancia
              landing={landing}
              applicationCode={applicationCode}
              onDescargar={onDescargarConstancia}
            />
          </div>
        )}

        <div className="mt-6">
          <ContactInfo onGoToHome={onGoToHome} />
        </div>
      </div>
    </div>
  );
}

export default ConfirmacionV2;
