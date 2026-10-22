'use client';

/**
 * "¿Qué pasa ahora?" de `ConfirmacionV2` (F8, BAL-4967): los 4 hitos fijos
 * del prototipo de Brenda. Solo se monta en el caso por defecto —ver
 * `textoCabeceraV2().mostrarLineaDeTiempo`—, nunca cuando ya hay firma,
 * aprobación o cierre de KYC: decir "estamos revisando" ahí sería falso.
 *
 * `<ol>` porque el orden importa, y el estado de cada hito va en TEXTO (un
 * `<span className="sr-only">`), no solo en el color del ícono — un lector de
 * pantalla no ve que el círculo está en verde.
 */

import React from 'react';
import { Check, Clock, MessageCircle, Truck } from 'lucide-react';
import { useReducedMotion } from '@/app/prototipos/0.6/components/product-landing/shared/hooks/useReducedMotion';

export interface LineaDeTiempoV2Props {
  /** "Hoy, 08:38 a. m." o "Hoy" — ver `horaDeEnvio`. */
  horaDeEnvio: string;
  /** "Máx. 24 h" — se arma a partir de `data.estimatedResponseHours`. */
  plazoWhatsApp: string;
}

interface Hito {
  titulo: string;
  descripcion: string;
  tiempo: string;
  estado: 'completado' | 'actual' | 'pendiente';
  icono: React.ReactNode;
}

const TEXTO_ESTADO: Record<Hito['estado'], string> = {
  completado: 'Completado',
  actual: 'En curso',
  pendiente: 'Pendiente',
};

export function LineaDeTiempoV2({ horaDeEnvio, plazoWhatsApp }: LineaDeTiempoV2Props) {
  const reducido = useReducedMotion();

  const hitos: Hito[] = [
    {
      titulo: 'Solicitud enviada',
      descripcion: 'Recibimos todos tus datos.',
      tiempo: horaDeEnvio,
      estado: 'completado',
      icono: <Check className="h-4 w-4" strokeWidth={3} />,
    },
    {
      titulo: 'Revisamos tu solicitud',
      descripcion: 'Validamos tus datos para darte una respuesta.',
      tiempo: 'Ahora',
      estado: 'actual',
      icono: <Clock className="h-4 w-4" />,
    },
    {
      titulo: 'Te avisamos por WhatsApp',
      descripcion: 'Te escribimos con el resultado de tu evaluación.',
      tiempo: plazoWhatsApp,
      estado: 'pendiente',
      icono: <MessageCircle className="h-4 w-4" />,
    },
    {
      titulo: 'Firmas y te enviamos tu laptop',
      descripcion: 'El envío es gratis a todo el Perú.',
      tiempo: 'Si te aprueban',
      estado: 'pendiente',
      icono: <Truck className="h-4 w-4" />,
    },
  ];

  return (
    <section aria-labelledby="linea-tiempo-v2-titulo" className="rounded-2xl border border-[#E3E6EE] bg-white p-5">
      <h2 id="linea-tiempo-v2-titulo" className="font-['Baloo_2',_sans-serif] text-lg font-bold text-[#1E2230]">
        ¿Qué pasa ahora?
      </h2>
      <p className="mt-0.5 text-sm text-[#5B6275]">Te contamos cada avance por WhatsApp.</p>

      <ol className="mt-4 space-y-5">
        {hitos.map((hito, i) => (
          <li key={hito.titulo} className="relative flex gap-3 pb-1">
            {i < hitos.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%+4px)] w-px border-l border-dashed border-[#D5D9E6]"
              />
            )}
            <span
              aria-hidden
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                hito.estado === 'completado'
                  ? 'border-[#12A877] bg-[#12A877] text-white'
                  : hito.estado === 'actual'
                    ? 'border-[#4654CD] bg-white text-[#4654CD]'
                    : 'border-[#D5D9E6] bg-white text-[#8A90A2]'
              }`}
            >
              {hito.icono}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#1E2230]">{hito.titulo}</span>
                  <span className="sr-only">{TEXTO_ESTADO[hito.estado]}</span>
                  {hito.estado === 'actual' && (
                    <span className="rounded-full bg-[#4654CD]/10 px-2 py-0.5 text-[11px] font-bold text-[#4654CD]">
                      En curso
                    </span>
                  )}
                </span>
                <span className="text-xs text-[#8A90A2]">{hito.tiempo}</span>
              </div>
              <p className="mt-0.5 text-[13px] text-[#5B6275]">{hito.descripcion}</p>
              {hito.estado === 'actual' && (
                <div
                  className="mt-2 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-[#E3E6EE]"
                  role="img"
                  aria-label="Revisión en curso"
                >
                  <div
                    data-barra-en-curso
                    className="h-full w-1/2 rounded-full bg-[#4654CD]"
                    style={
                      reducido
                        ? undefined
                        : { animation: 'barraEnCursoV2 1.6s ease-in-out infinite' }
                    }
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <style>{`
        @keyframes barraEnCursoV2 {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </section>
  );
}

export default LineaDeTiempoV2;
