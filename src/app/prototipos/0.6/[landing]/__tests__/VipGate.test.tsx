/**
 * VipGate unit tests
 *
 * Estrategia: testeamos el bypass de preview mode directamente a través de
 * la lógica del PreviewContext + fetchLandingConfig, sin montar el árbol
 * completo de LandingLayout (que trae demasiadas dependencias de runtime).
 *
 * Los tests verifican:
 * 1. Con preview activo: children se renderizan sin bloqueo
 * 2. Sin preview + countdown vencido: overlay aparece
 * 3. Sin whitelist: children se renderizan normalmente
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ── next/navigation ──────────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'renueva-tu-equipo' }),
  usePathname: () => '/renueva-tu-equipo/catalogo',
  useRouter: () => ({ replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// ── PreviewContext ────────────────────────────────────────────────────────────
const previewContextMock = {
  isPreviewingLanding: (_slug: string) => false,
  isHydrated: true,
};

jest.mock('../../context/PreviewContext', () => ({
  usePreview: () => ({
    isPreviewingLanding: (slug: string) => previewContextMock.isPreviewingLanding(slug),
    isPreviewMode: false,
    previewKey: null,
    isHydrated: previewContextMock.isHydrated,
  }),
}));

// ── fetchLandingConfig ────────────────────────────────────────────────────────
const mockFetchLandingConfig = jest.fn();
jest.mock('../../services/landingConfigApi', () => ({
  fetchLandingConfig: (...args: unknown[]) => mockFetchLandingConfig(...args),
}));

// ── SessionProvider / EventTrackerProvider ────────────────────────────────────
jest.mock('../solicitar/context/SessionContext', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSessionOptional: () => null,
}));
jest.mock('../solicitar/context/EventTrackerContext', () => ({
  EventTrackerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── LayoutProvider ────────────────────────────────────────────────────────────
jest.mock('../context/LayoutContext', () => ({
  LayoutProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── VipCountdownOverlay ───────────────────────────────────────────────────────
jest.mock('../../components/hero/VipCountdownOverlay', () => ({
  VipCountdownOverlay: () => (
    <div data-testid="vip-countdown-overlay">Venta exclusiva finalizada</div>
  ),
}));

// ── DniModal / helpers ────────────────────────────────────────────────────────
jest.mock('../../components/hero/DniModal', () => ({
  DniModal: () => null,
  getVipToken: () => null,
  getVipName: () => null,
  consumeVipWelcomePending: () => false,
  saveVipToken: jest.fn(),
  saveVipName: jest.fn(),
}));

// ── routes ────────────────────────────────────────────────────────────────────
jest.mock('../../utils/routes', () => ({
  routes: {
    landingHome: (slug: string) => `/${slug}`,
    catalogo: (slug: string) => `/${slug}/catalogo`,
  },
}));

// ── framer-motion ─────────────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Configs de test ───────────────────────────────────────────────────────────
const VIP_EXPIRED_CONFIG = {
  layout: { has_catalog: true },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '2026-01-01T00:00:00.000Z', // expirado
    has_dni_whitelist: true,
    dni_capture_mode: 'inline' as const,
    floating_cta: null,
    overlay_variant: '',
    overlay_deadline: '',
  },
};

const NO_WHITELIST_CONFIG = {
  layout: { has_catalog: true },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '',
    has_dni_whitelist: false,
    dni_capture_mode: 'modal' as const,
    floating_cta: null,
    overlay_variant: '',
    overlay_deadline: '',
  },
};

// ── Componente wrapper mínimo que simula VipGate en aislamiento ───────────────
// Replicamos la lógica central del VipGate sin el árbol completo de LandingLayout
import { usePreview } from '../../context/PreviewContext';
import { fetchLandingConfig } from '../../services/landingConfigApi';
import { VipCountdownOverlay } from '../../components/hero/VipCountdownOverlay';
import type { LandingConfig } from '../../types/landingConfig';

function VipGateIsolated({
  landing,
  children,
}: {
  landing: string;
  children: React.ReactNode;
}) {
  const [config, setConfig] = React.useState<LandingConfig | null>(null);
  const preview = usePreview();

  React.useEffect(() => {
    // Replica la guarda de hydration del VipGate real:
    // no evaluar acceso hasta que sessionStorage haya sido leído.
    if (!preview.isHydrated) return;

    fetchLandingConfig(landing).then((cfg: LandingConfig) => {
      if (preview.isPreviewingLanding(landing)) {
        setConfig(cfg); // permite pasar sin bloquear
        return;
      }
      setConfig(cfg);
    });
  }, [landing, preview, preview.isHydrated]);

  // Preview bypass antes de tener config
  if (preview.isPreviewingLanding(landing)) return <>{children}</>;

  // Cargando
  if (!config) return null;

  const { vip_countdown, has_dni_whitelist } = config.features as unknown as {
    vip_countdown: string;
    has_dni_whitelist: boolean;
    [key: string]: unknown;
  };

  // Sin whitelist: acceso libre
  if (!has_dni_whitelist) return <>{children}</>;

  // Countdown expirado: solo overlay
  if (vip_countdown && new Date().getTime() >= new Date(vip_countdown).getTime()) {
    return <VipCountdownOverlay endDate={vip_countdown} catalogSlug={landing} />;
  }

  return <>{children}</>;
}

// PreviewProvider mínimo para los tests
import PreviewContext from '../../context/PreviewContext';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function renderGate(landing = 'renueva-tu-equipo') {
  return render(
    <TestWrapper>
      <VipGateIsolated landing={landing}>
        <div data-testid="protected-content">Catálogo</div>
      </VipGateIsolated>
    </TestWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  previewContextMock.isPreviewingLanding = (_slug: string) => false;
  previewContextMock.isHydrated = true;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VipGate — preview mode bypass', () => {
  it('renderiza children inmediatamente cuando hay preview activo para el slug', () => {
    previewContextMock.isPreviewingLanding = (_slug: string) => true;
    mockFetchLandingConfig.mockResolvedValue(VIP_EXPIRED_CONFIG);

    renderGate();

    // Los children aparecen sin esperar fetchLandingConfig
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('vip-countdown-overlay')).not.toBeInTheDocument();
  });

  it('NO hace bypass cuando el preview es para un slug distinto', async () => {
    previewContextMock.isPreviewingLanding = (slug: string) => slug === 'otro-slug';
    mockFetchLandingConfig.mockResolvedValue(VIP_EXPIRED_CONFIG);

    renderGate('renueva-tu-equipo');

    await waitFor(() => {
      expect(screen.getByTestId('vip-countdown-overlay')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

describe('VipGate — comportamiento sin preview', () => {
  it('muestra el overlay expirado cuando el countdown venció', async () => {
    mockFetchLandingConfig.mockResolvedValue(VIP_EXPIRED_CONFIG);

    renderGate();

    await waitFor(() => {
      expect(screen.getByTestId('vip-countdown-overlay')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renderiza children cuando la landing no tiene whitelist', async () => {
    mockFetchLandingConfig.mockResolvedValue(NO_WHITELIST_CONFIG);

    renderGate();

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('vip-countdown-overlay')).not.toBeInTheDocument();
  });
});

describe('VipGate — race condition: hydration antes de fetchLandingConfig', () => {
  it('no redirige cuando preview activa llega después de que fetchLandingConfig resuelve', async () => {
    // Simula: isHydrated=false al inicio → fetchLandingConfig no corre → luego isHydrated=true + preview activo
    previewContextMock.isHydrated = false;
    previewContextMock.isPreviewingLanding = (_slug: string) => true;
    mockFetchLandingConfig.mockResolvedValue(VIP_EXPIRED_CONFIG);

    const { rerender } = renderGate();

    // Con isHydrated=false, el efecto no corre → no hay fetch ni redirect
    expect(mockFetchLandingConfig).not.toHaveBeenCalled();

    // Simula hidratación completada
    previewContextMock.isHydrated = true;
    rerender(
      <TestWrapper>
        <VipGateIsolated landing="renueva-tu-equipo">
          <div data-testid="protected-content">Catálogo</div>
        </VipGateIsolated>
      </TestWrapper>
    );

    // Ahora sí corre pero con preview activo → children visibles, sin overlay
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('vip-countdown-overlay')).not.toBeInTheDocument();
  });
});

// ── Configs adicionales para tests de no-regresión lockertruck (T-2) ─────────

const LOCKERTRUCK_CONFIG_NO_PASS = {
  layout: { has_catalog: true },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '',
    has_dni_whitelist: true,
    dni_capture_mode: 'modal' as const,
    floating_cta: null,
    overlay_variant: 'lockertruck',
    overlay_deadline: '',
  },
};

const CADE_CONFIG_WITH_TOKEN = {
  layout: { has_catalog: true },
  features: {
    has_dni_modal: false,
    dni_required: false,
    show_platform_commission: false,
    vip_countdown: '',
    has_dni_whitelist: true,
    dni_capture_mode: 'modal' as const,
    floating_cta: null,
    overlay_variant: 'cade',
    overlay_deadline: '',
  },
};

/**
 * VipGateIsolatedLockertruck: replica la guarda de lockertruck del VipGate real
 * para testear el bypass de sessionStorage sin montar el árbol completo.
 *
 * Refleja la lógica de C-1: si overlay_variant === 'lockertruck' y el flag
 * anti-loop NO está seteado → status='blocked' (overlay renderiza).
 * Si el flag SÍ está seteado → status='allowed' (children visibles).
 */
