'use client';

import { ModalAviso } from '@/app/prototipos/_shared';

/**
 * El envío rechazó el link especial (DNI que no es el del pase, o pase vencido
 * o usado). Queda fijo hasta que la persona lo cierra: el toast de 4 segundos
 * se borraba antes de leerlo, y este mensaje pide una acción.
 *
 * El wrapper `z-[60]` es el mismo escalón que el modal de unidad tomada: la
 * navbar del wizard también es `z-50`.
 */
export function AvisoLinkEspecialRechazado({
  mensaje,
  onCerrar,
}: {
  mensaje: string | null;
  onCerrar: () => void;
}) {
  if (!mensaje) return null;
  return (
    <div className="relative z-[60]">
      <ModalAviso
        titulo="No pudimos usar tu link especial"
        mensaje={mensaje}
        textoBoton="Entendido"
        onCerrar={onCerrar}
        tono="error"
      />
    </div>
  );
}
