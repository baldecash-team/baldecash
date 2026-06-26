'use client';

import { useEffect, useState } from 'react';

export interface Countdown {
  expired: boolean;
  label: string; // ej. "1d 23h", "5h 12m", "8m"
}

function format(msLeft: number): Countdown {
  if (msLeft <= 0) return { expired: true, label: '0m' };
  const totalMin = Math.floor(msLeft / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  if (days > 0) return { expired: false, label: `${days}d ${hours}h` };
  if (hours > 0) return { expired: false, label: `${hours}h ${mins}m` };
  return { expired: false, label: `${mins}m` };
}

/** Cuenta regresiva hacia una fecha ISO; se actualiza cada minuto. */
export function useCountdown(expiresAtIso: string | null): Countdown | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!expiresAtIso) return null;
  const target = new Date(expiresAtIso).getTime();
  if (Number.isNaN(target)) return null;
  return format(target - now);
}