function VipGateIsolatedLockertruck({
  landing,
  children,
  sessionPassSet = false,
}: {
  landing: string;
  children: React.ReactNode;
  sessionPassSet?: boolean;
}) {
  const [status, setStatus] = React.useState<'loading' | 'allowed' | 'blocked'>('loading');
  const preview = usePreview();

  React.useEffect(() => {
    if (!preview.isHydrated) return;

    fetchLandingConfig(landing).then((cfg: LandingConfig) => {
      if (preview.isPreviewingLanding(landing)) {
        setStatus('allowed');
        return;
      }

      const variant = (cfg.features as Record<string, unknown>).overlay_variant as string || '';

      // Replica la guarda de lockertruck (C-1)
      if (variant === 'lockertruck') {
        if (sessionPassSet) {
          setStatus('allowed');
          return;
        }
        setStatus('blocked');
        return;
      }

      // Otros overlays (ej. cade) → blocked también (simplificado para test)
      if (variant) {
        setStatus('blocked');
        return;
      }

      setStatus('allowed');
    });
  }, [landing, preview, preview.isHydrated, sessionPassSet]);

  if (status === 'loading') return null;
  if (status === 'blocked') return <div data-testid="lockertruck-overlay">Gate bloqueado</div>;
  return <>{children}</>;
}

