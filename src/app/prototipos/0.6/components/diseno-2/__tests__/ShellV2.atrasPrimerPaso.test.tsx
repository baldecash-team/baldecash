/**
 * BAL-5207: el «Atrás» del Paso 1 de Diseño 2 no pasa por `handleBack` (vuelve
 * a la página del modal «Lo quiero», no a `/solicitar`), pero igual tiene que
 * emitir `form_step_back`, con lo mismo que manda `handleBack`. Sin esto no se
 * puede comparar el abandono del Paso 1 entre Diseño 1 y Diseño 2.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShellV2 } from '../ShellV2';

const track = jest.fn();
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track, flush: jest.fn() }),
}));

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

jest.mock('@/app/prototipos/0.6/[landing]/solicitar/hooks/useTecladoVirtualAbierto', () => ({ useTecladoVirtualAbierto: () => false }));

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

const useMesPrimeraCuotaMock = jest.fn(() => 'diciembre');
jest.mock('@/app/prototipos/0.6/components/lo-quiero/useMesPrimeraCuota', () => ({
  useMesPrimeraCuota: () => useMesPrimeraCuotaMock(),
}));



const paso1 = { code: 'datos_personales', url_slug: 'datos-personales', title: 'Datos personales', fields: [] } as unknown as React.ComponentProps<typeof ShellV2>['step'];

beforeEach(() => {
  track.mockClear();
  mockPush.mockClear();
  sessionStorage.clear();
});

describe('ShellV2 — «Atrás» del Paso 1 emite form_step_back (BAL-5207)', () => {
  it('primer paso: emite form_step_back con step_code, prev_step "preview" y diseno 2, y vuelve al catálogo', () => {
    const onBack = jest.fn();
    render(
      <ShellV2 currentStep="datos-personales" step={paso1} title="Datos personales" isFirstStep onBack={onBack} onNext={jest.fn()}>
        {() => <div />}
      </ShellV2>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Atrás/ }));
    expect(track).toHaveBeenCalledWith('form_step_back', {
      step_code: 'datos_personales',
      prev_step: 'preview',
      diseno: 2,
    });
    expect(track).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/catalogo'));
  });

  it('otro paso: no emite nada por su cuenta (lo emite `handleBack`, que es onBack)', () => {
    const onBack = jest.fn();
    render(
      <ShellV2 currentStep="datos-academicos" step={paso1} title="Datos académicos" onBack={onBack} onNext={jest.fn()}>
        {() => <div />}
      </ShellV2>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Atrás/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(track).not.toHaveBeenCalledWith('form_step_back', expect.anything());
  });
});
