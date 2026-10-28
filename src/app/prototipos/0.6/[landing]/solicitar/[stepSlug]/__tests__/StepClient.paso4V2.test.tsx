/**
 * BAL-4966 · Paso 4 · Resumen de Diseño 2, montado en `StepClient`.
 *
 * `ShellV2` va mockeado a lo que importa (qué recibe: título, antetítulo,
 * "Ver detalle", textos y acciones de escritorio y de celular). Lo que se
 * prueba de verdad: los seguros dentro del paso (con la lógica compartida de
 * `/complementos`), el submit con `insurance_ids`, que en Diseño 2 no se salte
 * a `/complementos`, el envío anticipado (D5), los seguros en su propia
 * página `/solicitar/complementos` después de los datos (BAL-5204 → BAL-5237)
 * y que Diseño 1 siga igual.
 */
import React, { useSyncExternalStore } from 'react';
import { render, screen, act, waitFor, fireEvent, within, cleanup } from '@testing-library/react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
/** Pasos que el Resumen marcó como completos (en memoria, como `WizardContext`). */
const mockCompletados = new Set<string>();
const mockSentry = jest.fn();
jest.mock('@sentry/nextjs', () => ({ captureException: (...a: unknown[]) => mockSentry(...a) }));
const mockSubmit = jest.fn().mockResolvedValue(true);
const mockLayout: { disenoSolicitud: 1 | 2; mostrarResumen: boolean | undefined } = { disenoSolicitud: 2, mostrarResumen: undefined };
const mockFlujo: {
  sectionsAfterWizard: { type: string; order: number; enabled: boolean }[];
  sectionsBeforeWizard: { type: string; order: number; enabled: boolean }[];
  shouldShowComplementos: boolean;
  envioAnticipadoStep: number | null;
  cargando: boolean;
} = { sectionsAfterWizard: [], sectionsBeforeWizard: [], shouldShowComplementos: false, envioAnticipadoStep: null, cargando: false };
const mockHandoff: { valor: unknown } = { valor: null };
const mockPlanes: { lista: unknown[]; falla: Error | null; pendiente: Promise<unknown[]> | null } = { lista: [], falla: null, pendiente: null };
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
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useParams: () => ({ landing: 'pago-diferido', stepSlug: 'resumen' }),
  usePathname: () => '/prototipos/0.6/pago-diferido/solicitar/resumen',
  useSearchParams: () => new URLSearchParams(''),
}));

// Lo que el resumen le pasa al hook de envío (para disparar "unidad tomada").
const mockOpcionesEnvio: { onUnidadTomada?: (m: string) => void } = {};
jest.mock('../../hooks/useSubmitApplication', () => ({
  useSubmitApplication: (opts: { onUnidadTomada?: (m: string) => void }) => {
    // Solo la instancia del resumen (`usePasoDelWizard` también llama al hook
    // y se distingue porque pasa `consentimientoEnPantalla`).
    if (opts && !('consentimientoEnPantalla' in opts)) mockOpcionesEnvio.onUnidadTomada = opts.onUnidadTomada;
    return {
    submit: mockSubmit,
    isSubmitting: false,
    submitMessage: '',
    submitStage: 'idle',
    submitSucceeded: false,
    };
  },
}));

