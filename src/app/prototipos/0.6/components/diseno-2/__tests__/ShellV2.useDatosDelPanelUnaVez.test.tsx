/**
 * Regresión BAL-4959 (re-revisión): `useDatosDelPanel` se llama UNA sola vez
 * en `ShellV2` y se pasa por prop a `CabeceraSolicitudV2` (celular) y a
 * `PanelSolicitudV2` (escritorio) — los dos están montados a la vez, uno
 * escondido con CSS, nunca desmontado. Antes de la corrección cada uno lo
 * llamaba por su cuenta, y eso pedía "1.ª cuota en {mes}" al backend por
 * duplicado en cada paso.
 *
 * Se mockea `useMesPrimeraCuota` —el hook de `useDatosDelPanel` que hace el
 * fetch (`obtenerPrimeraFechaPago`)— en una landing diferida: si alguien
 * vuelve a llamar `useDatosDelPanel` dentro de la cabecera o del panel, este
 * mock se vuelve a invocar y el test revienta.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { ShellV2 } from '../ShellV2';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'pago-diferido' }),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => '/prototipos/0.6/pago-diferido/solicitar/datos-personales',
}));

// Navbar real trae framer-motion/PreviewContext/etc.: no es lo que se prueba
// (escritorio está oculto en jsdom igual, pero ShellV2 la monta siempre).
jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({ Navbar: () => null }));
jest.mock('@/app/prototipos/0.6/components/product-landing/nvidia/NvidiaNavbar', () => ({ NvidiaNavbar: () => null }));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext');
  return {
    ...real,
    useWizardConfig: () => ({ steps: [] }),
  };
});

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext', () => ({
  useWizard: () => ({
    formData: {},
    setFieldError: jest.fn(),
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

const principal = {
  id: '1',
  name: 'Laptop Test',
  shortName: 'Laptop Test',
  image: null,
  term: 24,
  months: 24,
  paymentFrequency: 'mensual',
  initialPercent: 0,
  initialAmount: 0,
  monthlyPayment: 159,
  paymentPlans: [],
  regalos: [],
};

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/ProductContext', () => ({
  useProduct: () => ({
    getAllProducts: () => [principal],
    getTotalMonthlyPayment: () => 159,
    getInitialOptionsForProduct: () => [],
    selectedAccessories: [],
    appliedCoupon: null,
    isOverQuotaLimit: false,
    maxMonthlyQuota: 0,
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    puedeCambiarPlazo: false,
    mostrarImagenProducto: false,
    deferredPayment: { enabled: true }, // landing diferida: dispara useMesPrimeraCuota
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/product/useCondicionesDelPlan', () => ({
  useCondicionesDelPlan: () => ({
    congelada: false,
    handleTermChange: jest.fn(),
    handleInitialChange: jest.fn(),
    termLabels: new Map(),
    termOptions: [],
    landingSlug: 'pago-diferido',
  }),
}));

// El hook bajo prueba: si `useDatosDelPanel` se llama más de una vez (bug de
// la cabecera o el panel pidiendo sus propios datos), esto se invoca más de
// una vez también.
const useMesPrimeraCuotaMock = jest.fn(() => 'diciembre');
jest.mock('@/app/prototipos/0.6/components/lo-quiero/useMesPrimeraCuota', () => ({
  useMesPrimeraCuota: () => useMesPrimeraCuotaMock(),
}));

function renderShellV2() {
  return render(
    <ShellV2 currentStep="datos-personales" step={null} title="Datos personales">
      {() => <div data-testid="cuerpo-del-paso" />}
    </ShellV2>,
  );
}

describe('ShellV2 — useDatosDelPanel se pide una sola vez (regresión BAL-4959)', () => {
  beforeEach(() => {
    useMesPrimeraCuotaMock.mockClear();
  });

  it('con la cabecera de celular y el panel de escritorio montados a la vez, el hook de "1.ª cuota" se llama UNA sola vez', () => {
    renderShellV2();
    expect(useMesPrimeraCuotaMock).toHaveBeenCalledTimes(1);
  });
});
