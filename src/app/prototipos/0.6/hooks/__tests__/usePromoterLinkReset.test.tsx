/**
 * El reset por cambio de link de promotora tiene que correr ANTES que los
 * efectos de los hijos de la landing: `ReferralBanner` guarda la franja nueva en
 * su efecto de montaje y `SessionProvider` reutiliza el `session_uuid` guardado
 * en el suyo. Si el reset corriera en un efecto del padre, llegaría después de
 * los dos: borraría la franja recién guardada y la sesión ya habría nacido con
 * el uuid de la visita anterior.
 */
import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { usePromoterLinkReset } from '../usePromoterLinkReset';

const LANDING = 'ucv';
const LINK_KEY = `baldecash-${LANDING}-promotor-link`;
const UUID_KEY = `baldecash-${LANDING}-wizard-session-uuid`;
const FRANJA_KEY = `baldecash-referral-banner-${LANDING}`;

function entrarCon(search: string) {
  window.history.replaceState({}, '', `/${LANDING}/${search}`);
}

/** Simula lo que ve un hijo de la landing en su efecto de montaje. */
function Hijo({ onEffect }: { onEffect: () => void }) {
  useEffect(() => {
    onEffect();
  }, [onEffect]);
  return null;
}

function Landing({ onChildEffect }: { onChildEffect: () => void }) {
  usePromoterLinkReset(LANDING);
  return <Hijo onEffect={onChildEffect} />;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  entrarCon('');
});

describe('usePromoterLinkReset', () => {
  it('limpia la visita anterior antes de que corran los efectos de los hijos', () => {
    // Visita anterior: la promotora A dejó su link, una sesión y su franja.
    localStorage.setItem(LINK_KEY, 'ekscah|||');
    localStorage.setItem(UUID_KEY, 'uuid-de-A');
    sessionStorage.setItem(FRANJA_KEY, JSON.stringify({ firstName: 'Ana', reason: 'ref' }));

    entrarCon('?ref=mnpqrs');

    let uuidVistoPorElHijo: string | null = 'no-corrio';
    let franjaVistaPorElHijo: string | null = 'no-corrio';
    render(
      <Landing
        onChildEffect={() => {
          uuidVistoPorElHijo = localStorage.getItem(UUID_KEY);
          franjaVistaPorElHijo = sessionStorage.getItem(FRANJA_KEY);
        }}
      />
    );

    expect(uuidVistoPorElHijo).toBeNull();
    expect(franjaVistaPorElHijo).toBeNull();
    expect(localStorage.getItem(LINK_KEY)).toBe('mnpqrs|||');
  });

  it('con el mismo link no toca la sesión que ya existía', () => {
    localStorage.setItem(LINK_KEY, 'ekscah|||');
    localStorage.setItem(UUID_KEY, 'uuid-de-A');
    entrarCon('?ref=ekscah');

    render(<Landing onChildEffect={() => {}} />);

    expect(localStorage.getItem(UUID_KEY)).toBe('uuid-de-A');
  });

  it('en una visita orgánica no hace nada', () => {
    localStorage.setItem(UUID_KEY, 'uuid-previo');
    entrarCon('?utm_source=meta');

    render(<Landing onChildEffect={() => {}} />);

    expect(localStorage.getItem(UUID_KEY)).toBe('uuid-previo');
    expect(localStorage.getItem(LINK_KEY)).toBeNull();
  });
});
