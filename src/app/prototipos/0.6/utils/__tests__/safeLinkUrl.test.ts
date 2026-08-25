import { safeLinkUrl } from '../safeLinkUrl';

describe('safeLinkUrl', () => {
  describe('deja pasar lo que es navegable', () => {
    it('acepta https y http', () => {
      expect(safeLinkUrl('https://baldecash.com/promo')).toBe('https://baldecash.com/promo');
      expect(safeLinkUrl('http://baldecash.com')).toBe('http://baldecash.com');
    });

    it('acepta rutas internas, que es el caso de uso del banner', () => {
      // safeExternalUrl NO sirve para esto: `new URL('/x')` sin base lanza.
      expect(safeLinkUrl('/prototipos/0.6/reacondicionados#que-es'))
        .toBe('/prototipos/0.6/reacondicionados#que-es');
      expect(safeLinkUrl('/catalogo')).toBe('/catalogo');
    });

    it('acepta anclas y querystrings sueltos', () => {
      expect(safeLinkUrl('#que-es')).toBe('#que-es');
      expect(safeLinkUrl('?marca=lenovo')).toBe('?marca=lenovo');
    });

    it('recorta los espacios de los lados', () => {
      expect(safeLinkUrl('  /catalogo  ')).toBe('/catalogo');
    });
  });

  describe('bloquea lo peligroso', () => {
    it('rechaza javascript:, que es el XSS almacenado que motivó esto', () => {
      expect(safeLinkUrl('javascript:alert(1)')).toBe('');
      // Con mayúsculas y espacios, como se suele intentar evadir un filtro.
      expect(safeLinkUrl('  JavaScript:alert(1)')).toBe('');
    });

    it('rechaza data: y vbscript:', () => {
      expect(safeLinkUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(safeLinkUrl('vbscript:msgbox(1)')).toBe('');
    });

    it('rechaza protocol-relative, que parece interna pero es externa', () => {
      // `//evil.com` empieza por `/` pero el navegador la resuelve como
      // https://evil.com. Un chequeo ingenuo de «empieza por slash» la dejaría
      // pasar; por eso hay un caso propio.
      expect(safeLinkUrl('//evil.com')).toBe('');
      expect(safeLinkUrl('//evil.com/phishing')).toBe('');
    });

    it('rechaza esquemas que no navegan a una página', () => {
      expect(safeLinkUrl('mailto:hola@baldecash.com')).toBe('');
      expect(safeLinkUrl('file:///etc/passwd')).toBe('');
    });

    it('rechaza lo que ni siquiera es una URL', () => {
      expect(safeLinkUrl('baldecash.com')).toBe('');  // sin esquema
      expect(safeLinkUrl('no es una url')).toBe('');
    });
  });

  describe('vacíos', () => {
    it('devuelve el fallback con null, undefined o cadena vacía', () => {
      expect(safeLinkUrl(null)).toBe('');
      expect(safeLinkUrl(undefined)).toBe('');
      expect(safeLinkUrl('')).toBe('');
      expect(safeLinkUrl('   ')).toBe('');
    });

    it('respeta el fallback que se le pase', () => {
      expect(safeLinkUrl('javascript:alert(1)', '/catalogo')).toBe('/catalogo');
      expect(safeLinkUrl(null, '/catalogo')).toBe('/catalogo');
    });
  });
});
