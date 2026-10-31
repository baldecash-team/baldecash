/**
 * BAL-5407: la confirmación mostraba el `product.name` interno que trae
 * `/status` («PM1503CDA») en vez del nombre de la card del catálogo.
 */
import { nombreDelEquipo } from '../nombreDelEquipo';
import {
  guardarNombresDelEnvio,
  leerNombresDelEnvio,
  nombreParaConfirmacion,
} from '../nombresDelEnvio';
import { buildReceivedData } from '../../confirmacion/confirmacionClient';
import type { ApplicationStatusData } from '../../confirmacion/types/applicationStatus';

const CARD = 'Laptop PM1503CDA R5 16GB 512GB';
const INTERNO = 'PM1503CDA';

describe('nombreDelEquipo', () => {
  it('usa el nombre de la card (`name`), no el corto', () => {
    expect(nombreDelEquipo({ name: CARD, shortName: INTERNO })).toBe(CARD);
  });

  it('sin `name` cae al corto; sin nada, vacío', () => {
    expect(nombreDelEquipo({ name: '', shortName: INTERNO })).toBe(INTERNO);
    expect(nombreDelEquipo({ shortName: INTERNO })).toBe(INTERNO);
    expect(nombreDelEquipo(null)).toBe('');
  });
});

describe('guardar / leer nombres del envío', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('devuelve lo guardado solo para el mismo código', () => {
    guardarNombresDelEnvio('prueba-formulario', 'APP-2026-1', [{ name: CARD, shortName: INTERNO, variantId: '77' }]);

    expect(leerNombresDelEnvio('prueba-formulario', 'APP-2026-1')).toEqual([{ nombre: CARD, variantId: '77' }]);
    expect(leerNombresDelEnvio('prueba-formulario', 'APP-2026-2')).toBeNull();
    expect(leerNombresDelEnvio('otra-landing', 'APP-2026-1')).toBeNull();
  });

  it('sin código o sin nombres no guarda nada', () => {
    guardarNombresDelEnvio('prueba-formulario', null, [{ name: CARD }]);
    guardarNombresDelEnvio('prueba-formulario', 'APP-2026-1', [{ name: '', shortName: '' }]);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('un JSON roto no rompe: devuelve null', () => {
    window.sessionStorage.setItem('baldecash-prueba-formulario-nombres-del-envio', '{roto');
    expect(leerNombresDelEnvio('prueba-formulario', 'APP-2026-1')).toBeNull();
  });
});

describe('nombreParaConfirmacion', () => {
  const delStatus = { name: INTERNO, variant: { id: 77 } };

  it('prefiere el display_name del backend si viene', () => {
    expect(nombreParaConfirmacion({ ...delStatus, display_name: 'Desde ws2' }, 1, [{ nombre: CARD }])).toBe('Desde ws2');
  });

  it('un equipo de cada lado: usa el de la card', () => {
    expect(nombreParaConfirmacion({ name: INTERNO }, 1, [{ nombre: CARD }])).toBe(CARD);
  });

  it('varios equipos: empareja por variante y, si no puede, deja el del /status', () => {
    const enviados = [{ nombre: 'Otro', variantId: '5' }, { nombre: CARD, variantId: '77' }];
    expect(nombreParaConfirmacion(delStatus, 2, enviados)).toBe(CARD);
    expect(nombreParaConfirmacion({ name: INTERNO, variant: { id: 9 } }, 2, enviados)).toBe(INTERNO);
  });

  it('sin nada guardado (link abierto en otro equipo) deja el del /status', () => {
    expect(nombreParaConfirmacion(delStatus, 1, null)).toBe(INTERNO);
  });
});

describe('buildReceivedData con los nombres del envío', () => {
  const status = {
    code: 'APP-2026-1',
    status: 'pending',
    submitted_at: null,
    products: [{ name: INTERNO, image: null, quantity: 1, unit_price: 2999, final_price: 2999, monthly_quota: 199 }],
  } as ApplicationStatusData;

  it('la confirmación muestra el nombre de la card', () => {
    const data = buildReceivedData('APP-2026-1', status, new URLSearchParams(), [{ nombre: CARD }]);
    expect(data.products[0].name).toBe(CARD);
  });

  it('sin nombres guardados se queda con el del /status (como hasta hoy)', () => {
    const data = buildReceivedData('APP-2026-1', status, new URLSearchParams());
    expect(data.products[0].name).toBe(INTERNO);
  });
});
