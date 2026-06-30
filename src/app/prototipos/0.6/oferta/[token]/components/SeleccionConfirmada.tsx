'use client';

/**
 * Confirmación de elección (feedback de Marco): UI custom simple que muestra el
 * cambio de equipo — equipo anterior (gris) → equipo nuevo (verde) con flecha,
 * cada uno con nombre y cuota. Abajo, el aviso del contrato por WhatsApp.
 * NO reutiliza el ReceivedScreen (sin timeline, sin tiempos de evaluación).
 */
import { CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

const APPROVED_GREEN = '#16a34a';

export interface EquipoResumen {
  name: string;
  imageUrl?: string;
  monthly?: number;
}

export interface ChosenSummary {
  // Equipo NUEVO (el elegido)
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
  finalPrice?: number;
  term?: number;
  termMonths?: number;
  paymentFrequency?: string;
  /** Nombre del estudiante. */
  userName?: string;
  /** Código de la oferta/solicitud. */
  offerCode?: string;
  /** Equipo ANTERIOR (el que pidió) — para el UI viejo→nuevo. */
  previous?: EquipoResumen | null;
}

function EquipoMini({
  equipo,
  tone,
}: {
  equipo: EquipoResumen;
  tone: 'old' | 'new';
}) {
  const isNew = tone === 'new';
  return (
    <div
      className={`flex w-full max-w-[220px] flex-col items-center rounded-2xl border p-4 text-center ${
        isNew ? 'border-2 bg-emerald-50' : 'border-gray-200 bg-gray-50'
      }`}
      style={isNew ? { borderColor: APPROVED_GREEN } : undefined}
    >
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${isNew ? 'text-emerald-600' : 'text-gray-400'}`}>
        {isNew ? 'Tu nuevo equipo' : 'Equipo anterior'}
      </p>
      {equipo.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={equipo.imageUrl}
          alt={equipo.name}
          className={`mb-3 h-24 w-auto object-contain ${isNew ? '' : 'grayscale opacity-70'}`}
        />
      ) : (
        <div className="mb-3 flex h-24 w-full items-center justify-center text-gray-300">Sin imagen</div>
      )}
      <p className={`text-sm font-semibold ${isNew ? 'text-[var(--foreground)]' : 'text-gray-500'}`}>
        {equipo.name}
      </p>
      {equipo.monthly ? (
        <p className={`mt-1 text-sm font-bold ${isNew ? '' : 'text-gray-400'}`} style={isNew ? { color: APPROVED_GREEN } : undefined}>
          S/{Math.round(equipo.monthly)}/mes
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400">{isNew ? '' : 'No disponible'}</p>
      )}
    </div>
  );
}

export function SeleccionConfirmada({ chosen }: { chosen: ChosenSummary; backHref?: string }) {
  const nombre = (chosen.userName || '').trim();
  const titulo = nombre ? `¡Felicidades, ${nombre}!` : '¡Felicidades!';
  const nuevo: EquipoResumen = { name: chosen.name, imageUrl: chosen.imageUrl, monthly: chosen.monthly };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl sm:p-10">
        {/* Check de éxito */}
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${APPROVED_GREEN}1a` }}
        >
          <CheckCircle2 className="h-9 w-9" style={{ color: APPROVED_GREEN }} />
        </div>

        <h1 className="font-['Baloo_2',_sans-serif] text-2xl font-bold text-[var(--foreground)]">
          {titulo}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Has realizado el cambio de equipo correctamente.
        </p>

        {/* Equipo anterior → equipo nuevo */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {chosen.previous ? (
            <>
              <EquipoMini equipo={chosen.previous} tone="old" />
              <ArrowRight className="h-6 w-6 shrink-0 rotate-90 text-gray-300 sm:rotate-0" />
            </>
          ) : null}
          <EquipoMini equipo={nuevo} tone="new" />
        </div>

        {/* Aviso del contrato por WhatsApp */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-left">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            Recibirás el contrato por WhatsApp para firmarlo y coordinar la entrega de tu equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
