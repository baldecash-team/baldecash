/**
 * BAL-5277 — eventos de la dirección: sugerencias de Google o a mano,
 * «Usar mi ubicación actual», mapa y ubigeo. Nunca la dirección ni
 * coordenadas; nunca por tecla.
 */
import { renderHook, act } from '@testing-library/react';

const mockTrack = jest.fn();
jest.mock('../../context/EventTrackerContext', () => ({
  useEventTrackerOptional: () => ({ track: mockTrack, flush: jest.fn() }),
}));

import { useAddressTracking, ESPERA_SUGERENCIAS_MS, resultadoDeErrorGeo } from '../useAddressTracking';

let input: HTMLInputElement;

function montar(diseno: 1 | 2 = 2) {
  const inputRef = { current: input };
  return renderHook(() => useAddressTracking({ fieldName: 'address', diseno, inputRef })).result;
}

/** Lista de Google como la arma Places: en <body>, con .pac-item. */
function listaDeGoogle(n: number, marcada = -1) {
  const c = document.createElement('div');
  c.className = 'pac-container';
  for (let i = 0; i < n; i++) {
    const it = document.createElement('div');
    it.className = i === marcada ? 'pac-item pac-item-selected' : 'pac-item';
    it.textContent = `Calle ${i}`;
    c.appendChild(it);
  }
  document.body.appendChild(c);
  return c;
}

const eventos = () => mockTrack.mock.calls.map((c) => [c[0], c[1]]);

beforeEach(() => {
  jest.useFakeTimers();
  mockTrack.mockClear();
  document.body.innerHTML = '';
  input = document.createElement('input');
  document.body.appendChild(input);
  input.focus();
});
afterEach(() => jest.useRealTimers());

describe('useAddressTracking (BAL-5277)', () => {
  it('sugerencias: una vez por entrada al campo, 1 s después de la última tecla', () => {
    const r = montar();
    listaDeGoogle(5);
    act(() => {
      r.current.alEnfocar();
      r.current.alEscribir();
      jest.advanceTimersByTime(300);
      r.current.alEscribir();
      jest.advanceTimersByTime(300);
      r.current.alEscribir();
    });
    expect(eventos()).toEqual([]);
    act(() => {
      jest.advanceTimersByTime(ESPERA_SUGERENCIAS_MS);
      r.current.alEscribir();
      jest.advanceTimersByTime(ESPERA_SUGERENCIAS_MS * 3);
    });
    expect(eventos()).toEqual([['address_suggestions_shown', { field_name: 'address', cantidad: 5, diseno: 2 }]]);
  });

  it('elige una sugerencia con el dedo: posición y cantidad, y no cuenta como «a mano»', () => {
    const r = montar(1);
    const lista = listaDeGoogle(4);
    act(() => {
      r.current.alEnfocar();
      r.current.alEscribir();
      jest.advanceTimersByTime(ESPERA_SUGERENCIAS_MS);
    });
    act(() => {
      lista.querySelectorAll('.pac-item')[2].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      r.current.alSalir(); // el input pierde el foco antes del place_changed
      r.current.alElegirSugerencia();
      jest.advanceTimersByTime(1000);
    });
    expect(eventos()).toEqual([
      ['address_suggestions_shown', { field_name: 'address', cantidad: 4, diseno: 1 }],
      ['address_suggestion_selected', { field_name: 'address', posicion: 3, cantidad: 4, diseno: 1 }],
    ]);
  });

  it('elige con flechas + Enter: toma la sugerencia marcada', () => {
    const r = montar();
    listaDeGoogle(5, 1);
    act(() => {
      r.current.alEnfocar();
      r.current.alEscribir();
      r.current.alTecla({ key: 'Enter' });
      r.current.alElegirSugerencia();
    });
    expect(eventos()).toContainEqual(['address_suggestion_selected', { field_name: 'address', posicion: 2, cantidad: 5, diseno: 2 }]);
  });

  it('escribe y sale sin elegir: `address_typed_manual` con el largo, sin el texto', () => {
    const r = montar();
    act(() => {
      r.current.alEnfocar();
      input.value = 'Av. Siempre Viva 742 ';
      r.current.alEscribir();
      r.current.alSalir();
      jest.advanceTimersByTime(1000);
    });
    expect(eventos()).toEqual([
      ['address_typed_manual', { field_name: 'address', largo: 20, sugerencias_vistas: false, diseno: 2 }],
    ]);
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain('Siempre');
  });

  it('entra y sale sin escribir: no registra nada', () => {
    const r = montar();
    act(() => {
      r.current.alEnfocar();
      r.current.alSalir();
      jest.advanceTimersByTime(1000);
    });
    expect(eventos()).toEqual([]);
  });

  it('mapa: abrir, mover el pin (una vez), confirmar y cerrar', () => {
    const r = montar();
    act(() => {
      r.current.alAbrirMapa('mapa');
      r.current.alMoverPin();
      r.current.alMoverPin();
      r.current.alMoverPin();
      r.current.alCerrarMapa(true);
    });
    expect(eventos()).toEqual([
      ['address_map_open', { field_name: 'address', pantalla: 'mapa', diseno: 2 }],
      ['address_map_pin_move', { field_name: 'address', diseno: 2 }],
      ['address_map_confirm', { field_name: 'address', pin_movido: true, diseno: 2 }],
      ['address_map_close', { field_name: 'address', confirmado: true, diseno: 2 }],
    ]);
  });

  it('mapa cerrado sin confirmar; reabrir vuelve a contar el pin', () => {
    const r = montar();
    act(() => {
      r.current.alAbrirMapa('permiso');
      r.current.alCerrarMapa(false);
      r.current.alCerrarMapa(false); // cierre doble: no duplica
      r.current.alAbrirMapa('mapa');
      r.current.alMoverPin();
    });
    expect(eventos().map((e) => e[0])).toEqual([
      'address_map_open',
      'address_map_close',
      'address_map_open',
      'address_map_pin_move',
    ]);
    expect(eventos()[1][1]).toEqual({ field_name: 'address', confirmado: false, diseno: 2 });
  });

  it('geolocalización y ubigeo', () => {
    const r = montar(1);
    act(() => {
      r.current.alGeolocalizar('boton', 'negado');
      r.current.alGeolocalizar('modal', 'error', 'tiempo');
      r.current.alAutollenarUbigeo('sugerencia', { departamento: true, provincia: true, distrito: false });
    });
    expect(eventos()).toEqual([
      ['address_geolocate', { field_name: 'address', resultado: 'negado', origen: 'boton', diseno: 1 }],
      ['address_geolocate', { field_name: 'address', resultado: 'error', origen: 'modal', motivo: 'tiempo', diseno: 1 }],
      ['address_ubigeo_autofill', {
        field_name: 'address', completo: false, departamento: true, provincia: true, distrito: false, origen: 'sugerencia', diseno: 1,
      }],
    ]);
  });

  it('traduce el error del navegador', () => {
    expect(resultadoDeErrorGeo({ code: 1 })).toEqual({ resultado: 'negado' });
    expect(resultadoDeErrorGeo({ code: 2 })).toEqual({ resultado: 'error', motivo: 'sin_senal' });
    expect(resultadoDeErrorGeo({ code: 3 })).toEqual({ resultado: 'error', motivo: 'tiempo' });
  });
});
