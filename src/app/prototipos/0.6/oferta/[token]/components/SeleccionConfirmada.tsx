'use client';

/**
 * Confirmación de elección (feedback de Marco): UI custom simple que muestra el
 * cambio de equipo — equipo anterior (gris) → equipo nuevo (verde) con flecha,
 * cada uno con nombre y cuota. Abajo, el aviso del contrato por WhatsApp.
 * NO reutiliza el ReceivedScreen (sin timeline, sin tiempos de evaluación).
 *
 * Rediseño visual (BAL-2186): mismo API de props y misma lógica; solo cambia
 * la presentación para calzar con el mock de Claude Design
 * (docs/superpowers/design-refs/mock-confirmacion.html, frame 3).
 */
import { useEffect, useState } from 'react';
import { CheckCircle2, ArrowRight, MessageCircle, Package, ShieldCheck, ChevronDown } from 'lucide-react';
import { OFERTA_COLORS } from './redesign/ofertaTheme';
import { OfertaHeader } from './redesign/OfertaHeader';
import { cuotaSuffix, plazoUnit, inicialText } from './equipoCardFormat';

export interface EquipoResumen {
  name: string;
  imageUrl?: string;
  monthly?: number;
  /** Plazo e inicial (%) — se muestran en ambos equipos (viejo y nuevo). */
  term?: number;
  initial?: number;
  /** Monto (S/) de la inicial. Se muestra en vez del %; si no viene, cae al %. */
  initialAmount?: number;
  /** Frecuencia de la cuota: 'mensual' | 'semanal' | 'quincenal' (para celulares). */
  paymentFrequency?: string;
  /** Plazo en unidad nativa (nº de cuotas), para "en N semanas/quincenas". */
  nativeTerm?: number;
}

/** Accesorio/seguro sumado a la oferta (para el desglose). */
export interface AddonResumen {
  id: string;
  name: string;
  monthly: number;
  /** Regalo incluido gratis por el combo elegido (BAL-2159). */
  includedFree?: boolean;
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
  /** Inicial (%) elegido — para mostrar "· inicial S/X" junto al plazo. */
  initial?: number;
  /** Monto (S/) de la inicial. Se muestra en vez del %; si no viene, cae al %. */
  initialAmount?: number;
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
  const f = equipo.paymentFrequency ?? 'mensual';
  const n = f === 'mensual' ? equipo.term : (equipo.nativeTerm ?? equipo.term);

