/// <reference types="jest" />
/**
 * EleccionEquipoClient — ruta `/eleccion-equipo/[token]`.
 *
 * Cubre los caminos que importan: la lista, el "equipo en preparación"
 * (`units: []`, que NO es un error), abrir la galería, confirmar con éxito, el
 * 409 de la unidad que otro se llevó, el enlace vencido y el reingreso de quien
 * ya eligió.
 *
 * `jest.spyOn` sobre imports de módulo NO funciona en este repo (Next 16/SWC
 * compila los exports como propiedades no configurables), así que se mockea el
 * módulo completo — mismo patrón que `EntregaClient.test.tsx`.
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

jest.mock('@/app/prototipos/0.6/services/eleccionEquipoApi', () => {
  const real = jest.requireActual('@/app/prototipos/0.6/services/eleccionEquipoApi');
  return { ...real, getEleccion: jest.fn(), elegirUnidad: jest.fn() };
});

const mockTrack = jest.fn();
jest.mock('../eleccionEvents', () => ({
  eleccionEvents: () => ({ track: mockTrack }),
}));

import {
  getEleccion,
  elegirUnidad,
} from '@/app/prototipos/0.6/services/eleccionEquipoApi';
import { EleccionEquipoClient } from '../EleccionEquipoClient';

const mockGet = getEleccion as jest.Mock;
const mockPost = elegirUnidad as jest.Mock;

const unidad = (n: number) => ({
  unit_id: 100 + n,
  display_number: n,
  grado: 'A',
  grado_label: 'Excelente estado',
  photos: [
    { url: `https://s3/foto-${n}-1.jpg`, label: 'Tapa' },
    { url: `https://s3/foto-${n}-2.jpg`, label: 'Teclado' },
  ],
  video_url: `https://s3/video-${n}.mp4`,
});

const datos = {
  application: { monthly_payment: 55, link_expires_at: '2026-08-26T15:30:00' },
  product: { product_id: 9, sku: 'MBA-M1', name: 'MacBook Air M1', slug: 'macbook-air-m1' },
  units: [unidad(1), unidad(2), unidad(3)],
  selected_unit_id: null,
};

/** Nombres de evento tal como los emitió el componente. */
const tiposEmitidos = () => mockTrack.mock.calls.map((c) => c[0]);

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
  mockTrack.mockReset();
});

describe('lista de unidades', () => {
  it('muestra el modelo, la cuota y una card por unidad', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);

    expect(await screen.findByText(/Elige tu MacBook Air M1/)).toBeInTheDocument();
    expect(screen.getByText(/S\/ 55\/mes/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unidad 01/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unidad 03/ })).toBeInTheDocument();
  });

  it('nunca muestra el serial ni bullets de detalle estético', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    // El backend ni siquiera manda `serial`; esto es la red de seguridad de
    // que nadie lo reintroduzca por otra vía.
    expect(screen.queryByText(/serial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/detalle estético/i)).not.toBeInTheDocument();
  });

  it('emite link_open una sola vez, con la cantidad de unidades', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    const aperturas = mockTrack.mock.calls.filter(
      (c) => c[0] === 'equipment_selection_link_open',
    );
    expect(aperturas).toHaveLength(1);
    expect(aperturas[0][1]).toEqual({ units_count: 3 });
  });
});

describe('units: [] — el equipo se está preparando', () => {
  it('no es un error: dice que el enlace sigue sirviendo', async () => {
    mockGet.mockResolvedValue({ ...datos, units: [] });
    render(<EleccionEquipoClient token="tok" />);

    expect(await screen.findByText(/Estamos preparando tu equipo/)).toBeInTheDocument();
    expect(screen.getByText(/Guarda este enlace/)).toBeInTheDocument();
    // Ni "venció" ni "no es válido": el link está vivo.
    expect(screen.queryByText(/venció/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no es válido/i)).not.toBeInTheDocument();
    expect(tiposEmitidos()).toContain('equipment_selection_empty');
  });
});