jest.mock('@/app/prototipos/0.6/hooks/useSolicitarFlow', () => ({
  useSolicitarFlow: () => ({
    sectionsAfterWizard: mockFlujo.sectionsAfterWizard,
    sectionsBeforeWizard: mockFlujo.sectionsBeforeWizard,
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
    markStepCompleted: (id: string) => mockCompletados.add(id),
    isStepCompleted: (id: string) => mockCompletados.has(id),
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
  obtenerPlanesDeSeguro: jest.fn(() =>
    mockPlanes.pendiente ?? (mockPlanes.falla ? Promise.reject(mockPlanes.falla) : Promise.resolve(mockPlanes.lista))),
}));

jest.mock('@/app/prototipos/0.6/hooks/useLeadGuard', () => ({ useLeadGuard: () => true }));
jest.mock('../../hooks/useLeadPrefill', () => ({ useLeadPrefill: jest.fn(), leadLockKey: (c: string) => `_lead_locked_${c}` }));
// Estable entre renders, como el del contexto real (`useCallback`).
const mockTrack = jest.fn();
const mockTracker = { track: mockTrack };
jest.mock('../../context/EventTrackerContext', () => ({ useEventTrackerOptional: () => mockTracker }));
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
// Las otras secciones de después del wizard (accesorios) en la página de seguros.
jest.mock('../../components/solicitar/sections/SectionRenderer', () => ({
  SectionRenderer: ({ type }: { type: string }) => <div data-testid={`seccion-${type}`} />,
}));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNavbar', () => ({ GamerNavbar: () => null }));
jest.mock('@/app/prototipos/0.6/components/zona-gamer/GamerNewsletter', () => ({ GamerNewsletter: () => null }));
jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({ Footer: () => null }));
jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({ Navbar: () => null }));
// El detalle de Diseño 1 (NextUI) reducido a lo que importa: qué plan abre.
jest.mock('@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal', () => ({
  // Diseño 2 usa su propia hoja (`HojaSeguroV2`), que lee este contenido.
  getModalConfig: jest.requireActual('@/app/prototipos/0.6/[landing]/solicitar/components/upsell/InsuranceDetailModal').getModalConfig,
  InsuranceDetailModal: ({ plan, isOpen, onClose }: { plan: { name: string } | null; isOpen: boolean; onClose: () => void }) =>
    isOpen && plan ? (
      <div role="dialog">
        Detalle de {plan.name}
        <button type="button" onClick={onClose}>Cerrar detalle</button>
      </div>
    ) : null,
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
  isBusy?: boolean;
  onNext?: () => void;
  onSubmit?: () => void;
  onBack?: () => void;
  detalle?: React.ReactNode;
  textoEnviar?: string;
  accionMovil?: { texto: string; onPrimary: () => void } | null;
  atrasMovil?: { texto: string; onClick: () => void } | null;
  ocultarBarraInferior?: boolean;
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
        {p.onBack && (
          <button type="button" data-testid="atras" onClick={p.onBack}>
            Atrás
          </button>
        )}
        <button type="button" data-testid="escritorio" onClick={principal} disabled={p.isBusy}>
          {p.isLastStep ? p.textoEnviar || 'Enviar solicitud' : 'Continuar'}
        </button>
        {/* Como `BarraInferiorV2`: con `ocultarBarraInferior` no hay barra. */}
        {!p.ocultarBarraInferior && (
          <button type="button" data-testid="celular" onClick={p.accionMovil?.onPrimary ?? principal} disabled={p.isBusy}>
            {p.accionMovil?.texto ?? (p.isLastStep ? p.textoEnviar || 'Enviar solicitud' : 'Continuar')}
          </button>
        )}
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
  AvisoV2: jest.requireActual('@/app/prototipos/0.6/components/diseno-2/AvisoV2').AvisoV2,
}));

import StepClient from '../StepClient';

const SECCION_SEGURO = { type: 'insurance', order: 3, enabled: true };

function vista(n: 1 | 2) {
  return document.querySelector<HTMLElement>(`[data-vista-paso4="${n}"]`);
}

const COMPLEMENTOS = '/prototipos/0.6/pago-diferido/solicitar/complementos';

/** La página de seguros de Diseño 2 (`/solicitar/complementos`, BAL-5237). */
function montarPaginaDeSeguros() {
  return render(<StepClient pantalla="seguros" />);
}

/**
 * BAL-5204 → BAL-5237: con seguros, el Resumen va en dos pantallas y la
 * segunda es su propia página. «Continuar» (de escritorio o de la barra de
 * celular) espera a los planes, navega a `/solicitar/complementos` y ahí se
 * monta la página de seguros (como hace la app al cambiar de ruta).
 */