  return (
    <div
      className="flex w-full flex-1 flex-col items-center rounded-xl p-3.5 text-center"
      style={
        isNew
          ? { border: `1.5px solid ${OFERTA_COLORS.green}`, backgroundColor: '#fff', boxShadow: '0 4px 14px rgba(34,197,94,0.12)' }
          : { border: `1px solid ${OFERTA_COLORS.border}`, backgroundColor: OFERTA_COLORS.grayBg, opacity: 0.75 }
      }
    >
      <p
        className="mb-2 text-[8.5px] font-bold uppercase tracking-wide"
        style={{ color: isNew ? OFERTA_COLORS.greenDark : OFERTA_COLORS.textSoft }}
      >
        {isNew ? 'Tu nuevo equipo' : 'Equipo anterior'}
      </p>
      {equipo.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={equipo.imageUrl}
          alt={equipo.name}
          className={`mb-2 h-[52px] w-auto object-contain ${isNew ? '' : 'grayscale'}`}
        />
      ) : (
        <div className="mb-2 flex h-[52px] w-full items-center justify-center text-xs" style={{ color: OFERTA_COLORS.textSoft }}>
          Sin imagen
        </div>
      )}
      <p
        className="text-xs font-bold"
        style={{ color: isNew ? OFERTA_COLORS.textStrong : OFERTA_COLORS.textMid }}
      >
        {equipo.name}
      </p>
      {equipo.monthly ? (
        <>
          <p
            className={`mt-1 text-[15px] font-extrabold ${isNew ? '' : 'line-through'}`}
            style={{ color: isNew ? OFERTA_COLORS.greenDark : OFERTA_COLORS.textMid }}
          >
            S/{Math.round(equipo.monthly)}{cuotaSuffix(equipo.paymentFrequency)}
          </p>
          {n ? (
            <p className="mt-0.5 text-[10px]" style={{ color: OFERTA_COLORS.textSoft }}>
              en {n} {plazoUnit(n, equipo.paymentFrequency)}
              {inicialText(equipo.initialAmount, equipo.initial)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-xs" style={{ color: OFERTA_COLORS.textSoft }}>{isNew ? '' : 'No disponible'}</p>
      )}
    </div>
  );
}

export function SeleccionConfirmada({ chosen }: { chosen: ChosenSummary; backHref?: string }) {
  // El nombre viene ya capitalizado del backend (fuente única de verdad): el
  // front solo lo pinta.
  const nombre = (chosen.userName || '').trim();
  const titulo = nombre ? `¡Felicidades, ${nombre}!` : '¡Felicidades!';
  const nuevo: EquipoResumen = {
    name: chosen.name, imageUrl: chosen.imageUrl, monthly: chosen.monthly,
    term: chosen.termMonths ?? chosen.term, initial: chosen.initial,
    initialAmount: chosen.initialAmount, paymentFrequency: chosen.paymentFrequency,
  };

  // Gratis primero, luego los de costo (orden estable dentro de cada grupo).
  const gratisPrimero = <T extends { includedFree?: boolean }>(arr: T[]): T[] =>
    [...arr].sort((a, b) => Number(b.includedFree ?? false) - Number(a.includedFree ?? false));
  const accesorios = gratisPrimero(chosen.accessories ?? []);
  const seguros = gratisPrimero(chosen.insurances ?? []);
  const tieneAddons = accesorios.length > 0 || seguros.length > 0;
  // Cuota total = equipo + accesorios + seguros (solo si hay add-ons).
  const cuotaTotal =
    (chosen.monthly ?? 0) +
    accesorios.reduce((s, a) => s + (a.monthly || 0), 0) +
    seguros.reduce((s, i) => s + (i.monthly || 0), 0);
  // Nº de items del desglose (equipo + add-ons), para el label del toggle.
  const totalItems = 1 + accesorios.length + seguros.length;
  // Colapsable "Tu pedido incluye": desktop (≥640px) abierto, mobile cerrado
  // (ahorra alto). Default SSR cerrado para evitar mismatch de hidratación; un
  // effect lo abre en desktop tras montar. "Cuota total" queda SIEMPRE visible.
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      setDetalleAbierto(true);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <OfertaHeader />

      <div className="flex flex-1 flex-col items-center px-4 py-8">
        <div
          className="w-full max-w-md rounded-xl p-5 text-center shadow-sm sm:p-6"
          style={{ border: `1px solid ${OFERTA_COLORS.border}` }}
        >
          {/* Check de éxito */}
          <div
            className="mx-auto mb-3 flex h-[60px] w-[60px] items-center justify-center rounded-full"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: OFERTA_COLORS.green }} />
          </div>

          <h1 className="font-['Baloo_2',_sans-serif] text-[21px] font-extrabold" style={{ color: OFERTA_COLORS.textStrong }}>
            {titulo}
          </h1>
          <p className="mt-1 text-[12.5px]" style={{ color: OFERTA_COLORS.textMid }}>
            Has realizado el cambio de equipo correctamente.
          </p>

          {/* Equipo anterior → equipo nuevo */}
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {chosen.previous ? (
              <>
                <EquipoMini equipo={chosen.previous} tone="old" />
                <div className="flex justify-center sm:shrink-0">
                  <div
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
                    style={{ backgroundColor: OFERTA_COLORS.lilac }}
                  >
                    <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" style={{ color: OFERTA_COLORS.primary }} />
                  </div>
                </div>
              </>
            ) : null}
            <EquipoMini equipo={nuevo} tone="new" />
          </div>