describe('galería', () => {
  it('abre la galería de la unidad tocada y emite gallery_open', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 02/ }));

    const dialogo = await screen.findByRole('dialog');
    expect(dialogo).toHaveAccessibleName('Unidad 02');
    expect(screen.getByRole('button', { name: /Elegir esta unidad/ })).toBeInTheDocument();

    const abiertas = mockTrack.mock.calls.filter(
      (c) => c[0] === 'equipment_selection_gallery_open',
    );
    expect(abiertas[0][1]).toEqual({
      unit_id: 102, display_number: 2, photos_count: 2, has_video: true,
    });
  });

  it('mete el foco en el diálogo, atrapa el Tab y bloquea el scroll del body', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    const dialogo = await screen.findByRole('dialog');

    // Declarar `aria-modal` sin llevar el foco adentro es peor que no
    // declararlo: la lista de atrás queda tabulable igual.
    expect(document.activeElement).toBe(dialogo);
    expect(document.body.style.overflow).toBe('hidden');

    // Shift+Tab desde el propio diálogo envuelve al último enfocable de adentro,
    // en vez de salirse a las cards.
    const enfocables = dialogo.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video[controls]');
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(enfocables[enfocables.length - 1]);
  });

  it('al cerrar devuelve el foco a la card y libera el scroll', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    const card = screen.getByRole('button', { name: /Unidad 01/ });
    await userEvent.click(card);
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).toBe(card);
    expect(document.body.style.overflow).toBe('');
  });

  it('reabrir una galería limpia el aviso anterior', async () => {
    mockGet.mockResolvedValue(datos);
    mockPost.mockResolvedValue({ reason: 'unit_unavailable', error: 'x' });
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Elegir esta unidad/ }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/Alguien eligió/i));

    await userEvent.click(screen.getByRole('button', { name: /Unidad 02/ }));

    // Ya siguió adelante: el aviso cumplió y dejarlo pegado es ruido.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('cambiar de foto emite photo_change con el índice', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);
    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await screen.findByRole('dialog');

    // El nombre accesible del thumb es el alt de la foto + su etiqueta.
    await userEvent.click(screen.getByRole('button', { name: /Teclado/ }));

    const cambios = mockTrack.mock.calls.filter(
      (c) => c[0] === 'equipment_selection_photo_change',
    );
    expect(cambios[0][1]).toEqual({ unit_id: 101, photo_index: 1 });
  });

  it('tocar la foto que ya está en el visor no emite photo_change', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);
    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await screen.findByRole('dialog');

    await userEvent.click(screen.getByRole('button', { name: /Teclado/ }));
    await userEvent.click(screen.getByRole('button', { name: /Teclado/ }));

    // Dos toques, un solo cambio real: contar el segundo infla la métrica.
    expect(
      mockTrack.mock.calls.filter((c) => c[0] === 'equipment_selection_photo_change'),
    ).toHaveLength(1);
  });
});

describe('navegar entre unidades sin cerrar la galería', () => {
  it('siguiente cambia la unidad mostrada y emite gallery_open con sus datos', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    const dialogo = await screen.findByRole('dialog');
    expect(dialogo).toHaveAccessibleName('Unidad 01');

    await userEvent.click(screen.getByRole('button', { name: 'Unidad siguiente' }));

    expect(dialogo).toHaveAccessibleName('Unidad 02');
    const abiertas = mockTrack.mock.calls.filter(
      (c) => c[0] === 'equipment_selection_gallery_open',
    );
    // Una por el open inicial y otra por la navegación: para la analítica,
    // navegar a otra unidad es, conceptualmente, abrir su galería.
    expect(abiertas).toHaveLength(2);
    expect(abiertas[1][1]).toEqual({
      unit_id: 102, display_number: 2, photos_count: 2, has_video: true,
    });
  });

  it('en la primera unidad, "Unidad anterior" está aria-disabled', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Unidad anterior' })).toHaveAttribute(
      'aria-disabled', 'true',
    );
    expect(screen.getByRole('button', { name: 'Unidad siguiente' })).toHaveAttribute(
      'aria-disabled', 'false',
    );
  });

  it('en la última unidad, "Unidad siguiente" está aria-disabled', async () => {
    mockGet.mockResolvedValue(datos);
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 03/ }));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Unidad siguiente' })).toHaveAttribute(
      'aria-disabled', 'true',
    );
  });
});

