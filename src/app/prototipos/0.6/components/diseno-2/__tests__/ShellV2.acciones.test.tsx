/**
 * Botones de navegación y candado de Diseño 2 contra el prototipo de Brenda
 * (BAL-4959): Atrás como botón secundario, Continuar en línea en celular
 * (barra fija solo en el Paso 4) y el candado donde lo pone el prototipo.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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


const TEXTO_CANDADO = /Tu información es confidencial/;

function pintar(props: Partial<React.ComponentProps<typeof ShellV2>> = {}) {
  return render(
    <ShellV2 currentStep="datos-academicos" step={null} title="Datos Académicos" onBack={jest.fn()} onNext={jest.fn()} {...props}>
      {() => <div data-testid="cuerpo-del-paso" />}
    </ShellV2>,
  );
}

describe('ShellV2 — Atrás como botón y Continuar en línea (BAL-4959)', () => {
  it('Atrás es un botón secundario con contorno estándar y la altura de Continuar, en la misma fila', () => {
    pintar();
    const atras = screen.getByRole('button', { name: /Atrás/ });
    const continuar = screen.getByRole('button', { name: /Continuar/ });
    expect(atras).toHaveAttribute('data-atras-v2');
    expect(atras.className).toMatch(/min-h-\[52px\]/);
    expect(atras.className).toMatch(/border-\[1\.5px\]/);
    expect(atras.className).toMatch(/rounded-\[10px\]/);
    expect(atras.className).toMatch(/bg-white/);
    expect(continuar.className).toMatch(/min-h-\[52px\]/);
    // Misma fila: el mismo contenedor, sin barra fija aparte.
    expect(atras.parentElement).toBe(continuar.parentElement);
    expect(document.querySelector('.fixed.bottom-0')).toBeNull();
  });

  it('en el Paso 4 (pasoResumen) el celular usa la barra fija con Atrás, la cuota y "Desde {mes}" con pago diferido', () => {
    pintar({ pasoResumen: true, isLastStep: true, onSubmit: jest.fn() });
    const barra = document.querySelector('.fixed.bottom-0') as HTMLElement;
    expect(barra).not.toBeNull();
    expect(barra.querySelector('[data-atras-v2]')).toHaveAttribute('aria-label', 'Atrás');
    expect(barra).toHaveTextContent('Desde diciembre');
    expect(barra).toHaveTextContent('S/159');
  });
});

describe('ShellV2 — candado de confidencialidad (prototipo)', () => {
  it('paso sin descripción: el candado va bajo el título, no bajo los botones', () => {
    pintar();
    const candado = screen.getByText(TEXTO_CANDADO).closest('p') as HTMLElement;
    const titulo = screen.getByRole('heading', { name: 'Datos Académicos' });
    expect(titulo.nextElementSibling).toBe(candado);
    expect(screen.getAllByText(TEXTO_CANDADO)).toHaveLength(1);
  });

  it('paso con descripción: la descripción bajo el título y el candado bajo los botones', () => {
    pintar({ description: 'Solo necesitamos tu documento y tu celular.' });
    const titulo = screen.getByRole('heading', { name: 'Datos Académicos' });
    expect(titulo.nextElementSibling).toHaveTextContent('Solo necesitamos tu documento');
    const candado = screen.getByText(TEXTO_CANDADO).closest('p') as HTMLElement;
    expect(candado.closest('[data-zona-acciones-v2]')).not.toBeNull();
  });

  it('el Paso 4 no lleva candado', () => {
    pintar({ pasoResumen: true, isLastStep: true, onSubmit: jest.fn(), description: 'Elige tu día de pago' });
    expect(screen.queryByText(TEXTO_CANDADO)).toBeNull();
  });
});
