/**
 * Jest Setup File
 * Runs after Jest is initialized but before tests run
 */

// Import jest-dom matchers for DOM assertions
import '@testing-library/jest-dom';

// Mock Next.js router - use jest.fn() to allow overriding in tests
const mockRouterPush = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useParams: () => ({ landing: 'test-landing' }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
  usePathname: () => '',
}));

// Export mocks for use in tests
global.mockRouterPush = mockRouterPush;
global.mockSearchParamsGet = mockSearchParamsGet;

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Suppress console errors during tests (optional, remove if you want to see them)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });
