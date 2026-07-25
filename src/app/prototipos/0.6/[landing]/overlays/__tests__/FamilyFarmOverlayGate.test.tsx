/**
 * FamilyFarmOverlayGate — behavior-preservation tests (BAL-2522 Commit B)
 *
 * Imports the REAL extracted component (no re-implementation inside the
 * test file — explicitly rejects the VipGate.test.tsx anti-pattern, see
 * design D2 point 3). These tests must pass before AND after the Commit C
 * visual redesign: they are the behavior-preservation contract.
 */

import React from 'react';
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
    const submit = screen.getByRole('button', { name: /validar/i });

    await user.type(input, '1234567');
    expect(submit).toBeDisabled();
  });

  it('enables submit once 8 digits are present', async () => {
    const user = userEvent.setup();
    renderGate();

    const input = screen.getByLabelText('Número de documento');
    const submit = screen.getByRole('button', { name: /validar/i });

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
    const submit = screen.getByRole('button', { name: /validar/i });
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
    await user.click(screen.getByRole('button', { name: /validar/i }));

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
    await user.click(screen.getByRole('button', { name: /validar/i }));

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
    await user.click(screen.getByRole('button', { name: /validar/i }));

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
