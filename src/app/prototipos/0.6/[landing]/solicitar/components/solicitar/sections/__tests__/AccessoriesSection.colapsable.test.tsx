/**
 * Accesorios plegado en el segundo financiamiento.
 *
 * Cerrado por defecto para que el formulario embebido quede a la vista sin
 * scroll, pero el loader tiene que verse IGUAL estando plegado: si la cabecera
 * no dijera nada mientras carga, un bloque cerrado y mudo se lee como que la
 * sección está vacía.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let accesoriosDelApi: unknown[] = [];
let resuelveFetch: () => void = () => {};

jest.mock('next/navigation', () => ({
  useParams: () => ({ landing: 'renueva-tu-equipo-1' }),
}));
jest.mock('@/app/prototipos/0.6/services/landingApi', () => ({
  // `getLandingAccessories` real devuelve `Promise<ApiAccessory[]>` (el array
  // pelado, no `{ accessories, categories }`): así lo desenvuelve el propio
  // servicio antes de retornar. El componente hace `apiAccessories.length`
  // directo sobre el resultado, así que el mock tiene que resolver el array.
  getLandingAccessories: jest.fn(
    () =>
      new Promise((resolve) => {
        resuelveFetch = () => resolve(accesoriosDelApi);
      })
  ),
  resolveEcosistema: () => null,
}));
jest.mock('@/app/prototipos/0.6/context/PreviewContext', () => ({
  usePreview: () => ({ isPreviewingLanding: () => false, previewKey: null }),
}));
jest.mock('../../../../context/WizardConfigContext', () => ({
  useWizardConfig: () => ({ config: {}, badgeText: '' }),
}));
jest.mock('../../../../context/SessionContext', () => ({
  useSessionOptional: () => null,
}));
jest.mock('@/app/prototipos/0.6/services/sessionApi', () => ({
  patchTrackingSession: jest.fn(),
}));
jest.mock('@/app/prototipos/0.6/analytics/useAnalytics', () => ({
  useAnalytics: () =>
    new Proxy({}, { get: () => jest.fn() }),
}));
jest.mock('../../../../context/ProductContext', () => ({
  useProduct: () => ({
    selectedAccessories: [],
    toggleAccessory: jest.fn(),
    setSelectedAccessories: jest.fn(),
    selectedProduct: { id: 1, name: 'Laptop Test', type: 'laptop', term: 24 },
    cartProducts: [],
    getAllProducts: () => [{ id: 1, name: 'Laptop Test', type: 'laptop', term: 24 }],
    setIsLoadingAccessories: jest.fn(),
  }),
}));

import { AccessoriesSection } from '../AccessoriesSection';
import { getLandingAccessories } from '@/app/prototipos/0.6/services/landingApi';

const mockGetLandingAccessories = getLandingAccessories as jest.Mock;

const UN_ACCESORIO = {
  id: 10,
  name: 'Mouse inalámbrico',
  category: { slug: 'perifericos', name: 'Periféricos' },
  monthlyQuota: 15,
};

beforeEach(() => {
  accesoriosDelApi = [UN_ACCESORIO];
});

// El componente dispara el fetch real recién a los 50ms del mount (debounce
// interno). `resuelveFetch` recién apunta a la promesa correcta después de esa
// llamada: si se invoca antes, resuelve un no-op y la carga queda colgada.
async function esperarQueElFetchArranque() {
  const llamadasPrevias = mockGetLandingAccessories.mock.calls.length;
  await waitFor(() => {
    expect(mockGetLandingAccessories.mock.calls.length).toBeGreaterThan(llamadasPrevias);
  });
}

describe('AccessoriesSection colapsable', () => {
  it('cerrado por defecto: no muestra el contenido', async () => {
    render(<AccessoriesSection colapsable />);
    await esperarQueElFetchArranque();
    resuelveFetch();
    expect(await screen.findByRole('button', { name: /accesorios/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar accesorio...')).not.toBeInTheDocument();
  });

  it('al abrirlo aparece el contenido', async () => {
    render(<AccessoriesSection colapsable />);
    await esperarQueElFetchArranque();
    resuelveFetch();
    const cabecera = await screen.findByRole('button', { name: /accesorios/i });
    await userEvent.click(cabecera);
    expect(await screen.findByPlaceholderText('Buscar accesorio...')).toBeInTheDocument();
  });

  it('cerrado y cargando: el loader se ve igual', () => {
    render(<AccessoriesSection colapsable />);
    // Sin resolver el fetch: sigue en isLoading.
    expect(screen.getByRole('status', { name: /cargando accesorios/i })).toBeInTheDocument();
  });

  it('sin `colapsable` se comporta como siempre: contenido a la vista', async () => {
    render(<AccessoriesSection />);
    await esperarQueElFetchArranque();
    resuelveFetch();
    expect(await screen.findByPlaceholderText('Buscar accesorio...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /accesorios/i })).not.toBeInTheDocument();
  });
});
