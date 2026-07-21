import { render, screen, act } from '@testing-library/react';
import { ProductProvider, useProduct } from '../ProductContext';

jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/[landing]/context/LayoutContext', () => ({
  useLayout: () => ({ layoutData: null }),
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'home' }),
}));

function Probe() {
  const { isLoadingAccessories, setIsLoadingAccessories } = useProduct();
  return (
    <div>
      <span data-testid="loading-state">{String(isLoadingAccessories)}</span>
      <button onClick={() => setIsLoadingAccessories(true)}>set-true</button>
    </div>
  );
}

test('isLoadingAccessories arranca en false y se puede setear a true', () => {
  render(
    <ProductProvider landingSlug="home">
      <Probe />
    </ProductProvider>
  );

  expect(screen.getByTestId('loading-state')).toHaveTextContent('false');

  act(() => {
    screen.getByText('set-true').click();
  });

  expect(screen.getByTestId('loading-state')).toHaveTextContent('true');
});
