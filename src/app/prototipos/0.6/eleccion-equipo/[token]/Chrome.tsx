'use client';

/**
 * Marco común de `/eleccion-equipo/[token]`: el header con el logo y la cuenta
 * regresiva del link, y el contenedor de la página.
 *
 * El contenedor cambia de ancho según la pantalla: en mobile queda en la
 * columna de 480px del diseño aprobado; en desktop se abre hasta 1120px, que es
 * donde la grilla de cards respira sin que las fotos queden diminutas.
 *
 * La cuenta regresiva se recalcula cada segundo pero solo muestra segundos
 * dentro del último día (ver `etiquetaCuentaRegresiva`).
 */

import { useEffect, useState, type ReactNode } from 'react';
import { etiquetaCuentaRegresiva, vencimientoEnMs } from './formato';

const LOGO_URL = 'https://baldecash.s3.amazonaws.com/company/logo.png';
export const WHATSAPP_URL = 'https://wa.me/51959324808';

export function CuentaRegresiva({ expiraEn }: { expiraEn: string | null | undefined }) {
  const objetivo = vencimientoEnMs(expiraEn);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    if (objetivo == null) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [objetivo]);

  if (objetivo == null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[20px] bg-[#fff4e5] px-3 py-1.5 text-xs font-bold text-[#b5651d]">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Vence en{' '}
      <b className="font-extrabold [font-variant-numeric:tabular-nums]">
        {etiquetaCuentaRegresiva(objetivo - ahora)}
      </b>
    </span>
  );
}

export interface ChromeProps {
  expiraEn?: string | null;
  children: ReactNode;
}

export function Chrome({ expiraEn, children }: ChromeProps) {
  return (
    <div
      style={{ fontFamily: 'var(--font-baloo-2), sans-serif' }}
      className="min-h-screen bg-[#f4f5f8] text-[#151744]"
    >
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#e9e9ef] bg-white px-[18px] py-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- logo de S3, mismo criterio que el resto de las rutas por token */}
        <img src={LOGO_URL} alt="BaldeCash" className="h-[30px] w-auto" />
        <CuentaRegresiva expiraEn={expiraEn} />
      </header>

      <main className="mx-auto w-full max-w-[480px] px-[18px] pb-[60px] pt-5 md:max-w-[1120px] md:pt-8">
        {children}
      </main>
    </div>
  );
}

/** Botón de WhatsApp: la salida de emergencia de todas las pantallas. */
export function BotonWhatsApp({ texto = 'Escríbenos por WhatsApp' }: { texto?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-[18px] flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] p-[15px] text-[15px] font-bold text-white"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2z" />
      </svg>
      {texto}
    </a>
  );
}

/** Pantalla de estado: un título, un detalle y, si aplica, una acción. */
export function Mensaje({
  titulo, detalle, accion, whatsapp = false, expiraEn,
}: {
  titulo: string;
  detalle?: string;
  accion?: { texto: string; onClick: () => void };
  whatsapp?: boolean;
  expiraEn?: string | null;
}) {
  return (
    <Chrome expiraEn={expiraEn}>
      <div className="mx-auto max-w-[420px] py-10 text-center">
        <h1 className="text-2xl font-extrabold">{titulo}</h1>
        {detalle && (
          <p className="mt-2.5 text-[15px] leading-[1.55] text-[#5b5c6b]">{detalle}</p>
        )}
        {accion && (
          <button
            type="button"
            onClick={accion.onClick}
            className="mt-5 rounded-2xl bg-[#4654CD] px-5 py-3 text-sm font-bold text-white"
          >
            {accion.texto}
          </button>
        )}
        {whatsapp && <BotonWhatsApp />}
      </div>
    </Chrome>
  );
}
