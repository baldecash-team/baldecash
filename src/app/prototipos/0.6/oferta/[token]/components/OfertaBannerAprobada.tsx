'use client';

/**
 * Banner de felicitaciones de la página de oferta (reemplaza al countdown).
 * Fondo con color de marca, nombre del estudiante y mensaje de entrega.
 * Feedback de Marco: "Marco, tu solicitud ha sido aprobada! Elige un equipo y
 * lo recibirás en 48-72 horas*" (* aplica en Lima).
 */
import { PartyPopper } from 'lucide-react';

export function OfertaBannerAprobada({
  clientName,
  applicationCode,
}: {
  clientName?: string | null;
  applicationCode?: string | null;
}) {
  // El nombre viene ya capitalizado del backend (fuente única de verdad): el
  // front solo lo pinta, no lo transforma.
  const nombre = (clientName || '').trim();
  const saludo = nombre ? `¡Felicitaciones, ${nombre}!` : '¡Felicitaciones!';

  // Mismo contenedor que el logo y las cards (max-w-5xl centrado en desktop)
  // para alinear todo verticalmente. Mobile: solo px-4, sin margen grande.
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 text-white sm:px-8 sm:py-7"
        style={{ backgroundColor: 'var(--color-primary, #4654CD)' }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <PartyPopper className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-['Baloo_2',_sans-serif] text-xl font-bold leading-tight sm:text-2xl">
              {saludo} Tu solicitud ha sido aprobada
            </h1>
            {applicationCode ? (
              <p className="mt-1 text-xs font-medium text-white/70">
                Solicitud {applicationCode}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-white/90 sm:text-base">
              Elige un equipo y tu solicitud quedará aprobada. Lo recibirás en{' '}
              <span className="font-semibold">48-72 horas</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
