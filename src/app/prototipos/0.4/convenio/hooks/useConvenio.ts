'use client';

// useConvenio Hook - BaldeCash v0.4
// Manages convenio parameter propagation across the flow

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ConvenioData } from '../types/convenio';
import { convenios, getConvenioBySlug } from '../data/mockConvenioData';

export interface UseConvenioReturn {
  /** Whether a convenio is currently active */
  isConvenio: boolean;
  /** The convenio data if active, null otherwise */
  convenio: ConvenioData | null;
  /** The convenio slug from URL params */
  convenioSlug: string | null;
  /** Appends convenio parameter to a URL */
  appendConvenioParam: (url: string) => string;
  /** Calculates discounted quota */
  calcularCuotaDescuento: (cuotaOriginal: number) => number;
  /** Calculates savings per quota */
  calcularAhorro: (cuotaOriginal: number) => number;
  /** Calculates total savings over term */
  calcularAhorroTotal: (cuotaOriginal: number, plazo: number) => number;
  /** All available convenios */
  allConvenios: ConvenioData[];
}

export function useConvenio(): UseConvenioReturn {
  const searchParams = useSearchParams();
  const convenioSlug = searchParams.get('convenio');

  const convenioData = useMemo(() => {
    return convenioSlug ? getConvenioBySlug(convenioSlug) ?? null : null;
  }, [convenioSlug]);

  /**
   * Appends the convenio parameter to a URL
   * Preserves existing query params
   */
  const appendConvenioParam = (url: string): string => {
    if (!convenioSlug) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}convenio=${convenioSlug}`;
  };

  /**
   * Calculates the discounted quota based on convenio discount
   */
  const calcularCuotaDescuento = (cuotaOriginal: number): number => {
    if (!convenioData) return cuotaOriginal;
    return Math.round(cuotaOriginal * (1 - convenioData.descuentoCuota / 100));
  };

  /**
   * Calculates the savings per quota
   */
  const calcularAhorro = (cuotaOriginal: number): number => {
    if (!convenioData) return 0;
    return cuotaOriginal - calcularCuotaDescuento(cuotaOriginal);
  };

  /**
   * Calculates total savings over the entire term
   */
  const calcularAhorroTotal = (cuotaOriginal: number, plazo: number): number => {
    return calcularAhorro(cuotaOriginal) * plazo;
  };

  return {
    isConvenio: !!convenioData,
    convenio: convenioData,
    convenioSlug,
    appendConvenioParam,
    calcularCuotaDescuento,
    calcularAhorro,
    calcularAhorroTotal,
    allConvenios: convenios,
  };
}

/**
 * Hook for use in static/server contexts where useSearchParams isn't available
 * Takes convenio slug directly as parameter
 */
export function useConvenioStatic(convenioSlug: string | null): UseConvenioReturn {
  const convenioData = useMemo(() => {
    return convenioSlug ? getConvenioBySlug(convenioSlug) ?? null : null;
  }, [convenioSlug]);

  const appendConvenioParam = (url: string): string => {
    if (!convenioSlug) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}convenio=${convenioSlug}`;
  };

  const calcularCuotaDescuento = (cuotaOriginal: number): number => {
    if (!convenioData) return cuotaOriginal;
    return Math.round(cuotaOriginal * (1 - convenioData.descuentoCuota / 100));
  };

  const calcularAhorro = (cuotaOriginal: number): number => {
    if (!convenioData) return 0;
    return cuotaOriginal - calcularCuotaDescuento(cuotaOriginal);
  };

  const calcularAhorroTotal = (cuotaOriginal: number, plazo: number): number => {
    return calcularAhorro(cuotaOriginal) * plazo;
  };

  return {
    isConvenio: !!convenioData,
    convenio: convenioData,
    convenioSlug,
    appendConvenioParam,
    calcularCuotaDescuento,
    calcularAhorro,
    calcularAhorroTotal,
    allConvenios: convenios,
  };
}

export default useConvenio;
