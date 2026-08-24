import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_REDIRECT_URL = process.env.MAINTENANCE_REDIRECT_URL || 'https://baldecash.webflow.io';
const APP_BASE_PATH = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? '/prototipos/0.6';
const isProduction = APP_BASE_PATH === '';

/**
 * 301 redirects migrados desde Webflow.
 * Clave: pathname sin trailing slash. Valor: URL destino.
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  '/terminos-y-condiciones': '/home/legal/terminos-y-condiciones',
  '/politica-de-privacidad': '/home/legal/politica-de-privacidad',
  '/politica-de-privacidad-baldecash': '/home/legal/politica-de-privacidad',
  '/libro-reclamaciones': '/home/legal/libro-reclamaciones',
  '/isat': 'https://beneficios.baldecash.com/isat',
  '/colegios': 'https://baldecash-colegios-financiamientos.lovable.app/',
  '/coar': 'https://baldecash-coar.lovable.app/',
  '/terminos-condiciones-baldecash': 'https://baldecash-legal-hub.lovable.app/',
  '/terminos-y-condiciones-baldecash': 'https://baldecash-legal-hub.lovable.app/',
  '/ucal-cachimbo': 'https://beneficios.baldecash.com/ucal-cachimbo',
  '/icpna': 'https://beneficios.baldecash.com/icpna',
  '/isil': 'https://beneficios.baldecash.com/isil',
  '/carloscueto': 'https://beneficios.baldecash.com/carloscueto',
  '/innova': 'https://beneficios.baldecash.com/innova',
  '/corrientealterna': 'https://beneficios.baldecash.com/corrientealterna',
  '/iurusayhua': 'https://beneficios.baldecash.com/iurusayhua',
  '/terminos-condiciones-sorteo-mayo-baldecash': 'https://drive.google.com/file/d/1IdE3FIG0y7iwL6sxYNGnookGZIMuaVtB/view',
  '/usjb': 'https://beneficios.baldecash.com/usjb',
  '/colegiatura-cpsp': 'https://beneficios.baldecash.com/colegiatura-cpsp',
  '/matriculaupn': 'https://pidetuprestamo.baldecash.com/#/matriculasupn',
  '/undac': 'https://beneficios.baldecash.com/undac',
  '/cachimbos': 'https://beneficios.baldecash.com/ucv-2025',
  '/icontinental': 'https://beneficios.baldecash.com/icontinental',
  '/tituloupn': 'https://pidetuprestamo.baldecash.com/#/titulosupn',
  '/titulosupn': 'https://pidetuprestamo.baldecash.com/#/titulosupn',
  '/iestp': 'https://beneficios.baldecash.com/iestp',
  // '/uss' ya no redirige a beneficios: ahora es la landing de convenio.
  // beneficios.baldecash.com/uss redirige hacia acá, así que mantener esta
  // clave causaba un bucle infinito (ERR_TOO_MANY_REDIRECTS).
  '/cpsp': 'https://beneficios.baldecash.com/cpsp',
  // '/wiener' ya no sale a pidetuprestamo: ahora es la landing de convenio.
  // beneficios.baldecash.com/norbert-wiener redirige hacia acá.
  '/carrion-egresados': 'https://pidetuprestamo.baldecash.com/#/prestamos?source=carrion&fuente=carrion-egresados',
  '/ansimar': 'https://beneficios.baldecash.com/ansimar',
  '/ucv-docentes': 'https://pidetuprestamo.baldecash.com/#/ucv-docentes-y-administrativos',
  '/mrap': 'https://beneficios.baldecash.com/maria-araoz',
  '/untumbes': 'https://beneficios.baldecash.com/untumbes',
  '/unap': 'https://beneficios.baldecash.com/unap',
  '/utec': 'https://beneficios.baldecash.com/utec',
  '/sorteo-senati-cuotas': '/sorteo-senati-becas',
  '/jhalebet': 'https://beneficios.baldecash.com/jhalebet',
  '/iesrp': 'https://beneficios.baldecash.com/instituto-ricardo-palma',
  '/educad': 'https://beneficios.baldecash.com/educad',
  '/ucsur': 'https://beneficios.baldecash.com/ucsur',
  // '/sise' y '/continental' ya no redirigen a beneficios: ahora son landings
  // de convenio y beneficios.baldecash.com redirige hacia acá (bucle).
  // '/senati' ya no redirige a beneficios: ahora es la landing de convenio
  // (antes /convenio-senati-landing). beneficios.baldecash.com/senati
  // redirige hacia acá, así que mantener esta clave causaría un bucle.
  // El redirect del slug viejo vive en RENAMED_LANDING_SLUGS (abajo), para
  // cubrir también las subrutas: /catalogo, /producto/..., /solicitar/...
  // '/carrion' ya no redirige a beneficios: ahora es la landing de convenio
  // y beneficios.baldecash.com/carrion redirige hacia acá (bucle).
  '/maria-araoz': 'https://beneficios.baldecash.com/maria-araoz',
  '/lasartes': 'https://beneficios.baldecash.com/lasartes-lima',
  '/ucv-losolivos': 'https://beneficios.baldecash.com/ucv-losolivos',
  '/uncp': 'https://beneficios.baldecash.com/uncp',
  // '/upn' ya no redirige a beneficios: ahora es la landing de convenio.
  // '/ucv' ya no redirige a beneficios: ahora es la landing de convenio
  // (antes /convenio-ucv-landing). Ver RENAMED_LANDING_SLUGS.
  '/bachillerupn': 'https://pidetuprestamo.baldecash.com/#/titulos-upn',
  '/promoestudiantes': 'https://pidetuprestamo.baldecash.com/#/prestamos?fuente=marcoloretdemola',
  '/baldecash-que-oferton': '/baldecash-oferton',
  '/encerrona': 'https://pidetuprestamo.baldecash.com/#/campaign-107',
  '/promo': 'https://pidetuprestamo.baldecash.com/#/prestamos?fuente=jorgeek',
  '/terminos-y-condiciones-grupoa': '/terminos-y-condiciones-9466',
  '/que-oferton/9014': '/que-oferton/que-oferton-9014',
  '/que-oferton/que-oferton-9014': '/que-oferton-9014',
  '/baldecash-oferton': '/baldecash-oferton-9842',
  '/terminos-y-condiciones-grupoc': '/terminos-y-condiciones-7617',
  '/terminos-y-condiciones-pv1': '/terminos-y-condiciones-grupoa',
  '/terminos-y-condiciones-pv3': '/terminos-y-condiciones-grupoc',
  '/que-oferton/9842': '/que-oferton/que-oferton-9841',
  '/pasalavoz': '/pasa-la-voz-9466',
  '/terminos-y-condiciones-grupob': '/terminos-y-condiciones-7321',
  '/zonaestudiantes': 'https://zonaclientes.baldecash.com/',
};

/**
 * Landings que cambiaron de slug. Se redirige el slug viejo al nuevo
 * conservando el resto del path, para que los enlaces publicados hacia
 * subrutas (/catalogo, /producto/..., /solicitar/...) no se pierdan.
 *
 * Clave: slug antiguo. Valor: slug nuevo.
 */
