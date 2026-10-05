import {
  kycBypassHabilitado,
  persistUtmParams,
  readUtmParams,
  withUtmParams,
} from '../utmParams';

describe('readUtmParams', () => {
  it('lee los cinco UTM estándar', () => {
    expect(
      readUtmParams(
        '?utm_source=meta&utm_medium=cpc&utm_campaign=verano&utm_term=laptop&utm_content=a1',
      ),
    ).toEqual({
      utm_source: 'meta',
      utm_medium: 'cpc',
      utm_campaign: 'verano',
      utm_term: 'laptop',
      utm_content: 'a1',
    });
  });

  it('ignora parámetros que no son UTM', () => {
    expect(readUtmParams('?code=SOL-1&utm_source=meta&coupon=X')).toEqual({
      utm_source: 'meta',
    });
  });

  it('devuelve vacío si no hay ninguno', () => {
    expect(readUtmParams('?code=SOL-1')).toEqual({});
    expect(readUtmParams('')).toEqual({});
  });
});

describe('withUtmParams', () => {
  it('agrega los UTM a una URL sin querystring', () => {
    expect(withUtmParams('/copia-home/solicitar/confirmacion', '?utm_source=meta')).toBe(
      '/copia-home/solicitar/confirmacion?utm_source=meta',
    );
  });

  it('respeta el querystring que la URL ya trae', () => {
    expect(withUtmParams('/copia-home/solicitar/kyc?code=SOL-1', '?utm_source=meta')).toBe(
      '/copia-home/solicitar/kyc?code=SOL-1&utm_source=meta',
    );
  });

  // Sin esto quedaría un `?` colgando en la URL de todos los que entran directo.
  it('devuelve la URL intacta si no hay UTM', () => {
    expect(withUtmParams('/copia-home/solicitar/confirmacion', '?code=SOL-1')).toBe(
      '/copia-home/solicitar/confirmacion',
    );
  });

  it('conserva el hash al final', () => {
    expect(withUtmParams('/ruta#seccion', '?utm_source=meta')).toBe(
      '/ruta?utm_source=meta#seccion',
    );
  });
});

describe('persistencia entre rutas', () => {
  beforeEach(() => sessionStorage.clear());

  // La ruta de KYC se arma solo con `?code=`, asi que los UTM de la entrada ya
  // no estan en la URL: sin persistirlos se pierde la atribucion completa.
  it('recupera los UTM guardados cuando la URL ya no los trae', () => {
    persistUtmParams('?utm_source=meta&utm_term=activacion');
    expect(readUtmParams('?code=APP-1')).toEqual({
      utm_source: 'meta',
      utm_term: 'activacion',
    });
  });

  it('navegar a una ruta interna no borra la atribucion', () => {
    persistUtmParams('?utm_source=meta');
    persistUtmParams('?code=APP-1');
    expect(readUtmParams('?code=APP-1').utm_source).toBe('meta');
  });

  it('la URL gana sobre lo guardado', () => {
    persistUtmParams('?utm_source=meta');
    expect(readUtmParams('?utm_source=google').utm_source).toBe('google');
  });
});

describe('kycBypassHabilitado', () => {
  beforeEach(() => sessionStorage.clear());

  it('se habilita con el utm_term acordado (parametro de promotor)', () => {
    expect(kycBypassHabilitado('?utm_term=activacion')).toBe(true);
  });

  it('sigue habilitado en la ruta de KYC, que no lleva el UTM en la URL', () => {
    persistUtmParams('?utm_term=activacion');
    expect(kycBypassHabilitado('?code=APP-1')).toBe(true);
  });

  // Es una puerta angosta a proposito: cualquier otro trafico no la ve.
  it('no se habilita sin el UTM ni con otro valor', () => {
    expect(kycBypassHabilitado('?code=APP-1')).toBe(false);
    expect(kycBypassHabilitado('?utm_term=otra-cosa')).toBe(false);
    // El valor en utm_content ya NO habilita: el gate vive en utm_term.
    expect(kycBypassHabilitado('?utm_content=activacion')).toBe(false);
    expect(kycBypassHabilitado('?utm_campaign=activacion')).toBe(false);
  });
});
