/**
 * BAL-4966 · Paso 4 · Resumen de Diseño 2, montado en `StepClient`.
 *
 * `ShellV2` va mockeado a lo que importa (qué recibe: título, antetítulo,
 * "Ver detalle", textos y acciones de escritorio y de celular). Lo que se
 * prueba de verdad: los seguros dentro del paso (con la lógica compartida de
 * `/complementos`), el submit con `insurance_ids`, que en Diseño 2 no se salte
 * a `/complementos`, el envío anticipado (D5), las dos vistas de celular y que
 * Diseño 1 siga igual.
 */
import React, { useSyncExternalStore } from 'react';
import { render, screen, act, waitFor, fireEvent, within } from '@testing-library/react';

const mockPush = jest.fn();
const mockSentry = jest.fn();
jest.mock('@sentry/nextjs', () => ({ captureException: (...a: unknown[]) => mockSentry(...a) }));
const mockSubmit = jest.fn().mockResolvedValue(true);
const mockLayout: { disenoSolicitud: 1 | 2; mostrarResumen: boolean | undefined } = { disenoSolicitud: 2, mostrarResumen: undefined };
const mockFlujo: {
  sectionsAfterWizard: { type: string; order: number; enabled: boolean }[];
  shouldShowComplementos: boolean;
  envioAnticipadoStep: number | null;
  cargando: boolean;
} = { sectionsAfterWizard: [], shouldShowComplementos: false, envioAnticipadoStep: null, cargando: false };
const mockHandoff: { valor: unknown } = { valor: null };
const mockPlanes: { lista: unknown[]; falla: Error | null } = { lista: [], falla: null };
let mockFormData: Record<string, { value: string }> = {};

const CAMPO_DIA = {
  id: 1,
  code: 'payment_day',
  label: '¿Qué día del mes prefieres pagar?',
  type: 'select',
  required: true,
  readonly: false,
  hidden: false,
  grid_columns: 12,
  grid_columns_mobile: 12,
  options: [{ value: '18', label: 'Día 18 de cada mes' }],
  validations: [],
  dependency_groups: [],
  max_files: null,
};
const PASO_REGULAR = {
  id: 10,
  code: 'personal_data',
  url_slug: 'datos-personales',
  name: 'Datos personales',
  title: 'Datos personales',
  description: '',
  icon: 'user',
  order: 0,
  is_summary_step: false,
  fields: [
    {
      id: 2, code: 'first_name', label: 'Nombres', type: 'text', required: false, readonly: false, hidden: false,
      grid_columns: 12, grid_columns_mobile: 12, options: [], validations: [], dependency_groups: [], max_files: null,
    },
  ],
  motivational: null,
};
const PASO_RESUMEN = {
  id: 11,
  code: 'summary',
  url_slug: 'resumen',
  name: 'Resumen',
  title: 'Resumen de tu solicitud',
  description: '',
  order: 1,
  is_summary_step: true,
  fields: [CAMPO_DIA],
  motivational: null,
};

const GARANTIA = {
  id: '14', code: 'INS-GE', name: 'Garantía Extendida Laptop 24M', description: 'Garantía', monthlyPrice: 20, totalPrice: 480,
  paymentMonths: 24, insuranceType: 'garantia_extendida', tier: 'basic', isRecommended: false, coverage: [], exclusions: [],
  durationMonths: 24, provider: { name: 'Insurama', code: 'INSURAMA' }, imageUrl: null,
};
const ROBO = { ...GARANTIA, id: '16', code: 'INS-SR', name: 'Seguro Contra Robo Laptop 24M', monthlyPrice: 16, insuranceType: 'seguro_robo' };

