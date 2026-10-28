/**
 * BAL-5210 — `institution_search`: qué busca la persona en institución y
 * carrera, cuántos resultados le salieron y si terminó eligiendo algo.
 *
 * Se registra cuando deja de escribir 1 s o sale del campo con una búsqueda
 * pendiente; nunca en cada tecla ni dos veces la misma consulta seguida.
 */
import { renderHook, act } from '@testing-library/react';

const mockTrack = jest.fn();
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { useInstitutionSearchTracking, ESPERA_BUSQUEDA_MS } from '../useInstitutionSearchTracking';

function montar(opts: { activo?: boolean; diseno?: 1 | 2; campo?: string } = {}) {
  return renderHook(() =>
    useInstitutionSearchTracking(opts.campo ?? 'institution', {
      activo: opts.activo ?? true,
      diseno: opts.diseno ?? 2,
    }),
  ).result;
}

const busquedas = () => mockTrack.mock.calls.filter((c) => c[0] === 'institution_search');

beforeEach(() => {
  jest.useFakeTimers();
  mockTrack.mockClear();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('useInstitutionSearchTracking (BAL-5210)', () => {
  it('no emite en cada tecla: emite una vez, 1 s después de la última', () => {
    const r = montar();
    act(() => {
      r.current.alEscribir('cib');
      r.current.alLlegarResultados('cib', 4);
      jest.advanceTimersByTime(500);
      r.current.alEscribir('cibe');
      r.current.alLlegarResultados('cibe', 3);
      jest.advanceTimersByTime(500);
      r.current.alEscribir('ciber');
      r.current.alLlegarResultados('ciber', 1);
    });
    expect(busquedas()).toHaveLength(0);
    act(() => {
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    });
    expect(busquedas()).toEqual([
      ['institution_search', {
        field_name: 'institution',
        query: 'ciber',
        results_count: 1,
        selected_id: null,
        selected_label: null,
        searches_before_select: 1,
        diseno: 2,
      }, 'institution'],
    ]);
  });

  it('si los resultados llegan después del segundo, espera a que lleguen', () => {
    const r = montar();
    act(() => {
      r.current.alEscribir('cibertec');
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    });
    expect(busquedas()).toHaveLength(0);
    act(() => {
      r.current.alLlegarResultados('cibertec', 0);
    });
    expect(busquedas()).toHaveLength(1);
    expect(busquedas()[0][1]).toMatchObject({ query: 'cibertec', results_count: 0 });
  });

  it('al salir con una búsqueda pendiente la emite sin esperar el segundo', () => {
    const r = montar({ diseno: 1 });
    act(() => {
      r.current.alEscribir('pucp');
      r.current.alLlegarResultados('pucp', 2);
      r.current.alSalir();
    });
    expect(busquedas()).toHaveLength(1);
    expect(busquedas()[0][1]).toMatchObject({ query: 'pucp', results_count: 2, selected_id: null, diseno: 1 });
    // Y el temporizador ya no la repite.
    act(() => {
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS * 2);
    });
    expect(busquedas()).toHaveLength(1);
  });

  it('salir sin búsqueda pendiente no emite nada', () => {
    const r = montar();
    act(() => {
      r.current.alSalir();
    });
    expect(busquedas()).toHaveLength(0);
  });

  it('no emite dos veces la misma consulta seguida (recortada, sin importar mayúsculas)', () => {
    const r = montar();
    act(() => {
      r.current.alEscribir('upc');
      r.current.alLlegarResultados('upc', 2);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
      r.current.alEscribir('UPC ');
      r.current.alLlegarResultados('UPC ', 2);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    });
    expect(busquedas()).toHaveLength(1);
  });

  it('recorta la consulta y la corta a 50 caracteres', () => {
    const r = montar();
    const larga = `  ${'x'.repeat(80)}  `;
    act(() => {
      r.current.alEscribir(larga);
      r.current.alLlegarResultados(larga, 0);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    });
    expect(busquedas()[0][1].query).toBe('x'.repeat(50));
  });

  it('al elegir emite uno con la opción y cuántas búsquedas hizo antes', () => {
    const r = montar({ campo: 'career' });
    act(() => {
      r.current.alEscribir('ingenieria sis');
      r.current.alLlegarResultados('ingenieria sis', 0);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
      r.current.alEscribir('sistemas');
      r.current.alLlegarResultados('sistemas', 5);
      // Elige antes del segundo: esa búsqueda también cuenta.
      r.current.alElegir('77', 'Ingeniería de Sistemas');
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS * 2);
    });
    expect(busquedas().map((c) => c[1])).toEqual([
      expect.objectContaining({ field_name: 'career', query: 'ingenieria sis', results_count: 0, selected_id: null, searches_before_select: 1 }),
      {
        field_name: 'career',
        query: 'sistemas',
        results_count: 5,
        selected_id: '77',
        selected_label: 'Ingeniería de Sistemas',
        searches_before_select: 2,
        diseno: 2,
      },
    ]);
  });

  it('elegir después de una búsqueda ya registrada no la cuenta dos veces', () => {
    const r = montar();
    act(() => {
      r.current.alEscribir('senati');
      r.current.alLlegarResultados('senati', 1);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
      r.current.alElegir('16', 'SENATI');
    });
    expect(busquedas().map((c) => c[1].searches_before_select)).toEqual([1, 1]);
    expect(busquedas()[1][1]).toMatchObject({ query: 'senati', selected_id: '16' });
  });

  it('después de elegir, la cuenta vuelve a empezar', () => {
    const r = montar();
    act(() => {
      r.current.alEscribir('senati');
      r.current.alLlegarResultados('senati', 1);
      r.current.alElegir('16', 'SENATI');
      r.current.alEscribir('senati');
      r.current.alLlegarResultados('senati', 1);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
    });
    expect(busquedas().map((c) => [c[1].selected_id, c[1].searches_before_select])).toEqual([['16', 1], [null, 1]]);
  });

  it('elegir sin haber buscado no emite (valor puesto por el sistema)', () => {
    const r = montar();
    act(() => {
      r.current.alElegir('16', 'SENATI');
    });
    expect(busquedas()).toHaveLength(0);
  });

  it('apagado no emite nada', () => {
    const r = montar({ activo: false });
    act(() => {
      r.current.alEscribir('upc');
      r.current.alLlegarResultados('upc', 2);
      jest.advanceTimersByTime(ESPERA_BUSQUEDA_MS);
      r.current.alElegir('1', 'UPC');
    });
    expect(mockTrack).not.toHaveBeenCalled();
  });
});
