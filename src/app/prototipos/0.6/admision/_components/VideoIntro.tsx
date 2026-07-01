'use client';
import { useState } from 'react';
import type { AdmissionEvents } from '../_lib/events';

type Coords = { latitude: number; longitude: number; accuracy_m?: number };

const BULLETS = [
  'Te mostramos una pregunta a la vez.',
  'Respondes con un video corto, a tu ritmo.',
  'Lo revisamos y seguimos con tu solicitud.',
];

export function VideoIntro({ onStart, applicantName, events }: { onStart: (c: Coords) => void; applicantName?: string; events?: AdmissionEvents }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      events?.track('video_device_unsupported', { reason: 'no_geolocation' });
      setError('Tu navegador no soporta geolocalización. Abre el enlace desde tu celular.');
      return;
    }
    setError(null);
    // iOS: invocar getCurrentPosition síncronamente dentro del tap; setState DESPUÉS.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        events?.track('video_permission_location_granted');
        setLocating(false);
        onStart({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy,
        });
      },
      (geoError) => {
        events?.track('video_permission_location_denied', { error_type: String(geoError.code) });
        setLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Necesitamos tu ubicación para empezar. Activa el permiso y vuelve a intentar.');
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError('No pudimos determinar tu ubicación. Verifica el GPS e intenta de nuevo.');
        } else if (geoError.code === geoError.TIMEOUT) {
          setError('Se agotó el tiempo de espera. Intenta de nuevo.');
        } else {
          setError('Error al obtener la ubicación.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
    // getCurrentPosition ya se invocó de forma síncrona (regla iOS); ahora sí
    // efectos secundarios: telemetría de "solicitado" y estado de UI.
    events?.track('video_permission_location_requested');
    setLocating(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Hola{applicantName ? `, ${applicantName}` : ''} 👋</h2>
        <p className="mt-2 text-gray-600">
          Para terminar tu evaluación te haremos unas preguntas cortas y nos respondes en video.
          <strong> Toma menos de 5 minutos.</strong>
        </p>
      </div>

      {/* Card llamativo: requisitos bloqueantes */}
      <div className="rounded-2xl border-2 border-[#4654CD]/30 bg-[#ECECFB] p-4">
        <p className="flex items-center gap-2 font-bold text-[#4654CD]">📍 Antes de empezar</p>
        <ul className="mt-2 space-y-2 text-sm text-[#1f2937]">
          <li className="flex gap-2"><span>🏢</span><span>Debes estar <strong>en tu lugar de trabajo</strong>.</span></li>
          <li className="flex gap-2"><span>📡</span><span>Acepta <strong>compartir tu ubicación</strong>: es obligatorio para iniciar.</span></li>
        </ul>
      </div>

      <ul className="space-y-1 text-sm text-gray-600">
        {BULLETS.map((b) => <li key={b} className="flex gap-2"><span>•</span><span>{b}</span></li>)}
      </ul>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={handleStart}
        disabled={locating}
        className="w-full rounded-xl bg-[#4654CD] px-4 py-3 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {locating ? 'Obteniendo ubicación…' : 'Permitir ubicación y comenzar'}
      </button>
    </div>
  );
}
