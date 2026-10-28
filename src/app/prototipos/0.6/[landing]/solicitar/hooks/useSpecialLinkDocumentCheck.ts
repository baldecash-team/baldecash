'use client';

/**
 * Link especial: valida el DNI del titular apenas está completo.
 *
 * Solo corre si el producto elegido vino con pase (`specialLinkToken`) y la
 * landing tiene un token guardado. Sin link especial no hace nada: ni llama al
 * backend ni devuelve error.
 *
 * Devuelve el error a mostrar debajo del campo (o `null`). Una falla de red no
 * bloquea: el envío lo vuelve a validar.
 */

import { useEffect, useRef, useState } from 'react';
import { getSpecialLinkToken } from '@/app/prototipos/0.6/utils/specialLink';
import { verificarDniDelLinkEspecial } from '@/app/prototipos/0.6/utils/specialLinkDni';
import { useProductOptional } from '../context/ProductContext';

interface Options {
  /** Documento completo y con formato válido, o `null` mientras no lo esté. */
  documentNumber: string | null;
  landing: string;
  debounceMs?: number;
}

interface Result {
  error: string | null;
  isChecking: boolean;
}

export function useSpecialLinkDocumentCheck({
  documentNumber,
  landing,
  debounceMs = 300,
}: Options): Result {
  const product = useProductOptional();
  const tokenDelProducto =
    product?.selectedProduct?.specialLinkToken ?? product?.cartProducts?.[0]?.specialLinkToken ?? null;
  const tokenGuardado = tokenDelProducto ? getSpecialLinkToken(landing) : null;
  const token = tokenDelProducto && tokenGuardado ? tokenDelProducto : null;

  // Veredicto para un (token, documento) concreto: si el documento cambia, el
  // veredicto anterior deja de valer en el mismo render, sin esperar al efecto.
  const [veredicto, setVeredicto] = useState<{ key: string; error: string | null } | null>(null);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const keyActual = token && documentNumber ? `${token}:${documentNumber}` : null;
  const keyRef = useRef(keyActual);
  keyRef.current = keyActual;

  useEffect(() => {
    if (!keyActual || !token || !documentNumber) return;
    if (veredicto?.key === keyActual) return;
    const timer = setTimeout(() => {
      setEnCurso(keyActual);
      verificarDniDelLinkEspecial(token, landing, documentNumber).then((r) => {
        // Mientras respondía, la persona cambió el documento.
        if (keyRef.current !== keyActual) return;
        setEnCurso(null);
        setVeredicto({ key: keyActual, error: r?.error ?? null });
      });
    }, debounceMs);
    return () => clearTimeout(timer);
    // `veredicto` no va: re-dispararía la consulta al guardar su propio resultado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyActual, token, documentNumber, landing, debounceMs]);

  return {
    error: keyActual && veredicto?.key === keyActual ? veredicto.error : null,
    isChecking: !!keyActual && enCurso === keyActual,
  };
}
