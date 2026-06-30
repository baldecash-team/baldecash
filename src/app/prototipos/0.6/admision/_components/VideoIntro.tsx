'use client';
import { useState } from 'react';

type Coords = { latitude: number; longitude: number; accuracy_m?: number };

const BULLETS = [
  'Te mostramos una pregunta a la vez.',
  'Respondes con un video corto, a tu ritmo.',
  'Lo revisamos y seguimos con tu solicitud.',
];

export function VideoIntro({ onStart, applicantName }: { onStart: (c: Coords) => void; applicantName?: string }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización. Abre el enlace desde tu celular.');
      return;
    }
    setError(null);
    // iOS: invocar getCurrentPosition síncronamente dentro del tap; setState DESPUÉS.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onStart({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy,
        });
      },
      (geoError) => {
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
      <div className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4">
        <p className="flex items-center gap-2 font-bold text-violet-900">📍 Antes de empezar</p>
        <ul className="mt-2 space-y-2 text-sm text-violet-900">
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
        className="w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {locating ? 'Obteniendo ubicación…' : 'Permitir ubicación y comenzar'}
      </button>
    </div>
  );
}
