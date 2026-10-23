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
 *   - Sin hermana -> rechazo, pero nunca sin salida: se ofrece el catalogo
 *     principal, que no pide invitacion. Un modal con solo «Cerrar» deja a
 *     alguien mirando un formulario que ya sabe que no puede llenar.
 *
 * La salida era un link de WhatsApp («escribinos y lo revisamos»), pero eso
 * prometia una revision que no existe: no estar en la lista no es un error a
 * corregir. El catalogo abierto es una salida real y inmediata.
 *
 * Va montado en document.body con un portal, y eso NO es opcional. El modal
 * se renderiza dentro de `<div class="relative z-10">`, que abre un contexto
 * de apilamiento propio: adentro de esa caja el z-[10002] manda, pero contra
 * el resto de la pagina el subarbol entero vale 10, y el header (z-50) le
 * pasa por encima. Subir el numero no arregla nada — se probo 9999 -> 10002
 * y el header seguia ganando — porque los z-index de contextos distintos no
 * se comparan entre si. La unica salida es sacarlo del subarbol.
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  dni: string;
  hermana?: { slug: string; name: string } | null;
  firstName?: string | null;
  onCerrar: () => void;
  /**
   * Diseño 2 (BAL-4963): mismo modal y misma lógica, con la tipografía y los
   * botones del kit de F2. Sin esto, el DOM es el de siempre.
   */
  v2?: boolean;
}

/** Clases de Diseño 2. Las de Diseño 1 quedan escritas tal cual abajo. */
const V2 = {
  tarjeta: "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl font-['Asap',_sans-serif]",
  titulo: "mb-3 font-['Baloo_2',_sans-serif] text-[22px] font-bold leading-tight text-[#1E2230]",
  texto: 'text-[15px] leading-snug text-[#5B6275]',
  primario:
    'flex flex-1 min-h-[48px] cursor-pointer items-center justify-center rounded-[10px] bg-[var(--color-primary)] px-4 text-center text-base font-bold text-white transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
  secundario:
    'flex-1 min-h-[48px] cursor-pointer rounded-[10px] border-[1.5px] border-[var(--color-primary)] bg-white px-4 text-base font-bold text-[var(--color-primary)] transition hover:bg-[rgba(var(--color-primary-rgb),0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
};

/** El catalogo abierto, el que no pide invitacion. Es la salida para quien no
 *  esta en la lista de esta campana: en vez de mandarlo a escribir por
 *  WhatsApp y esperar respuesta, puede seguir comprando ahora mismo. */
const CATALOGO_PRINCIPAL = 'https://baldecash.com/home/catalogo/';

export const DniNoInvitadoModal: React.FC<Props> = ({
  dni,
  hermana,
  firstName,
  onCerrar,
  v2 = false,
}) => {
  const esRedireccion = !!hermana;

  // El portal necesita el DOM, que en el render del servidor no existe. Se
  // monta recien en el cliente; hasta entonces no se pinta nada.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Al abrirse, sacarle el foco a lo que lo tenga. El modal se dispara desde
  // el campo del DNI, que queda con el cursor puesto: sin esto se puede
  // seguir escribiendo detras del overlay, y lo que se escribe no se ve.
  //
  // Se le pasa el foco al dialogo (tabIndex={-1}) en vez de solo hacer blur:
  // si el foco se va al body, el Tab siguiente vuelve al principio de la
  // pagina en vez de entrar al modal, y el lector de pantalla no anuncia nada.
  const dialogoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!montado) return;
    (document.activeElement as HTMLElement | null)?.blur();
    dialogoRef.current?.focus();
  }, [montado]);

  if (!montado) return null;

  return createPortal(
    <div
      ref={dialogoRef}
      tabIndex={-1}
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 p-4 outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dni-no-invitado-titulo"
    >
      <div className={v2 ? V2.tarjeta : 'w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'}>
        <h2
          id="dni-no-invitado-titulo"
          className={v2 ? V2.titulo : 'mb-3 text-lg font-bold text-gray-900'}
        >
          {esRedireccion
            ? 'Tu invitación es para otro grupo'
            : 'Esta campaña es por invitación'}
        </h2>

        {esRedireccion ? (
          <p className={v2 ? `mb-5 ${V2.texto}` : 'mb-5 text-sm text-gray-600'}>
            {firstName ? `Hola ${firstName}. ` : ''}
            El DNI <strong>{dni}</strong> está invitado a{' '}
            <strong>{hermana!.name}</strong>.
          </p>
        ) : (
          <>
            <p className={v2 ? `mb-2 ${V2.texto}` : 'mb-2 text-sm text-gray-600'}>
              El DNI <strong>{dni}</strong> no está en la lista de clientes
              invitados a esta campaña.
            </p>
            <p className={v2 ? `mb-5 ${V2.texto}` : 'mb-5 text-sm text-gray-600'}>
              Puedes ver nuestro catálogo principal, abierto para todos.
            </p>
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {esRedireccion ? (
            <a
              href={`/${hermana!.slug}/catalogo/`}
              className={v2 ? V2.primario : 'flex-1 cursor-pointer rounded-xl bg-[#4654CD] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90'}
            >
              Ir a esa campaña
            </a>
          ) : (
            <a
              href={CATALOGO_PRINCIPAL}
              className={v2 ? V2.primario : 'flex-1 cursor-pointer rounded-xl bg-[#4654CD] px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90'}
            >
              Ver el catálogo principal
            </a>
          )}

          <button
            type="button"
            onClick={onCerrar}
            className={v2 ? V2.secundario : 'flex-1 cursor-pointer rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'}
          >
            {esRedireccion ? 'Cancelar' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DniNoInvitadoModal;
