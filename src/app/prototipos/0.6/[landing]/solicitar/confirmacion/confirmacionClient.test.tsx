/**
 * Tests for ConfirmacionClient
 *
 * Tests the confirmation page behavior:
 * - Shows demo view when no code in URL
 * - Shows real confirmation when code is present
 * - Fetches application status from API
 * - Allows copying the application code
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Declare global mocks (defined in jest.setup.js)
declare global {
  var mockSearchParamsGet: jest.Mock;
  var mockRouterPush: jest.Mock;
}

// Mock the API
jest.mock('../../../services/applicationApi', () => ({
  getApplicationStatus: jest.fn(),
}));

// Mock the LayoutContext
jest.mock('../../context/LayoutContext', () => ({
  useLayout: () => ({
    navbarProps: { logo: '/logo.png' },
    footerData: {},
    isLoading: false,
    hasError: false,
  }),
}));

// Mock shared components
jest.mock('@/app/prototipos/_shared', () => ({
  CubeGridSpinner: () => <div data-testid="spinner">Loading...</div>,
  useScrollToTop: () => {},
}));

jest.mock('@/app/prototipos/0.6/components/NotFoundContent', () => ({
  NotFoundContent: () => <div>Not Found</div>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

jest.mock('@/app/prototipos/0.6/components/hero/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

// Import after mocks
import ConfirmacionPage from './confirmacionClient';
import { getApplicationStatus } from '../../../services/applicationApi';

// Type the mock
const mockGetApplicationStatus = getApplicationStatus as jest.MockedFunction<
  typeof getApplicationStatus
>;

describe('ConfirmacionClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the search params mock to return null by default
    global.mockSearchParamsGet.mockReturnValue(null);
  });

  describe('Demo View (no code in URL)', () => {
    beforeEach(() => {
      // No code in URL
      global.mockSearchParamsGet.mockReturnValue(null);
    });

    it('shows demo view with result options when no code', () => {
      render(<ConfirmacionPage />);

      // Should show the demo title
      expect(screen.getByText('Solicitud Enviada')).toBeInTheDocument();

      // Should show the demo description
      expect(
        screen.getByText(/Selecciona un resultado para ver/)
      ).toBeInTheDocument();

      // Should show the 3 result options
      expect(screen.getByText('Aprobación')).toBeInTheDocument();
      expect(screen.getByText('Rechazo')).toBeInTheDocument();
      expect(screen.getByText('Recibido')).toBeInTheDocument();
    });

    it('shows demo disclaimer note', () => {
      render(<ConfirmacionPage />);

      expect(
        screen.getByText(/Esta página es solo para demostración/)
      ).toBeInTheDocument();
    });
  });

  describe('Real Confirmation View (code in URL)', () => {
    const mockCode = 'BC-2025-ABC12345';

    beforeEach(() => {
      // Mock code in URL
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === 'code') return mockCode;
        return null;
      });

      // Mock successful API response
      mockGetApplicationStatus.mockResolvedValue({
        code: mockCode,
        status: 'submitted',
        submitted_at: '2025-03-03T10:00:00Z',
        evaluated_at: null,
        status_history: [],
      });
    });

    it('shows application code when present in URL', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(screen.getByText(mockCode)).toBeInTheDocument();
      });
    });

    it('calls getApplicationStatus with correct code', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(mockGetApplicationStatus).toHaveBeenCalledWith(mockCode);
      });
    });

    it('shows success message', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Solicitud Enviada/i)
        ).toBeInTheDocument();
      });
    });

    it('shows application status', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        // Status should be displayed (translated to Spanish)
        expect(screen.getByText(/Enviada|submitted/i)).toBeInTheDocument();
      });
    });

    it('does NOT show demo options when code is present', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(screen.getByText(mockCode)).toBeInTheDocument();
      });

      // Demo options should NOT be visible
      expect(
        screen.queryByText(/Selecciona un resultado para ver/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    const mockCode = 'BC-2025-COPY123';

    beforeEach(() => {
      // Mock code in URL
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === 'code') return mockCode;
        return null;
      });

      mockGetApplicationStatus.mockResolvedValue({
        code: mockCode,
        status: 'submitted',
        submitted_at: '2025-03-03T10:00:00Z',
        evaluated_at: null,
        status_history: [],
      });

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
    });

    it('has a copy button', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar/i });
        expect(copyButton).toBeInTheDocument();
      });
    });

    it('copies code to clipboard when button clicked', async () => {
      const user = userEvent.setup();
      const writeTextMock = jest.fn().mockResolvedValue(undefined);

      // Mock clipboard using defineProperty
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(screen.getByText(mockCode)).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /copiar/i });
      await user.click(copyButton);

      expect(writeTextMock).toHaveBeenCalledWith(mockCode);
    });
  });

  describe('Error Handling', () => {
    const mockCode = 'BC-INVALID-CODE';

    beforeEach(() => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === 'code') return mockCode;
        return null;
      });
    });

    it('shows error message when API returns null', async () => {
      mockGetApplicationStatus.mockResolvedValue(null);

      render(<ConfirmacionPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/no encontrada|error|inválido/i)
        ).toBeInTheDocument();
      });
    });

    it('shows loading state while fetching', () => {
      // Make the API call hang
      mockGetApplicationStatus.mockImplementation(
        () => new Promise(() => {})
      );

      render(<ConfirmacionPage />);

      // Should show the code while loading (the skeleton is inside the card)
      // The page renders immediately with the code from URL
      expect(screen.getByText(mockCode)).toBeInTheDocument();

      // Should show loading skeleton for status (animate-pulse class)
      const skeletonElement = document.querySelector('.animate-pulse');
      expect(skeletonElement).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    const mockCode = 'BC-2025-NAV123';

    beforeEach(() => {
      global.mockSearchParamsGet.mockImplementation((param: string) => {
        if (param === 'code') return mockCode;
        return null;
      });

      mockGetApplicationStatus.mockResolvedValue({
        code: mockCode,
        status: 'submitted',
        submitted_at: '2025-03-03T10:00:00Z',
        evaluated_at: null,
        status_history: [],
      });
    });

    it('has a button to go back to home', async () => {
      render(<ConfirmacionPage />);

      await waitFor(() => {
        const homeButton = screen.getByRole('button', {
          name: /inicio|volver|home/i,
        });
        expect(homeButton).toBeInTheDocument();
      });
    });
  });
});