async function irASeguros(boton: 'escritorio' | 'celular' = 'escritorio') {
  await waitFor(() => expect(screen.getByTestId(boton)).not.toBeDisabled());
  expect(screen.getByTestId(boton)).toHaveTextContent('Continuar');
  await act(async () => {
    fireEvent.click(screen.getByTestId(boton));
  });
  expect(mockPush).toHaveBeenCalledWith(COMPLEMENTOS);
  cleanup();
  montarPaginaDeSeguros();
}

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockCompletados.clear();
  // Algunos tests mueven la URL (el «Atrás» al Resumen): cada uno arranca limpio.
  window.history.replaceState(null, '', '/');
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
  mockPlanes.pendiente = null;
  mockSentry.mockClear();
  mockTrack.mockClear();
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
    // El paso de este test pide día de pago pero no dirección: el respaldo
    // ya no promete "confirma tu dirección" (BAL-4969, casuísticas).
    expect(screen.getByTestId('subtitulo')).toHaveTextContent('Elige tu día de pago y envía tu solicitud.');
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
    await irASeguros();
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
    expect(screen.queryByTestId('ver-detalle')).not.toBeInTheDocument();
  });
});

describe('Paso 4 de Diseño 2 · protecciones', () => {
  it('con la sección insurance aparecen en la pantalla de seguros, con su precio del backend', async () => {
    render(<StepClient />);
    await irASeguros();
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
    expect(screen.getByText('Seguro Contra Robo Laptop 24M')).toBeInTheDocument();
    expect(screen.getByText('+S/20/mes')).toBeInTheDocument();
    // El título de la pantalla; el de la tarjeta queda para el lector de pantalla.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Protege tu laptop');
    expect(screen.getByRole('heading', { level: 2, name: 'Protege tu laptop' })).toHaveClass('sr-only');
  });

  it('"Agregar" las suma y cambia el texto del botón; "¿Qué cubre?" abre el detalle', async () => {
    render(<StepClient />);
    await irASeguros();
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
    // La hoja propia de Diseño 2 (prototipo), no la de Diseño 1.
    expect(screen.getByRole('dialog', { name: 'Seguro Contra Robo Laptop 24M' })).toHaveTextContent('Ver términos y condiciones');
  });

  it('QA en celular (BAL-4969, bug 1): con "¿Qué cubre?" abierto no hay barra de "Enviar"; al cerrar vuelve', async () => {
    render(<StepClient />);
    await irASeguros('celular');
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(screen.getByTestId('celular')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '¿Qué cubre?' })[0]);
    expect(screen.getByRole('dialog', { name: 'Garantía Extendida Laptop 24M' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('celular')).not.toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[0]);
    await waitFor(() => expect(screen.getByTestId('celular')).toBeInTheDocument());
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('el submit lleva los insurance_ids elegidos y NO salta a /complementos', async () => {
    render(<StepClient />);
    await irASeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección'));

    mockPush.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: '16', insuranceIds: ['16'] }));
    // Desde la página de seguros se envía: no vuelve a saltar a /complementos.
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/complementos'));
  });

  it('BAL-4969: un seguro configurado ANTES del wizard también se ofrece en el Paso 4', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.sectionsBeforeWizard = [SECCION_SEGURO];
    try {
      render(<StepClient />);
      await irASeguros();
      expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
      await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección'));
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
      });
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: expect.arrayContaining([expect.any(String)]) }));
    } finally {
      mockFlujo.sectionsBeforeWizard = [];
    }
  });

  it('BAL-4969: "unidad tomada" al enviar desde el resumen muestra el modal (no falla en silencio)', async () => {
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    act(() => {
      mockOpcionesEnvio.onUnidadTomada?.('Era la última unidad de ese modelo.');
    });
    expect(await screen.findByText('Ese equipo ya no está disponible')).toBeInTheDocument();
    expect(screen.getByText('Era la última unidad de ese modelo.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Elegir otro equipo' }));
    expect(mockPush).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/catalogo');
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

  it('con otra sección después del wizard (accesorios): la página de seguros la pinta y envía desde ahí', async () => {
    mockFlujo.sectionsAfterWizard = [SECCION_SEGURO, { type: 'accessories', order: 4, enabled: true }];
    render(<StepClient />);
    await irASeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(screen.getByTestId('seccion-accessories')).toBeInTheDocument();
    // Los seguros no se repiten como sección de Diseño 1.
    expect(screen.queryByTestId('seccion-insurance')).not.toBeInTheDocument();
    mockPush.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalledWith(COMPLEMENTOS);
  });

  it('sin otra sección después del wizard, la página de seguros no pinta accesorios', async () => {
    render(<StepClient />);
    await irASeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(screen.queryByTestId('seccion-accessories')).not.toBeInTheDocument();
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
    await irASeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['14'] }));
  });
});