// ProductContext con estado compartido entre todos los que lo usan.
type Seguro = { id: string; monthlyPrice: number };
let mockSeguros: Seguro[] = [];
const oyentes = new Set<() => void>();
const mockStore = {
  get: () => mockSeguros,
  set: (v: Seguro[]) => {
    mockSeguros = v;
    oyentes.forEach((o) => o());
  },
  sub: (o: () => void) => {
    oyentes.add(o);
    return () => oyentes.delete(o);
  },
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useParams: () => ({ landing: 'pago-diferido', stepSlug: 'resumen' }),
  usePathname: () => '/prototipos/0.6/pago-diferido/solicitar/resumen',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: () => ({
    submit: mockSubmit,
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
  }),
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    sectionsAfterWizard: mockFlujo.sectionsAfterWizard,
    shouldShowComplementos: mockFlujo.shouldShowComplementos,
    configLoadFailed: false,
    isCouponRequired: false,
    isEnabled: () => false,
    kycEnabled: false,
    isKycStepEnabled: () => false,
    envioAnticipadoStep: mockFlujo.envioAnticipadoStep,
    firmaPorAceptacion: false,
    isLoading: mockFlujo.cargando,
  }),
}));

jest.mock('../../utils/envioAnticipadoHandoff', () => ({
  readEnvioAnticipadoHandoff: () => mockHandoff.valor,
}));

jest.mock('../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({
    getStepByUrlSlug: (slug: string) => (slug === 'datos-personales' ? PASO_REGULAR : PASO_RESUMEN),
    getNavigation: (code: string) =>
      code === 'personal_data'
        ? { currentIndex: 0, prevStep: null, nextStep: PASO_RESUMEN, isFirst: true, isLast: false }
        : { currentIndex: 1, prevStep: PASO_REGULAR, nextStep: null, isFirst: false, isLast: true },
    steps: [PASO_REGULAR, PASO_RESUMEN],
    isLoading: false,
    error: null,
    badgeText: null,
  }),
}));

jest.mock('../../context/WizardContext', () => ({
  useWizard: () => ({
    formData: mockFormData,
    setFieldError: jest.fn(),
    markStepCompleted: jest.fn(),
    getFieldValue: (c: string) => mockFormData[c]?.value ?? '',
    getFieldLabel: () => undefined,
    getAllDynamicOptions: () => ({}),
  }),
  FILE_PENDING_REUPLOAD: '__pending__',
}));

jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: {},
    footerData: {},
    agreementData: null,
    landingId: 170,
    isLoading: false,
    hasError: false,
    newsletterData: null,
    disenoSolicitud: mockLayout.disenoSolicitud,
    mostrarResumen: mockLayout.mostrarResumen,
  }),
}));

// Funciones estables, como las del contexto real (`useCallback`): con
// funciones nuevas en cada render, los efectos que dependen de ellas se
// relanzan sin fin.
const mockAcciones = {
  toggleInsurance: (p: Seguro) =>
    mockStore.set(mockStore.get().some((s) => s.id === p.id) ? mockStore.get().filter((s) => s.id !== p.id) : [...mockStore.get(), p]),
  clearInsurance: () => mockStore.set([]),
  setAvailableMultiasistencia: () => {},
  hasUnifiedTerms: () => true,
  getAllProducts: () => [{ id: '1', name: 'Laptop Test', paymentFrequency: 'mensual' }],
  getInitialOptionsForProduct: () => [],
  getAvailableTerms: () => [],
  updateAllProductsToTerm: () => {},
  updateProductInitial: () => {},
  setIsProductBarExpanded: () => {},
};
const mockProducto = { id: '1', name: 'Laptop Test', price: 3000, months: 24, type: 'Laptop' };
const mockSinCarrito: unknown[] = [];

jest.mock('../../context/ProductContext', () => ({
  useProduct: () => {
    const seguros = useSyncExternalStore(mockStore.sub, mockStore.get, mockStore.get);
    return {
      ...mockAcciones,
      selectedProduct: mockProducto,
      isHydrated: true,
      appliedCoupon: null,
      cartProducts: mockSinCarrito,
      isOverQuotaLimit: false,
      unavailableProductIds: [],
      isValidatingAvailability: false,
      selectedAccessories: mockSinCarrito,
      selectedInsurances: seguros,
      isProductBarExpanded: false,
      maxMonthlyQuota: 0,
      getTotalMonthlyPayment: () => 159 + seguros.reduce((t, s) => t + s.monthlyPrice, 0),
    };
  },
}));

jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  ...jest.requireActual('@/app/prototipos/0.6/services/landingApi'),
  obtenerPlanesDeSeguro: jest.fn(() => (mockPlanes.falla ? Promise.reject(mockPlanes.falla) : Promise.resolve(mockPlanes.lista))),
}));

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({ useLeadGuard: () => true }));
jest.mock('../../hooks/useLeadPrefill', () => ({ useLeadPrefill: jest.fn(), leadLockKey: (c: string) => `_lead_locked_${c}` }));
jest.mock('../../context/EventTrackerContext', () => ({ useEventTrackerOptional: () => ({ track: jest.fn() }) }));
jest.mock('../../context/SessionContext', () => ({ useSessionOptional: () => ({ sessionUuid: 'ses-1' }) }));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('@/app/prototipos/0.6/services/landingConfigApi', () => ({
  fetchLandingConfig: jest.fn().mockResolvedValue({ layout: { has_catalog: true }, features: {} }),
}));
jest.mock('../../components/solicitar/wizard/DynamicWizardStep', () => ({
  DynamicWizardStep: () => <div data-testid="campos-del-paso" data-campo="payment_day" />,
}));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNavbar', () => ({ GamerNavbar: () => null }));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter', () => ({ GamerNewsletter: () => null }));
jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({ Footer: () => null }));
jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({ Navbar: () => null }));
// El detalle de Diseño 1 (NextUI) reducido a lo que importa: qué plan abre.
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal', () => ({
  InsuranceDetailModal: ({ plan, isOpen }: { plan: { name: string } | null; isOpen: boolean }) =>
    isOpen && plan ? <div role="dialog">Detalle de {plan.name}</div> : null,
}));

