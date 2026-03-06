/**
 * Image Proxy API - Descarga imágenes externas evitando CORS
 * Uso: /api/image-proxy?url=https://example.com/image.jpg
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Normalizar URL: quitar doble barra después del dominio
  url = url.replace(/([^:]\/)\/+/g, '$1');

  try {
    console.log('[Image Proxy] Fetching:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.baldecash.com/',
      },
    });
    console.log('[Image Proxy] Response status:', response.status);

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch image: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Image Proxy] Error:', errorMessage, 'URL:', url);
    return NextResponse.json({ error: `Failed to proxy image: ${errorMessage}` }, { status: 500 });
  }
}