describe('confirmar la elección', () => {
  it('reserva la unidad y muestra los próximos pasos', async () => {
    mockGet.mockResolvedValue(datos);
    mockPost.mockResolvedValue({ status: 'selected', unit: unidad(2) });
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 02/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Elegir esta unidad/ }));

    expect(await screen.findByText(/¡Listo!/)).toBeInTheDocument();
    expect(screen.getByText(/Próximos pasos/)).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith('tok', 102);
    expect(tiposEmitidos()).toEqual(
      expect.arrayContaining([
        'equipment_selection_click',
        'equipment_selection_confirmed',
      ]),
    );
  });

  it('409 unit_unavailable: refresca la lista y lo dice sin dramatizar', async () => {
    mockGet.mockResolvedValue(datos);
    mockPost.mockResolvedValue({
      reason: 'unit_unavailable', error: 'Esa unidad ya no está disponible.',
    });
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    // La lista que devuelve el refresco ya no trae la unidad que otro se llevó.
    mockGet.mockResolvedValue({ ...datos, units: [unidad(2), unidad(3)] });
    await userEvent.click(await screen.findByRole('button', { name: /Elegir esta unidad/ }));

    // La región live ya está montada desde antes (por eso `waitFor` sobre el
    // texto y no `findByRole`): una que nace junto con su contenido no se
    // anuncia de forma confiable.
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/Alguien eligió esa unidad/i));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
    // El refresco NO pasa por "Cargando...": el chrome nunca se desmonta.
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Unidad 01/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unidad 02/ })).toBeInTheDocument();

    const errores = mockTrack.mock.calls.filter((c) => c[0] === 'equipment_selection_error');
    expect(errores[0][1]).toEqual({ unit_id: 101, reason: 'unit_unavailable' });
  });

  it('un fallo de red deja la galería abierta para reintentar', async () => {
    mockGet.mockResolvedValue(datos);
    mockPost.mockResolvedValue({ reason: 'network', error: 'No pudimos conectarnos.' });
    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);

    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Elegir esta unidad/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/No pudimos conectarnos/);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('si cierra la galería mientras el POST viaja y falla, el error igual se ve', async () => {
    // El peor desenlace posible: la reserva NO ocurrió y el cliente se queda
    // creyendo que sí porque el error se escribió en un componente desmontado.
    mockGet.mockResolvedValue(datos);
    let resolver: (v: unknown) => void = () => {};
    mockPost.mockReturnValue(new Promise((r) => { resolver = r; }));

    render(<EleccionEquipoClient token="tok" />);
    await screen.findByText(/Elige tu MacBook Air M1/);
    await userEvent.click(screen.getByRole('button', { name: /Unidad 01/ }));
    await userEvent.click(await screen.findByRole('button', { name: /Elegir esta unidad/ }));

    // Se va de la galería con el POST todavía en vuelo.
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(async () => {
      resolver({ reason: 'network', error: 'No pudimos conectarnos.' });
    });

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/No pudimos reservar esa unidad/i));
  });
});

describe('reingreso de quien ya eligió', () => {
  it('muestra su unidad, no un enlace inválido', async () => {
    mockGet.mockResolvedValue({
      ...datos, units: [unidad(2)], selected_unit_id: 102,
    });
    render(<EleccionEquipoClient token="tok" />);

    expect(await screen.findByText(/¡Listo!/)).toBeInTheDocument();
    // Aparece dos veces a propósito: en el "Elegiste la ..." y en el resumen.
    expect(screen.getAllByText('Unidad 02').length).toBeGreaterThan(0);
    expect(screen.getByText('Unidad elegida')).toBeInTheDocument();
    expect(tiposEmitidos()).toContain('equipment_selection_already_chosen');
  });
});

describe('enlaces que ya no sirven', () => {
  it.each(['expired', 'revoked', 'consumed', 'inactive'])(
    'con enlace %s ofrece pedir uno nuevo y emite link_expired',
    async (reason) => {
      mockGet.mockResolvedValue({ reason, error: 'x' });
      render(<EleccionEquipoClient token="tok" />);

      expect(await screen.findByText(/Este enlace venció/i)).toBeInTheDocument();
      expect(tiposEmitidos()).toContain('equipment_selection_link_expired');
    },
  );

  it.each(['invalid', 'purpose_mismatch', 'not_found', 'lo_que_sea'])(
    'con reason %s da el mismo copy, sin delatar si la solicitud existe',
    async (reason) => {
      mockGet.mockResolvedValue({ reason, error: 'x' });
      render(<EleccionEquipoClient token="tok" />);

      expect(await screen.findByText(/no es válido/i)).toBeInTheDocument();
      // Un link muerto tiene que dejar rastro: sin evento, la visita es
      // invisible y "cuántos abren y dónde se caen" queda sin respuesta.
      const errores = mockTrack.mock.calls.filter(
        (c) => c[0] === 'equipment_selection_error',
      );
      expect(errores[0][1]).toEqual({ reason });
    },
  );

  it('invalid_status tiene su propio copy y también deja rastro', async () => {
    mockGet.mockResolvedValue({ reason: 'invalid_status', error: 'x' });
    render(<EleccionEquipoClient token="tok" />);

    expect(await screen.findByText(/cambió de estado/i)).toBeInTheDocument();
    const errores = mockTrack.mock.calls.filter(
      (c) => c[0] === 'equipment_selection_error',
    );
    expect(errores[0][1]).toEqual({ reason: 'invalid_status' });
  });

  it('ofrece reintentar si falla la red', async () => {
    mockGet.mockResolvedValue({ reason: 'network', error: 'x' });
    render(<EleccionEquipoClient token="tok" />);

    const boton = await screen.findByRole('button', { name: /Reintentar/i });
    mockGet.mockResolvedValue(datos);
    await userEvent.click(boton);

    expect(await screen.findByText(/Elige tu MacBook Air M1/)).toBeInTheDocument();
  });
});
