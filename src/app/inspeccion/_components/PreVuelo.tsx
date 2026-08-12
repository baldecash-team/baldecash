'use client';

import { TOKENS } from '@/app/prototipos/0.6/admision/_components/tokens';
import type { PresenceCaptureState, PresenceMember } from '../_lib/usePresenceChannel';

/**
 * Estados de captura que hacen a una cámara USABLE para grabar. Antes de F3,
 * `estaListo` solo miraba presencia en el canal — "conectada" equivalía a
 * "sirve". Eso dejó de ser cierto en cuanto la cámara empezó a poder estar
 * conectada al canal y sin armar (`inactiva`), a mitad de pedir permiso
 * (`armando`), o caída (`caida`, `track.ended` real): en los tres casos el
 * semáforo se ponía en verde igual y el operador arrancaba una inspección
 * con un teléfono que no puede grabar. Mismo argumento que F1: un semáforo
 * que miente en verde es peor que no tener semáforo.
 */
const ESTADOS_QUE_SIRVEN = new Set<PresenceCaptureState>(['armada', 'grabando']);

function sirve(captureState: PresenceCaptureState | null): boolean {
  return captureState != null && ESTADOS_QUE_SIRVEN.has(captureState);
}

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
    members
      .filter((m) => m.kind === 'camara' && m.label && sirve(m.captureState))
      .map((m) => m.label as string)
  );
  return expectedLabels.every((label) => vivas.has(label));
}

/** Texto del semáforo para una etiqueta — distingue "nunca se conectó" de
 * "conectada pero no puede grabar todavía" en vez de un "Sin conexión"
 * genérico para ambos: son problemas distintos y el operador va a revisar
 * cosas distintas para cada uno. */
function textoEstado(miembro: PresenceMember | undefined): string {
  if (!miembro) return 'Sin conexión';
  switch (miembro.captureState) {
    case 'armada':
    case 'grabando':
      return 'Conectada';
    case 'caida':
      return 'Cámara caída';
    case 'armando':
      return 'Armando…';
    case 'inactiva':
    case null:
      return 'Conectada, sin armar';
  }
}

export function PreVuelo({
  expectedLabels,
  members,
}: {
  expectedLabels: string[];
  members: PresenceMember[];
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {expectedLabels.map((label) => {
        const miembro = members.find((m) => m.kind === 'camara' && m.label === label);
        const viva = sirve(miembro?.captureState ?? null);
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
                {textoEstado(miembro)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
