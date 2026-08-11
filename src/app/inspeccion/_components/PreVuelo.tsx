'use client';

import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import type { PresenceMember } from '../_lib/usePresenceChannel';

/**
 * Sin todas las cámaras que la estación declara, no se escanea (spec §7).
 *
 * `expectedLabels` viene de `camera_labels` (GET /inspections/stations/{id}/state):
 * es la única fuente de verdad de cuántas cámaras hacen falta. El número NUNCA
 * se compara contra una constante — una estación de pruebas con una sola cámara
 * declarada debe poder operar completa.
 */
export function estaListo(
  expectedLabels: string[],
  members: PresenceMember[]
): boolean {
  if (expectedLabels.length === 0) return false;
  const vivas = new Set(
    members.filter((m) => m.kind === 'camara' && m.label).map((m) => m.label as string)
  );
  return expectedLabels.every((label) => vivas.has(label));
}

export function PreVuelo({
  expectedLabels,
  members,
}: {
  expectedLabels: string[];
  members: PresenceMember[];
}) {
  const vivas = new Set(
    members.filter((m) => m.kind === 'camara' && m.label).map((m) => m.label as string)
  );

  return (
    <div className="flex flex-wrap gap-4">
      {expectedLabels.map((label) => {
        const viva = vivas.has(label);
        return (
          <div
            key={label}
            data-semaforo={label}
            className="flex min-w-[150px] flex-1 items-center gap-3 rounded-xl border p-4"
            style={{ borderColor: TOKENS.line }}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: viva ? TOKENS.green : TOKENS.red }}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
                {label}
              </p>
              <p className="text-xs" style={{ color: TOKENS.slate }}>
                {viva ? 'Conectada' : 'Sin conexión'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
