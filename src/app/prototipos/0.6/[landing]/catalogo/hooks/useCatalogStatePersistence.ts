'use client';

/**
 * useCatalogStatePersistence - Guarda/restaura el estado del catálogo en
 * sessionStorage para que volver desde el detalle no dispare un refetch ni
 * pierda el scroll.
 *
 * Qué se guarda (y por qué):
 * - products: lista completa tal como se está mostrando. Evita un fetch al
 *   volver (el requisito del PO). Capamos a MAX_PRODUCTS para acotar tamaño.
 * - total, offset, hasMore: necesarios para que "Load more" siga funcionando
 *   correctamente tras restaurar.
 * - scrollY: posición para restaurar UX.
 * - viewMode: la pestaña "Favoritos" vs "Todos".
 * - timestamp / version / landing / previewKey: validez + invalidación.
 *
 * Qué NO se guarda:
 * - Filtros, sort, search: ya los serializa la URL; restaurar desde sessionStorage
 *   podría divergir y generar estado inconsistente.
 *
 * Claves de storage:
 *   baldecash-{landing}-catalog-snapshot  (por landing, no por previewKey)
 *
 * TTL: 30 min. Snapshots más viejos se descartan.
 */

import { useCallback, useMemo, useRef } from 'react';
import type { CatalogProduct, CatalogViewMode } from '../types/catalog';

const SNAPSHOT_VERSION = 1;
const TTL_MS = 30 * 60 * 1000;
const MAX_PRODUCTS = 96; // ~300KB JSON — cota razonable para sessionStorage

export interface CatalogSnapshot {
  version: number;
  timestamp: number;
  landing: string;
  previewKey: string | null;
  scrollY: number;
  viewMode: CatalogViewMode;
  products: CatalogProduct[];
  total: number;
  offset: number;
  hasMore: boolean;
}

interface SaveArgs {
  scrollY: number;
  viewMode: CatalogViewMode;
  products: CatalogProduct[];
  total: number;
  offset: number;
  hasMore: boolean;
}

const getStorageKey = (landing: string) => `baldecash-${landing}-catalog-snapshot`;

export function useCatalogStatePersistence(
  landing: string,
  previewKey: string | null | undefined
) {
  // Evita restaurar dos veces en la misma sesión de página.
  const consumedRef = useRef(false);

  // Snapshot leído una sola vez (la primera renderización).
  const snapshot = useMemo<CatalogSnapshot | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(getStorageKey(landing));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CatalogSnapshot;

      // Validaciones
      if (parsed.version !== SNAPSHOT_VERSION) return null;
      if (parsed.landing !== landing) return null;
      if ((parsed.previewKey ?? null) !== (previewKey ?? null)) return null;
      if (Date.now() - parsed.timestamp > TTL_MS) return null;
      if (!Array.isArray(parsed.products) || parsed.products.length === 0) return null;

      return parsed;
    } catch {
      return null;
    }
    // Intencionalmente sólo depende de landing/previewKey en el primer mount.
    // No queremos recalcular el snapshot a mitad de sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    (args: SaveArgs) => {
      if (typeof window === 'undefined') return;
      try {
        const data: CatalogSnapshot = {
          version: SNAPSHOT_VERSION,
          timestamp: Date.now(),
          landing,
          previewKey: previewKey ?? null,
          scrollY: args.scrollY,
          viewMode: args.viewMode,
          products: args.products.slice(0, MAX_PRODUCTS),
          total: args.total,
          offset: Math.min(args.offset, MAX_PRODUCTS),
          hasMore: args.hasMore,
        };
        sessionStorage.setItem(getStorageKey(landing), JSON.stringify(data));
      } catch {
        // QuotaExceededError u otros: ignorar. Es una mejora de UX, no un
        // bloqueo funcional. Evitar spam de logs.
      }
    },
    [landing, previewKey]
  );

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(getStorageKey(landing));
    } catch {
      // ignore
    }
  }, [landing]);

  const markConsumed = useCallback(() => {
    consumedRef.current = true;
  }, []);

  const isConsumed = useCallback(() => consumedRef.current, []);

  return { snapshot, save, clear, markConsumed, isConsumed };
}
