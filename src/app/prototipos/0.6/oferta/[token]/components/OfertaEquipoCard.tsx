'use client';

/**
 * OfertaEquipoCard — card custom de la página de oferta (feedback de Marco).
 * NO reutiliza la card del catálogo: llena mejor el espacio y se usa igual para
 * "el que pediste" y "aprobado para ti".
 *
 * - Variante "aprobado": tag verde "Aprobado" + 3 CTAs (Ver detalle / Aceptar /
 *   Ver otros equipos).
 * - Variante "pediste" (no entra en cuota): atenuada/tachada + solo "Ver detalle".
 */
import { motion } from 'framer-motion';
import { CheckCircle2, Eye, ArrowRight, Info, Ban, Package, ShieldCheck, Cpu, MemoryStick, HardDrive, Monitor } from 'lucide-react';
import type { ProductSpecs } from '../../../[landing]/catalogo/types/catalog';

// Verde "aprobado" premium (green-600), más intenso que el badge esquina del catálogo.
const APPROVED_GREEN = '#16a34a';

/** Accesorio/seguro del pedido original (composición real, acta 1-jul). */
export interface OfertaCardAddon {
  id: number | null;
  name: string;
  monthly: number;
}

export interface OfertaEquipoCardProps {
  /** Marca (ej. "Asus"). */
  brand?: string | null;
  /** Nombre del equipo. */
  name: string;
  /** Imagen principal. */
  imageUrl?: string | null;
  /** Cuota mensual del equipo (aprobado o pedido) a 24m/0%. */
  monthly?: number | null;
  /** Cuota máxima aprobada del estudiante (para comparar en "pedido"). */
  maxQuota?: number | null;
  /** Plazo en meses (para el subtexto "en X meses · ..."). */
  termMonths?: number | null;
  /** Inicial (%) del equipo. Si > 0 muestra "· inicial X%", si no "· sin inicial". */
  initialPercent?: number | null;
  /** 'aprobado' = destacado con tag verde + 3 CTAs. 'pedido' = atenuado, solo ver detalle. */
  variant: 'aprobado' | 'pedido';
  /** Si el equipo entra en la cuota aprobada (para "pedido": decide tachado y CTAs). */
  fits?: boolean;
  href?: string; // Ver detalle
  onAceptar?: () => void;
  onVerOtros?: () => void;
  /** Accesorios del pedido original (card "el que pediste", composición real). */
  accessories?: OfertaCardAddon[];
  /** Seguros del pedido original. */
  insurances?: OfertaCardAddon[];
  /** Specs técnicas del equipo (card "aprobado para ti"): procesador, RAM, etc. */
  specs?: ProductSpecs;
}

