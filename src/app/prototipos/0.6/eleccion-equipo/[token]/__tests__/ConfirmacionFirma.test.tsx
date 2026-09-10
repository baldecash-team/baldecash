/**
 * El botón para firmar, en la pantalla de confirmación.
 *
 * Existe porque el WhatsApp de aprobación —el que llevaba el enlace de firma—
 * se apaga para reacondicionados: sin este botón, después de elegir la unidad
 * no habría ningún camino a la firma.
 *
 * Lo que se fija acá es lo que NO puede cambiar sin romper eso: que abra en
 * otra pestaña, que avise el clic, y que cuando no hay enlace la pantalla no
 * prometa un WhatsApp que ya no se manda.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Confirmacion } from '../Confirmacion';
import { getLinkDeFirma } from '../../../services/eleccionEquipoApi';

jest.mock('../Chrome', () => ({ BotonWhatsApp: () => <div /> }));
// El export es de solo lectura (ES module): `spyOn` no puede reemplazarlo.
jest.mock('../../../services/eleccionEquipoApi', () => ({
  getLinkDeFirma: jest.fn(),
}));

const mockLink = getLinkDeFirma as jest.MockedFunction<typeof getLinkDeFirma>;

const UNIDAD = {
  unit_id: 7, display_number: 2, grado: 'A', grado_label: 'Como nuevo',
  photos: [], video_url: null, defectos: [],
} as never;
const PRODUCTO = { name: 'MacBook Air M1' };
const FIRMA = 'https://sign.keynua.com/index.html?token=abc123';

function pintar(onIrAFirmar?: () => void) {
  return render(
    <Confirmacion
      unidad={UNIDAD} producto={PRODUCTO} cuota={189}
      token="tok-de-prueba" onIrAFirmar={onIrAFirmar}
    />,
  );
}

afterEach(() => jest.clearAllMocks());

it('muestra el botón y lo abre en otra pestaña', async () => {
  mockLink.mockResolvedValue(FIRMA);
  pintar();

  const boton = await screen.findByRole('link', { name: /firmar mi contrato/i });
  expect(boton).toHaveAttribute('href', FIRMA);
  // Otra pestaña: la firma es un proceso largo en Keynua y navegar en la misma
  // destruiría la única pantalla donde consta qué unidad quedó reservada.
  expect(boton).toHaveAttribute('target', '_blank');
  // Sin `noopener` la pestaña nueva puede tocar esta por `window.opener`.
  expect(boton.getAttribute('rel')).toContain('noopener');
});

it('avisa el clic para poder medirlo', async () => {
  mockLink.mockResolvedValue(FIRMA);
  const onIrAFirmar = jest.fn();
  pintar(onIrAFirmar);

  await userEvent.click(await screen.findByRole('link', { name: /firmar mi contrato/i }));
  expect(onIrAFirmar).toHaveBeenCalledTimes(1);
});

it('sin enlace no hay botón, y el paso 1 no promete un WhatsApp', async () => {
  mockLink.mockResolvedValue(null);
  pintar();

  await waitFor(() => expect(mockLink).toHaveBeenCalled());
  expect(screen.queryByRole('link', { name: /firmar mi contrato/i })).toBeNull();
  expect(screen.getByText(/Estamos preparando tu/i)).toBeInTheDocument();
  // El texto viejo prometía el envío por WhatsApp. Con ese envío apagado sería
  // mandar a esperar algo que no va a llegar.
  expect(screen.queryByText(/a tu WhatsApp/i)).toBeNull();
});

it('con enlace, el paso 1 manda al botón en vez de a esperar', async () => {
  mockLink.mockResolvedValue(FIRMA);
  pintar();

  expect(await screen.findByText(/desde el botón de abajo/i)).toBeInTheDocument();
});
