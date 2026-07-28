/**
 * FamilyFarmOverlayGate — behavior-preservation tests (BAL-2522 Commit B)
 *
 * Imports the REAL extracted component (no re-implementation inside the
 * test file — explicitly rejects the VipGate.test.tsx anti-pattern, see
 * design D2 point 3). These tests must pass before AND after the Commit C
 * visual redesign: they are the behavior-preservation contract.
 */

import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── framer-motion ────────────────────────────────────────────────────────
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── DniModal helpers ──────────────────────────────────────────────────────
const mockSaveVipToken = jest.fn();
const mockSaveVipName = jest.fn();
jest.mock('../../../components/hero/DniModal', () => ({
  saveVipToken: (...args: unknown[]) => mockSaveVipToken(...args),
  saveVipName: (...args: unknown[]) => mockSaveVipName(...args),
}));

// ── SessionContext ────────────────────────────────────────────────────────
jest.mock('../../solicitar/context/SessionContext', () => ({
  useSessionOptional: () => ({ sessionUuid: 'session-test-uuid' }),
}));

// ── routes ────────────────────────────────────────────────────────────────
jest.mock('../../../utils/routes', () => ({
  routes: {
    catalogo: (slug: string) => `/${slug}/catalogo`,
  },
}));

// ── landingApi ────────────────────────────────────────────────────────────
const mockEvaluateFamilyFarmAccess = jest.fn();
jest.mock('../../../services/landingApi', () => ({
  evaluateFamilyFarmAccess: (...args: unknown[]) => mockEvaluateFamilyFarmAccess(...args),
}));

import { FamilyFarmOverlayGate } from '../FamilyFarmOverlayGate';

function renderGate() {
  return render(<FamilyFarmOverlayGate landing="family-farm-cosechador" onValidated={jest.fn()} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FamilyFarmOverlayGate — digit sanitization', () => {
  it('strips non-digit characters and caps at 12 digits while typing', async () => {
    const user = userEvent.setup();
    renderGate();

    const input = screen.getByLabelText('Número de documento') as HTMLInputElement;
    await user.type(input, '12ab34');
    expect(input.value).toBe('1234');

    await user.clear(input);
    await user.type(input, '1234567890123456');
    expect(input.value).toHaveLength(12);
  });
});

describe('FamilyFarmOverlayGate — submit gating', () => {
  it('disables submit while fewer than 8 digits are present', async () => {
    const user = userEvent.setup();
    renderGate();

    const input = screen.getByLabelText('Número de documento');
    const submit = screen.getByRole('button');

    await user.type(input, '1234567');
    expect(submit).toBeDisabled();
  });

  it('enables submit once 8 digits are present', async () => {
    const user = userEvent.setup();
    renderGate();

    const input = screen.getByLabelText('Número de documento');
    const submit = screen.getByRole('button');

    await user.type(input, '12345678');
    expect(submit).not.toBeDisabled();
  });
});

describe('FamilyFarmOverlayGate — loading state', () => {
  it('disables the submit control and shows a loading indicator while the request is pending', async () => {
    const user = userEvent.setup();
    let resolveFn!: (value: unknown) => void;
    mockEvaluateFamilyFarmAccess.mockReturnValue(new Promise((resolve) => { resolveFn = resolve; }));

    renderGate();
    const input = screen.getByLabelText('Número de documento');
    await user.type(input, '80011001');
    const submit = screen.getByRole('button');
    await user.click(submit);

    expect(submit).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveFn({ valid: true, first_name: 'Rosa' });
    await waitFor(() => {
      expect(screen.getByText('¡Hola, Rosa!')).toBeInTheDocument();
    });
  });
});

describe('FamilyFarmOverlayGate — backend outcome rendering', () => {
  it('valid:true renders the welcome view with first_name and document', async () => {
    const user = userEvent.setup();
    mockEvaluateFamilyFarmAccess.mockResolvedValue({ valid: true, first_name: 'Rosa', access_token: 'tok-1' });

    renderGate();
    const input = screen.getByLabelText('Número de documento');
    await user.type(input, '80011001');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('¡Hola, Rosa!')).toBeInTheDocument();
    });
    expect(screen.getByText('80011001')).toBeInTheDocument();
    expect(mockSaveVipToken).toHaveBeenCalledWith('family-farm-cosechador', 'tok-1');
    expect(mockSaveVipName).toHaveBeenCalledWith('family-farm-cosechador', 'Rosa');
  });

  it('valid:false + found_in_sibling:true renders the sibling notice with a link (no re-validation)', async () => {
    const user = userEvent.setup();
    mockEvaluateFamilyFarmAccess.mockResolvedValue({
      valid: false,
      found_in_sibling: true,
      sibling_landing_slug: 'family-farm-fijo',
      sibling_landing_name: 'Family Farm - Fijo',
      first_name: 'Miguel',
    });

    renderGate();
    const input = screen.getByLabelText('Número de documento');
    await user.type(input, '80011002');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Family Farm - Fijo')).toBeInTheDocument();
    });
    const siblingLink = screen.getByRole('link', { name: /empezar/i });
    expect(siblingLink.tagName).toBe('A');
    expect(siblingLink).toHaveAttribute('href', '/family-farm-fijo/catalogo');
  });

  it('valid:false (no sibling) renders the no-access notice', async () => {
    const user = userEvent.setup();
    mockEvaluateFamilyFarmAccess.mockResolvedValue({ valid: false, found_in_sibling: false });

    renderGate();
    const input = screen.getByLabelText('Número de documento');
    await user.type(input, '80011003');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Tu documento no tiene acceso a esta promoción.')).toBeInTheDocument();
    });
  });
});

