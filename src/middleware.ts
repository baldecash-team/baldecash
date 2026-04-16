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
  '/zegel': 'https://beneficios.baldecash.com/zegel',
  '/idat': 'https://beneficios.baldecash.com/idat',
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
  '/uss': 'https://beneficios.baldecash.com/uss',
  '/cpsp': 'https://beneficios.baldecash.com/cpsp',
  '/wiener': 'https://pidetuprestamo.baldecash.com/#/norbertwiener?fuente=wiener-verano',
  '/carrion-egresados': 'https://pidetuprestamo.baldecash.com/#/prestamos?source=carrion&fuente=carrion-egresados',
  '/ansimar': 'https://beneficios.baldecash.com/ansimar',
  '/ucv-docentes': 'https://pidetuprestamo.baldecash.com/#/ucv-docentes-y-administrativos',
  '/mrap': 'https://beneficios.baldecash.com/maria-araoz',
  '/untumbes': 'https://beneficios.baldecash.com/untumbes',
  '/unap': 'https://beneficios.baldecash.com/unap',
  '/utec': 'https://beneficios.baldecash.com/utec',
  '/cibertec': 'https://beneficios.baldecash.com/cibertec',
  '/sorteo-senati-cuotas': '/sorteo-senati-becas',
  '/jhalebet': 'https://beneficios.baldecash.com/jhalebet',
  '/iesrp': 'https://beneficios.baldecash.com/instituto-ricardo-palma',
  '/educad': 'https://beneficios.baldecash.com/educad',
  '/ucsur': 'https://beneficios.baldecash.com/ucsur',
  '/sise': 'https://beneficios.baldecash.com/sise',
  '/continental': 'https://beneficios.baldecash.com/continental',
  '/senati': 'https://beneficios.baldecash.com/senati',
  '/carrion': 'https://beneficios.baldecash.com/carrion',
  '/maria-araoz': 'https://beneficios.baldecash.com/maria-araoz',
  '/lasartes': 'https://beneficios.baldecash.com/lasartes-lima',
  '/ucv-losolivos': 'https://beneficios.baldecash.com/ucv-losolivos',
  '/uncp': 'https://beneficios.baldecash.com/uncp',
  '/upn': 'https://beneficios.baldecash.com/upn',
  '/ucv': 'https://beneficios.baldecash.com/ucv',
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