// El Modal de NextUI necesita framer-motion de verdad (jest.setup lo mockea):
// se reduce a un diálogo que se ve cuando está abierto.
jest.mock('@nextui-org/react', () => ({
  ...jest.requireActual('@nextui-org/react'),
  Modal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
  ModalContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

type PropsShell = {
  title: string;
  antetitulo?: string | null;
  description?: string;
  isLastStep?: boolean;
  onNext?: () => void;
  onSubmit?: () => void;
  detalle?: React.ReactNode;
  textoEnviar?: string;
  accionMovil?: { texto: string; onPrimary: () => void } | null;
  atrasMovil?: { texto: string; onClick: () => void } | null;
  children: (t: ReadonlySet<string>) => React.ReactNode;
};
jest.mock('@/app/prototipos/0.6/components/diseno-2', () => ({
  ShellV2: (p: PropsShell) => {
    const principal = p.isLastStep ? p.onSubmit : p.onNext;
    return (
      <div data-testid="shell-v2">
        {p.antetitulo && <p data-testid="antetitulo">{p.antetitulo}</p>}
        <h1>{p.title}</h1>
        <p data-testid="subtitulo">{p.description}</p>
        {p.detalle && <div data-testid="ver-detalle">{p.detalle}</div>}
        {p.children(new Set())}
        <button type="button" data-testid="escritorio" onClick={principal}>
          {p.isLastStep ? p.textoEnviar || 'Enviar solicitud' : 'Continuar'}
        </button>
        <button type="button" data-testid="celular" onClick={p.accionMovil?.onPrimary ?? principal}>
          {p.accionMovil?.texto ?? (p.isLastStep ? p.textoEnviar || 'Enviar solicitud' : 'Continuar')}
        </button>
        {p.atrasMovil && (
          <button type="button" data-testid="atras-celular" onClick={p.atrasMovil.onClick}>
            {p.atrasMovil.texto}
          </button>
        )}
      </div>
    );
  },
  TransicionDelWizard: () => null,
  BarraInferiorV2Spacer: () => null,
}));

import StepClient from '../StepClient';

const SECCION_SEGURO = { type: 'insurance', order: 3, enabled: true };

function vista(n: 1 | 2) {
  return document.querySelector<HTMLElement>(`[data-vista-paso4="${n}"]`);
}

beforeEach(() => {
  mockPush.mockClear();
  mockSubmit.mockClear();
  mockLayout.disenoSolicitud = 2;
  mockLayout.mostrarResumen = undefined;
  mockFlujo.sectionsAfterWizard = [SECCION_SEGURO];
  mockFlujo.shouldShowComplementos = true;
  mockFlujo.envioAnticipadoStep = null;
  mockFlujo.cargando = false;
  mockHandoff.valor = null;
  mockPlanes.lista = [GARANTIA, ROBO];
  mockPlanes.falla = null;
  mockSentry.mockClear();
  (jest.requireMock('@/app/prototipos/0.6/services/landingApi').obtenerPlanesDeSeguro as jest.Mock).mockClear();
  mockSeguros = [];
  mockFormData = { payment_day: { value: '18' } };
  Element.prototype.scrollIntoView = jest.fn();
  window.scrollTo = jest.fn();
});

describe('Paso 4 de Diseño 2 · encabezado y "Ver detalle"', () => {
  it('sin nombre: el título de la BD, sin antetítulo, y el subtítulo de respaldo', async () => {
    render(<StepClient />);
    expect(await screen.findByRole('heading', { name: 'Resumen de tu solicitud' })).toBeInTheDocument();
    expect(screen.queryByTestId('antetitulo')).not.toBeInTheDocument();
    expect(screen.getByTestId('subtitulo')).toHaveTextContent('Elige tu día de pago, confirma tu dirección y envía tu solicitud.');
  });

  it('con el nombre del lookup: "¡Último paso, {Nombre}!"', async () => {
    PASO_REGULAR.fields.push({
      id: 3, code: 'document_number', label: 'DNI', type: 'document_number', required: false, readonly: false, hidden: false,
      grid_columns: 12, grid_columns_mobile: 12, options: [], validations: [], dependency_groups: [], max_files: null,
    });
    mockFormData.document_number = { value: '70020010' };
    mockFormData._prefill_status_document_number = { value: 'found' };
    mockFormData.first_name = { value: 'BRENDA' };
    try {
      render(<StepClient />);
      expect(await screen.findByTestId('antetitulo')).toHaveTextContent('¡Último paso, Brenda!');
    } finally {
      PASO_REGULAR.fields.pop();
    }
  });

  it('el repaso de datos va en "Ver detalle", no en el cuerpo', async () => {
    mockFormData.first_name = { value: 'Brenda' };
    render(<StepClient />);
    const detalle = await screen.findByTestId('ver-detalle');
    expect(detalle).toHaveTextContent('Datos personales');
    expect(detalle).toHaveTextContent('Editar');
    // El cuerpo solo trae los campos del paso y las protecciones.
    expect(vista(1)).not.toHaveTextContent('Editar');
  });

  it('con `summary-off` (D3) el Paso 4 sale igual, sin "Ver detalle"', async () => {
    mockLayout.mostrarResumen = false;
    render(<StepClient />);
    expect(await screen.findByTestId('campos-del-paso')).toBeInTheDocument();
    expect(screen.queryByTestId('ver-detalle')).not.toBeInTheDocument();
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
  });
});

describe('Paso 4 de Diseño 2 · protecciones', () => {
  it('con la sección insurance aparecen dentro del paso, con su precio del backend', async () => {
    render(<StepClient />);
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
    expect(screen.getByText('Seguro Contra Robo Laptop 24M')).toBeInTheDocument();
    expect(screen.getByText('+S/20/mes')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Protege tu laptop/ })).toBeInTheDocument();
  });

  it('"Agregar" las suma y cambia el texto del botón; "¿Qué cubre?" abre el detalle', async () => {
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar solicitud');

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    // Etiqueta fija; el estado va en aria-pressed (revisión M-2).
    const garantia = screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' });
    await waitFor(() => expect(garantia).toHaveAttribute('aria-pressed', 'true'));
    // WCAG 2.5.3: el texto visible no cambia y está dentro del nombre accesible.
    expect(garantia).toHaveTextContent(/^Agregar/);
    expect(garantia).not.toHaveTextContent('Agregada');
    expect(garantia.querySelector('[data-check-v2]')).toBeInTheDocument();
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección');

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 2 protecciones'));

    fireEvent.click(screen.getAllByRole('button', { name: '¿Qué cubre?' })[1]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Detalle de Seguro Contra Robo Laptop 24M');
  });

  it('el submit lleva los insurance_ids elegidos y NO salta a /complementos', async () => {
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
    await screen.findByText('Enviar con 1 protección');

    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: '16', insuranceIds: ['16'] }));
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/complementos'));
  });

  it('sin la sección insurance no aparecen y se envía sin seguros', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    expect(screen.queryByText(/Protege tu/)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: null }));
    expect(mockSubmit.mock.calls[0][0]).not.toHaveProperty('insuranceIds');
  });

  it('con otra sección después del wizard (accesorios) sí pasa por /complementos', async () => {
    jest.useFakeTimers();
    try {
      mockFlujo.sectionsAfterWizard = [SECCION_SEGURO, { type: 'accessories', order: 4, enabled: true }];
      render(<StepClient />);
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
        await jest.advanceTimersByTimeAsync(600);
      });
      expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/complementos');
      expect(mockSubmit).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('Paso 4 de Diseño 2 · envío anticipado (D5)', () => {
  it('la solicitud ya se creó antes del paso: sin protecciones, va a la confirmación sin reenviar', async () => {
    mockFlujo.envioAnticipadoStep = 1;
    mockHandoff.valor = { applicationCode: 'BC-1', publicToken: 'tok', sessionUuid: 'ses-1' };
    mockSeguros = [{ id: '14', monthlyPrice: 20 }]; // quedó de antes
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    expect(screen.queryByText(/Protege tu/)).not.toBeInTheDocument();
    // Los que no pueden viajar se sueltan (el total no los cobra).
    await waitFor(() => expect(mockSeguros).toEqual([]));
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/confirmacion'));
  });

  it('la solicitud se crea en ESTE paso: las protecciones salen y viajan en ese submit', async () => {
    mockFlujo.envioAnticipadoStep = 2;
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    await screen.findByText('Enviar con 1 protección');
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['14'] }));
  });
});

