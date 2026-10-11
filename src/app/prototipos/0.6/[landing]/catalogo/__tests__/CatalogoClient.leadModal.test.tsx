import React from 'react';
import { render, screen, act } from '@testing-library/react';

/**
 * El modal de captura del cupón se monta UNA vez, por encima de las variantes
 * del catálogo. Antes vivía dentro del catálogo estándar (`CatalogoContent`),
 * así que las variantes que lo reemplazan —el catálogo de celular de
 * `copia-home` y el de `zona-gamer`— se quedaban sin modal.
 *
 * Las variantes van simuladas: acá no importa qué dibuja cada una, importa
 * que el modal salga sin depender de cuál se eligió.
 */

let landingActual = 'copia-home';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: landingActual }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => `/${landingActual}/catalogo/`,
}));

// El hook real arranca en `false` y se corrige en un efecto, así que por un
// instante dibuja el catálogo estándar entero (decenas de contextos que acá
// no vienen al caso). Se simula leyendo el ancho al toque.
jest.mock('@/app/prototipos/_shared', () => ({
  __esModule: true,
  ...jest.requireActual('@/app/prototipos/_shared'),
  useIsMobile: () => window.innerWidth < 768,
}));

jest.mock('../copia-home/CopiaHomeMobileCatalog', () => ({
  __esModule: true,
  CopiaHomeMobileCatalog: () => <div data-testid="catalogo-celular-copia-home" />,
}));

jest.mock('../GamerCatalogoClient', () => ({
  __esModule: true,
  GamerCatalogoContent: () => <div data-testid="catalogo-gamer" />,
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  __esModule: true,
  ProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useProduct: () => ({}),
}));

jest.mock('@/app/prototipos/0.6/hooks/usePromoterLinkReset', () => ({
  __esModule: true,
  usePromoterLinkReset: jest.fn(),
}));

const fetchLandingConfig = jest.fn();
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  __esModule: true,
  fetchLandingConfig: (...args: unknown[]) => fetchLandingConfig(...args),
}));

jest.mock('@/app/prototipos/0.6/components/lead-modal/LeadCouponModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="modal-cupon">
      <button type="button" onClick={onClose}>cerrar-mock</button>
    </div>
  ),
}));

import { CatalogoClient } from '../CatalogoClient';

const CONFIG_CON_MODAL = {
  layout: { has_catalog: true },
  features: {},
  lead_modal: { enabled: true, title: '¡Suscríbete y accede a tu cupón!' },
};

const CONFIG_SIN_MODAL = {
  layout: { has_catalog: true },
  features: {},
  lead_modal: { enabled: false },
};

function ponerAncho(px: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: px });
}

/** Monta el catálogo, deja resolver la config y pasa los 3 s de espera. */
async function montarYEsperar() {
  render(<CatalogoClient />);
  // La config llega por una promesa: hay que dejarla resolver antes de
  // adelantar el reloj, o el gate todavía no sabe si el modal está encendido.
  await act(async () => {
    await Promise.resolve();
  });
  act(() => {
    jest.advanceTimersByTime(3000);
  });
}

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  fetchLandingConfig.mockReset();
  fetchLandingConfig.mockResolvedValue(CONFIG_CON_MODAL);
  landingActual = 'copia-home';
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CatalogoClient — el modal del cupón no depende de la variante de catálogo', () => {
  it('el catálogo de celular de copia-home monta el modal', async () => {
    ponerAncho(375);

    await montarYEsperar();

    // Se está viendo la variante de celular, no el catálogo estándar…
    expect(screen.getByTestId('catalogo-celular-copia-home')).toBeTruthy();
    // …y el modal sale igual, una sola vez.
    expect(screen.getAllByTestId('modal-cupon')).toHaveLength(1);
  });

  it('el catálogo de zona-gamer monta el modal', async () => {
    landingActual = 'zona-gamer';
    ponerAncho(1280);

    await montarYEsperar();

    expect(screen.getByTestId('catalogo-gamer')).toBeTruthy();
    expect(screen.getAllByTestId('modal-cupon')).toHaveLength(1);
  });

  it('en celular tampoco sale si la landing lo tiene apagado', async () => {
    fetchLandingConfig.mockResolvedValue(CONFIG_SIN_MODAL);
    ponerAncho(375);

    await montarYEsperar();

    expect(screen.getByTestId('catalogo-celular-copia-home')).toBeTruthy();
    expect(screen.queryByTestId('modal-cupon')).toBeNull();
  });

  it('en celular no sale si el visitante ya dejó sus datos', async () => {
    localStorage.setItem('baldecash-dni-copia-home', '72345678');
    ponerAncho(375);

    await montarYEsperar();

    expect(screen.queryByTestId('modal-cupon')).toBeNull();
  });

  it('pide la config de la landing una sola vez', async () => {
    ponerAncho(375);

    await montarYEsperar();

    expect(fetchLandingConfig).toHaveBeenCalledTimes(1);
    expect(fetchLandingConfig).toHaveBeenCalledWith('copia-home');
  });
});