describe('FamilyFarmOverlayGate — no decorative particles', () => {
  it('does not render a FloatingParticles node', () => {
    const { container } = renderGate();
    // FloatingParticles renders a `div[aria-hidden]` full of decorative circles;
    // this variant must never mount it (spec: "No decorative particles").
    expect(container.querySelector('[aria-hidden]')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Commit C — visual redesign: a11y + asset regression assertions
// ─────────────────────────────────────────────────────────────────────────

describe('FamilyFarmOverlayGate — accessible document input (Commit C)', () => {
  it('renders a visible <label> bound via for/id to the input, not placeholder-only', () => {
    renderGate();
    const input = screen.getByLabelText('Número de documento');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('id');
    const label = document.querySelector(`label[for="${input.getAttribute('id')}"]`);
    expect(label).not.toBeNull();
    expect(label?.textContent).toContain('Número de documento');
  });

  it('sets inputMode="numeric" and maxLength={12} on the input', () => {
    renderGate();
    const input = screen.getByLabelText('Número de documento');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('maxlength', '12');
  });
});

describe('FamilyFarmOverlayGate — no broken mascot image (Commit C)', () => {
  it('never references mascota.png', () => {
    const { container } = renderGate();
    expect(container.querySelector('img[src*="mascota"]')).not.toBeInTheDocument();
  });
});

/*
 * Regression guard for a real production incident: the overlay shipped with the
 * background and logo pointing at `/assets/family-farm/*` under `public/`, which
 * is not served in production — both 404'd and the overlay rendered with a
 * broken logo and no photo. It passed every local check because `next dev`
 * serves `public/` happily; only prod exposed it.
 *
 * Both the component AND the stylesheet reference the artwork, and the CSS one
 * is easy to miss — fixing only the constants would have left the background
 * still broken. Assert both.
 */
describe('FamilyFarmOverlayGate — artwork is served from S3, never from public/', () => {
  const componentSource = fs.readFileSync(
    path.join(__dirname, '..', 'FamilyFarmOverlayGate.tsx'),
    'utf8',
  );
  const cssSource = fs.readFileSync(
    path.join(__dirname, '..', 'familyFarmOverlay.module.css'),
    'utf8',
  );

  it.each([
    ['component', () => componentSource],
    ['stylesheet', () => cssSource],
  ])('%s never points artwork at a relative /assets path', (_name, read) => {
    expect(read()).not.toMatch(/['"(]\/assets\//);
  });

  it('resolves both images to absolute S3 URLs', () => {
    const bg = componentSource.match(/FAMILY_FARM_BG_URL\s*=\s*'([^']+)'/)?.[1];
    const logo = componentSource.match(/FAMILY_FARM_LOGO_URL\s*=\s*'([^']+)'/)?.[1];

    for (const url of [bg, logo]) {
      expect(url).toMatch(/^https:\/\/baldecash\.s3\.amazonaws\.com\//);
    }
    // The stylesheet paints the background; it must use the same absolute URL.
    expect(cssSource).toContain(`url('${bg}')`);
  });
});

describe('FamilyFarmOverlayGate.module.css — source-text regression guard', () => {
  const css = fs.readFileSync(
    path.join(__dirname, '..', 'familyFarmOverlay.module.css'),
    'utf8',
  );

  it.each([
    '@supports not',
    '@media (hover: hover) and (pointer: fine)',
    'prefers-reduced-motion',
    '#5c6a86',
    'linear-gradient(180deg, #00a99f, #008078)',
    'tabular-nums',
    '0 0 0 4px',
    'border-color: var(--teal) !important',
    'clamp(48px, 10.4vh, 110px)',
    'clamp(120px, 12.8vw, 250px)',
    'clamp(280px, 24.4vw, 430px)',
    '767px',
  ])('contains %s', (needle) => {
    expect(css).toContain(needle);
  });

  it('declares tokens on .overlay, never on :root', () => {
    expect(css).not.toMatch(/^:root\s*\{/m);
    expect(css).toMatch(/\.overlay\s*\{[\s\S]*--teal:/);
  });

  it('does not hardcode a font-family override', () => {
    expect(css).not.toMatch(/font-family\s*:/);
  });

  /*
   * Regression guard. An entrance animation ending at `opacity: 1` with
   * `animation-fill-mode: both` keeps that value applied forever once the
   * animation finishes, and animations outrank normal declarations in the
   * cascade — which silently defeated `.btnSubmit:disabled { opacity: .42 }`
   * and rendered the disabled button as fully solid. Use `backwards`: it still
   * applies the `from` state during the delay but releases control on finish.
   */
  it('never uses animation-fill-mode `both` (it would outrank :disabled)', () => {
    expect(css).not.toMatch(/animation:[^;]*\bboth\b/);
  });

  /*
   * Regression guard. DISENO-CARD.md §10 requires every :active scale to be
   * cancelled under reduced motion. `.btnPrimary` was added later and initially
   * escaped the reset, leaving one control still scaling. Assert that each
   * class which scales on :active is also listed in the reduced-motion block.
   */
  it('cancels every :active scale under prefers-reduced-motion', () => {
    const reducedMotion = css.slice(css.indexOf('prefers-reduced-motion'));
    const scalingControls = [...css.matchAll(/\.(btn[A-Za-z]+)[^{]*:active[^{]*\{[^}]*scale\(/g)]
      .map((m) => m[1]);

    expect(scalingControls.length).toBeGreaterThan(0);
    for (const control of new Set(scalingControls)) {
      // Matches `.btnSubmit:not(:disabled):active` as well as `.btnPrimary:active`.
      expect(reducedMotion).toMatch(new RegExp(`\\.${control}[^,{]*:active`));
    }
  });
});
