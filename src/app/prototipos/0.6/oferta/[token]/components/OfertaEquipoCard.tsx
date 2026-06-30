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
import { CheckCircle2, Eye, ArrowRight } from 'lucide-react';

export interface OfertaEquipoCardProps {
  /** Marca (ej. "Asus"). */
  brand?: string | null;
  /** Nombre del equipo. */
  name: string;
  /** Imagen principal. */
  imageUrl?: string | null;
  /** Cuota mensual (solo en "aprobado"; en "pediste" no entra → undefined). */
  monthly?: number | null;
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
        isAprobado ? 'border-2 shadow-sm' : 'border-gray-200'
      }`}
      style={isAprobado ? { borderColor: 'var(--color-primary)' } : undefined}
    >
      {/* Tag verde "Aprobado" (solo en el recomendado) */}
      {isAprobado ? (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aprobado
        </div>
      ) : null}

      {/* Imagen */}
      <div className="flex items-center justify-center bg-gray-50 px-6 pt-8 pb-4">
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
          </div>
        ) : null}
        {atenuado ? (
          <p className="mt-3 text-sm text-gray-400">No disponible para tu cuota aprobada.</p>
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
            // Card "pediste": solo "Ver detalle" (cuando no entra no hay "Aceptar")
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
