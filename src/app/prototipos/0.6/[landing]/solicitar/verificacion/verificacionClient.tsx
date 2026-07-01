'use client';

/**
 * Verificación de correo (OTP inline) — ruta dedicada `…/solicitar/verificacion`.
 *
 * Se llega aquí tras el submit cuando la landing tiene `otp_verification`
 * habilitado. Reusa `OtpScreen` (mismo UI que el link) en modo inline: auto-envía
 * el código usando el DNI capturado del formulario y aterriza directo en el campo
 * OTP. Al confirmar (o si el correo ya estaba verificado) navega al resumen
 * `…/solicitar/confirmacion`.
 *
 * Persistencia: `application_id` y `code` viajan por la URL; el DNI (PII) viaja
 * por sessionStorage (handoff). Un refresh vuelve a esta pantalla (no pierde el
 * paso, no salta al resumen) y re-consulta el estado real en el backend.
 */

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { CubeGridSpinner } from '@/app/prototipos/_shared';
import { routes } from '@/app/prototipos/0.6/utils/routes';
import { OtpScreen } from '@/app/prototipos/0.6/admision/_components/OtpScreen';
import { getEmailStatus } from '@/app/prototipos/0.6/admision/_lib/api/verification';
import {
  readOtpHandoff,
  markOtpVerified,
} from '../utils/otpHandoff';

function VerificacionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const landing = (params.landing as string) || 'home';

  const appIdParam = searchParams.get('application_id');
  const applicationId = appIdParam ? parseInt(appIdParam, 10) : NaN;
  const codeParam = searchParams.get('code') || undefined;

  // Handoff local (DNI + code) escrito por el submit. Sobrevive un refresh.
  const handoff = typeof window !== 'undefined' ? readOtpHandoff(landing) : null;
  const dni = handoff?.dni;
  const code = codeParam ?? handoff?.code;

  // 'checking' → consulta estado; 'otp' → muestra OtpScreen; 'redirecting' → navega.
  const [phase, setPhase] = useState<'checking' | 'otp' | 'redirecting'>('checking');

  const goToConfirmacion = useCallback(() => {
    if (Number.isFinite(applicationId)) markOtpVerified(landing, applicationId);
    router.replace(routes.solicitarConfirmacion(landing, code));
  }, [applicationId, landing, code, router]);

  // Sin application_id no podemos verificar: volver al inicio del flujo.
  useEffect(() => {
    if (!Number.isFinite(applicationId)) {
      router.replace(routes.solicitar(landing));
    }
  }, [applicationId, landing, router]);

  // Chequeo de estado autoritativo al montar (idempotencia con `already_verified`).
  // Si ya está verificado (por este flujo o por el link del workflow) → resumen.
  useEffect(() => {
    if (!Number.isFinite(applicationId)) return;
    let cancelled = false;

    (async () => {
      // Si el handoff ya quedó marcado como verificado, saltar directo.
      if (handoff?.verified) {
        if (!cancelled) {
          setPhase('redirecting');
          goToConfirmacion();
        }
        return;
      }

      // Solo podemos consultar el estado si tenemos el DNI (ownership).
      if (dni) {
        try {
          const st = await getEmailStatus(applicationId, dni);
          if (!cancelled && st.ok && st.data.verified) {
            setPhase('redirecting');
            goToConfirmacion();
            return;
          }
        } catch {
          // ignorar — mostramos el OTP igualmente
        }
      }

      if (!cancelled) setPhase('otp');
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  if (phase !== 'otp') {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 overflow-y-auto">
      <OtpScreen
        applicationId={applicationId}
        documentNumber={dni}
        onConfirmed={goToConfirmacion}
      />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <CubeGridSpinner />
    </div>
  );
}

export default function VerificacionClient() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerificacionContent />
    </Suspense>
  );
}
