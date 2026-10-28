/**
 * BAL-4959 · la parte pura de la guía de campos: a qué campo llevar y cuándo
 * señalar "Continuar". No depende de códigos de campo.
 */
import {
  siguientePendiente,
  campoPendiente,
  valorVacio,
  esDeLargoFijo,
  elegirDestinoContinuar,
  type CampoDeLaGuia,
} from '../useGuiaDeCampos';

const campo = (codigo: string, extra: Partial<CampoDeLaGuia> = {}): CampoDeLaGuia => ({
  codigo,
  obligatorio: true,
  vacio: false,
  valido: true,
  ...extra,
});

describe('siguientePendiente', () => {
  it('devuelve el primer obligatorio vacío', () => {
    const campos = [campo('a'), campo('b', { vacio: true }), campo('c', { vacio: true })];
    expect(siguientePendiente(campos)).toEqual({ tipo: 'campo', codigo: 'b' });
  });

  it('salta los opcionales vacíos', () => {
    const campos = [campo('opc', { obligatorio: false, vacio: true }), campo('x', { vacio: true })];
    expect(siguientePendiente(campos)).toEqual({ tipo: 'campo', codigo: 'x' });
  });

  it('un campo lleno pero inválido también está pendiente', () => {
    const campos = [campo('a', { valido: false }), campo('b', { vacio: true })];
    expect(siguientePendiente(campos)).toEqual({ tipo: 'campo', codigo: 'a' });
  });

  it('con todo completo señala Continuar', () => {
    const campos = [campo('a'), campo('b'), campo('opc', { obligatorio: false, vacio: true })];
    expect(siguientePendiente(campos)).toEqual({ tipo: 'continuar' });
  });

  it('sin campos señala Continuar', () => {
    expect(siguientePendiente([])).toEqual({ tipo: 'continuar' });
  });

  it('con despuesDe busca hacia abajo primero (goNextField)', () => {
    const campos = [campo('a', { vacio: true }), campo('doc'), campo('c', { vacio: true })];
    expect(siguientePendiente(campos, 'doc')).toEqual({ tipo: 'campo', codigo: 'c' });
  });

  it('con despuesDe y nada abajo, vuelve al primero pendiente de arriba', () => {
    const campos = [campo('a', { vacio: true }), campo('doc')];
    expect(siguientePendiente(campos, 'doc')).toEqual({ tipo: 'campo', codigo: 'a' });
  });
});

describe('valorVacio y campoPendiente', () => {
  it('cuenta como vacío lo que el formulario trata como no llenado', () => {
    expect(valorVacio(undefined)).toBe(true);
    expect(valorVacio('  ')).toBe(true);
    expect(valorVacio([])).toBe(true);
    expect(valorVacio('false')).toBe(true); // casilla sin marcar
    expect(valorVacio('70020010')).toBe(false);
    expect(valorVacio(['a'])).toBe(false);
  });

  it('opcional vacío no está pendiente', () => {
    expect(campoPendiente(campo('x', { obligatorio: false, vacio: true }))).toBe(false);
  });
});

describe('elegirDestinoContinuar (goFin: a dónde resaltar "Continuar")', () => {
  const elMock = (nombre: string) => ({ __nombre: nombre } as unknown as HTMLElement);

  it('el botón visible, si hay uno', () => {
    const escritorio = elMock('escritorio');
    const movil = elMock('movil');
    const visible = (el: HTMLElement) => el === movil;
    expect(elegirDestinoContinuar([escritorio, movil], visible, elMock('zona'))).toBe(movil);
  });

  it('con la barra de celular sin pintar, NO cae al botón de escritorio oculto: va a la zona de acciones', () => {
    const escritorioOculto = elMock('escritorio-oculto');
    const zona = elMock('zona-acciones');
    const ningunoVisible = () => false;
    expect(elegirDestinoContinuar([escritorioOculto], ningunoVisible, zona)).toBe(zona);
  });

  it('sin ningún botón y sin zona de acciones, no revienta: devuelve null', () => {
    expect(elegirDestinoContinuar([], () => false, null)).toBeNull();
  });
});

describe('esDeLargoFijo', () => {
  it('documento y celular por su tipo', () => {
    expect(esDeLargoFijo({ type: 'document_number' })).toBe(true);
    expect(esDeLargoFijo({ type: 'phone' })).toBe(true);
  });
  it('otro campo solo si mínimo y máximo coinciden', () => {
    expect(esDeLargoFijo({ type: 'text', min_length: 11, max_length: 11 })).toBe(true);
    expect(esDeLargoFijo({ type: 'text', min_length: 1, max_length: 100 })).toBe(false);
    expect(esDeLargoFijo({ type: 'email' })).toBe(false);
  });
});

describe('irAlPrimerErrorV2: el foco va al campo con error (BAL-4969, casuísticas)', () => {
  it('trae el campo a la vista y le da el foco al input, sin dejarlo en el botón', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { irAlPrimerErrorV2 } = require('../useGuiaDeCampos');
    document.body.innerHTML = `
      <div data-campo="email"><label for="email">Correo</label><input id="email" /></div>
      <button id="continuar">Continuar</button>`;
    // BAL-5206: `resaltar` ya no centra con scrollIntoView; desplaza lo justo.
    // En jsdom el campo mide 0 y queda "bajo la cabecera": hay que moverse.
    window.scrollBy = jest.fn() as unknown as typeof window.scrollBy;
    (document.getElementById('continuar') as HTMLElement).focus();
    irAlPrimerErrorV2('email');
    expect(document.activeElement).toBe(document.getElementById('email'));
    expect(window.scrollBy).toHaveBeenCalled();
  });
});
