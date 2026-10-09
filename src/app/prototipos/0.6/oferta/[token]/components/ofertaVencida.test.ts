/**
 * La oferta vencida del downgrade cierra la solicitud: su pantalla no promete
 * "reactivarla". El upsell conserva su texto.
 */
import { OfferApiError } from '../../../services/offerApi';
import { casoDelError, copyDeLinkMuerto, OFERTA_VENCIDA_DOWNGRADE, type CopyDeEstado } from './ofertaVencida';

const DE_SIEMPRE: CopyDeEstado = {
  icon: 'clock',
  title: 'Esta oferta venció',
  body: 'El tiempo para elegir tu equipo ya terminó. Escríbenos y con gusto te ayudamos a reactivarla.',
};

describe('pantalla de oferta vencida', () => {
  it('el downgrade vencido dice que la solicitud se cerró, sin "reactivarla"', () => {
    const copy = copyDeLinkMuerto(DE_SIEMPRE, 'expired', 'downgrade');
    expect(copy).toBe(OFERTA_VENCIDA_DOWNGRADE);
    expect(copy.title).toBe('Esta oferta venció');
    expect(copy.body).toBe(
      'El tiempo para elegir tu equipo terminó y tu solicitud se cerró. Si quieres volver a intentarlo, escríbenos.',
    );
    expect(copy.body).not.toMatch(/reactivar/i);
  });

  it('el upsell y el caso desconocido conservan su texto', () => {
    expect(copyDeLinkMuerto(DE_SIEMPRE, 'expired', 'upsell')).toBe(DE_SIEMPRE);
    expect(copyDeLinkMuerto(DE_SIEMPRE, 'expired', 'standard')).toBe(DE_SIEMPRE);
    expect(copyDeLinkMuerto(DE_SIEMPRE, 'expired', null)).toBe(DE_SIEMPRE);
  });

  it('solo cambia el vencido: un link usado o revocado del downgrade queda igual', () => {
    expect(copyDeLinkMuerto(DE_SIEMPRE, 'consumed', 'downgrade')).toBe(DE_SIEMPRE);
    expect(copyDeLinkMuerto(DE_SIEMPRE, 'revoked', 'downgrade')).toBe(DE_SIEMPRE);
  });

  it('lee el caso del detalle del 410', () => {
    const err = new OfferApiError('expired', 'Este enlace expiró.', 410, {
      reason: 'expired',
      offer_case: 'downgrade',
    });
    expect(casoDelError(err)).toBe('downgrade');
    expect(casoDelError(new OfferApiError('expired', 'x', 410))).toBeNull();
    expect(casoDelError(new Error('red'))).toBeNull();
  });
});
