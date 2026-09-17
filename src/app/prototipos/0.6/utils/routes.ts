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
// When rewrites are active, set NEXT_PUBLIC_APP_BASE_PATH='' so links are clean.
// Defaults to '/prototipos/0.6' for local dev without rewrites.
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

/**
 * Convierte un href guardado desde el admin en una URL navegable de esta landing.
 *
 * El selector del admin (`NavigationLinkSelect`) guarda los hrefs SIN barra
 * inicial --`catalogo`, `catalogo?device=laptop`, `proximamente/becas`--, que
 * no son rutas validas por si solas: hay que anteponerles el home de la landing.
 *
 * Es la misma logica que `transformLink` en `components/hero/Navbar.tsx`. Se
 * copio esa variante y no la del Footer: el Footer manda `#ancla` por la rama
 * de "dejar intacto", asi que desde una subpagina el ancla se busca en la
 * pagina actual en vez de llevar al home de la landing.
 *
 * OJO con el orden: esta funcion NO sanitiza. El resultado tiene que pasar
 * despues por `safeLinkUrl`. Al reves no funciona -- `safeLinkUrl('catalogo')`
 * devuelve '' porque no empieza con '/', '#', '?' ni 'http', y el enlace
 * desaparece sin ningun error.
 *
 * Devuelve '' cuando no hay href, para que el consumidor decida no renderizar
 * el enlace (mismo contrato que `safeLinkUrl`).
 */
export function transformConfigHref(href: string, landing: string): string {
  if (!href) return '';

  if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
    return href;
  }

  // Destino en OTRA landing: `@slug/pagina`. Ver `parseCrossLanding`.
  const cross = parseCrossLanding(href);
  if (cross) {
    const otroHome = landingHome(cross.landing);
    // El resto se resuelve igual que en la landing propia, ancla incluida.
    if (!cross.resto) return otroHome;
    if (cross.resto.startsWith('#')) return `${otroHome}${cross.resto}`;
    return `${otroHome}/${cross.resto}`;
  }

  const home = landingHome(landing.replace(/\/+$/, ''));

  if (href.startsWith('#')) return `${home}${href}`;
  if (href.startsWith(`${BASE_PATH}/`)) return href;

  return `${home}/${href}`;
}

/**
 * Prefijo de los destinos que apuntan a OTRA landing: `@slug/pagina`.
 *
 * Se eligió una marca explícita en vez de apoyarse en la barra inicial porque
 * `/otra-landing/catalogo` significa cosas distintas según el entorno: en
 * producción `BASE_PATH` es '' y la rama de "ya viene con BASE_PATH" la deja
 * intacta, pero en local (`/prototipos/0.6`) no matchea y termina colgada de
 * la landing actual. El mismo valor guardado llevaría a dos sitios distintos.
 *
 * `@` no colisiona con nada de lo ya guardado: los hrefs del admin son rutas
 * relativas (`catalogo`), anclas (`#faq`) o URLs absolutas.
 */
const CROSS_LANDING_PREFIX = '@';

/** Un slug de landing: minúsculas, dígitos y guiones. */
const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Parte `@slug/resto` en sus dos mitades.
 *
 * Devuelve null si no lleva el prefijo o si el slug no es válido -- un slug
 * con `.` o `/` extra podría salirse de la ruta esperada, y ante la duda es
 * preferible tratarlo como href normal y que caiga en la landing actual, que
 * es el comportamiento de siempre.
 */
