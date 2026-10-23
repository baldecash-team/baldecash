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
import { useMenosMovimiento } from '../movimiento';

export interface LineaDeTiempoV2Props {
  /** "Hoy, 08:38 a. m." o "Hoy" — ver `horaDeEnvio`. */
  horaDeEnvio: string;
  /** "Máx. 24 h" — se arma a partir de `data.estimatedResponseHours`. */
  plazoWhatsApp: string;
  /**
   * Hay envío a domicilio (BAL-4969, casuísticas). Sin él (Locker Truck,
   * préstamo, formulario sin dirección) el último hito no promete envío.
   */
  conEnvio?: boolean;
  /** "laptop", "celular"… para "te enviamos tu {equipo}". */
  equipo?: string;
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

export function LineaDeTiempoV2({ horaDeEnvio, plazoWhatsApp, conEnvio = true, equipo = 'laptop' }: LineaDeTiempoV2Props) {
  const reducido = useMenosMovimiento();

  const hitos: Hito[] = [
    {
      titulo: 'Solicitud enviada',
      descripcion: 'Recibimos todos tus datos.',
      tiempo: horaDeEnvio,
      estado: 'completado',
      icono: <Check className="h-[18px] w-[18px]" strokeWidth={3} />,
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
      titulo: conEnvio ? `Firmas y te enviamos tu ${equipo}` : 'Firmas tu contrato',
      descripcion: conEnvio ? 'El envío es gratis a todo el Perú.' : 'Te contamos por WhatsApp cómo sigue.',
      tiempo: 'Si te aprueban',
      estado: 'pendiente',
      icono: <Truck className="h-4 w-4" />,
    },
  ];

  return (
    // Prototipo de Brenda: tarjeta de radio 20 con sombra suave; cada hito con
    // su círculo de 36 px y la línea que lo une al siguiente (llena tras lo
    // completado, punteada después).
    <section
      aria-labelledby="linea-tiempo-v2-titulo"
      className="flex flex-col gap-[18px] rounded-[20px] border border-[#E3E6EE] bg-white px-[22px] pb-[22px] pt-6 shadow-[0_14px_36px_rgba(30,34,48,0.08)] sm:px-[26px]"
    >
      <div className="flex flex-col gap-0.5">
        <h2 id="linea-tiempo-v2-titulo" className="text-[19px] font-bold text-[#1E2230]">
          ¿Qué pasa ahora?
        </h2>
        <p className="text-sm text-[#5B6275]">Te contamos cada avance por WhatsApp.</p>
      </div>

      <ol className="flex flex-col">
        {hitos.map((hito, i) => (
          <li key={hito.titulo} className="flex gap-3.5" aria-current={hito.estado === 'actual' ? 'step' : undefined}>
            <span className="flex flex-shrink-0 flex-col items-center" aria-hidden>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  hito.estado === 'completado'
                    ? 'bg-[#0E8C78] text-white'
                    : hito.estado === 'actual'
                      ? 'border-2 border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)]'
                      : 'border-2 border-[#C9CEDB] bg-white text-[#5B6275]'
                }`}
              >
                {hito.estado === 'actual' ? (
                  <span
                    data-punto-en-curso
                    className="h-3 w-3 rounded-full bg-[var(--color-primary)]"
                    style={reducido ? undefined : { animation: 'd2Pulso 1.4s ease-in-out infinite' }}
                  />
                ) : (
                  hito.icono
                )}
              </span>
              {i < hitos.length - 1 && (
                <span
                  className={`my-1 min-h-4 flex-grow ${
                    hito.estado === 'completado' ? 'w-0.5 rounded-sm bg-[#0E8C78]' : 'w-0 border-l-2 border-dashed border-[#C9CEDB]'
                  }`}
                />
              )}
            </span>
            <div className="flex min-w-0 flex-grow flex-col gap-0.5 pb-[18px] pt-1.5">
              <div className="flex items-baseline justify-between gap-2.5">
                <span className="inline-flex flex-wrap items-center gap-2 text-base font-bold text-[#1E2230]">
                  {hito.titulo}
                  <span className="sr-only">{TEXTO_ESTADO[hito.estado]}</span>
                  {hito.estado === 'actual' && (
                    <span className="rounded-full bg-[rgba(var(--color-primary-rgb),0.1)] px-[9px] py-0.5 text-xs font-bold text-[var(--color-primary-text)]">
                      En curso
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap text-[13px] tabular-nums text-[#5B6275]">{hito.tiempo}</span>
              </div>
              <p className="text-sm leading-[1.4] text-[#5B6275]">{hito.descripcion}</p>
              {hito.estado === 'actual' && (
                <div
                  className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E3E6EE]"
                  role="img"
                  aria-label="Revisión en curso"
                >
                  <div
                    data-barra-en-curso
                    className="absolute inset-y-0 left-0 w-2/5 rounded-full"
                    style={
                      reducido
                        ? { background: 'var(--color-primary)' }
                        : {
                            background:
                              'linear-gradient(90deg, rgba(var(--color-primary-rgb), 0) 0%, var(--color-primary) 50%, rgba(var(--color-primary-rgb), 0) 100%)',
                            animation: 'barraEnCursoV2 1.6s ease-in-out infinite',
                          }
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
          0% { transform: translateX(-110%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
    </section>
  );
}

export default LineaDeTiempoV2;