describe('Paso 4 de Diseño 2 · celular en dos pantallas (BAL-5204)', () => {
  it('la barra dice «Continuar» en los datos y «Enviar…» en los seguros, y envía con lo elegido', async () => {
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    expect(vista(2)).not.toBeInTheDocument();
    await irASeguros('celular');
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(vista(1)).not.toBeInTheDocument();
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud');
    expect(screen.queryByTestId('atras-celular')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar con 1 protección');
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['14'] }));
  });

  it('«Continuar» desde el celular con el día de pago vacío no avanza ni envía', async () => {
    delete mockFormData.payment_day;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await waitFor(() => expect(screen.getByTestId('celular')).not.toBeDisabled());
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(vista(1)).toBeInTheDocument();
    expect(vista(2)).not.toBeInTheDocument();
  });

  it('sin seguros: el botón de celular envía', async () => {
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
    await irASeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));
    await waitFor(() => expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']));

    // "Editar" lleva a otro paso: la página se desmonta.
    fireEvent.click(within(screen.getByTestId('ver-detalle')).getAllByText('Editar')[0]);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/datos-personales'));
    expect(primero.container).toBeDefined();
    cleanup();

    // Vuelve al Paso 4: se monta de nuevo, con la config cargando.
    montarComoEnLaApp();
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
    await irASeguros();
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
    await irASeguros();
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
      // Con seguros elegidos, el aviso está en la pantalla de seguros.
      await irASeguros();
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

  /**
   * Monta con `/insurances` caído y espera el aviso (tras el reintento
   * automático). Con seguros elegidos, el aviso está en la pantalla de
   * seguros (BAL-5204); sin elegidos, en la única pantalla.
   */
  async function montarConError(boton: 'escritorio' | 'celular' = 'escritorio') {
    mockPlanes.falla = new Error('500');
    montarComoEnLaApp();
    if (mockSeguros.length > 0) {
      await waitFor(() => expect(mockSentry).toHaveBeenCalled());
      await irASeguros(boton);
    }
    await screen.findByText('No pudimos cargar las protecciones.');
  }

  it('con error: aviso en vez del esqueleto, la selección sigue, y "Reintentar" (44px) vuelve a pedir', async () => {
    mockSeguros = [{ id: '14', monthlyPrice: 20 }, { id: '16', monthlyPrice: 16 }];
    await montarConError();
    expect(screen.queryByLabelText('Cargando protecciones')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Guardamos tu selección (2 protecciones elegidas)');
    // El pedido + el reintento automático, en el Resumen y otra vez en la página de seguros.
    expect(pedidosDePlanes()).toHaveBeenCalledTimes(4);
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);

    // El reintento sale bien: los planes, con la selección intacta.
    mockPlanes.falla = null;
    const reintentar = screen.getByRole('button', { name: 'Reintentar' });
    expect(reintentar).toHaveClass('min-h-[44px]');
    fireEvent.click(reintentar);
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(pedidosDePlanes()).toHaveBeenCalledTimes(5);
    expect(screen.queryByText('No pudimos cargar las protecciones.')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' })).toHaveAttribute('aria-pressed', 'true');
    expect(mockSeguros.map((s) => s.id)).toEqual(['14', '16']);
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 2 protecciones');
    // Sigue en la pantalla de seguros.
    expect(vista(2)).toBeInTheDocument();
    expect(vista(1)).not.toBeInTheDocument();
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

  it('el celular también pide confirmación (desde la pantalla de seguros, con el aviso)', async () => {
    mockSeguros = [{ id: '16', monthlyPrice: 16 }];
    await montarConError('celular');
    expect(vista(2)).toBeInTheDocument();
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
    // La página de seguros, mientras cargan sus planes: esqueleto.
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    const esqueleto = document.querySelector('[aria-label="Cargando protecciones"] > div');
    expect(esqueleto).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
    await screen.findByText('Garantía Extendida Laptop 24M');
    for (const b of screen.getAllByRole('button', { name: '¿Qué cubre?' })) expect(b).toHaveClass('min-h-[44px]');
    expect(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' })).toHaveClass('min-h-[44px]');
  });
});

describe('Revisión de F7 · I-1: celular con seguros y otra sección después', () => {
  it('datos → página de seguros (con los accesorios) → «Enviar» envía con lo elegido', async () => {
    mockFlujo.sectionsAfterWizard = [SECCION_SEGURO, { type: 'accessories', order: 4, enabled: true }];
    render(<StepClient />);
    await irASeguros('celular');
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(vista(2)).toBeInTheDocument();
    expect(screen.queryByTestId('atras-celular')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Seguro Contra Robo Laptop 24M' }));

    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar con 1 protección');
    await act(async () => {
      fireEvent.click(screen.getByTestId('celular'));
    });
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceIds: ['16'] }));
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

  it('M-2/M-3: el aviso es una región status/polite, nombra el paso con su progress_label y se cierra con un botón accesible', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    const nombre = PASO_REGULAR.fields[0];
    const antes = nombre.required;
    nombre.required = true;
    (PASO_REGULAR as { progress_label?: string }).progress_label = 'Tus datos';
    jest.useFakeTimers();
    try {
      montarComoEnLaApp();
      await screen.findByTestId('campos-del-paso');
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
      });
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveTextContent('Hay campos incompletos en "Tus datos". Por favor, revísalos.');
      const cerrar = screen.getByRole('button', { name: 'Cerrar aviso' });
      expect(cerrar.className).toMatch(/h-11/);
      expect(cerrar.className).toMatch(/w-11/);
      expect(cerrar.className).toMatch(/focus-visible:ring-2/);
      await act(async () => {
        fireEvent.click(cerrar);
        await jest.advanceTimersByTimeAsync(300);
      });
      expect(screen.queryByText(/Hay campos incompletos/)).not.toBeInTheDocument();
    } finally {
      nombre.required = antes;
      delete (PASO_REGULAR as { progress_label?: string }).progress_label;
      jest.useRealTimers();
    }
  });
});

