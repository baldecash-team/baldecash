'use client';

/**
 * El aviso cuando el DNI no esta en la whitelist de esta landing.
 *
 * Es un modal y no un mensaje debajo del campo a proposito: el DNI esta bien
 * escrito, simplemente no aplica a esta campana. Un texto rojo al pie del input
 * se lee como «corregi lo que pusiste», y no hay nada que corregir.
 *
 * Dos mensajes distintos, tambien a proposito:
 *
 *   - Con landing hermana -> es una REDIRECCION, no un rechazo. La persona si
 *     esta invitada, solo que al grupo de al lado. Decirle «no estas
 *     habilitado» seria falso.
 *   - Sin hermana -> rechazo, pero nunca sin salida: siempre se ofrece a donde
 *     ir. Un modal con solo «Cerrar» deja a alguien mirando un formulario que
 *     ya sabe que no puede llenar.
 */

import React from 'react';

interface Props {
  dni: string;
  hermana?: { slug: string; name: string } | null;
  firstName?: string | null;
  onCerrar: () => void;
}

const WHATSAPP_SOPORTE = 'https://wa.link/qqmbg0';

export const DniNoInvitadoModal: React.FC<Props> = ({
  dni,
  hermana,
  firstName,
  onCerrar,
}) => {
  const esRedireccion = !!hermana;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dni-no-invitado-titulo"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2
          id="dni-no-invitado-titulo"
          className="mb-3 text-lg font-bold text-gray-900"
        >
          {esRedireccion
            ? 'Tu invitación es para otro grupo'
            : 'Esta campaña es por invitación'}
        </h2>

        {esRedireccion ? (
          <p className="mb-5 text-sm text-gray-600">
            {firstName ? `Hola ${firstName}. ` : ''}
            El DNI <strong>{dni}</strong> está invitado a{' '}
            <strong>{hermana!.name}</strong>.
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-600">
              El DNI <strong>{dni}</strong> no está en la lista de clientes
              invitados a esta campaña.
            </p>
            <p className="mb-5 text-sm text-gray-600">
              Si creés que es un error, escribinos y lo revisamos.
            </p>
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {esRedireccion ? (
            <a
              href={`/${hermana!.slug}/catalogo/`}
              className="flex-1 rounded-xl bg-[#4654CD] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ir a esa campaña
            </a>
          ) : (
            <a
              href={WHATSAPP_SOPORTE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-[#4654CD] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Escribir por WhatsApp
            </a>
          )}

          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {esRedireccion ? 'Cancelar' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DniNoInvitadoModal;
