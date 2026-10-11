import { render, screen } from '@testing-library/react';
import { CouponCampaignBanner } from '../CouponCampaignBanner';

/**
 * El banner del catálogo anuncia «¡Cupón aplicado!» apenas el link trae un
 * cupón válido, antes de conocer el documento. Con un cupón de lista cerrada
 * tiene que decir que es solo para invitados.
 */

const CUPON = {
  code: 'INVITADOS',
  discount: 10,
  couponType: 'percent_quotas' as const,
  quotasAffected: 1,
  label: '10% de descuento en 1 cuotas',
  lockedFromUrl: true,
};

const AVISO = 'Solo para documentos invitados. Lo confirmaremos cuando ingreses tu documento.';

test('lista cerrada sin confirmar: el banner lo avisa y conserva el alcance', () => {
  render(
    <CouponCampaignBanner
      coupon={{ ...CUPON, restrictedToDocumentList: true, requiresDocument: true }}
    />
  );

  expect(screen.getByText(AVISO)).toBeInTheDocument();
  expect(screen.getByText('primera cuota')).toBeInTheDocument();
});

test('cupón abierto: el banner no agrega nada', () => {
  render(<CouponCampaignBanner coupon={CUPON} />);

  expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
});
