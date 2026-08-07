'use client';

import { useEffect, useState } from 'react';

export interface Countdown {
  expired: boolean;
  label: string; // ej. "1d 23h", "5h 12m", "8m"
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function format(msLeft: number): Countdown {
  if (msLeft <= 0) {
    return { expired: true, label: '0m', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSec = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  // #5: contador en palabras completas ("2 días 7 horas") en vez de "2d 7h".
  const label =
    days > 0
      ? `${days} ${days === 1 ? 'día' : 'días'} ${hours} ${hours === 1 ? 'hora' : 'horas'}`
      : hours > 0
      ? `${hours} ${hours === 1 ? 'hora' : 'horas'} ${minutes} min`
      : `${minutes} min`;
  return { expired: false, label, days, hours, minutes, seconds };
}

/** Cuenta regresiva hacia una fecha ISO; se actualiza cada segundo. */
export function useCountdown(expiresAtIso: string | null): Countdown | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!expiresAtIso) return null;
  const target = new Date(expiresAtIso).getTime();
  if (Number.isNaN(target)) return null;
  return format(target - now);
}