describe('Paso 4 de Diseño 2 · celular en dos vistas', () => {
  it('vista 1 → "Continuar" → vista 2 con las protecciones y "‹ Volver"', async () => {
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    // Vista 1: campos a la vista, protecciones solo en escritorio.
    expect(vista(1)).not.toHaveClass('hidden');
    expect(vista(2)).toHaveClass('hidden', 'lg:block');
    expect(screen.getByTestId('celular')).toHaveTextContent('Continuar');
    // Escritorio: todo junto y envía.
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar solicitud');

    fireEvent.click(screen.getByTestId('celular'));
    expect(vista(1)).toHaveClass('hidden', 'lg:block');
    expect(vista(2)).not.toHaveClass('hidden');
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud');
    expect(mockSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('atras-celular'));
    expect(vista(1)).not.toHaveClass('hidden');
  });

  it('"Continuar" con el día de pago vacío no pasa a la vista 2', async () => {
    delete mockFormData.payment_day;
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByTestId('celular'));
    expect(vista(1)).not.toHaveClass('hidden');
    expect(screen.queryByTestId('atras-celular')).not.toBeInTheDocument();
  });

  it('enviar desde la vista 2 con algo pendiente vuelve a la vista 1 sin enviar', async () => {
    const { rerender } = render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByTestId('celular')); // a la vista 2
    expect(vista(2)).not.toHaveClass('hidden');

    // Ej. se borró el borrador: un `formData` nuevo, como el del contexto real.
    const { payment_day: _borrado, ...resto } = mockFormData;
    void _borrado;
    mockFormData = resto;
    rerender(<StepClient />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(vista(1)).not.toHaveClass('hidden');
    expect(vista(2)).toHaveClass('hidden', 'lg:block');
  });

  it('sin seguros hay una sola vista: el botón de celular envía', async () => {
    mockPlanes.lista = [];
    mockSeguros = [{ id: '14', monthlyPrice: 20 }]; // quedó de otro equipo
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await waitFor(() => expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud'));
    // Sin planes para este equipo, la selección vieja se suelta (no se cobra).
    await waitFor(() => expect(mockSeguros).toEqual([]));
    expect(vista(1)).not.toHaveClass('hidden');
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(mockSubmit).toHaveBeenCalled();
  });
});

