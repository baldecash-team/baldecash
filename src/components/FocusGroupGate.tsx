'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Lock } from 'lucide-react';

const VALID_CODES = (process.env.NEXT_PUBLIC_FG_CODES || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);

const SESSION_KEY = 'fg_access';

function GateInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (VALID_CODES.length === 0) {
      setAuthorized(true);
      return;
    }

    // 1. Check URL for fg_code (sent by gateway)
    const urlCode = searchParams.get('fg_code');
    if (urlCode && VALID_CODES.includes(urlCode)) {
      sessionStorage.setItem(SESSION_KEY, urlCode);
      // Clean all fg_ params from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('fg_code');
      url.searchParams.delete('fg_token');
      url.searchParams.delete('fg_ts');
      window.history.replaceState({}, '', url.toString());
      setAuthorized(true);
      return;
    }

    // 2. Check sessionStorage
    const storedCode = sessionStorage.getItem(SESSION_KEY);
    if (storedCode && VALID_CODES.includes(storedCode)) {
      setAuthorized(true);
      return;
    }

    // 3. No valid code
    setAuthorized(false);
  }, [searchParams]);

  if (authorized === null) return null;
  if (!authorized) return <RestrictedPage />;
  return <>{children}</>;
}

function RestrictedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a1a',
        color: '#ffffff',
        fontFamily: 'var(--font-asap), sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <Lock size={48} color="#4654CD" strokeWidth={1.5} style={{ marginBottom: '32px' }} />
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
        Acceso restringido
      </h1>
      <p style={{ fontSize: '16px', color: '#9ca3af', maxWidth: '400px', margin: 0 }}>
        Necesitas un link de invitación para acceder a este sitio.
      </p>
    </div>
  );
}

export function FocusGroupGate({ children }: { children: React.ReactNode }) {
  if (VALID_CODES.length === 0) return <>{children}</>;

  return (
    <Suspense fallback={null}>
      <GateInner>{children}</GateInner>
    </Suspense>
  );
}
