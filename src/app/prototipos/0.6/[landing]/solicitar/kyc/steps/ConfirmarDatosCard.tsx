'use client';

/**
 * Confirmá tus datos antes del contrato (§5, pantalla 1).
 *
 * Nombre y DNI van bloqueados: corresponden a la identidad que ya se validó, y
 * el §2 es explícito en que querer cambiarlos deriva al proceso reforzado, no
 * se resuelve acá. Editables solo el celular y el correo.
 *
 * El bloqueo no es cosmético: el endpoint tampoco tiene forma de tocar la
 * identidad. Pintarlos deshabilitados es para que la persona entienda por qué,
 * no para impedir nada — un cliente hecho a mano no ve pantallas.
 *
 * Cada cambio queda registrado del lado del servidor con su valor anterior: la
 * matriz de controles marca el cambio fraudulento de contacto como riesgo Alto.
 */
import React, { useEffect, useState } from 'react';

import {
  actualizarContacto,
  getContacto,
  type ContactoKyc,
} from '@/app/prototipos/0.6/services/kycApi';

export interface ConfirmarDatosCardProps {
  applicationCode?: string;
  documentNumber?: string;
  resumeToken?: string;
  /** Se emite cuando un cambio se guardó de verdad. */
  onCambio?: (campos: string[]) => void;
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) {
  if (!valor) return null;

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-[#6b7280]">{etiqueta}</span>
      <span className="text-sm font-medium text-[#1f2937] text-right">{valor}</span>
    </div>
  );
}

export function ConfirmarDatosCard({
  applicationCode,
  documentNumber,
  resumeToken,
  onCambio,
}: ConfirmarDatosCardProps) {
  const [datos, setDatos] = useState<ContactoKyc | null>(null);
  const [editando, setEditando] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationCode) return;
    let vivo = true;
    getContacto({ applicationCode, documentNumber, resumeToken }).then((d) => {
      if (!vivo || !d) return;
      setDatos(d);
      setEmail(d.email ?? '');
      setTelefono(d.telefono ?? '');
    });

    return () => { vivo = false; };
  }, [applicationCode, documentNumber, resumeToken]);

  if (!datos) return null;

  async function guardar() {
    if (!applicationCode || guardando) return;
    setGuardando(true);
    setError(null);

    const cambiados = [
      email !== (datos!.email ?? '') ? 'email' : null,
      telefono !== (datos!.telefono ?? '') ? 'telefono' : null,
    ].filter(Boolean) as string[];

    const nuevo = await actualizarContacto({
      applicationCode, documentNumber, resumeToken, email, telefono,
    });
    setGuardando(false);

    if (!nuevo) {
      // Avisar en vez de dejar creer que quedó guardado: la persona está por
      // aceptar un contrato con estos datos.
      setError('No pudimos guardar los cambios. Revisa el correo y el celular e intenta de nuevo.');
      return;
    }

    setDatos(nuevo);
    setEmail(nuevo.email ?? '');
    setTelefono(nuevo.telefono ?? '');
    setEditando(false);
    if (cambiados.length) onCambio?.(cambiados);
  }

  return (
    <div
      data-testid="confirmar-datos"
      className="rounded-xl border border-[#e5e7eb] bg-white p-4"
    >
      <p className="text-sm font-semibold text-[#1f2937]">Confirma tus datos para continuar</p>

      <div className="mt-2 divide-y divide-[#F1F1F6]">
        <Campo etiqueta="Nombre completo" valor={datos.nombre} />
        <Campo etiqueta="DNI" valor={datos.documento} />
      </div>

      {!editando ? (
        <>
          <div className="mt-2 divide-y divide-[#F1F1F6]">
            <Campo etiqueta="Celular" valor={datos.telefono} />
            <Campo etiqueta="Correo" valor={datos.email} />
          </div>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="mt-2 text-xs font-semibold text-[#4654CD] underline cursor-pointer"
          >
            Actualizar celular o correo
          </button>
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-xs text-[#6b7280]">Celular</span>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[#6b7280]">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
            />
          </label>

          {error && <p className="text-xs text-[#b91c1c]">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded-lg bg-[#4654CD] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setError(null);
                setEmail(datos.email ?? '');
                setTelefono(datos.telefono ?? '');
              }}
              className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs font-semibold text-[#374151] cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
