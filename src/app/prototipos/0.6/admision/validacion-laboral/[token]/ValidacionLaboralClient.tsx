'use client';

import { useState, useEffect } from 'react';
import { AdmisionLayout } from '../../_components/AdmisionLayout';
import { VideoFlow } from '../../_components/VideoFlow';
import { LinkLoading, LinkStatus } from '../../_components/LinkScreens';
import { VIDEO_DONE_TITLE, VIDEO_DONE_MESSAGE } from '../../_components/VideoConfirm';
import { validateLink } from '../../_lib/api/links';
import { admissionEvents } from '../../_lib/events';

type PageState =
  | { status: 'loading' }
  | { status: 'invalid'; reason?: string }
  | { status: 'valid'; token: string; documentTypeCodes: string[]; applicantName?: string };

export function ValidacionLaboralClient({ token }: { token: string }) {
  const [page, setPage] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    if (!token) {
      setPage({ status: 'invalid', reason: undefined });
      return;
    }

    admissionEvents(token).linkOpen(); // mejora #10

    let cancelled = false;

    (async () => {
      const linkResult = await validateLink(token);
      if (cancelled) return;

      if (!linkResult.ok) {
        setPage({ status: 'invalid', reason: undefined });
        return;
      }

      const data = linkResult.data;
      if (!data.valid || data.purpose !== 'video_validation') {
        const reason = data.valid === false ? data.reason : undefined;
        setPage({ status: 'invalid', reason });
        return;
      }

      const documentTypeCodes = data.context?.document_type_codes ?? [];
      const applicantName = data.context?.applicant_name;

      if (!cancelled) {
        setPage({ status: 'valid', token, documentTypeCodes, applicantName });
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
          consumedTitle={VIDEO_DONE_TITLE}
          consumedMessage={VIDEO_DONE_MESSAGE}
          consumedWhatsapp
        />
      )}

      {page.status === 'valid' && (
        <VideoFlow
          token={page.token}
          documentTypeCodes={page.documentTypeCodes}
          applicantName={page.applicantName}
        />
      )}
    </AdmisionLayout>
  );
}
