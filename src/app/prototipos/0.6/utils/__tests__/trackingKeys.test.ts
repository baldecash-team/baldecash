import {
  capturarLlavesDelUrl,
  elegirLlaves,
  leerLlavesPendientes,
  limpiarLlavesPendientes,
  llavesActivas,
  quitarLlavesDelUrl,
  LLAVES_POR_DEFECTO,
} from '../trackingKeys';

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState({}, '', '/zona-estudiantes/catalogo/');
});

describe('capturarLlavesDelUrl', () => {
  it('guarda las llaves del URL por landing', () => {
    capturarLlavesDelUrl('ze', '?utm_campaign=x&rid=Abc12345&vip_auto=tok');
    expect(leerLlavesPendientes('ze')).toEqual({ utm_campaign: 'x', rid: 'Abc12345', vip_auto: 'tok' });
    expect(leerLlavesPendientes('otra')).toEqual({});
  });

  it('un URL sin llaves no borra lo que ya estaba guardado', () => {
    capturarLlavesDelUrl('ze', '?rid=Abc12345');
    capturarLlavesDelUrl('ze', '');
    expect(leerLlavesPendientes('ze')).toEqual({ rid: 'Abc12345' });
  });

  it('un link nuevo pisa la llave vieja', () => {
    capturarLlavesDelUrl('ze', '?rid=Abc12345');
    capturarLlavesDelUrl('ze', '?rid=Zzz99999');
    expect(leerLlavesPendientes('ze').rid).toBe('Zzz99999');
  });

  it('limpiar las borra', () => {
    capturarLlavesDelUrl('ze', '?rid=Abc12345');
    limpiarLlavesPendientes('ze');
    expect(leerLlavesPendientes('ze')).toEqual({});
  });

  it('lo guardado roto se lee como vacío', () => {
    sessionStorage.setItem('baldecash-llaves-pendientes-ze', '{no es json');
    expect(leerLlavesPendientes('ze')).toEqual({});
  });
});

describe('elegirLlaves / llavesActivas', () => {
  it('solo manda las llaves activas', () => {
    expect(elegirLlaves({ rid: 'a', utm_campaign: 'x', alk: 'b' }, ['rid', 'alk'])).toEqual({ rid: 'a', alk: 'b' });
  });

  it('lee las llaves del config o cae al default', () => {
    expect(llavesActivas({ tracking: { query_keys: ['rid', 'nueva'] } })).toEqual(['rid', 'nueva']);
    expect(llavesActivas({})).toEqual(LLAVES_POR_DEFECTO);
    expect(llavesActivas(null)).toEqual(LLAVES_POR_DEFECTO);
    expect(llavesActivas({ tracking: { query_keys: 'basura' } })).toEqual(LLAVES_POR_DEFECTO);
  });
});

describe('quitarLlavesDelUrl', () => {
  it('borra el rid y deja vip_auto, alk y las UTM', () => {
    window.history.replaceState({}, '', '/ze/catalogo/?utm_campaign=x&rid=Abc12345&vip_auto=tok&alk=C4');
    quitarLlavesDelUrl(['rid', 'vip_auto', 'alk']);
    expect(window.location.search).toBe('?utm_campaign=x&vip_auto=tok&alk=C4');
  });

  it('sin nada que quitar no toca el historial', () => {
    window.history.replaceState({}, '', '/ze/?utm_campaign=x');
    const espia = jest.spyOn(window.history, 'replaceState');
    quitarLlavesDelUrl(['rid']);
    expect(espia).not.toHaveBeenCalled();
    espia.mockRestore();
  });
});
