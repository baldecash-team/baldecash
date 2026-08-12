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

  // Production mode: rewrite clean URLs to internal paths
  if (isProduction) {
    // Root → home landing
    if (pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/prototipos/0.6/home';
      return NextResponse.rewrite(url);
    }

    // Skip internal Next.js paths and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      // pathname.startsWith('/monitoring') || // tunnel Sentry desactivado
      pathname.startsWith('/prototipos') ||
      pathname.startsWith('/sentry-example-page') ||
      pathname.startsWith('/seguros') ||
      pathname.startsWith('/multiasistencia') ||
      // Estación de inspección: vive en la raíz, NO bajo /prototipos/0.6. Sin
      // esta línea el rewrite de abajo la manda al catch-all [[...slug]] de
      // landings y toda la vinculación por QR devuelve 404 en produccion.
      pathname.startsWith('/inspeccion') ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      pathname === '/favicon.ico'
    ) {
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
