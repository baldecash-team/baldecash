'use client';

/**
 * Confirmación de elección (feedback de Marco): UI custom simple que muestra el
 * cambio de equipo — equipo anterior (gris) → equipo nuevo (verde) con flecha,
 * cada uno con nombre y cuota. NO reutiliza el ReceivedScreen (sin timeline,
 * sin tiempos de evaluación).
 *
 * Rediseño visual (BAL-2186): mismo API de props y misma lógica; solo cambia
 * la presentación para calzar con el mock de Claude Design
 * (docs/superpowers/design-refs/mock-confirmacion.html, frame 3).
 *
 * BAL-3471 — el copy ahora DERIVA del tipo de oferta aceptada. Antes esta
 * pantalla era una sola: decía "Has realizado el cambio de equipo
 * correctamente", titulaba "Tu nuevo equipo" y prometía "Recibirás el contrato
 * por WhatsApp para firmarlo y coordinar la entrega" — sin importar qué había
 * aceptado el cliente. La comparten tres caminos (oferta estándar, Caso 4
 * downgrade y Caso 5 upsell), así que un cliente que solo sumó un accesorio
 * leía que había cambiado de equipo y que ya tenía contrato.
 *
 * Las tres afirmaciones eran falsas para el caso de accesorios, y la del
 * contrato lo es para TODOS: aceptar una oferta marca `application_offer` como
 * `accepted` y reescribe producto/pricing de la solicitud, pero NO toca
 * `application.status_id` (ws2 `conditional_offer_service.py:3383`,
 * `offer_acceptance_service.py:50-113` — ninguno escribe status). En prod, 54
 * de 75 solicitudes con upsell aceptado seguían en evaluación (`nuevo`,
 * `documentacion_erronea`, `mas_documentacion`, incluso `ready_to_reject`).
 * Por eso la promesa de contrato/entrega se elimina de la pantalla: el único
 * mensaje que se puede sostener es que la solicitud sigue su evaluación.
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

/**
 * Qué aceptó el cliente. Determina TODO el copy de la pantalla (BAL-3471).
 *
 *  - `accesorios`  → sumó accesorios/seguros a su solicitud; el equipo NO cambió.
 *  - `equipo`      → cambió de equipo (hay equipo anterior distinto del elegido).
 *  - `condiciones` → mismo equipo, otro plazo/inicial (la "oferta de plazo").
 */
export type ConfirmacionVariant = 'accesorios' | 'equipo' | 'condiciones';

/** Copy por tipo de oferta. Regla (BAL-3471): cada texto solo puede afirmar lo
 *  que efectivamente ocurrió. Ninguno promete contrato ni entrega, porque
 *  aceptar una oferta no aprueba la solicitud — sigue en evaluación. */
const COPY: Record<
  ConfirmacionVariant,
  { subtitulo: string; etiquetaNuevo: string; seguimiento: string }
> = {
  accesorios: {
    // Copy pedido por Marco (BAL-3471): no dice "cambio de equipo" —no lo hubo—
    // y deja claro que la evaluación continúa.
    subtitulo: 'Has modificado tu solicitud exitosamente, te seguiremos evaluando.',
    etiquetaNuevo: 'Tu equipo',
    seguimiento: 'Seguiremos evaluando tu solicitud y te avisaremos por WhatsApp cuando tengamos novedades.',
  },
  equipo: {
    subtitulo: 'Has realizado el cambio de equipo correctamente, te seguiremos evaluando.',
    etiquetaNuevo: 'Tu nuevo equipo',
    seguimiento: 'Seguiremos evaluando tu solicitud con este equipo y te avisaremos por WhatsApp cuando tengamos novedades.',
  },
  condiciones: {
    subtitulo: 'Has actualizado las condiciones de tu solicitud, te seguiremos evaluando.',
    etiquetaNuevo: 'Tu equipo',
    seguimiento: 'Seguiremos evaluando tu solicitud y te avisaremos por WhatsApp cuando tengamos novedades.',
  },
};

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
  label,
}: {
  equipo: EquipoResumen;
  tone: 'old' | 'new';
  /** Encabezado de la tarjeta. En la columna "new" depende del tipo de oferta:
   *  solo un cambio de equipo puede decir "Tu nuevo equipo" (BAL-3471). */
  label: string;
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
        {label}
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

export function SeleccionConfirmada({
  chosen,
  variant,
}: {
  chosen: ChosenSummary;
  /** Tipo de oferta aceptada — decide el copy (BAL-3471). Si no se pasa, se
   *  deriva de los datos: hay equipo anterior distinto → cambio de equipo. */
  variant?: ConfirmacionVariant;
  backHref?: string;
}) {
  // El nombre viene ya capitalizado del backend (fuente única de verdad): el
  // front solo lo pinta.
  const nombre = (chosen.userName || '').trim();
  const titulo = nombre ? `¡Felicidades, ${nombre}!` : '¡Felicidades!';

  // El equipo anterior solo cuenta como "cambio" si es OTRO equipo: el backend
  // manda `requested_product` siempre que la solicitud tenga producto, también
  // cuando el cliente se quedó con el mismo (ws2 `_requested_product`,
  // conditional_offer_service.py:1796). Comparar por nombre evita pintar la
  // flecha "anterior → nuevo" entre dos tarjetas idénticas.
  const cambioDeEquipo =
    !!chosen.previous && chosen.previous.name.trim() !== chosen.name.trim();
  const tipo: ConfirmacionVariant = variant ?? (cambioDeEquipo ? 'equipo' : 'condiciones');
  const copy = COPY[tipo];
  // La comparación viejo→nuevo solo se muestra si de verdad cambió el equipo.
  const previo = cambioDeEquipo ? chosen.previous : null;
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
            {copy.subtitulo}
          </p>

          {/* Equipo anterior → equipo nuevo. Sin cambio de equipo se pinta una
              sola tarjeta, rotulada "Tu equipo": es el que el cliente ya tenía,
              se muestra como contexto de lo que quedó en su solicitud. */}
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {previo ? (
              <>
                <EquipoMini equipo={previo} tone="old" label="Equipo anterior" />
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
            <EquipoMini equipo={nuevo} tone="new" label={copy.etiquetaNuevo} />
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

          {/* Qué pasa después. Antes decía "Recibirás el contrato por WhatsApp
              para firmarlo y coordinar la entrega de tu equipo": aceptar la
              oferta NO aprueba la solicitud —el backend no toca el estado— así
              que la promesa era falsa para los tres tipos de oferta. Ahora
              anuncia lo único cierto: la evaluación sigue y avisamos. */}
          <div
            className="mt-5 flex items-start gap-3 rounded-xl p-4 text-left"
            style={{ backgroundColor: OFERTA_COLORS.greenSoft }}
          >
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: OFERTA_COLORS.greenDark }} />
            <p className="text-sm" style={{ color: OFERTA_COLORS.greenDark }}>
              {copy.seguimiento}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
