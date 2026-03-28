import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_REDIRECT_URL = process.env.MAINTENANCE_REDIRECT_URL || 'https://baldecash.webflow.io';
const APP_BASE_PATH = process.env.NEXT_PUBLIC_APP_BASE_PATH ?? '/prototipos/0.6';
const isProduction = APP_BASE_PATH === '';

export function middleware(request: NextRequest) {
  // Maintenance mode: redirect everything to Webflow
  if (process.env.MAINTENANCE_MODE === 'true') {
    return NextResponse.redirect(MAINTENANCE_REDIRECT_URL, 302);
  }

  // Production mode: rewrite clean URLs to internal paths
  if (isProduction) {
    const { pathname } = request.nextUrl;

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
      pathname.startsWith('/monitoring') ||
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
