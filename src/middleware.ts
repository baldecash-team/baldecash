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
  // BAL-4152 (26-sep): ningun redirect apunta a beneficios ni a pidetuprestamo,
  // salvo Bachiller UPN (/tituloupn, /titulosupn, /bachillerupn), que sigue alla.
  '/terminos-y-condiciones': '/home/legal/terminos-y-condiciones',
  '/politica-de-privacidad': '/home/legal/politica-de-privacidad',
  '/politica-de-privacidad-baldecash': '/home/legal/politica-de-privacidad',
  '/libro-reclamaciones': '/home/legal/libro-reclamaciones',
  '/isat': '/home',
  '/colegios': 'https://baldecash-colegios-financiamientos.lovable.app/',
  // '/coar' ya no redirige a la landing de Lovable: ahora es la landing de
  // convenio (BAL-4133, 25-sep), con /coar-docente para docentes.
  '/terminos-condiciones-baldecash': 'https://baldecash-legal-hub.lovable.app/',
  '/terminos-y-condiciones-baldecash': 'https://baldecash-legal-hub.lovable.app/',
  '/ucal-cachimbo': '/ucal',
  // '/icpna' ya no redirige a beneficios: ahora es la landing de convenio
  // (BAL-4133, 25-sep). Si beneficios.baldecash.com/icpna pasa a redirigir
  // hacia aca, volver a agregar esta clave causaria un bucle.
  // '/carloscueto' ya no redirige: es la landing de convenio del Instituto
  // Carlos Cueto Fernandini (BAL-4133, 25-sep). Si beneficios.baldecash.com/carloscueto
  // pasa a redirigir hacia aca, volver a agregar esta clave causaria un bucle.
  // '/innova' ya no redirige a beneficios: ahora es la landing de convenio
  // (BAL-4133, 25-sep). Si beneficios.baldecash.com/innova pasa a redirigir
  // hacia aca, volver a agregar esta clave causaria un bucle.
  // '/corrientealterna' ya no redirige a beneficios: ahora es la landing de
  // convenio (BAL-4133, 25-sep). Si beneficios.baldecash.com/corrientealterna
  // pasa a redirigir hacia aca, volver a agregar esta clave causaria un bucle.
  '/iurusayhua': '/home',
  '/terminos-condiciones-sorteo-mayo-baldecash': 'https://drive.google.com/file/d/1IdE3FIG0y7iwL6sxYNGnookGZIMuaVtB/view',
  '/usjb': '/upsjb',
  '/colegiatura-cpsp': '/cpsp',
  '/matriculaupn': '/home',
  // '/undac' ya no redirige a beneficios: ahora es la landing de convenio
  // (landing 402, publicada el 25-sep). Si beneficios.baldecash.com/undac
  // pasa a redirigir hacia acá, volver a agregar esta clave causaría un bucle.
  '/cachimbos': '/ucv',
  // '/icontinental' ya no redirige a beneficios: ahora es la landing de
  // convenio (landing 399, publicada el 24-sep). Si
  // beneficios.baldecash.com/icontinental pasa a redirigir hacia acá, volver
  // a agregar esta clave causaría un bucle (ERR_TOO_MANY_REDIRECTS).
  '/tituloupn': 'https://pidetuprestamo.baldecash.com/#/titulosupn',
  '/titulosupn': 'https://pidetuprestamo.baldecash.com/#/titulosupn',
  '/iestp': '/home',
  // '/uss' ya no redirige a beneficios: ahora es la landing de convenio.
  // beneficios.baldecash.com/uss redirige hacia acá, así que mantener esta
  // clave causaba un bucle infinito (ERR_TOO_MANY_REDIRECTS).
  // '/cpsp' ya no redirige a beneficios: ahora es la landing de convenio
  // (BAL-4133, 25-sep). Si beneficios.baldecash.com/cpsp pasa a redirigir
  // hacia aca, volver a agregar esta clave causaria un bucle.
  // '/wiener' ya no sale a pidetuprestamo: ahora es la landing de convenio.
  // beneficios.baldecash.com/norbert-wiener redirige hacia acá.
  '/carrion-egresados': '/carrion',
  '/ansimar': '/home',
  '/ucv-docentes': '/ucv-docente',
  '/mrap': '/home',
  // '/untumbes' ya no redirige a beneficios: ahora es la landing de convenio
  // (BAL-4136, publicada el 25-sep). Si beneficios.baldecash.com/untumbes pasa a
  // redirigir hacia aca, volver a agregar esta clave causaria un bucle.
  // '/unap' ya no redirige a beneficios: ahora es la landing de convenio
  // (landing 359, publicada el 21-sep). Si beneficios.baldecash.com/unap
  // pasa a redirigir hacia acá, volver a agregar esta clave causaría un
  // bucle (ERR_TOO_MANY_REDIRECTS).
  // '/utec' ya no redirige a beneficios: ahora es la landing de convenio
  // (landing 143) con su Express (404). Si beneficios.baldecash.com/utec
  // pasa a redirigir hacia acá, volver a agregar esta clave causaría un bucle.
  '/sorteo-senati-cuotas': '/sorteo-senati-becas',
  // '/jhalebet' ya no redirige a beneficios: ahora es la landing de convenio
  // (BAL-4136, publicada el 25-sep). Si beneficios.baldecash.com/jhalebet pasa a
  // redirigir hacia aca, volver a agregar esta clave causaria un bucle.
  '/iesrp': '/isrp',
  '/educad': '/home',
  // '/ucsur' ya no redirige a beneficios: ahora es la landing de convenio.
  // Si beneficios.baldecash.com/ucsur pasa a redirigir hacia acá, volver a
  // agregar esta clave causaría un bucle.
  // '/sise' y '/continental' ya no redirigen a beneficios: ahora son landings
  // de convenio y beneficios.baldecash.com redirige hacia acá (bucle).
  // '/senati' ya no redirige a beneficios: ahora es la landing de convenio
  // (antes /convenio-senati-landing). beneficios.baldecash.com/senati
  // redirige hacia acá, así que mantener esta clave causaría un bucle.
  // El redirect del slug viejo vive en RENAMED_LANDING_SLUGS (abajo), para
  // cubrir también las subrutas: /catalogo, /producto/..., /solicitar/...
  // '/carrion' ya no redirige a beneficios: ahora es la landing de convenio
  // y beneficios.baldecash.com/carrion redirige hacia acá (bucle).
  '/maria-araoz': '/home',
  '/lasartes': '/home',
  '/ucv-losolivos': '/ucv',
  '/uncp': '/home',
  // '/upn' ya no redirige a beneficios: ahora es la landing de convenio.
  // '/ucv' ya no redirige a beneficios: ahora es la landing de convenio
  // (antes /convenio-ucv-landing). Ver RENAMED_LANDING_SLUGS.
  '/bachillerupn': 'https://pidetuprestamo.baldecash.com/#/titulosupn',
  '/promoestudiantes': '/home',
  '/baldecash-que-oferton': '/baldecash-oferton',
  '/encerrona': '/home',
  '/promo': '/home',
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
 * URLs cortas de campaña: lo que se imprime en un banner o se dicta por
 * teléfono, apuntando al link de difusión que mide.
 *
 * Clave: pathname sin trailing slash. Valor: link corto de ws2 (`/r/{code}`),
 * que estampa las UTMs, cuenta el clic y recién ahí manda a la landing.
 *
 * Separado de LEGACY_REDIRECTS por el código de estado: estos salen **302**.
 * El destino de una campaña se reapunta desde ws2 sin reimprimir el banner
 * —esa es la razón de ser del link corto— y un 301 lo cachea el navegador de
 * por vida, así que a quien ya lo abrió le seguiría yendo al destino viejo.
 * Los de Webflow sí son 301 porque son mudanzas definitivas.
 *
 * El alias NO puede llamarse igual que una landing: acá se resuelve antes que
 * el rewrite y dejaría esa landing inalcanzable. Al agregar una clave,
 * verificarla contra la tabla `landing` de ws2.
 */