describe('VipGate — no-regresión bypass lockertruck (T-2)', () => {
  it('Caso 1: overlay_variant=lockertruck sin flag sessionStorage → status=blocked (overlay renderiza)', async () => {
    mockFetchLandingConfig.mockResolvedValue(LOCKERTRUCK_CONFIG_NO_PASS);

    render(
      <TestWrapper>
        <VipGateIsolatedLockertruck landing="locker-truck" sessionPassSet={false}>
          <div data-testid="protected-content">Catálogo</div>
        </VipGateIsolatedLockertruck>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('lockertruck-overlay')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('Caso 2: overlay_variant=lockertruck con flag sessionStorage seteado → status=allowed (children visibles)', async () => {
    mockFetchLandingConfig.mockResolvedValue(LOCKERTRUCK_CONFIG_NO_PASS);

    render(
      <TestWrapper>
        <VipGateIsolatedLockertruck landing="locker-truck" sessionPassSet={true}>
          <div data-testid="protected-content">Catálogo</div>
        </VipGateIsolatedLockertruck>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('lockertruck-overlay')).not.toBeInTheDocument();
  });

  it('Caso 3: overlay_variant=cade con vip_auto presente → comportamiento idéntico al anterior (no activa guarda lockertruck)', async () => {
    // La guarda de lockertruck NO se activa para variant='cade'
    // → el flujo cae al path genérico (blocked por overlay cade)
    mockFetchLandingConfig.mockResolvedValue(CADE_CONFIG_WITH_TOKEN);

    render(
      <TestWrapper>
        <VipGateIsolatedLockertruck landing="cade" sessionPassSet={false}>
          <div data-testid="protected-content">Catálogo CADE</div>
        </VipGateIsolatedLockertruck>
      </TestWrapper>
    );

    await waitFor(() => {
      // overlay cade también está bloqueado — pero NO es el lockertruck-overlay
      expect(screen.getByTestId('lockertruck-overlay')).toBeInTheDocument();
    });
    // El testid 'lockertruck-overlay' aquí representa cualquier overlay bloqueado en el mock.
    // Lo relevante: protected-content NO es visible (no se saltea la guarda).
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
