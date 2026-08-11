'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import { PreVuelo, estaListo } from '../_components/PreVuelo';
import { getDeviceSession, type DeviceSession } from '../_lib/deviceSession';
import { redeemPairingCode } from '../_lib/pairing';
import { usePresenceChannel } from '../_lib/usePresenceChannel';

// Mismo patrón que pairing.ts: NEXT_PUBLIC_API_URL ya incluye /api/v1 en su
// fallback, así que acá NO se vuelve a agregar (el brief original sí lo hacía
// y hubiera duplicado el path — ver task-7-report.md).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

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
  const [labels, setLabels] = useState<string[]>([]);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);

  useEffect(() => {
    const existente = getDeviceSession();
    if (existente) {
      // Deferido a un microtask por la misma razón que en camara/page.tsx:
      // react-hooks/set-state-in-effect no permite setState síncrono acá.
      Promise.resolve().then(() => setSession(existente));
      return;
    }

    const code = new URLSearchParams(window.location.search).get('p');
    if (!code) return;
    redeemPairingCode(code).then((s) => {
      setSession(s);
      window.history.replaceState({}, '', window.location.pathname);
    });
  }, []);

  const { members, connected } = usePresenceChannel(
    session?.stationId ?? null,
    session?.token ?? null
  );

  // Las etiquetas esperadas vienen del servidor: el front nunca asume cuántas son.
  useEffect(() => {
    if (!session) return;
    fetch(`${API_BASE_URL}/inspections/stations/${session.stationId}/state`, {
      headers: { 'X-Device-Token': session.token },
    })
      .then((r) => r.json())
      .then((d) => setLabels(d.camera_labels ?? []));
  }, [session]);

  const pedirCodigo = useCallback(
    async (label: string) => {
      if (!session) return;
      setPairingError(null);
      try {
        // NOTA DE CONTRATO (verificado contra el backend, no adivinado):
        // POST /inspections/stations/{id}/pairing-codes exige `get_backoffice_user`
        // (app/api/routers/inspection/pairing.py), es decir un UserAccount de
        // backoffice autenticado por JWT Bearer — NO `X-Device-Token`. El escáner
        // kiosco solo tiene un token de dispositivo (deviceSession.token), nunca
        // un JWT de backoffice, así que esta llamada hoy responde 401 contra el
        // backend real. El brief de esta task (Step 6) pedía mandar
        // 'X-Device-Token' acá, pero eso no matchea el endpoint tal como quedó
        // tras el review de Task 6 (fix que restringió el endpoint a backoffice
        // para que un dispositivo no pudiera emitir sus propios códigos). Dejo
        // la llamada tal como la especifica el brief porque no es mi lugar
        // inventar un mecanismo de auth distinto para el kiosco — ver el reporte
        // de esta task para la pregunta abierta a resolver con backend/producto.
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

  if (!session) {
    return (
      <main className="p-6">
        <p className="text-lg font-semibold">Escáner no vinculado</p>
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
          background: listo ? '#E9F4EF' : '#FBEDEE',
          color: listo ? TOKENS.green : TOKENS.red,
        }}
      >
        {listo ? 'Estación lista para escanear' : 'Faltan cámaras — no se puede escanear'}
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
            <div className="mx-auto mt-3 flex justify-center">
              <QRCodeSVG value={pairing.pair_url} size={200} />
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
