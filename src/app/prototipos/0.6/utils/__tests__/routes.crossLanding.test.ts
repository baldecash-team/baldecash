import {
  transformConfigHref,
  parseCrossLanding,
  buildCrossLandingHref,
  BASE_PATH,
} from '../routes';

/**
 * Destinos que apuntan a OTRA landing (`@slug/pagina`).
 *
 * Lo que más importa acá no es el formato nuevo sino que los hrefs YA
 * guardados sigan resolviendo igual: hay 100 landings en producción con
 * enlaces configurados, y este es el único punto por donde pasan todos.
 */
describe('transformConfigHref', () => {
  const ACTUAL = 'home-2';

  describe('lo que ya estaba guardado (no debe cambiar)', () => {
    it('una ruta relativa se cuelga de la landing actual', () => {
      expect(transformConfigHref('catalogo', ACTUAL)).toBe(`${BASE_PATH}/home-2/catalogo`);
    });

    it('conserva el querystring', () => {
      expect(transformConfigHref('catalogo?condition=reacondicionado', ACTUAL)).toBe(
        `${BASE_PATH}/home-2/catalogo?condition=reacondicionado`
      );
    });

    it('un ancla va al home de la landing actual, no a la página en curso', () => {
      expect(transformConfigHref('#faq', ACTUAL)).toBe(`${BASE_PATH}/home-2#faq`);
    });

    it('una URL absoluta se deja intacta', () => {
      const url = 'https://www.baldecash.com/reacondicionados/catalogo/';
      expect(transformConfigHref(url, ACTUAL)).toBe(url);
    });

    it('sin href devuelve vacío', () => {
      expect(transformConfigHref('', ACTUAL)).toBe('');
    });
  });

  describe('destino en otra landing', () => {
    it('resuelve contra la landing del prefijo, no contra la actual', () => {
      expect(transformConfigHref('@reacondicionados/catalogo', ACTUAL)).toBe(
        `${BASE_PATH}/reacondicionados/catalogo`
      );
    });

    it('sin página apunta al home de esa landing', () => {
      expect(transformConfigHref('@reacondicionados', ACTUAL)).toBe(
        `${BASE_PATH}/reacondicionados`
      );
    });

    it('conserva el querystring del destino', () => {
      expect(transformConfigHref('@reacondicionados/catalogo?condition=nueva', ACTUAL)).toBe(
        `${BASE_PATH}/reacondicionados/catalogo?condition=nueva`
      );
    });

    it('un ancla va al home de ESA landing', () => {
      expect(transformConfigHref('@reacondicionados#faq', ACTUAL)).toBe(
        `${BASE_PATH}/reacondicionados#faq`
      );
    });

    it('soporta rutas de varios segmentos', () => {
      expect(transformConfigHref('@otra/legal/terminos-y-condiciones', ACTUAL)).toBe(
        `${BASE_PATH}/otra/legal/terminos-y-condiciones`
      );
    });

    // El bug que motivó el prefijo: sin él, `otra/catalogo` terminaba en
    // `/home-2/otra/catalogo`, una ruta que no existe.
    it('sin el prefijo seguiría colgándose de la landing actual', () => {
      expect(transformConfigHref('reacondicionados/catalogo', ACTUAL)).toBe(
        `${BASE_PATH}/home-2/reacondicionados/catalogo`
      );
    });
  });

  describe('seguridad', () => {
    it('un slug con barras de más no se trata como cross-landing', () => {
      // Cae a la rama normal en vez de construir una ruta rara.
      expect(transformConfigHref('@../otra/catalogo', ACTUAL)).toBe(
        `${BASE_PATH}/home-2/@../otra/catalogo`
      );
    });

    it('un slug vacío no se trata como cross-landing', () => {
      expect(transformConfigHref('@/catalogo', ACTUAL)).toBe(
        `${BASE_PATH}/home-2/@/catalogo`
      );
    });

    it('un esquema peligroso no se disfraza de cross-landing', () => {
      expect(parseCrossLanding('@javascript:alert(1)')).toBeNull();
    });
  });
});

describe('parseCrossLanding', () => {
  it('parte el slug y el resto', () => {
    expect(parseCrossLanding('@home-3/catalogo')).toEqual({
      landing: 'home-3',
      resto: 'catalogo',
    });
  });

  it('sin resto devuelve cadena vacía', () => {
    expect(parseCrossLanding('@home-3')).toEqual({ landing: 'home-3', resto: '' });
  });

  it('el ancla queda en el resto, con su almohadilla', () => {
    expect(parseCrossLanding('@home-3#faq')).toEqual({ landing: 'home-3', resto: '#faq' });
  });

  it('un href normal no es cross-landing', () => {
    expect(parseCrossLanding('catalogo')).toBeNull();
  });

  it('rechaza un slug con mayúsculas o puntos', () => {
    expect(parseCrossLanding('@Home-3/catalogo')).toBeNull();
    expect(parseCrossLanding('@home.3/catalogo')).toBeNull();
  });
});

describe('buildCrossLandingHref', () => {
  it('arma el valor que se guarda', () => {
    expect(buildCrossLandingHref('home-3', 'catalogo')).toBe('@home-3/catalogo');
  });

  it('sin página apunta al home', () => {
    expect(buildCrossLandingHref('home-3', '')).toBe('@home-3');
  });

  // Ida y vuelta: lo que se arma se tiene que poder volver a leer.
  it('lo construido se vuelve a parsear igual', () => {
    const href = buildCrossLandingHref('home-3', 'catalogo?condition=nueva');
    expect(parseCrossLanding(href)).toEqual({
      landing: 'home-3',
      resto: 'catalogo?condition=nueva',
    });
  });
});