const ALIAS_CAMPANA: Record<string, string> = {
  '/idat30': 'https://api.baldecash.com/r/idat30',
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
    // Verificación de una constancia: vive en la raíz, NO bajo /prototipos/0.6,
    // porque es la URL que va impresa en el QR del documento. Sin esta línea el
    // rewrite la manda al catch-all [[...slug]] de landings y CUALQUIER QR
    // emitido devuelve 404 en producción. Segunda vez que pasa lo mismo: ver
    // /inspeccion, tres líneas arriba.
    pathname.startsWith('/verificar') ||
    esArchivo(pathname)
  );
}

/**
 * Un archivo servido desde `public/`, no una landing.
 *
 * Va por la forma del camino y no por una lista de carpetas. El slug de una
 * landing NUNCA lleva un punto —comprobado contra la tabla: cero de las que
 * existen lo tiene—, así que un último segmento con extensión no puede ser
 * una landing, y la regla es cierta por construcción en vez de por
 * mantenimiento.
 *
 * Reemplaza a las tres excepciones sueltas que había —`/robots.txt`,
 * `/sitemap.xml`, `/favicon.ico`—, que son casos particulares de esto mismo.
 * La lista las nombraba una por una y ese es justo el problema: la guía de
 * titulación en PDF se publicó bajo `/docs`, nadie agregó la línea, y el
 * enlace devolvía la página de error en producción.
 */
function esArchivo(pathname: string): boolean {
  const ultimoSegmento = pathname.slice(pathname.lastIndexOf('/') + 1);
  return ultimoSegmento.includes('.');
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

  // URL corta de campaña: 302 al link de difusión, que es el que mide.
  // Conserva el querystring entrante (un `fbclid`, un `utm_` que ya venga de
  // afuera) para que `/r/{code}` lo tenga a la vista al armar la URL final.
  const aliasDest = ALIAS_CAMPANA[normalizedPath];
  if (aliasDest) {
    const destino = new URL(aliasDest);
    request.nextUrl.searchParams.forEach((valor, clave) => {
      destino.searchParams.set(clave, valor);
    });
    return NextResponse.redirect(destino, 302);
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