describe('BAL-5008: Diseño 1 también avisa "campos incompletos" al enviar', () => {
  it('se ve el aviso (status/polite, cerrar de 44px) antes de volver al paso con el campo vacío', async () => {
    mockLayout.disenoSolicitud = 1;
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    const nombre = PASO_REGULAR.fields[0];
    const antes = nombre.required;
    nombre.required = true; // obligatorio y vacío en el Paso 1
    jest.useFakeTimers();
    try {
      montarComoEnLaApp();
      expect(screen.queryByTestId('shell-v2')).not.toBeInTheDocument();
      const enviar = screen.getAllByRole('button', { name: /Enviar/i })[0];
      await act(async () => {
        fireEvent.click(enviar);
      });
      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('data-aviso-d1');
      expect(region).toHaveTextContent('Hay campos incompletos en "Datos personales". Por favor, revísalos.');
      const cerrar = screen.getByRole('button', { name: 'Cerrar aviso' });
      expect(cerrar.className).toMatch(/h-11/);
      expect(cerrar.className).toMatch(/w-11/);
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

describe('E2E BAL-4969 (bug 2): reacondicionado en Diseño 2', () => {
  afterEach(() => {
    delete (mockProducto as Record<string, unknown>).condition;
  });

  it('"Enviar" envía directo: sin el modal viejo "Confirma tu solicitud · semi nuevo"', async () => {
    (mockProducto as Record<string, unknown>).condition = 'refurbished';
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(screen.queryByText(/semi nuevo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Acepto y contin/ })).not.toBeInTheDocument();
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('doble clic en "Enviar" llama al envío una sola vez', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('BAL-5237 · «Protege tu laptop» en su propia página /solicitar/complementos', () => {
  const pedidos = () => jest.requireMock('@/app/prototipos/0.6/services/landingApi').obtenerPlanesDeSeguro as jest.Mock;
  async function planesCargados() {
    await waitFor(() => expect(pedidos()).toHaveBeenCalled());
    await act(async () => {
      await Promise.resolve();
    });
  }

  it('con planes: primero los datos con «Continuar», sin las protecciones', async () => {
    render(<StepClient />);
    await planesCargados();
    expect(screen.getByTestId('campos-del-paso')).toBeInTheDocument();
    expect(screen.queryByText('Garantía Extendida Laptop 24M')).not.toBeInTheDocument();
    expect(vista(2)).not.toBeInTheDocument();
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Continuar');
    expect(screen.getByTestId('celular')).toHaveTextContent('Continuar');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Resumen de tu solicitud');
  });

  it('«Continuar» con los datos completos navega a /solicitar/complementos (sin cambiar de vista dentro del Resumen)', async () => {
    render(<StepClient />);
    await planesCargados();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockPush).toHaveBeenCalledWith(COMPLEMENTOS);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockSubmit).not.toHaveBeenCalled();
    // El Resumen no se transforma: sigue con sus campos hasta que cambia la ruta.
    expect(screen.getByTestId('campos-del-paso')).toBeInTheDocument();
    expect(screen.queryByText('Garantía Extendida Laptop 24M')).not.toBeInTheDocument();
    // Y deja el paso marcado como completo (la página de seguros lo exige).
    expect(mockCompletados.has('resumen')).toBe(true);
  });

  it('la página: «Protege tu laptop», el panel, las protecciones y «Enviar solicitud» con el mismo envío', async () => {
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Protege tu laptop');
    expect(screen.queryByTestId('campos-del-paso')).not.toBeInTheDocument();
    expect(screen.getByTestId('ver-detalle')).toBeInTheDocument();
    expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar solicitud');
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud');
    expect(mockReplace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Garantía Extendida Laptop 24M' }));
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar con 1 protección'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ insuranceId: '14', insuranceIds: ['14'] }));
    expect(mockPush).not.toHaveBeenCalledWith(COMPLEMENTOS);
  });

  it('«Continuar» con el día de pago vacío no navega: se queda en los datos', async () => {
    delete mockFormData.payment_day;
    render(<StepClient />);
    await planesCargados();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(screen.getByTestId('campos-del-paso')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('«Atrás» de la página va por el historial (lo mismo que el del navegador)', async () => {
    const atras = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    try {
      mockCompletados.add('resumen');
      montarPaginaDeSeguros();
      await screen.findByText('Garantía Extendida Laptop 24M');
      fireEvent.click(screen.getByTestId('atras'));
      expect(atras).toHaveBeenCalledTimes(1);
      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/datos-personales'));
    } finally {
      atras.mockRestore();
    }
  });

  it('entrada directa sin pasar por el Resumen: redirige al Resumen', async () => {
    montarPaginaDeSeguros();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/resumen'));
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('con el Resumen incompleto (falta el día de pago): redirige al Resumen', async () => {
    mockCompletados.add('resumen');
    delete mockFormData.payment_day;
    montarPaginaDeSeguros();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/resumen'));
  });

  it('entrada directa con un equipo SIN planes: redirige al Resumen (nunca una página de seguros vacía)', async () => {
    mockCompletados.add('resumen');
    mockPlanes.lista = [];
    montarPaginaDeSeguros();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/prototipos/0.6/pago-diferido/solicitar/resumen'));
  });

  it('mientras cargan los planes de la página no redirige (va el esqueleto)', async () => {
    let soltar: (v: unknown[]) => void = () => {};
    mockPlanes.pendiente = new Promise((r) => {
      soltar = r;
    });
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    expect(await screen.findByLabelText('Cargando protecciones')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
    await act(async () => {
      soltar([GARANTIA, ROBO]);
    });
    expect(await screen.findByText('Garantía Extendida Laptop 24M')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('sin planes: una sola pantalla con «Enviar solicitud» directo, sin ir a /complementos', async () => {
    mockPlanes.lista = [];
    render(<StepClient />);
    await planesCargados();
    await waitFor(() => expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar solicitud'));
    expect(screen.getByTestId('celular')).toHaveTextContent('Enviar solicitud');
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith(COMPLEMENTOS);
  });

  it('con los seguros apagados: el Resumen envía directo, sin ir a /complementos', async () => {
    mockFlujo.sectionsAfterWizard = [];
    mockFlujo.shouldShowComplementos = false;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    expect(screen.getByTestId('escritorio')).not.toBeDisabled();
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockSubmit).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith(COMPLEMENTOS);
  });

  describe('mientras los planes todavía cargan, el Resumen espera para decidir', () => {
    let soltar: (v: unknown[]) => void = () => {};
    beforeEach(() => {
      mockPlanes.pendiente = new Promise((r) => {
        soltar = r;
      });
    });

    it('el botón queda ocupado: tocarlo no navega ni envía', async () => {
      render(<StepClient />);
      await screen.findByTestId('campos-del-paso');
      expect(screen.getByTestId('escritorio')).toBeDisabled();
      expect(screen.getByTestId('celular')).toBeDisabled();
      fireEvent.click(screen.getByTestId('escritorio'));
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('llegan planes: «Continuar» va a /complementos', async () => {
      render(<StepClient />);
      await screen.findByTestId('campos-del-paso');
      mockPlanes.pendiente = null;
      await act(async () => {
        soltar([GARANTIA]);
      });
      await waitFor(() => expect(screen.getByTestId('escritorio')).not.toBeDisabled());
      expect(screen.getByTestId('escritorio')).toHaveTextContent('Continuar');
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
      });
      expect(mockPush).toHaveBeenCalledWith(COMPLEMENTOS);
    });

    it('no llega ninguno: el botón es «Enviar solicitud» y envía desde el Resumen', async () => {
      render(<StepClient />);
      await screen.findByTestId('campos-del-paso');
      await act(async () => {
        soltar([]);
      });
      await waitFor(() => expect(screen.getByTestId('escritorio')).not.toBeDisabled());
      expect(screen.getByTestId('escritorio')).toHaveTextContent('Enviar solicitud');
      await act(async () => {
        fireEvent.click(screen.getByTestId('escritorio'));
      });
      expect(mockSubmit).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith(COMPLEMENTOS);
    });
  });
});

describe('BAL-5237 · eventos de la página de seguros', () => {
  it('al ir: form_step_complete {vista datos, diseno 2}', async () => {
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await irASeguros();
    expect(mockTrack).toHaveBeenCalledWith('form_step_complete', { step_code: 'summary', vista: 'datos', diseno: 2 });
  });

  it('la página manda su form_step_view con vista «seguros» y el step_index del Resumen', async () => {
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(mockTrack).toHaveBeenCalledWith('form_step_view', {
      step_slug: 'resumen',
      step_code: 'summary',
      step_index: 1,
      total_steps: 2,
      diseno: 2,
      vista: 'seguros',
    });
  });

  it('al volver (pantalla o navegador): form_step_back {vista seguros, diseno 2}, una vez', async () => {
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    expect(mockTrack).not.toHaveBeenCalledWith('form_step_back', expect.anything());
    // El «Atrás» deja la URL en el Resumen y desmonta la página.
    window.history.pushState(null, '', '/prototipos/0.6/pago-diferido/solicitar/resumen/');
    cleanup();
    await waitFor(() =>
      expect(mockTrack).toHaveBeenCalledWith('form_step_back', { step_code: 'summary', vista: 'seguros', diseno: 2 }));
    expect(mockTrack.mock.calls.filter(([e]) => e === 'form_step_back')).toHaveLength(1);
  });

  it('salir hacia otra página (envío, «Editar») no manda form_step_back', async () => {
    mockCompletados.add('resumen');
    montarPaginaDeSeguros();
    await screen.findByText('Garantía Extendida Laptop 24M');
    window.history.pushState(null, '', '/prototipos/0.6/pago-diferido/solicitar/confirmacion/');
    cleanup();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockTrack).not.toHaveBeenCalledWith('form_step_back', expect.anything());
  });

  it('«Continuar» con un campo vacío no manda form_step_complete', async () => {
    delete mockFormData.payment_day;
    render(<StepClient />);
    await screen.findByTestId('campos-del-paso');
    await waitFor(() => expect(screen.getByTestId('escritorio')).not.toBeDisabled());
    await act(async () => {
      fireEvent.click(screen.getByTestId('escritorio'));
    });
    expect(mockTrack).not.toHaveBeenCalledWith('form_step_complete', expect.anything());
  });
});
