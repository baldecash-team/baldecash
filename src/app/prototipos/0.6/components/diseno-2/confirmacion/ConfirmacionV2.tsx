'use client';

/**
 * Confirmación de Diseño 2 — la última pantalla del rediseño de Brenda
 * (F8, BAL-4967; rediseñada en BAL-5274, prototipo v53 del 28-oct).
 * Es solo presentación: usa los MISMOS datos que `ReceivedScreen` (Diseño 1)
 * — `ReceivedData`, construida por el mismo `buildReceivedData` de siempre en
 * `confirmacionClient.tsx` — y no llama ningún endpoint nuevo.
 *
 * BAL-5274: cabecera con la barra de pasos de Zona Estudiantes (paso 2,
 * «Evaluación», como actual; «Cuota inicial» solo si eligió inicial), el
 * botón «Sigue tu solicitud en Zona Estudiantes» (otra pestaña), la tarjeta
 * «Tu solicitud» y «Ir al inicio» como botón secundario. Sin Baldi, sin
 * horas: la página no sabe en qué va la solicitud.
 *
 * Qué se conserva:
 * - El `otpCta` opcional (verificar correo), arriba de la tarjeta.
 * - `modoCierreKyc` / `cierre` deciden el mensaje (firmada, aprobada,
 *   completada) EXACTO que ya usa `ReceivedMessage` — ver `textoCabeceraV2`.
 *   Con esos estados la barra de pasos NO se pinta (decir «en evaluación»
 *   después de una firma sería falso) y va el subtítulo de siempre.
 * - "Descargar constancia" es el MISMO componente de Diseño 1.
 * - Los eventos: «Ir al inicio» emite lo mismo que el «Volver al inicio» de
 *   antes (`cta_click` go_home + `confirmation_cta_click` go_home vía
 *   `onGoToHome`). El botón de Zona Estudiantes se avisa con
 *   `onZonaEstudiantes` (quien llama emite el evento).
 */
import React from 'react';
import { House } from 'lucide-react';
import { useEventTrackerOptional } from '@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext';
import { DescargarConstancia } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/components/received/DescargarConstancia';
import type { ReceivedData } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/types/received';
import type { ModoCierreKyc } from '@/app/prototipos/0.6/[landing]/solicitar/confirmacion/confirmacionClient';
import { CabeceraConfirmacionV2 } from './CabeceraConfirmacionV2';
import { TarjetaSolicitudV2 } from './TarjetaSolicitudV2';
import { textoCabeceraV2 } from './textoCabeceraV2';
import { eligioInicial } from './pasosZonaEstudiantes';
import type { OpcionesTarjetaV2 } from './resumenTarjetaV2';

export interface ConfirmacionV2Props {
  data: ReceivedData;
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
  /** Clic en «Sigue tu solicitud en Zona Estudiantes». */
  onZonaEstudiantes?: () => void;
  /**
   * Celular del titular para «al +51 …»: `applicant_phone_masked` de
   * `/status`, enmascarado («9XX XXX 321»).
   */
  telefono?: string | null;
  /** Día de pago / entrega: ver `datosDelEnvioV2`. */
  tarjeta?: OpcionesTarjetaV2;
}

export function ConfirmacionV2({
  data,
  onGoToHome,
  otpCta,
  modoCierreKyc,
  cierre,
  overlayVariant,
  landing,
  applicationCode,
  onDescargarConstancia,
  onZonaEstudiantes,
  telefono,
  tarjeta,
}: ConfirmacionV2Props) {
  const tracker = useEventTrackerOptional();
  const texto = textoCabeceraV2({
    userName: data.userName,
    modoCierreKyc,
    cierre,
    overlayVariant,
  });

  const irAlInicio = () => {
    tracker?.track('cta_click', { cta_name: 'go_home', location: 'confirmacion' });
    onGoToHome?.();
  };

  return (
    <div data-confirmacion-v2 className="bg-[var(--d2-fondo)] font-['Asap',_sans-serif] text-[var(--d2-texto)]">
      <CabeceraConfirmacionV2
        titulo={texto.titulo}
        subtitulo={texto.subtitulo}
        numeroDeSolicitud={data.applicationId}
        pasos={texto.mostrarPasos ? { conInicial: eligioInicial(data.initialPayment), telefono } : null}
        onZonaEstudiantes={() => {
          tracker?.track('cta_click', { cta_name: 'zona_estudiantes', location: 'confirmacion' });
          onZonaEstudiantes?.();
        }}
      />

      {/* La tarjeta se monta sobre la banda (prototipo: -60 px y 16 px a los
          lados en celular; -76 px y 560 px de ancho en computadora). */}
      <div className="relative mx-4 -mt-[60px] flex flex-col gap-3.5 md:mx-auto md:-mt-[76px] md:w-[560px] md:max-w-[calc(100%-48px)] md:gap-5">
        {otpCta}
        <TarjetaSolicitudV2 data={data} landingSlug={landing ?? ''} opciones={tarjeta} />
        {landing && (
          <DescargarConstancia landing={landing} applicationCode={applicationCode} onDescargar={onDescargarConstancia} />
        )}
      </div>

      <div className="flex flex-col items-stretch gap-2.5 px-4 pb-7 pt-5 md:items-center md:gap-3 md:px-6 md:pb-14 md:pt-[30px]">
        <button
          type="button"
          onClick={irAlInicio}
          className="flex min-h-[50px] cursor-pointer items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] text-base font-bold text-[var(--color-primary-text)] md:inline-flex md:px-[30px]"
        >
          <House width={20} height={20} strokeWidth={2} aria-hidden />
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

export default ConfirmacionV2;
