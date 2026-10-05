'use client';

/**
 * La operación deja de ser editable cuando la solicitud ya existe.
 *
 * Con envío anticipado la solicitud se crea a mitad del wizard y el contrato se
 * emite con ESOS números: plazo, inicial, cuota. Si después se pudiera mover el
 * plazo o la inicial, la pantalla mostraría una cuota y el PDF diría otra —y el
 * hash sella el PDF—. No es un detalle de UI: es la diferencia entre aceptar el
 * contrato propio y aceptar uno que ya no describe la operación.
 *
 * Aplica SOLO donde el contrato se lee y se acepta en el flujo (sub-paso
 * `contract` de la sección `kyc`). Sin ese módulo no hay documento emitido que
 * pueda quedar desfasado, y congelar las condiciones sería quitarle al
 * postulante una opción por nada.
 */

import { useEffect, useState } from 'react';

import { readEnvioAnticipadoHandoff } from '../utils/envioAnticipadoHandoff';

export function useSolicitudCongelada(landing: string): boolean {
  const [congelada, setCongelada] = useState(false);

  // En un efecto y no en el render: `sessionStorage` no existe en el servidor,
  // y leerlo directo rompe la hidratación.
  //
  // El dato de si hay contrato viene en el propio handoff: pedir la config acá
  // metería un fetch en la barra del producto, que se monta en todo el wizard,
  // solo para decidir si pinta un selector.
  useEffect(() => {
    setCongelada(readEnvioAnticipadoHandoff(landing)?.conContrato === true);
  }, [landing]);

  return congelada;
}
