'use client';

import { useRef } from 'react';

interface OtpFieldProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
}

/**
 * Campo OTP: N inputs controlados, solo dígitos, auto-avance, paste-aware.
 */
export function OtpField({ length = 6, value, onChange }: OtpFieldProps) {
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const digit = (i: number) => value[i] ?? '';

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const d = raw.replace(/\D/g, '').slice(-1);

    if (!d) {
      e.target.value = digit(i);
      return;
    }

    const arr = value.padEnd(length, ' ').split('');
    arr[i] = d;
    const next = arr.join('').replace(/\s/g, '');
    onChange(next);

    if (i < length - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') ?? '').replace(/\D/g, '');
    if (!pasted) return;

    const arr = value.padEnd(length, ' ').split('');
    pasted.split('').forEach((d, j) => {
      const pos = i + j;
      if (pos < length) arr[pos] = d;
    });
    const result = arr.join('').replace(/\s/g, '');
    onChange(result);

    const lastFilled = Math.min(i + pasted.length, length - 1);
    inputRefs.current[lastFilled]?.focus();
  }

  /** Elimina el dígito en la posición `i` (compacta hacia la izquierda). */
  function clearAt(i: number) {
    if (i >= value.length) return;
    onChange(value.slice(0, i) + value.slice(i + 1));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digit(i)) {
        clearAt(i); // borra el dígito de esta casilla
      } else if (i > 0) {
        clearAt(i - 1); // casilla vacía: borra el anterior y retrocede
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      if (digit(i)) clearAt(i);
    }
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) inputRefs.current[i] = el;
          }}
          role="textbox"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit(i)}
          aria-label={`Dígito ${i + 1}`}
          className="w-12 h-14 text-center text-xl font-semibold text-[#1f2937] border-2 border-[#e5e7eb] rounded-lg focus:border-[#4654CD] focus:outline-none transition-colors"
          onChange={(e) => handleChange(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}