/**
 * Monta el Paso 4 como en la app: primero `solicitar-config` cargando (el
 * hook de planes arranca inactivo) y después lista. Así el primer render con
 * `activo` es el de verdad: sin planes todavía y sin haber pedido nada.
 */
function montarComoEnLaApp() {
  mockFlujo.cargando = true;
  const utils = render(<StepClient />);
  mockFlujo.cargando = false;
  utils.rerender(<StepClient />);
  return utils;
}

describe('Revisión de F7 · I-2: no se borran selecciones válidas al llegar al Paso 4', () => {
  it('elegir 2 seguros, ir a otro paso con "Editar" y volver: siguen elegidos', async () => {
    const primero = montarComoEnLaApp();
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
    await waitFor(() => expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']));

    // "Editar" lleva a otro paso: el Paso 4 se desmonta.
    fireEvent.click(within(screen.getByTestId('ver-detalle')).getAllByText('Editar')[0]);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/datos-personales'));
    primero.unmount();

    // Vuelve al Paso 4: se monta de nuevo, con la config cargando.
    montarComoEnLaApp();
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
    await screen.findByText('Garantía Extendida Laptop 24M');
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 2 protecciones'));
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
  });

  it('recargar con seguros válidos: siguen elegidos y viajan en el submit', async () => {
    // El borrador del ProductContext los trae de vuelta.
    mockSeguros = [{ id: '14', monthlyPrice: 20 }, { id: '16', monthlyPrice: 16 }];
    montarComoEnLaApp();
    // El primer render activo, sin planes todavía, no los suelta.
    expect(mockSeguros).toHaveLength(2);
    await screen.findByText('Garantía Extendida Laptop 24M');
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 2 protecciones'));
    expect(mockSeguros).toHaveLength(2);
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['14', '16'] }));
  });

  it('M-3/M-4: con la sección de seguros en otra pantalla, la selección no se suelta', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    mockSeguros = [{ id: '14', monthlyPrice: 20 }];
    montarComoEnLaApp();
    await screen.findByTestId('campos-del-paso');
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockSeguros).toEqual([{ id: '14', monthlyPrice: 20 }]);
  });

  it('M-5: si el pedido de planes falla, va a Sentry y la selección se CONSERVA', async () => {
    const error = new Error('caído');
    mockPlanes.falla = error;
    mockSeguros = [{ id: '14', monthlyPrice: 20 }, { id: '16', monthlyPrice: 16 }];
    const consola = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Menor 10 (BAL-4969): reloj falso; `waitFor` lo adelanta y el reintento
    // de 500 ms ya no depende de esperas reales.
    jest.useFakeTimers();
    try {
      montarComoEnLaApp();
      await waitFor(() => expect(mockSentry).toHaveBeenCalledWith(error, expect.objectContaining({
        tags: expect.objectContaining({ modulo: 'seguros', accion: 'cargar_planes' }),
      })));
      // Un solo aviso a Sentry, tras el reintento automático.
      expect(mockSentry).toHaveBeenCalledTimes(1);
      await screen.findByText('No pudimos cargar las protecciones.');
      expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
    } finally {
      consola.mockRestore();
      jest.useRealTimers();
    }
  });

  it('menor 11: al desmontar durante la espera del reintento, el reintento no sale', async () => {
    mockPlanes.falla = new Error('caído');
    const consola = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.useFakeTimers();
    try {
      const pedidos = jest.requireMock('@/app/prototipos/0.6/services/landingApi').obtenerPlanesDeSeguro as jest.Mock;
      const { unmount } = montarComoEnLaApp();
      await waitFor(() => expect(pedidos).toHaveBeenCalledTimes(1));
      const pendientes = jest.getTimerCount();
      unmount();
      // El temporizador del reintento se limpió con el desmontaje.
      expect(jest.getTimerCount()).toBeLessThan(pendientes);
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(pedidos).toHaveBeenCalledTimes(1);
      expect(mockSentry).not.toHaveBeenCalled();
    } finally {
      consola.mockRestore();
      jest.useRealTimers();
    }
  });
});