export function OfertaEquipoCard({
  brand,
  name,
  imageUrl,
  monthly,
  maxQuota,
  termMonths,
  initialPercent,
  variant,
  fits = true,
  href,
  onAceptar,
  onVerOtros,
  accessories = [],
  insurances = [],
  specs,
}: OfertaEquipoCardProps) {
  const isAprobado = variant === 'aprobado';
  const addons = [
    ...accessories.map((a) => ({ ...a, kind: 'accessory' as const })),
    ...insurances.map((i) => ({ ...i, kind: 'insurance' as const })),
  ];
  // Total del pedido = cuota del equipo + cuotas de accesorios/seguros (para el
  // desglose de la card "el que pediste").
  const addonsMonthly = addons.reduce((s, ad) => s + (ad.monthly || 0), 0);
  const pedidoTotal = (monthly ?? 0) + addonsMonthly;
  // En "pedido" no disponible: atenuado + nombre tachado.
  const atenuado = variant === 'pedido' && !fits;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
        isAprobado ? 'border-2' : 'border-gray-200'
      }`}
      style={
        isAprobado
          ? {
              borderColor: APPROVED_GREEN,
              boxShadow: `0 0 20px 4px ${APPROVED_GREEN}40, 0 4px 12px ${APPROVED_GREEN}26`,
            }
          : undefined
      }
    >
      {/* Banner premium "APROBADO" full-width (mismo lenguaje visual que COMBO EXCLUSIVO) */}
      {isAprobado ? (
        <div
          className="flex w-full items-center justify-center gap-2.5 px-4 py-2.5"
          style={{
            background: `linear-gradient(135deg, ${APPROVED_GREEN} 0%, ${APPROVED_GREEN}cc 50%, ${APPROVED_GREEN} 100%)`,
          }}
        >
          <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
            <CheckCircle2 className="h-5 w-5 text-white" />
          </motion.div>
          <span
            className="text-base font-black uppercase tracking-widest text-white"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
          >
            Aprobado para ti
          </span>
          <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
            <CheckCircle2 className="h-5 w-5 text-white" />
          </motion.div>
        </div>
      ) : null}

      {/* Imagen */}
      <div className={`flex items-center justify-center bg-gray-50 px-6 pb-4 ${isAprobado ? 'pt-6' : 'pt-8'}`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className={`h-40 w-auto object-contain ${atenuado ? 'grayscale opacity-70' : ''}`}
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center text-gray-300">Sin imagen</div>
        )}
      </div>

      {/* Datos */}
      <div className="flex flex-1 flex-col px-6 py-5">
        {brand ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{brand}</p>
        ) : null}
        <h3
          className={`mt-1 text-base font-bold leading-snug ${
            atenuado ? 'text-gray-400 line-through' : 'text-[var(--text-strong,#111827)]'
          }`}
        >
          {name}
        </h3>

        {/* Cuota (aprobado) o aviso de no-disponible (pedido) */}
        {isAprobado && monthly ? (
          <div className="mt-4">
            <p className="text-xs text-gray-400">Cuota mensual</p>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
              S/{Math.round(monthly)}
              <span className="text-base font-normal text-gray-400">/mes</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              en {termMonths ?? 24} meses{initialPercent && initialPercent > 0 ? ` · inicial ${initialPercent}%` : ' · sin inicial'}
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Elige este equipo y tu solicitud quedará aprobada.
            </p>
          </div>
        ) : null}

        {/* Aprobado: specs clave del equipo (llena el espacio y ayuda a decidir).
            Mismo estilo que las cards del catálogo. */}
        {isAprobado && specs ? (
          <div className="mt-4 space-y-2.5">
            {specs.processor?.model ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#4b5563)]">
                <Cpu className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span className="truncate">{specs.processor.model}</span>
              </div>
            ) : null}
            {specs.ram ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#4b5563)]">
                <MemoryStick className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{specs.ram.size}GB {specs.ram.type}</span>
              </div>
            ) : null}
            {specs.storage ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#4b5563)]">
                <HardDrive className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{specs.storage.size}GB {String(specs.storage.type).toUpperCase()}</span>
              </div>
            ) : null}
            {specs.display ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted,#4b5563)]">
                <Monitor className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>{specs.display.size}&quot; {String(specs.display.resolution).toUpperCase()}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Pedido: comparación de cuota vs cuota aprobada (número concreto). */}
        {!isAprobado ? (
          <div className="mt-4">
            {monthly ? (
              <>
                <p className="text-xs text-gray-400">Cuota de este equipo</p>
                <p
                  className={`text-2xl font-extrabold ${atenuado ? 'text-gray-400' : 'text-[var(--text-strong,#111827)]'}`}
                >
                  S/{Math.round(monthly)}
                  <span className="text-base font-normal text-gray-400">/mes</span>
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  en {termMonths ?? 24} meses{initialPercent && initialPercent > 0 ? ` · inicial ${initialPercent}%` : ' · sin inicial'}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Cuota no disponible.</p>
            )}
            {/* Sin aviso de cuota/tope: no se le muestra el threshold al cliente.
                El equipo simplemente aparece atenuado/tachado. */}
          </div>
        ) : null}

        {/* Composición real del pedido (acta 1-jul): accesorios/seguros que el
            cliente YA tenía. Solo en la card "el que pediste". */}
        {!isAprobado && addons.length > 0 ? (
          <div className="mt-4 rounded-xl border border-gray-100 bg-white p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Desglose de tu pedido
            </p>
            <ul className="space-y-2">
              {/* Equipo */}
              <li className="flex items-center justify-between gap-3 text-sm">
                <span className={`flex min-w-0 items-center gap-2 ${atenuado ? 'text-gray-400' : 'text-gray-600'}`}>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate">{name}</span>
                </span>
                {monthly ? (
                  <span className="shrink-0 text-gray-500">S/{Math.round(monthly)}/mes</span>
                ) : null}
              </li>
              {/* Accesorios / seguros */}
              {addons.map((ad) => (
                <li key={`${ad.kind}-${ad.id}`} className="flex items-center justify-between gap-3 text-sm">
                  <span className={`flex min-w-0 items-center gap-2 ${atenuado ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ad.kind === 'insurance' ? (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <Package className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="truncate">{ad.name}</span>
                  </span>
                  {ad.monthly > 0 ? (
                    <span className="shrink-0 text-gray-400">+S/{Math.round(ad.monthly)}/mes</span>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-emerald-600">Gratis</span>
                  )}
                </li>
              ))}
            </ul>
            {/* Total */}
            <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
              <span className={`text-sm font-semibold ${atenuado ? 'text-gray-400' : 'text-[var(--text-strong,#111827)]'}`}>
                Total mensual
              </span>
              <span className={`text-base font-extrabold ${atenuado ? 'text-gray-400' : 'text-[var(--text-strong,#111827)]'}`}>
                S/{Math.round(pedidoTotal)}<span className="text-xs font-normal text-gray-400">/mes</span>
              </span>
            </div>
          </div>
        ) : null}

        {/* Card "pedido": mensaje de contexto justo debajo de la cuota (no
            anclado al fondo, para no dejar espacio muerto). No menciona cuota
            ni tope; solo aclara que es el equipo que pidió y guía a la derecha. */}
        {!isAprobado ? (
          <div className="mt-4">
            <div className="flex items-start gap-2.5 rounded-xl bg-[var(--surface-bg,#f8fafc)] px-3.5 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <p className="text-xs leading-relaxed text-gray-500">
                Este es el equipo que solicitaste. Revisa a la derecha el equipo que
                preparamos para ti.
              </p>
            </div>
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-auto pt-5">
          {isAprobado ? (
            <div className="flex flex-col gap-2">
              {/* CTA principal reducido (feedback acta 1-jul: "aceptar equipo
                  demasiado grande"): ya no ocupa todo el ancho, se centra. */}
              <button
                type="button"
                onClick={onAceptar}
                className="mx-auto cursor-pointer rounded-xl px-8 py-2.5 text-sm font-bold text-white transition-all hover:brightness-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Aceptar equipo
              </button>
              <div className="flex gap-2">
                {href ? (
                  <a
                    href={href}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalle
                  </a>
                ) : null}
                {onVerOtros ? (
                  <button
                    type="button"
                    onClick={onVerOtros}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Ver otros
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            // Card "pediste": el equipo no se puede elegir (la oferta existe
            // porque no calificaba), pero sí damos un siguiente paso natural
            // (feedback acta 1-jul): botón "Ver otros equipos" (protagonista del
            // lado izquierdo) + link discreto "Ver detalle" del equipo pedido
            // (solo lectura). Jerarquía: el verde "Aprobado" sigue ganando.
            <div className="flex flex-col gap-2.5">
              {/* Botón gris "No disponible" (feedback acta 3-jul): comunica de
                  forma explícita que este equipo NO es elegible. Solo cuando no
                  entra en la cuota (atenuado). Deshabilitado, no accionable. */}
              {atenuado ? (
                <div
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-400"
                  aria-disabled="true"
                >
                  <Ban className="h-4 w-4" />
                  No disponible
                </div>
              ) : null}
              {onVerOtros ? (
                <button
                  type="button"
                  onClick={onVerOtros}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Ver otros equipos
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {href ? (
                <a
                  href={href}
                  className="flex cursor-pointer items-center justify-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver detalle
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
