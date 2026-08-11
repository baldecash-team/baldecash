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

/**
 * Controlador de la estación. En F1 muestra el pre-vuelo y permite vincular
 * cámaras por QR: la lectura del serial es F2 y el comando de grabación es F3.
 *
 * El QR se genera EN EL CLIENTE con `qrcode.react` — no se manda la URL de
 * vinculación a un servicio externo (ver nota sobre `pedirCodigo` más abajo).
 */
export default function EscanerPage() {
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [vinculando, setVinculando] = useState(true);
  const [vinculoError, setVinculoError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [stateError, setStateError] = useState<string | null>(null);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);

  useEffect(() => {
    const existente = getDeviceSession();
    if (existente) {
      // Deferido a un microtask por la misma razón que en camara/page.tsx:
      // react-hooks/set-state-in-effect no permite setState síncrono acá.
      Promise.resolve().then(() => {
        setSession(existente);
        setVinculando(false);
      });
      return;
    }

    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) {
      Promise.resolve().then(() => setVinculando(false));
      return;
    }

    redeemPairingCode(code)
      .then((s) => setSession(s))
      .catch((e: Error) => setVinculoError(e.message))
      .finally(() => {
        // El código no debe quedar en el historial ni en el Referer — en
        // NINGÚN camino, éxito o error (mismo criterio que camara/page.tsx).
        // Sin esto, un código vencido o ya usado queda pegado en la URL y
        // cada refresh reintenta canjear el mismo código inválido.
        window.history.replaceState({}, '', window.location.pathname);
        setVinculando(false);
      });
  }, []);

  const { members, connected } = usePresenceChannel(
    session?.stationId ?? null,
    session?.token ?? null
  );

  // Las etiquetas esperadas vienen del servidor: el front nunca asume cuántas son.
  useEffect(() => {
    if (!session) return;
    // Mismo motivo que los otros setState en efecto de este archivo:
    // react-hooks/set-state-in-effect exige que no sea síncrono.
    Promise.resolve().then(() => setStateError(null));
    fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
      headers: { 'X-Device-Token': session.token },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        return r.json();
      })
      .then((d) => setLabels(d.camera_labels ?? []))
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

  const listo = estaListo(labels, members);

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
        style={{
          background: stateError ? '#FBEDEE' : listo ? '#E9F4EF' : '#FBEDEE',
          color: stateError ? TOKENS.red : listo ? TOKENS.green : TOKENS.red,
        }}
      >
        {stateError
          ? stateError
          : listo
            ? 'Estación lista para escanear'
            : 'Faltan cámaras — no se puede escanear'}
      </p>

      {!connected && (
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