describe('Corrección · error de carga de planes (BAL-4966)', () => {
  const pedidosDePlanes = () =>
    jest.requireMock('@/app/prototipos/0.6/services/landingApi').obtenerPlanesDeSeguro as jest.Mock;
  let consola: jest.SpyInstance;
  beforeEach(() => {
    consola = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Menor 10 (BAL-4969): reloj falso para el reintento de 500 ms.
    jest.useFakeTimers();
  });
  afterEach(() => {
    consola.mockRestore();
    jest.useRealTimers();
  });

  /** Monta con `/insurances` caído y espera el aviso (tras el reintento automático). */
  async function montarConError() {
    mockPlanes.falla = new Error('500');
    montarComoEnLaApp();
    await screen.findByText('No pudimos cargar las protecciones.');
  }

  it('con error: aviso en vez del esqueleto, la selección sigue, y "Reintentar" (44px) vuelve a pedir', async () => {
    mockSeguros = [{ id: '14', monthlyPrice: 20 }, { id: '16', monthlyPrice: 16 }];
    await montarConError();
    expect(screen.queryByLabelText('Cargando protecciones')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Guardamos tu selección (2 protecciones elegidas)');
    expect(pedidosDePlanes()).toHaveBeenCalledTimes(2); // el pedido + el reintento automático
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);

    // El reintento sale bien: los planes, con la selección intacta.
    mockPlanes.falla = null;
    const reintentar = screen.getByRole('button', { name: 'Reintentar' });
    expect(reintentar).toHaveClass('min-h-[44px]');
    fireEvent.click(reintentar);
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(pedidosDePlanes()).toHaveBeenCalledTimes(3);
    expect(screen.queryByText('No pudimos cargar las protecciones.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' })).toHaveAttribute('aria-pressed', 'true');
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 2 protecciones');
    // Celular: se pasa a la vista 2, donde están las protecciones.
    await waitFor(() => expect(vista(2)).not.toHaveClass('hidden'));
  });

  it('enviar con error y seguros pide confirmación: sin ella NO manda [], y al confirmar suelta y envía', async () => {
    mockSeguros = [{ id: '14', monthlyPrice: 20 }];
    await montarConError();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    const dialogo = await screen.findByRole('dialog');
    expect(dialogo).toHaveTextContent('¿Enviar sin tus protecciones?');
    expect(dialogo).toHaveTextContent('1 protección elegida');
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(mockSeguros.map((s) => s.id)).toEqual(['14']);

    await act(async () => {
      fireEvent.click(within(dialogo).getByRole('button', { name: 'Enviar sin protecciones' }));
    });
    expect(mockSeguros).toEqual([]);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: null }));
    expect(mockSubmit.mock.calls[0][0]).not.toHaveProperty('insuranceIds');
  });

  it('el celular también pide confirmación (una sola vista con el aviso)', async () => {
    mockSeguros = [{ id: '16', monthlyPrice: 16 }];
    await montarConError();
    expect(vista(2)).not.toHaveClass('hidden');
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud');
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('"Reintentar" desde la confirmación vuelve a pedir y, si carga, envía con los seguros', async () => {
    mockSeguros = [{ id: '14', monthlyPrice: 20 }];
    await montarConError();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    const dialogo = await screen.findByRole('dialog');
    mockPlanes.falla = null;
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Reintentar' }));
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(mockSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['14'] }));
  });

  it('con error y SIN seguros elegidos: aviso + reintentar, y el envío es normal', async () => {
    await montarConError();
    expect(screen.getByRole('alert')).toHaveTextContent('Puedes reintentar o enviar tu solicitud sin protecciones.');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: null }));
  });
});