export function parseCrossLanding(
  href: string
): { landing: string; resto: string } | null {
  if (!href.startsWith(CROSS_LANDING_PREFIX)) return null;

  const sinPrefijo = href.slice(CROSS_LANDING_PREFIX.length);
  const corte = sinPrefijo.search(/[/#?]/);

  const slug = corte === -1 ? sinPrefijo : sinPrefijo.slice(0, corte);
  if (!SLUG_VALIDO.test(slug)) return null;

  if (corte === -1) return { landing: slug, resto: '' };

  const resto = sinPrefijo.slice(corte);
  // `@slug/catalogo` -> resto `catalogo`; `@slug#faq` -> resto `#faq`.
  return { landing: slug, resto: resto.startsWith('/') ? resto.slice(1) : resto };
}

/** Arma el valor que se guarda para un destino en otra landing. */
export function buildCrossLandingHref(landing: string, resto: string): string {
  return resto
    ? `${CROSS_LANDING_PREFIX}${landing}/${resto}`
    : `${CROSS_LANDING_PREFIX}${landing}`;
}

/**
 * Selección de institución: /{landing}/universidad
 *
 * Primera pantalla del producto de matrícula. Reemplaza al catálogo: acá no se
 * elige un equipo sino la institución, y de ahí se pasa a la calculadora.
 */
export function universidad(landing: string): string {
  return `${BASE_PATH}/${landing}/universidad`;
}

/**
 * Calculadora de matrícula: /{landing}/calculadora
 *
 * Hermana de `catalogo`, no parte de `solicitar`. El recorrido del producto de
 * matrícula no pasa por catálogo ni por el detalle de producto: la calculadora
 * arma el financiamiento y entrega directo a /solicitar.
 */
export function calculadora(landing: string): string {
  return `${BASE_PATH}/${landing}/calculadora`;
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

/**
 * Solicitar confirmación: /{landing}/solicitar/confirmacion
 *
 * `kycCompletado` marca que se llega desde el cierre del KYC y no desde el
 * submit. Cambia lo que la pantalla puede prometer: quien cerró el KYC ya fue
 * aprobado y firmó, así que no hay nada "en revisión" ni una respuesta que
 * esperar. Viaja en la URL porque la confirmación se puede recargar y volver a
 * abrir desde cero.
 */
/**
 * Formulario de entrega por token.
 *
 * `volver` es a dónde sigue el flujo cuando la persona termina de coordinar
 * —la confirmación de su solicitud—. Viaja en la URL porque el formulario es
 * una pantalla propia, fuera del wizard: sin eso no sabría a dónde devolverla.
 *
 * `atras` es a dónde vuelve si se arrepiente ANTES de terminar: el contrato
 * que acaba de firmar (en modo "ya aceptaste este contrato"), no un paso
 * anterior del wizard —ese ya no se puede tocar, ver G2 de las gates de
 * navegación—. Opcional: el enlace de WhatsApp no trae ninguno de los dos, y
 * ahí el formulario no ofrece volver a ningún lado.
 */
export function entregaPorToken(token: string, volver?: string, atras?: string): string {
  const base = `${BASE_PATH}/entrega/${token}`;
  const params = new URLSearchParams();
  if (volver) params.set('volver', volver);
  if (atras) params.set('atras', atras);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function solicitarConfirmacion(
  landing: string,
  code?: string,
  kycCompletado?: boolean
): string {
  const base = `${BASE_PATH}/${landing}/solicitar/confirmacion`;
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (kycCompletado) params.set('kyc', '1');
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Solicitar verificación de correo (OTP inline): /{landing}/solicitar/verificacion
 * Lleva `application_id` (obligatorio para enviar/verificar) y opcionalmente el
 * `code` de la solicitud para navegar al resumen tras confirmar. El DNI viaja
 * fuera de la URL (sessionStorage) por ser PII.
 */
export function solicitarVerificacion(
  landing: string,
  params?: { applicationId?: number; code?: string }
): string {
  const base = `${BASE_PATH}/${landing}/solicitar/verificacion`;
  const qs = new URLSearchParams();
  if (params?.applicationId) qs.set('application_id', String(params.applicationId));
  if (params?.code) qs.set('code', params.code);
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
}

/** Solicitar KYC (pasos posteriores): /{landing}/solicitar/kyc */
export function solicitarKyc(
  landing: string,
  params?: { code?: string }
): string {
  const base = `${BASE_PATH}/${landing}/solicitar/kyc`;
  return params?.code ? `${base}?code=${params.code}` : base;
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

/**
 * Normaliza una URL absoluta devuelta por /evaluate al path navegable en el
 * entorno actual.
 *
 * En dev (BASE_PATH !== ''): extrae el pathname de la URL absoluta y lo
 * prefija con BASE_PATH. Así, por ejemplo,
 * "https://baldecash.com/locker-truck/catalogo" se convierte en
 * "/prototipos/0.6/locker-truck/catalogo".
 *
 * En prod (BASE_PATH === ''): devuelve la URL absoluta tal cual (passthrough).
 */
export function normalizeCatalogUrl(absoluteUrl: string): string {
  if (BASE_PATH === '') {
    // Producción: passthrough, la URL absoluta ya es correcta
    return absoluteUrl;
  }
  // Dev local: extraer pathname y anteponer BASE_PATH
  try {
    const { pathname } = new URL(absoluteUrl);
    return `${BASE_PATH}${pathname}`;
  } catch {
    // Si absoluteUrl no es parseable, devolverla sin modificar
    return absoluteUrl;
  }
}

/** Mi oferta pública: /mi-oferta/{token} */
export function miOferta(token: string): string {
  return `${BASE_PATH}/mi-oferta/${token}`;
}

// ─── Convenience namespace ───────────────────────────────────────────────────
export const routes = {
  BASE_PATH,
  home,
  landingHome,
  catalogo,
  universidad,
  calculadora,
  producto,
  productoPreview,
  solicitar,
  solicitarStep,
  solicitarComplementos,
  entregaPorToken,
  solicitarConfirmacion,
  solicitarVerificacion,
  solicitarKyc,
  legal,
  proximamente,
  preview,
  previewWizard,
  normalizeCatalogUrl,
  miOferta,
};

export default routes;
