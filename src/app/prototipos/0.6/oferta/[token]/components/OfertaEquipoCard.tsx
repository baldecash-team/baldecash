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
import { CheckCircle2, Eye, ArrowRight, AlertTriangle } from 'lucide-react';

// Verde "aprobado" premium (green-600), más intenso que el badge esquina del catálogo.
const APPROVED_GREEN = '#16a34a';

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
  /** Plazo en meses (para el subtexto "en X meses · sin inicial"). */
  termMonths?: number | null;
  /** 'aprobado' = destacado con tag verde + 3 CTAs. 'pedido' = atenuado, solo ver detalle. */
  variant: 'aprobado' | 'pedido';
  /** Si el equipo entra en la cuota aprobada (para "pedido": decide tachado y CTAs). */
  fits?: boolean;
  href?: string; // Ver detalle
  onAceptar?: () => void;
  onVerOtros?: () => void;
}

export function OfertaEquipoCard({
  brand,
  name,
  imageUrl,
  monthly,
  maxQuota,
  termMonths,
  variant,
  fits = true,
  href,
  onAceptar,
  onVerOtros,
}: OfertaEquipoCardProps) {
  const isAprobado = variant === 'aprobado';
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
              en {termMonths ?? 24} meses · sin inicial
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-600">
              Elige este equipo y tu solicitud quedará aprobada.
            </p>
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
                  en {termMonths ?? 24} meses · sin inicial
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Cuota no disponible.</p>
            )}

            {/* Aviso cuando no entra en la cuota aprobada (sin exponer el monto tope). */}
            {atenuado ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs text-amber-700">
                  Supera tu cuota aprobada. Por eso te preparamos las opciones de abajo.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-auto pt-5">
          {isAprobado ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onAceptar}
                className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition-all hover:brightness-90"
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
            // Card "pediste": SOLO informativa. No se puede elegir ni abrir su
            // detalle (la oferta existe porque no calificaba). El botón solo
            // aparece si se pasa `href`, cosa que la oferta ya no hace.
            href ? (
              <a
                href={href}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Ver detalle
              </a>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
