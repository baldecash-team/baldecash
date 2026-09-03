/**
 * Reset de la sesión al abrir el link de OTRA promotora.
 *
 * Un mismo celular pasa por varias manos en un stand: la promotora A abre su
 * link, un alumno deja una solicitud, y al rato la promotora B abre el suyo en
 * el mismo equipo. Sin esto, B veía la solicitud de A —con su franja encima— y
 * el siguiente alumno heredaba el `ref`, los UTMs y la sesión de tracking de A.
 */
import { resetLandingSessionIfPromoterLinkChanged } from '../landingSession';

const LANDING = 'ucv';
const SIBLING = 'ucv-express';

const REF_A = 'ekscah';
const REF_B = 'mnpqrs';

const linkConRef = (ref: string) =>
  '?utm_campaign=activacion_ucv_2026_09&utm_source=qr&utm_medium=offline&utm_content=qr' +
  `&utm_term=punto_lima-norte__promo_1vlqax8__act_1odsq6r&ref=${ref}`;

const keys = (slug: string) => ({
  wizardForm: `baldecash-wizard-${slug}-data`,
  sessionUuid: `baldecash-${slug}-wizard-session-uuid`,
  dni: `baldecash-dni-${slug}`,
  promotorRef: `baldecash-${slug}-promotor-ref`,
  pendingAlk: `baldecash-${slug}-pending-alk`,
});

const UTM_STORE = 'baldecash-utm';
const franjaKey = (slug: string) => `baldecash-referral-banner-${slug}`;

/** Lo que deja una visita completa que entró por el link de la promotora A. */
function visitaPrevia(slug: string, ref = REF_A) {
  const k = keys(slug);
  localStorage.setItem(k.wizardForm, '{"document_number":{"value":"73941627"}}');
  localStorage.setItem(k.sessionUuid, 'uuid-de-la-visita-anterior');
  localStorage.setItem(k.dni, '73941627');
  localStorage.setItem(k.promotorRef, ref);
  localStorage.setItem(k.pendingAlk, 'alk-anterior');
  sessionStorage.setItem(UTM_STORE, JSON.stringify({ utm_source: 'qr', promotor: 'promoA' }));
  sessionStorage.setItem(franjaKey(slug), JSON.stringify({ firstName: 'Ana', reason: 'ref' }));
}

function sobrevivientes(slug: string): string[] {
  const k = keys(slug);
  return [
    ...Object.entries(k).filter(([, key]) => localStorage.getItem(key) !== null),
    ['utmStore', UTM_STORE] as const,
    ['franja', franjaKey(slug)] as const,
  ]
    .filter(([name, key]) =>
      name === 'utmStore' || name === 'franja'
        ? sessionStorage.getItem(key) !== null
        : true
    )
    .map(([name]) => name);
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('resetLandingSessionIfPromoterLinkChanged', () => {
  it('borra toda la visita anterior cuando llega el link de otra promotora', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));
    visitaPrevia(LANDING, REF_A);

    const limpio = resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_B));

    expect(limpio).toBe(true);
    expect(sobrevivientes(LANDING)).toEqual([]);
  });

  it('no toca nada cuando vuelve a abrirse el mismo link', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));
    visitaPrevia(LANDING, REF_A);

    const limpio = resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));

    expect(limpio).toBe(false);
    expect(localStorage.getItem(keys(LANDING).wizardForm)).not.toBeNull();
    expect(localStorage.getItem(keys(LANDING).sessionUuid)).toBe('uuid-de-la-visita-anterior');
  });

  it('acepta el mismo ref escrito en mayúsculas como el mismo link', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));
    visitaPrevia(LANDING, REF_A);

    expect(resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A.toUpperCase()))).toBe(false);
  });

  it('no hace nada en una visita sin identificador de promotora', () => {
    visitaPrevia(LANDING, REF_A);

    const limpio = resetLandingSessionIfPromoterLinkChanged(LANDING, '?utm_source=meta&cupon=UNIV2026');

    expect(limpio).toBe(false);
    expect(localStorage.getItem(keys(LANDING).wizardForm)).not.toBeNull();
  });

  it('limpia los restos de una visita que no entró por ninguna promotora', () => {
    // Hubo una visita orgánica antes: hay formulario y sesión pero ningún link
    // recordado. Un link de promotora arranca de cero igual.
    visitaPrevia(LANDING, REF_A);
    localStorage.removeItem(keys(LANDING).promotorRef);

    const limpio = resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_B));

    expect(limpio).toBe(true);
    expect(sobrevivientes(LANDING)).toEqual([]);
  });

  it('en la primera visita del equipo limpia en vacío y recuerda el link', () => {
    expect(resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A))).toBe(true);
    expect(localStorage.getItem(`baldecash-${LANDING}-promotor-link`)).not.toBeNull();
    expect(resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A))).toBe(false);
  });

  it('distingue promotoras por `promotor=` cuando el link no trae ref', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, '?utm_source=qr&promotor=jperez');
    visitaPrevia(LANDING);

    expect(resetLandingSessionIfPromoterLinkChanged(LANDING, '?utm_source=qr&promotor=mlopez')).toBe(true);
    expect(sobrevivientes(LANDING)).toEqual([]);
  });

  it('distingue promotoras por el token del utm_term cuando sólo viaja eso', () => {
    resetLandingSessionIfPromoterLinkChanged(
      LANDING,
      '?utm_source=qr&utm_term=punto_lima__promo_aaaaaa__act_zzzzzz'
    );
    visitaPrevia(LANDING);

    expect(
      resetLandingSessionIfPromoterLinkChanged(
        LANDING,
        '?utm_source=wsp&utm_term=punto_lima__promo_bbbbbb__act_zzzzzz'
      )
    ).toBe(true);
    expect(sobrevivientes(LANDING)).toEqual([]);
  });

  it('el mismo QR con otra pieza (wsp en vez de qr) sigue siendo el mismo link', () => {
    resetLandingSessionIfPromoterLinkChanged(
      LANDING,
      '?utm_source=qr&utm_content=qr&utm_term=punto_lima__promo_aaaaaa__act_zzzzzz&ref=' + REF_A
    );
    visitaPrevia(LANDING);

    expect(
      resetLandingSessionIfPromoterLinkChanged(
        LANDING,
        '?utm_source=wsp&utm_content=wsp&utm_term=punto_lima__promo_aaaaaa__act_zzzzzz__fly_q1w2e3&ref=' + REF_A
      )
    ).toBe(false);
    expect(localStorage.getItem(keys(LANDING).wizardForm)).not.toBeNull();
  });

  it('no toca la landing hermana cuyo slug contiene a ésta', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));
    visitaPrevia(LANDING, REF_A);
    visitaPrevia(SIBLING, REF_A);

    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_B));

    expect(localStorage.getItem(keys(SIBLING).wizardForm)).not.toBeNull();
    expect(localStorage.getItem(keys(SIBLING).promotorRef)).toBe(REF_A);
  });

  it('recuerda el link nuevo para que la siguiente carga del mismo link no vuelva a limpiar', () => {
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_A));
    visitaPrevia(LANDING, REF_A);
    resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_B));

    // El alumno de B ya empezó su formulario y recarga la página del link.
    localStorage.setItem(keys(LANDING).wizardForm, '{"document_number":{"value":"11111111"}}');

    expect(resetLandingSessionIfPromoterLinkChanged(LANDING, linkConRef(REF_B))).toBe(false);
    expect(localStorage.getItem(keys(LANDING).wizardForm)).not.toBeNull();
  });
});