          {/* Desglose de accesorios/seguros sumados (BAL-2064) */}
          {tieneAddons ? (
            <div
              className="mt-5 rounded-xl p-4 text-left"
              style={{ backgroundColor: OFERTA_COLORS.grayBg, border: `1px solid ${OFERTA_COLORS.border}` }}
            >
              {/* Header colapsable: toggle con chevron. "Cuota total" queda fuera,
                  siempre visible. En desktop abre por default, mobile cerrado. */}
              <button
                type="button"
                onClick={() => setDetalleAbierto((v) => !v)}
                className="group flex w-full cursor-pointer items-center justify-between text-[10px] font-bold uppercase tracking-wide"
                style={{ color: OFERTA_COLORS.tealBrand }}
                aria-expanded={detalleAbierto}
              >
                <span>Tu pedido incluye ({totalItems})</span>
                <ChevronDown
                  className="h-4 w-4 transition-transform duration-300 ease-out"
                  style={{ transform: detalleAbierto ? 'rotate(180deg)' : 'none' }}
                />
              </button>
              {/* Lista colapsable (colapso suave grid-rows 0fr↔1fr + opacidad). */}
              <div
                className="grid transition-all duration-300 ease-out"
                style={{
                  gridTemplateRows: detalleAbierto ? '1fr' : '0fr',
                  opacity: detalleAbierto ? 1 : 0,
                  marginTop: detalleAbierto ? '0.75rem' : 0,
                }}
              >
                <ul className="space-y-2.5 overflow-hidden" aria-hidden={!detalleAbierto}>
                  {/* Equipo */}
                  <li className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.green }} />
                      <span className="min-w-0">
                        <span className="block font-semibold" style={{ color: OFERTA_COLORS.textStrong }}>
                          {chosen.name}
                        </span>
                      </span>
                    </span>
                    {chosen.monthly ? (
                      <span className="shrink-0 font-semibold" style={{ color: OFERTA_COLORS.textMid }}>
                        S/{Math.round(chosen.monthly)}{cuotaSuffix(chosen.paymentFrequency)}
                      </span>
                    ) : null}
                  </li>
                  {/* Accesorios */}
                  {accesorios.map((a) => (
                    <li key={`a-${a.id}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                        <Package className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.green }} />
                        <span className="min-w-0">{a.name}</span>
                      </span>
                      {a.includedFree ? (
                        <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
                      ) : (
                        <span className="shrink-0" style={{ color: OFERTA_COLORS.textMid }}>+S/{Math.round(a.monthly)}{cuotaSuffix(chosen.paymentFrequency)}</span>
                      )}
                    </li>
                  ))}
                  {/* Seguros */}
                  {seguros.map((i) => (
                    <li key={`i-${i.id}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2" style={{ color: OFERTA_COLORS.textMid }}>
                        <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: OFERTA_COLORS.green }} />
                        <span className="min-w-0">{i.name}</span>
                      </span>
                      {i.includedFree ? (
                        <span className="shrink-0 text-xs font-bold" style={{ color: OFERTA_COLORS.greenDark }}>Incluido gratis</span>
                      ) : (
                        <span className="shrink-0" style={{ color: OFERTA_COLORS.textMid }}>+S/{Math.round(i.monthly)}{cuotaSuffix(chosen.paymentFrequency)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Cuota total — SIEMPRE visible (fuera del colapsable) */}
              <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: OFERTA_COLORS.border }}>
                <span className="text-sm font-bold" style={{ color: OFERTA_COLORS.textStrong }}>
                  Cuota total
                </span>
                <span className="text-lg font-extrabold" style={{ color: OFERTA_COLORS.greenDark }}>
                  S/{Math.round(cuotaTotal)}<span className="text-sm font-normal" style={{ color: OFERTA_COLORS.textSoft }}>{cuotaSuffix(chosen.paymentFrequency)}</span>
                </span>
              </div>
            </div>
          ) : null}

          {/* Aviso del contrato por WhatsApp */}
          <div
            className="mt-5 flex items-start gap-3 rounded-xl p-4 text-left"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
          >
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
            <p className="text-sm" style={{ color: OFERTA_COLORS.greenDark }}>
              Recibirás el contrato por WhatsApp para firmarlo y coordinar la entrega de tu equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
