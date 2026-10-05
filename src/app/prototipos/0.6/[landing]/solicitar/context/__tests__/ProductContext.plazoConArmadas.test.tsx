/**
 * Elegir el plazo elige tambien como se paga la inicial.
 *
 * En Family Farms cada celda de pricing es un plazo Y una modalidad, asi que el
 * selector ofrece «17 semanas · 4 armadas» como una opcion distinta de
 * «17 semanas · 1 pago». El valor que viaja sigue siendo el `term` —las cuotas—,
 * pero el producto tiene que quedarse con las armadas de la celda elegida: es lo
 * que despues sale en el submit como `initial_installments`.
 */

import { render, screen, act } from '@testing-library/react';
import { ProductProvider, useProduct, type SelectedProduct } from '../ProductContext';

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
  useParams: () => ({ landing: 'family-farms-baldecash-c' }),
}));

function plan(term: number, armadas: number, cuota: number) {
  return {
    term,
    termMonths: null,
    options: [
      {
        initialPercent: 25,
        initialAmount: 500,
        monthlyQuota: cuota,
        initialInstallments: armadas,
      },
    ],
  };
}

/** Las seis celdas reales del cosechador. */
const cosechador: SelectedProduct = {
  id: 'ff-1',
  name: 'Redmi Note 14',
  shortName: 'Redmi Note 14',
  brand: 'Xiaomi',
  price: 2000,
  monthlyPayment: 105,
  months: 4,
  term: 17,
  initialPercent: 25,
  initialAmount: 500,
  initialInstallments: 1,
  image: '',
  paymentFrequency: 'semanal',
  paymentPlans: [
    plan(6, 4, 260), plan(8, 2, 200), plan(10, 1, 160),
    plan(13, 4, 125), plan(15, 2, 110), plan(17, 1, 100),
  ],
} as SelectedProduct;

function Probe({ term }: { term: number }) {
  const { selectedProduct, setSelectedProduct, updateAllProductsToTerm, getAvailableTerms } = useProduct();
  return (
    <div>
      <span data-testid="terms">{getAvailableTerms().join(',')}</span>
      <span data-testid="term">{String(selectedProduct?.term ?? '')}</span>
      <span data-testid="armadas">{String(selectedProduct?.initialInstallments ?? '')}</span>
      <span data-testid="cuota">{String(selectedProduct?.monthlyPayment ?? '')}</span>
      <button onClick={() => setSelectedProduct(cosechador)}>cargar</button>
      <button onClick={() => updateAllProductsToTerm(term)}>elegir</button>
    </div>
  );
}

function montar(term: number) {
  render(
    <ProductProvider landingSlug="family-farms-baldecash-c">
      <Probe term={term} />
    </ProductProvider>
  );
  act(() => {
    screen.getByText('cargar').click();
  });
}

beforeEach(() => {
  localStorage.clear();
});

test('el selector ofrece una opcion por celda, no los plazos agrupados', () => {
  montar(13);
  // Seis celdas, seis opciones: el rotulo las agrupa por plazo total, el valor no.
  expect(screen.getByTestId('terms')).toHaveTextContent('6,8,10,13,15,17');
});

test('elegir 17 semanas en 4 armadas resuelve el plan de 13 cuotas', () => {
  montar(13);

  act(() => {
    screen.getByText('elegir').click();
  });

  expect(screen.getByTestId('term')).toHaveTextContent('13');
  expect(screen.getByTestId('cuota')).toHaveTextContent('125');
});

test('el producto se queda con las armadas de la celda elegida', () => {
  // Arranca en pago unico (17 cuotas) y pasa a 4 armadas (13 cuotas). Sin esto,
  // al submit viajaba `initial_installments: 1` y legacy no generaba las armadas.
  montar(13);

  act(() => {
    screen.getByText('elegir').click();
  });

  expect(screen.getByTestId('armadas')).toHaveTextContent('4');
});

test('volver al pago unico devuelve las armadas a 1', () => {
  montar(17);

  act(() => {
    screen.getByText('elegir').click();
  });

  expect(screen.getByTestId('term')).toHaveTextContent('17');
  expect(screen.getByTestId('armadas')).toHaveTextContent('1');
});