const RENAMED_LANDING_SLUGS: Record<string, string> = {
  'convenio-senati-landing': 'senati',
  'convenio-ucv-landing': 'ucv',
};

/**
 * Rutas que NO son landings y por lo tanto no se reescriben a /prototipos/0.6.
 * Se usa tanto en el rewrite normal como en el de la franja de referido: sin
 * compartirla, un `?promotor=` sobre /seguros mandaría esa página al catch-all
 * de landings y devolvería 404.
 */
function esRutaInterna(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    // pathname.startsWith('/monitoring') || // tunnel Sentry desactivado
    pathname.startsWith('/prototipos') ||
    pathname.startsWith('/sentry-example-page') ||
    pathname.startsWith('/seguros') ||
    pathname.startsWith('/multiasistencia') ||
    // Estación de inspección: vive en la raíz, NO bajo /prototipos/0.6. Sin
    // esta línea el rewrite la manda al catch-all [[...slug]] de landings y
    // toda la vinculación por QR devuelve 404 en produccion.
    pathname.startsWith('/inspeccion') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico'
  );
}

/**
 * Segmento interno de la landing con franja de referido.
 * Ver `app/prototipos/0.6/referido/[slug]/page.tsx` para el porqué de la ruta
 * gemela: mantiene estática la landing normal y deja el render por request sólo
 * para las visitas que llegan por un link de activación.
 */
const REFERIDO_SEGMENT = 'referido';

/**
 * Slug de la landing si el path es la RAÍZ de una landing; `null` si no.
 *
 * Sólo la raíz: `/upn` sí, `/upn/catalogo` no. La franja se pinta en la página
 * a la que apunta el link del flyer, no en todo el recorrido posterior.
 * `trailingSlash: true` hace que los paths lleguen como `/upn/`, de ahí la
 * normalización.
 */
function landingRootSlug(pathname: string, basePath: string): string | null {
  let resto = pathname;
  if (basePath) {
    if (resto !== basePath && !resto.startsWith(`${basePath}/`)) return null;
    resto = resto.slice(basePath.length);
  }
  resto = resto.replace(/\/+$/, '');
  if (resto === '') return 'home';
  const segmentos = resto.split('/').filter(Boolean);
  if (segmentos.length !== 1) return null;
  // `/referido` como landing chocaría con el segmento interno; se deja pasar por
  // la ruta normal.
  return segmentos[0] === REFERIDO_SEGMENT ? null : segmentos[0];
}

export function middleware(request: NextRequest) {
  // Maintenance mode: redirect everything to Webflow
  if (process.env.MAINTENANCE_MODE === 'true') {
    return NextResponse.redirect(MAINTENANCE_REDIRECT_URL, 302);
  }

  const { pathname } = request.nextUrl;

  // Legacy 301 redirects (migrados de Webflow) — se evalúan primero
  const normalizedPath = pathname.endsWith('/') && pathname !== '/'
    ? pathname.slice(0, -1)
    : pathname;
  const redirectDest = LEGACY_REDIRECTS[normalizedPath];
  if (redirectDest) {
    if (redirectDest.startsWith('http')) {
      return NextResponse.redirect(redirectDest, 301);
    }
    const url = request.nextUrl.clone();
    url.pathname = redirectDest;
    return NextResponse.redirect(url, 301);
  }

  // Landings renombradas: redirige el slug viejo al nuevo conservando el
  // resto del path (/catalogo, /producto/..., etc.) y el querystring.
  const [, firstSegment, ...restSegments] = normalizedPath.split('/');
  const renamedTo = RENAMED_LANDING_SLUGS[firstSegment];
  if (renamedTo) {
    const url = request.nextUrl.clone();
    url.pathname = ['', renamedTo, ...restSegments].join('/');
    return NextResponse.redirect(url, 301);
  }

  // Link de activación: la landing se sirve desde la ruta gemela dinámica, que
  // resuelve la promotora server-side y pinta la franja ya en el HTML. El resto
  // del tráfico ni se entera y sigue saliendo estático del CDN.
  //
  // Va ANTES del rewrite normal en los dos modos (producción y `basePath` de
  // desarrollo) para que la franja se pueda probar en local sin desplegar.
  // `esRutaInterna` sólo aplica en producción: en desarrollo TODO cuelga de
  // /prototipos/0.6, así que ahí el filtro lo hace `landingRootSlug`, que exige
  // exactamente un segmento después del basePath.
  //
  // Dispara con `promotor` O con `ref`. Son los dos parámetros con los que un
  // link de activación puede identificar a quien refirió, y no son intercambiables:
  // `promotor` es el `Promoter.code` de ws2 y sólo viaja cuando esa promotora tiene
  // su correspondencia cargada allá —hoy, la minoría—, mientras que `ref` lo estampa
  // siempre `/r/{codigo}` del hub. Mirando sólo `promotor`, el tráfico de un flyer
  // salía estático del CDN y la franja no se pintaba nunca.
  const puedeLlevarFranja = isProduction ? !esRutaInterna(pathname) : true;
  const traeReferidor =
    request.nextUrl.searchParams.has('promotor') || request.nextUrl.searchParams.has('ref');
  if (traeReferidor && puedeLlevarFranja) {
    const slug = landingRootSlug(pathname, isProduction ? '' : APP_BASE_PATH);
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/prototipos/0.6/${REFERIDO_SEGMENT}/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // Production mode: rewrite clean URLs to internal paths
  if (isProduction) {
    // Root → home landing
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/prototipos/0.6/home';
      return NextResponse.rewrite(url);
    }

    // Skip internal Next.js paths and API routes
    if (esRutaInterna(pathname)) {
      return NextResponse.next();
    }

    // Rewrite all other paths to /prototipos/0.6/{path}
    const url = request.nextUrl.clone();
    url.pathname = `/prototipos/0.6${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
};
