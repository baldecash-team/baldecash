'use client';
/**
 * Vista del solicitante para entrar a una videollamada con su asesor.
 *
 * El token del link ES la credencial: acá no hay cuenta ni login. Se canjea
 * por `{room_url, token}` y con eso se levanta Daily Prebuilt.
 *
 * Se usa Prebuilt (`createFrame`) a propósito: trae la UI completa —permisos
 * de cámara, pantalla previa, controles— que de otro modo habría que escribir
 * entera. El día que queramos UI propia se cambia `createFrame` por
 * `createCallObject` y el backend no se toca.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { joinVideoCall } from '../../_lib/api/videoCalls';

type Estado = 'cargando' | 'en-llamada' | 'terminada' | 'error';

/** `daily-js` toca `window`, así que solo puede importarse en el navegador. */
async function cargarDaily() {
  const mod = await import('@daily-co/daily-js');
  return mod.default;
}

export function VideollamadaClient({ token }: { token: string }) {
  const contenedor = useRef<HTMLDivElement | null>(null);
  const frame = useRef<{ destroy: () => void } | null>(null);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [error, setError] = useState<string | null>(null);

  const entrar = useCallback(async () => {
    setEstado('cargando');
    setError(null);

    const res = await joinVideoCall(token);
    if (!res.ok) {
      // El backend devuelve 404 genérico para link inválido, vencido o
      // cancelado: no distingue el motivo a propósito. Acá tampoco.
      setError(
        res.error.code === 'http_404'
          ? 'Este enlace no es válido o ya venció. Pedile uno nuevo a tu asesor.'
          : 'No pudimos conectarte a la videollamada. Probá de nuevo en un momento.'
      );
      setEstado('error');
      return;
    }

    try {
      const Daily = await cargarDaily();
      if (!contenedor.current) return;

      // Si quedó un frame de un intento anterior hay que destruirlo: Daily no
      // permite dos instancias vivas y la segunda falla en silencio.
      frame.current?.destroy();

      const call = Daily.createFrame(contenedor.current, {
        iframeStyle: {
          position: 'relative',
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '12px',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      call.on('left-meeting', () => setEstado('terminada'));
      call.on('error', () => {
        setError('Se cortó la conexión con la videollamada.');
        setEstado('error');
      });

      await call.join({ url: res.data.room_url, token: res.data.token });
      frame.current = call;
      setEstado('en-llamada');
    } catch {
      setError('No pudimos abrir la videollamada en este navegador.');
      setEstado('error');
    }
  }, [token]);

  useEffect(() => {
    entrar();
    return () => {
      frame.current?.destroy();
      frame.current = null;
    };
  }, [entrar]);

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header>
          <h1 className="text-xl font-semibold text-[#4654CD]">
            Videollamada con tu asesor
          </h1>
          {estado === 'cargando' && (
            <p className="mt-1 text-sm text-gray-600">Conectando…</p>
          )}
        </header>

        {/* El contenedor vive siempre en el DOM: si se montara solo al estar
            en llamada, el ref llegaría null justo cuando Daily lo necesita. */}
        <div
          ref={contenedor}
          className={
            estado === 'en-llamada'
              ? 'h-[70vh] w-full overflow-hidden rounded-xl bg-black'
              : 'hidden'
          }
        />

        {estado === 'terminada' && (
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-800">Saliste de la videollamada.</p>
            <button
              type="button"
              onClick={entrar}
              className="mt-4 rounded-lg bg-[#4654CD] px-4 py-2 text-sm font-medium text-white"
            >
              Volver a entrar
            </button>
          </div>
        )}

        {estado === 'error' && (
          <div className="rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-800">{error}</p>
            <button
              type="button"
              onClick={entrar}
              className="mt-4 rounded-lg bg-[#4654CD] px-4 py-2 text-sm font-medium text-white"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
