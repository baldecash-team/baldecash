import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// NextUI's Modal uses framer-motion's `m` (LazyMotion) namespace, no exportado
// por el mock global de jest.setup.js. Ver components/upsell/__tests__/MultiasistenciaUpsellModal.test.tsx.
const passthrough = ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <div {...props}>{children}</div>;
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => passthrough }),
  m: new Proxy({}, { get: () => passthrough }),
  LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  domAnimation: {},
}));

const submitSpy = jest.fn().mockResolvedValue(undefined);
const toggleInsuranceSpy = jest.fn();
const trackSpy = jest.fn();

const MA_PLAN = { id: 'ma-1', code: 'A365', name: 'Multiasistencia', monthlyPrice: 15 };

let currentLanding = 'copia-home';

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: currentLanding }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({
  useLeadGuard: () => true,
}));

jest.mock('../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedProduct: { id: 'p1' },
    isHydrated: true,
    getTotalMonthlyPayment: () => 100,
    selectedAccessories: [],
    selectedInsurances: [],
    appliedCoupon: null,
    hasUnifiedTerms: () => true,
    cartProducts: [{ id: 'p1' }],
    isOverQuotaLimit: false,
    unavailableProductIds: [],
    isValidatingAvailability: false,
    getAllProducts: () => [{ id: 'p1', paymentFrequency: 'mensual' }],
    availableMultiasistencia: MA_PLAN,
    toggleInsurance: toggleInsuranceSpy,
  }),
}));

jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: submitSpy,
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
    error: null,
  }),
}));

jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: trackSpy }),
}));

jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () => ({
    trackCartState: jest.fn(),
  }),
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: {},
    landingId: 1,
    isLoading: false,
    hasError: false,
    newsletterData: {},
  }),
}));

jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ steps: [] }),
}));

jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({ formData: {}, setFieldError: jest.fn() }),
  FILE_PENDING_REUPLOAD: '__FILE_PENDING_REUPLOAD__',
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    sectionsAfterWizard: [{ type: 'insurance' }],
    isCouponRequired: false,
    isEnabled: () => false,
    isLoading: false,
  }),
}));

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({
    isPreviewingLanding: () => false,
    previewKey: null,
  }),
}));

jest.mock('../../components/solicitar/product/SelectedProductBar', () => ({
  SelectedProductBar: () => null,
  SelectedProductSpacer: () => null,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({
  Navbar: () => null,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => null,
}));

jest.mock('../../components/solicitar/sections', () => ({
  SectionRenderer: () => null,
}));

import ComplementosClient from '../complementosClient';

describe('ComplementosClient — Multiasistencia upsell gate (copia-home)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentLanding = 'copia-home';
  });

  test('copia-home: submit abre el modal; aceptar agrega la MA y envía con su id', async () => {
    render(<ComplementosClient />);

    fireEvent.click(screen.getByText('Enviar Solicitud'));

    expect(await screen.findByText(/Protégete hoy, no cuando ya sea tarde/)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(/Sí, lo quiero/));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    expect(toggleInsuranceSpy).toHaveBeenCalledWith(MA_PLAN);
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ insuranceIds: [MA_PLAN.id] })
    );
  });

  test('copia-home: declinar envía sin la MA y no vuelve a abrir el modal', async () => {
    render(<ComplementosClient />);

    fireEvent.click(screen.getByText('Enviar Solicitud'));
    expect(await screen.findByText(/Protégete hoy, no cuando ya sea tarde/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/No, continuar sin protección/));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ insuranceIds: [] })
    );
    expect(screen.queryByText(/Protégete hoy, no cuando ya sea tarde/)).not.toBeInTheDocument();

    // Re-submit no debe reabrir el modal.
    fireEvent.click(screen.getByText('Enviar Solicitud'));
    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/Protégete hoy, no cuando ya sea tarde/)).not.toBeInTheDocument();
  });

  test('landing != copia-home: submit procede de inmediato, sin modal', async () => {
    currentLanding = 'home';
    render(<ComplementosClient />);

    fireEvent.click(screen.getByText('Enviar Solicitud'));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Protégete hoy, no cuando ya sea tarde/)).not.toBeInTheDocument();
  });
});
