'use client';

/** Countdown del vencimiento de la oferta — bloques de tiempo (DD:HH:MM) en azul de marca. */
import { Clock } from 'lucide-react';
import { useCountdown } from './useCountdown';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-8 min-w-[2rem] items-center justify-center rounded-md px-1.5 text-sm font-bold tabular-nums text-white sm:h-9 sm:min-w-[2.25rem] sm:text-base"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {pad(value)}
      </div>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {unit}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="self-start pt-1 text-sm font-bold sm:text-base" style={{ color: 'var(--color-primary)' }}>
      :
    </span>
  );
}

export function CountdownBar({ expiresAt }: { expiresAt: string | null }) {
  const countdown = useCountdown(expiresAt);
  if (!countdown || countdown.expired) return null;

  const { days, hours, minutes } = countdown;

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: 'rgba(var(--color-primary-rgb), 0.05)',
        borderColor: 'rgba(var(--color-primary-rgb), 0.12)',
      }}
    >
      <div className="mx-auto flex w-full items-center justify-center gap-3 px-3 py-2 sm:px-4 lg:px-6">
        <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
          <Clock className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Tu oferta vence en</span>
          <span className="sm:hidden">Vence en</span>
        </div>
        <div className="flex items-center gap-1">
          {days > 0 && (
            <>
              <TimeBlock value={days} unit="días" />
              <Separator />
            </>
          )}
          <TimeBlock value={hours} unit="horas" />
          <Separator />
          <TimeBlock value={minutes} unit="min" />
        </div>
      </div>
    </div>
  );
}
