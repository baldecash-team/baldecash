'use client';

/**
 * Confirmación de elección (feedback de Marco): UI custom simple que muestra el
 * cambio de equipo — equipo anterior (gris) → equipo nuevo (verde) con flecha,
 * cada uno con nombre y cuota. Abajo, el aviso del contrato por WhatsApp.
 * NO reutiliza el ReceivedScreen (sin timeline, sin tiempos de evaluación).
 */
import { CheckCircle2, ArrowRight, MessageCircle, Package, ShieldCheck } from 'lucide-react';

const APPROVED_GREEN = '#16a34a';

export interface EquipoResumen {
  name: string;
  imageUrl?: string;
  monthly?: number;
}

/** Accesorio/seguro sumado a la oferta (para el desglose). */
export interface AddonResumen {
  id: string;
  name: string;
  monthly: number;
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
  /** Accesorios/seguros que el cliente sumó (BAL-2064). */
  accessories?: AddonResumen[];
  insurances?: AddonResumen[];
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

/** Capitaliza cada palabra: "tamara grisell" → "Tamara Grisell". El nombre
 *  viene de BD en minúsculas/mixto; lo normalizamos para mostrarlo bonito. */
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function SeleccionConfirmada({ chosen }: { chosen: ChosenSummary; backHref?: string }) {
  const nombre = toTitleCase((chosen.userName || '').trim());
  const titulo = nombre ? `¡Felicidades, ${nombre}!` : '¡Felicidades!';
  const nuevo: EquipoResumen = { name: chosen.name, imageUrl: chosen.imageUrl, monthly: chosen.monthly };

  const accesorios = chosen.accessories ?? [];
  const seguros = chosen.insurances ?? [];
  const tieneAddons = accesorios.length > 0 || seguros.length > 0;
  // Cuota total = equipo + accesorios + seguros (solo si hay add-ons).
  const cuotaTotal =
    (chosen.monthly ?? 0) +
    accesorios.reduce((s, a) => s + (a.monthly || 0), 0) +
    seguros.reduce((s, i) => s + (i.monthly || 0), 0);

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

        {/* Desglose de accesorios/seguros sumados (BAL-2064) */}
        {tieneAddons ? (
          <div className="mt-8 rounded-2xl border border-gray-200 p-4 text-left sm:p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
              Tu pedido incluye
            </p>
            <ul className="space-y-2.5">
              {/* Equipo */}
              <li className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-[var(--foreground)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: APPROVED_GREEN }} />
                  <span className="truncate font-medium">{chosen.name}</span>
                </span>
                {chosen.monthly ? (
                  <span className="shrink-0 font-semibold text-gray-600">S/{Math.round(chosen.monthly)}/mes</span>
                ) : null}
              </li>
              {/* Accesorios */}
              {accesorios.map((a) => (
                <li key={`a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-gray-600">
                    <Package className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-500">+S/{Math.round(a.monthly)}/mes</span>
                </li>
              ))}
              {/* Seguros */}
              {seguros.map((i) => (
                <li key={`i-${i.id}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-gray-600">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="truncate">{i.name}</span>
                  </span>
                  <span className="shrink-0 text-gray-500">+S/{Math.round(i.monthly)}/mes</span>
                </li>
              ))}
            </ul>
            {/* Cuota total */}
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-semibold text-[var(--foreground)]">Cuota mensual total</span>
              <span className="text-lg font-extrabold" style={{ color: APPROVED_GREEN }}>
                S/{Math.round(cuotaTotal)}<span className="text-sm font-normal text-gray-400">/mes</span>
              </span>
            </div>
          </div>
        ) : null}

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
