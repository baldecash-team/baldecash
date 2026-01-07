/**
 * API Endpoint: POST /api/feedback
 * Recibe feedback de usuarios en mode=clean con screenshot
 *
 * TODO: Conectar a backend real (Supabase, Firebase, etc.)
 * Por ahora solo hace log del feedback recibido
 */

import { NextRequest, NextResponse } from 'next/server';

interface FeedbackPayload {
  screenshot: string;
  feedbackText: string;
  pageUrl: string;
  sectionId: string;
  configSnapshot: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    // Validación básica
    if (!body.screenshot || !body.feedbackText) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // TODO: Enviar a tu API externa o base de datos
    // Ejemplos de integración:
    //
    // Supabase:
    // await supabase.from('feedback').insert({
    //   section_id: body.sectionId,
    //   feedback_text: body.feedbackText,
    //   screenshot_url: await uploadToStorage(body.screenshot),
    //   page_url: body.pageUrl,
    //   config: body.configSnapshot,
    //   created_at: body.timestamp,
    // });
    //
    // Firebase:
    // await addDoc(collection(db, 'feedback'), { ...body });
    //
    // Webhook (Slack, Discord, etc.):
    // await fetch(WEBHOOK_URL, { method: 'POST', body: JSON.stringify(body) });

    // Por ahora, log en consola del servidor
    console.log('═══════════════════════════════════════════');
    console.log('📝 FEEDBACK RECIBIDO');
    console.log('═══════════════════════════════════════════');
    console.log('Sección:', body.sectionId);
    console.log('URL:', body.pageUrl);
    console.log('Texto:', body.feedbackText);
    console.log('Config:', JSON.stringify(body.configSnapshot, null, 2));
    console.log('Timestamp:', body.timestamp);
    console.log('Screenshot size:', Math.round(body.screenshot.length / 1024), 'KB');
    console.log('═══════════════════════════════════════════');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error procesando feedback:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}
