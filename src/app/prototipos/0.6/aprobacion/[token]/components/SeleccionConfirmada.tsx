'use client';

/** Confirmación celebratoria con resumen del equipo elegido ("¡Listo!"). */
import { Illustration } from '../../../[landing]/solicitar/confirmacion/components/received/illustration/Illustration';

export interface ChosenSummary {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
}

export function SeleccionConfirmada({
  chosen,
  backHref,
}: {
  chosen: ChosenSummary;
  backHref: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
        {/* Check celebratorio (reutiliza Illustration del 0.6) */}
        <Illustration />

        <h2 className="text-xl font-bold text-[var(--foreground)]">¡Listo! Elegiste tu equipo</h2>
        <p className="mt-2 text-sm text-gray-500">
          Registramos tu elección. Pronto nos pondremos en contacto contigo.
        </p>

        {/* Resumen del equipo */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
          {chosen.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={chosen.imageUrl} alt={chosen.name} className="h-16 w-16 shrink-0 object-contain" />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-lg bg-gray-200" />
          )}
          <div className="min-w-0">
            {chosen.brand ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{chosen.brand}</p>
            ) : null}
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{chosen.name}</p>
            {chosen.monthly ? (
              <p className="mt-0.5 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                Desde S/{Math.round(chosen.monthly)}/mes
              </p>
            ) : null}
          </div>
        </div>

        <a
          href={backHref}
          className="mt-6 inline-block cursor-pointer text-sm font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Volver a mi oferta
        </a>
      </div>
    </div>
  );
}