describe('Revisión de F7 · I-3 y M-1: área táctil y movimiento', () => {
  it('"¿Qué cubre?" y "Agregar" miden 44px; el esqueleto no pulsa con movimiento reducido', async () => {
    montarComoEnLaApp();
    // Mientras cargan los planes: esqueleto.
    const esqueleto = document.querySelector('[aria-label="Cargando protecciones"] > div');
    expect(esqueleto).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
    await screen.findByText('Garantía Extendida Laptop 24M');
    for (const b of screen.getAllByRole('button', { name: '¿Qué cubre?' })) expect(b).toHaveClass('min-h-[44px]');
    expect(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' })).toHaveClass('min-h-[44px]');
  });
});

describe('Revisión de F7 · I-1: celular con seguros y otra sección después', () => {
  it('vista 1 "Continuar" → vista 2 con las protecciones → "Continuar" va a /complementos', async () => {
    mockFlujo.sectionsAfterWizard = [SECCION_SEGURO, { type: 'accessories', order: 4, enabled: true }];
    render(<StepClient />);
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(vista(2)).toHaveClass('hidden', 'lg:block');
    expect(screen.getByTestId('celular')).toHaveTextContent('Continuar');

    fireEvent.click(screen.getByTestId('celular'));
    expect(vista(2)).not.toHaveClass('hidden');
    expect(vista(1)).toHaveClass('hidden', 'lg:block');
    expect(screen.getByTestId('atras-celular')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));

    // En la vista 2 manda la acción de siempre: ir a complementos.
    expect(screen.getByTestId('celular')).toHaveTextContent('Continuar');
    jest.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(screen.getByTestId('celular'));
        await jest.advanceTimersByTimeAsync(600);
      });
    } finally {
      jest.useRealTimers();
    }
    expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/complementos');
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(mockSeguros.map((s) => s.id)).toEqual(['16']);
  });
});

describe('Decisión del controlador · el nombre no se pierde al recargar', () => {
  it('recarga con el borrador (sin estado del prefill): "¡Último paso, {Nombre}!" sigue', async () => {
    PASO_REGULAR.fields.push({
      id: 3, code: 'document_number', label: 'DNI', type: 'document_number', required: false, readonly: false, hidden: false,
      grid_columns: 12, grid_columns_mobile: 12, options: [], validations: [], dependency_groups: [], max_files: null,
    });
    // Lo que deja el borrador al recargar: `_prefill_status_*` no se guarda.
    mockFormData.document_number = { value: '70020010' };
    mockFormData.first_name = { value: 'BRENDA LUZ' };
    try {
      montarComoEnLaApp();
      expect(await screen.findByTestId('antetitulo')).toHaveTextContent('¡Último paso, Brenda!');
    } finally {
      PASO_REGULAR.fields.pop();
    }
  });
});

describe('Diseño 1 no cambia', () => {
  it('el resumen de siempre: repaso en el cuerpo, sin protecciones y salta a /complementos', async () => {
    jest.useFakeTimers();
    try {
      mockLayout.disenoSolicitud = 1;
      mockFormData.first_name = { value: 'Brenda' };
      render(<StepClient />);
      expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
      expect(screen.getAllByText('Editar').length).toBeGreaterThan(0);
      expect(screen.queryByText(/Protege tu/)).not.toBeInTheDocument();
      const continuar = screen.getAllByRole('button', { name: /Continuar/ })[0];
      await act(async () => {
        fireEvent.click(continuar);
        await jest.advanceTimersByTimeAsync(600);
      });
      expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/complementos');
      expect(mockSubmit).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('QA F10 · Falla 2c: falta un campo en otro paso al enviar', () => {
  it('Diseño 2: se ve el aviso "Hay campos incompletos en…" y después lleva a ese paso', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    const nombre = PASO_REGULAR.fields[0];
    const antes = nombre.required;
    nombre.required = true; // obligatorio y vacío en el Paso 1
    jest.useFakeTimers();
    try {
      montarComoEnLaApp();
      await screen.findByTestId('campos-del-paso');
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
      });
      expect(screen.getByText('Hay campos incompletos en "Datos personales". Por favor, revísalos.')).toBeInTheDocument();
      expect(mockSubmit).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      await act(async () => {
        await jest.advanceTimersByTimeAsync(1600);
      });
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('datos-personales'));
    } finally {
      nombre.required = antes;
      jest.useRealTimers();
    }
  });
});
