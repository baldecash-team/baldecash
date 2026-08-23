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
 * `createCallObject` y el backend no se entera.
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
  /**
   * Si llegamos a entrar de verdad. Sin esto, el `left-meeting` que Daily
   * dispara al destruir un frame que nunca conectó se leía como "el usuario
   * salió", y la pantalla mostraba "Saliste de la videollamada" sin que nadie
   * hubiera entrado.
   */
  const entroAlgunaVez = useRef(false);
  const [estado, setEstado] = useState<Estado>('cargando');
  const [error, setError] = useState<string | null>(null);

  const entrar = useCallback(async () => {
    setEstado('cargando');
    setError(null);
    entroAlgunaVez.current = false;

    const res = await joinVideoCall(token);
    if (!res.ok) {
      // El backend devuelve 404 genérico para link inválido, vencido o
      // cancelado: no distingue el motivo a propósito. Acá tampoco.
      setError(
        res.error.code === 'http_404'
          ? 'Este enlace no es válido o ya venció. Pídele uno nuevo a tu asesor.'
          : 'No pudimos conectarte a la videollamada. Inténtalo de nuevo en un momento.'
      );
      setEstado('error');
      return;
    }

    try {
      const Daily = await cargarDaily();
      if (!contenedor.current) return;

      // Daily no admite dos frames vivos a la vez: el segundo falla en
      // silencio y el usuario ve un recuadro negro sin explicación.
      frame.current?.destroy();
      frame.current = null;

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

      call.on('joined-meeting', () => {
        entroAlgunaVez.current = true;
        setEstado('en-llamada');
      });
      call.on('left-meeting', () => {
        if (entroAlgunaVez.current) setEstado('terminada');
      });
      call.on('error', (ev?: { errorMsg?: string; error?: { type?: string } }) => {
        // El motivo real de Daily se loguea pero NO se le muestra al cliente:
        // errores como `account-missing-payment-method` son de nuestra cuenta,
        // no algo que el solicitante pueda entender ni resolver. Sin este log,
        // un fallo de facturación se ve igual que un problema de red.
        const motivo = ev?.errorMsg || ev?.error?.type || 'desconocido';
        console.error('[videollamada] Daily rechazo la conexion:', motivo);
        setError('No pudimos conectarte a la videollamada. Avísale a tu asesor.');
        setEstado('error');
      });

      frame.current = call;
      await call.join({ url: res.data.room_url, token: res.data.token });
      // `joined-meeting` ya movió el estado; esto cubre el caso raro de que
      // el evento no llegue pero el join haya resuelto igual.
      entroAlgunaVez.current = true;
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

  const conectando = estado === 'cargando';

  return (
    /*
      `100dvh` y no `100vh`: en mobile la barra del navegador entra y sale, y
      `vh` la ignora — la pagina queda mas alta que la pantalla y aparece
      scroll. `dvh` sigue el alto real disponible.
    */
    <main className="flex h-[100dvh] flex-col bg-white px-3 py-4 font-sans sm:px-4 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl min-h-0 flex-1 flex-col gap-3">
        <header className="shrink-0">
          <h1 className="text-lg font-semibold text-[#4654CD] sm:text-xl">
            Videollamada con tu asesor
          </h1>
          {conectando && (
            <p className="mt-1 text-sm text-gray-600">Conectando…</p>
          )}
        </header>

        {/*
          El contenedor NO se oculta mientras conecta. Daily monta un iframe
          acá adentro y necesita un elemento con tamaño real: dentro de un
          `display:none` el frame nunca levanta y termina emitiendo
          `left-meeting`, que es exactamente el bug que mostraba "Saliste de
          la videollamada" sin haber entrado.
        */}
        <div
          ref={contenedor}
          aria-busy={conectando}
          className={
            estado === 'terminada' || estado === 'error'
              ? 'hidden'
              // `flex-1` para ocupar todo lo que sobra en vez de un alto fijo:
              // con `70vh` quedaba un tercio de pantalla en blanco abajo en
              // mobile. `min-h-0` deja que el hijo flex pueda encogerse — sin
              // eso desborda y vuelve el scroll.
              : 'min-h-0 w-full flex-1 overflow-hidden rounded-xl bg-black'
          }
        />

        {estado === 'terminada' && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 p-6 text-center">
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
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 p-6 text-center">
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
