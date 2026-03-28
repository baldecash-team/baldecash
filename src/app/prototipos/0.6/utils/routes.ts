/**
 * Centralized route builder for BaldeCash v0.6.
 *
 * All navigable paths go through these helpers so that the "/prototipos/0.6"
 * prefix lives in ONE place. When we move to production URLs the only change
 * needed is setting BASE_PATH = ''.
 *
 * Usage:
 *   import { routes } from '@/app/prototipos/0.6/utils/routes';
 *   router.push(routes.catalogo(landing));
 *   router.push(routes.producto(landing, slug));
 */

// ─── Single source of truth ──────────────────────────────────────────────────
// Set NEXT_PUBLIC_APP_BASE_PATH='' in env to remove the prefix for production.
export const BASE_PATH = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? '/prototipos/0.6';

// ─── Route builders ──────────────────────────────────────────────────────────

/** Landing home: /{landing}/ */
export function landingHome(landing: string): string {
  return `${BASE_PATH}/${landing}`;
}

/** Catalog: /{landing}/catalogo */
export function catalogo(landing: string, query?: string): string {
  const base = `${BASE_PATH}/${landing}/catalogo`;
  return query ? `${base}?${query}` : base;
}

/** Product detail: /{landing}/producto/{slug} */
export function producto(landing: string, slug: string, query?: string): string {
  const base = `${BASE_PATH}/${landing}/producto/${slug}`;
  return query ? `${base}?${query}` : base;
}

/** Product detail preview (admin): /{landing}/producto/detail-preview */
export function productoPreview(landing: string, productId?: string): string {
  const base = `${BASE_PATH}/${landing}/producto/detail-preview`;
  return productId ? `${base}?id=${productId}` : base;
}

/** Solicitar (application entry): /{landing}/solicitar/ */
export function solicitar(landing: string): string {
  return `${BASE_PATH}/${landing}/solicitar/`;
}

/** Solicitar step: /{landing}/solicitar/{stepSlug} */
export function solicitarStep(landing: string, stepSlug: string): string {
  return `${BASE_PATH}/${landing}/solicitar/${stepSlug}`;
}

/** Solicitar complementos: /{landing}/solicitar/complementos */
export function solicitarComplementos(landing: string): string {
  return `${BASE_PATH}/${landing}/solicitar/complementos`;
}

/** Solicitar confirmación: /{landing}/solicitar/confirmacion */
export function solicitarConfirmacion(landing: string, code?: string): string {
  const base = `${BASE_PATH}/${landing}/solicitar/confirmacion`;
  return code ? `${base}?code=${code}` : base;
}

/** Legal page: /{landing}/legal/{page} */
export function legal(landing: string, page: string): string {
  return `${BASE_PATH}/${landing}/legal/${page}`;
}

/** Próximamente: /{landing}/proximamente */
export function proximamente(landing: string): string {
  return `${BASE_PATH}/${landing}/proximamente`;
}

/** Preview page: /preview/{id} */
export function preview(id: number, previewKey?: string): string {
  const base = `${BASE_PATH}/preview/${id}`;
  return previewKey ? `${base}?preview_key=${previewKey}` : base;
}

/** Preview wizard: /preview-wizard/{id} */
export function previewWizard(id: number, stepSlug?: string, previewKey?: string): string {
  let path = `${BASE_PATH}/preview-wizard/${id}`;
  if (stepSlug) path += `/${stepSlug}`;
  if (previewKey) path += `?preview_key=${previewKey}`;
  return path;
}

/** Home (default landing): /home */
export function home(): string {
  return `${BASE_PATH}/home`;
}

// ─── Convenience namespace ───────────────────────────────────────────────────
export const routes = {
  BASE_PATH,
  home,
  landingHome,
  catalogo,
  producto,
  productoPreview,
  solicitar,
  solicitarStep,
  solicitarComplementos,
  solicitarConfirmacion,
  legal,
  proximamente,
  preview,
  previewWizard,
};

export default routes;
