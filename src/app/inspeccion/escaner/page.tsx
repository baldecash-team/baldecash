'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { PreVuelo, estaListo } from '../_components/PreVuelo';
import { getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { API_BASE_URL, redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';

interface PairingCode {
  code: string;
  expires_at: string;
  pair_url: string;
}

function hayCodigoEnUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('p') !== null;
}

/**
 * Controlador de la estación. En F1 muestra el pre-vuelo y permite vincular
 * cámaras por QR: la lectura del serial es F2 y el comando de grabación es F3.
 *
 * El QR se genera EN EL CLIENTE con `qrcode.react` — no se manda la URL de
 * vinculación a un servicio externo (ver nota sobre `pedirCodigo` más abajo).
 *
 * Vinculación: mismo criterio que `camara/page.tsx` — si la URL trae `?p=`,
 * se LIMPIA SINCRÓNICAMENTE al entrar al efecto, antes de cualquier `await`,
 * y GANA sobre una sesión ya guardada (ver doc-comment de `camara/page.tsx`
 * para el razonamiento completo: Analytics, historial, y es el único camino
 * de re-vinculación hoy).
 */
export default function EscanerPage() {
  // Lazy init por el mismo motivo que camara/page.tsx: valores síncronos
  // disponibles desde el primer render, sin efecto + microtask de por medio.
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession());
  const [vinculando, setVinculando] = useState<boolean>(() => hayCodigoEnUrl());
  const [vinculoError, setVinculoError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [stateError, setStateError] = useState<string | null>(null);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) return;

    // Sincrónico, antes de cualquier await — ver doc-comment de arriba.
    window.history.replaceState({}, '', window.location.pathname);

    redeemPairingCode(code)
      .then((s) => setSession(s))
      .catch((e: Error) => setVinculoError(e.message))
      .finally(() => setVinculando(false));
  }, []);

  // `error: channelError` para no chocar con `vinculoError`/`stateError`/
  // `pairingError`: son problemas distintos y no deben pisarse el mensaje.
  const { members, connected, error: channelError } = usePresenceChannel(
    session?.stationId ?? null,
    session?.token ?? null
  );

  // Las etiquetas esperadas vienen del servidor: el front nunca asume cuántas son.
  useEffect(() => {
    if (!session) return;
    fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
      headers: { 'X-Device-Token': session.token },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        return r.json();
      })
      .then((d) => {
        setLabels(d.camera_labels ?? []);
        // Limpia acá, no con un microtask al arrancar el efecto: así no
        // hace falta ningún setState síncrono en el cuerpo del efecto y el
        // error previo (si lo había) sigue visible hasta que el reintento
        // realmente resuelva, en vez de parpadear a "sin error" de entrada.
        setStateError(null);
      })
      .catch(() => {
        // Distinguir "no pude consultar el estado" (problema de red del
        // escáner) de "las cámaras no están conectadas" (problema real de
        // la estación) — si no, un corte de red del escáner se ve idéntico
        // a "faltan cámaras" y el operador va a revisar los teléfonos
        // equivocados.
        setStateError('No se pudo consultar el estado de la estación. Reintentá o revisá la red del escáner.');
      });
  }, [session]);

  const pedirCodigo = useCallback(
    async (label: string) => {
      if (!session) return;
      setPairingError(null);
      try {
        // NOTA DE CONTRATO (verificado contra el backend, commit c648e547):
        // POST /inspections/stations/{id}/pairing-codes acepta DOS vías de
        // auth (app/api/routers/inspection/pairing.py): un UserAccount de
        // backoffice por JWT Bearer, O el propio escáner de la estación por
        // `X-Device-Token` — pero solo para emitir códigos `kind=camara` de
        // SU PROPIA estación (`_authorize_scanner_camera_code`). Es lo que
        // permite vincular una cámara caída sin depender de que haya un
        // supervisor de backoffice disponible. La llamada de acá (kind fijo
        // en 'camara', mismo `session.stationId`) ya matchea ese contrato.
        const r = await fetch(
          `${API_BASE_URL}/inspections/stations/${session.stationId}/pairing-codes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Device-Token': session.token,
            },
            body: JSON.stringify({ kind: 'camara', label }),
          }
        );
        if (!r.ok) {
          setPairingError(`No se pudo emitir el código (http_${r.status})`);
          setPairing(null);
          return;
        }
        setPairing(await r.json());
      } catch {
        setPairingError('No se pudo emitir el código: error de red');
        setPairing(null);
      }
    },
    [session]
  );

  if (vinculando) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold" style={{ color: TOKENS.ink }}>
          Vinculando…
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold" style={{ color: TOKENS.ink }}>
          Escáner no vinculado
        </p>
        <p className="mt-2 text-sm" style={{ color: vinculoError ? TOKENS.red : TOKENS.slate }}>
          {vinculoError ?? 'Abrí la URL de vinculación que emite el backoffice para esta estación.'}
        </p>
      </main>
    );
  }

  // `connected` entra en la cuenta: presence es stale ante un corte —
  // pusher-js no emite member_removed al perder conexión, así que `members`
  // conserva la última foto. Sin este `&&`, "Estación lista" quedaba en
  // verde mientras el escáner estaba desconectado y la única pista era un
  // "Reconectando…" gris y chico (I2).
  const listo = connected && !channelError && estaListo(labels, members);

  // Precedencia que sostiene la semántica del banner (I1): `channelError`
  // (no sé nada del canal) > `stateError` (no sé qué espera la estación) >
  // `listo`/`faltan cámaras` (sé, y falta esto). Cuando gana un error de
  // arriba, el banner NO debe afirmar nada sobre las cámaras — antes,
  // `channelError` quedaba en un <p> chico aparte mientras el banner grande
  // seguía diciendo "Faltan cámaras" (falso: nadie sabía nada de las
  // cámaras), dos pantallas contradictorias sin que ninguna ganara.
  let bannerText: string;
  let bannerBg: string;
  let bannerColor: string;
  if (channelError) {
    bannerText = channelError.message;
    bannerBg = '#FBEDEE';
    bannerColor = channelError.reason === 'missing_config' ? TOKENS.tertiary : TOKENS.red;
  } else if (stateError) {
    bannerText = stateError;
    bannerBg = '#FBEDEE';
    bannerColor = TOKENS.red;
  } else if (listo) {
    bannerText = 'Estación lista para escanear';
    bannerBg = '#E9F4EF';
    bannerColor = TOKENS.green;
  } else {
    bannerText = 'Faltan cámaras — no se puede escanear';
    bannerBg = '#FBEDEE';
    bannerColor = TOKENS.red;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: TOKENS.slate }}>
        Estación {session.stationId}
      </p>
      <h1 className="mt-1 text-2xl font-bold" style={{ color: TOKENS.ink }}>
        Pre-vuelo
      </h1>

      <div className="mt-6">
        <PreVuelo expectedLabels={labels} members={members} />
      </div>

      <p
        className="mt-6 rounded-xl p-4 text-center text-sm font-semibold"
        style={{ background: bannerBg, color: bannerColor }}
      >
        {bannerText}
      </p>

      {/*
        "Reconectando…" solo cuando NO hay un error explicado arriba: si
        channelError o stateError ya están en el banner grande, repetir acá
        un mensaje distinto sobre lo mismo es la contradicción que era I1.
      */}
      {!channelError && !stateError && !connected && (
        <p className="mt-3 text-center text-xs" style={{ color: TOKENS.slate }}>
          Reconectando…
        </p>
      )}

      <section className="mt-8 border-t pt-6" style={{ borderColor: TOKENS.line }}>
        <h2 className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
          Vincular una cámara
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {labels.map((label) => (
            <button
              key={label}
              onClick={() => pedirCodigo(label)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: TOKENS.primary, color: TOKENS.primary }}
            >
              {label}
            </button>
          ))}
        </div>

        {pairingError && (
          <p className="mt-4 text-center text-sm font-semibold" style={{ color: TOKENS.red }}>
            {pairingError}
          </p>
        )}

        {pairing && (
          <div className="mt-4 rounded-xl border p-4 text-center" style={{ borderColor: TOKENS.line }}>
            <p className="text-xs" style={{ color: TOKENS.slate }}>
              Escaneá este QR con la cámara del teléfono
            </p>
            {/*
              El escáner corre en laptop (pantalla ancha) y el teléfono lo
              escanea a cierta distancia: cuanto más grande, mejor. QRCodeSVG
              es vector (viewBox + paths, sin rasterizar) así que escalarlo
              por CSS no pierde nitidez — el `size` de abajo es solo la
              resolución interna del viewBox, el tamaño real lo da el
              contenedor responsive.
            */}
            <div className="mx-auto mt-3 w-40 sm:w-56 md:w-72 lg:w-96">
              <QRCodeSVG
                value={pairing.pair_url}
                size={384}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <p className="mt-3 font-mono text-2xl tracking-widest" style={{ color: TOKENS.ink }}>
              {pairing.code}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
