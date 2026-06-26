'use client';

import { useState, useEffect } from 'react';
import { AdmisionLayout } from '../../_components/AdmisionLayout';
import { OtpScreen } from '../../_components/OtpScreen';
import { LinkLoading, LinkStatus } from '../../_components/LinkScreens';
import { validateLink, emailStatusByToken } from '../../_lib/api/links';
import { admissionEvents } from '../../_lib/events';

type PageState =
  | { status: 'loading' }
  | { status: 'invalid'; reason?: string }
  | { status: 'valid'; token: string; initialVerified: boolean };

export function ValidarCorreoClient({ token }: { token: string }) {
  const [page, setPage] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!token) {
        if (!cancelled) setPage({ status: 'invalid', reason: undefined });
        return;
      }

      admissionEvents(token).linkOpen(); // mejora #10

      const linkResult = await validateLink(token);
      if (cancelled) return;

      if (!linkResult.ok) {
        setPage({ status: 'invalid', reason: undefined });
        return;
      }

      const data = linkResult.data;
      if (!data.valid || data.purpose !== 'email_validation') {
        const reason = data.valid === false ? data.reason : undefined;
        setPage({ status: 'invalid', reason });
        return;
      }

      let initialVerified = false;
      try {
        const statusResult = await emailStatusByToken(token);
        if (!cancelled && statusResult.ok) {
          initialVerified = statusResult.data.verified;
        }
      } catch {
        // ignore — default to false
      }

      if (!cancelled) {
        setPage({ status: 'valid', token, initialVerified });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AdmisionLayout>
      {page.status === 'loading' && <LinkLoading />}

      {page.status === 'invalid' && (
        <LinkStatus
          reason={page.reason}
          consumedTitle="¡Correo confirmado!"
          consumedMessage="Ya validaste tu correo, no necesitas hacer nada más."
        />
      )}

      {page.status === 'valid' && (
        <OtpScreen token={page.token} initialVerified={page.initialVerified} />
      )}
    </AdmisionLayout>
  );
}
