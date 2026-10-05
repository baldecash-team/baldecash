import { sanearMontoEscrito, redondearSoles, totalAFinanciar } from './calculadora';

/**
 * Saneo de lo que se teclea en los campos de importe.
 *
 * Los campos son de texto y no numericos: un campo numerico responde a la rueda
 * del raton mientras tiene el foco, asi que desplazar la pagina con el puntero
 * encima cambia el importe sin que la persona lo advierta. Y el dano es
 * silencioso, porque la cuota se vuelve a simular con el monto nuevo y la
 * pantalla queda coherente consigo misma.
 *
 * A cambio, el filtrado deja de ser cosa del navegador y pasa a ser nuestro.
 */
describe('sanearMontoEscrito', () => {
  it('deja pasar digitos y el punto decimal', () => {
    expect(sanearMontoEscrito('350.50')).toBe('350.50');
  });

  it('descarta letras y simbolos', () => {
    expect(sanearMontoEscrito('3a5b0$')).toBe('350');
    expect(sanearMontoEscrito('S/ 800')).toBe('800');
  });

  /**
   * En Peru el separador decimal se escribe indistintamente con coma o con
   * punto. Descartarla convertiria 350,50 en 35050: un error de cien veces el
   * importe, en un campo cuyo valor termina en un contrato.
   */
  it('convierte la coma en punto en vez de descartarla', () => {
    expect(sanearMontoEscrito('350,50')).toBe('350.50');
  });

  it('conserva solo el primer separador decimal', () => {
    expect(sanearMontoEscrito('350.5.5')).toBe('350.55');
  });

  it('limita a dos decimales, que es la precision del soles', () => {
    expect(sanearMontoEscrito('350.505')).toBe('350.50');
    expect(sanearMontoEscrito('12.3456')).toBe('12.34');
  });

  it('no admite espacios', () => {
    expect(sanearMontoEscrito('1 000')).toBe('1000');
  });

  /**
   * Los estados intermedios de tecleo existen porque el campo es de texto.
   * Ninguno puede romperse ni corregirse a la fuerza: quien esta escribiendo
   * 350.50 pasa por 350. antes de llegar, y reescribirle el campo mientras
   * teclea es peor que dejarlo.
   */
  it('conserva los estados intermedios de tecleo', () => {
    expect(sanearMontoEscrito('')).toBe('');
    expect(sanearMontoEscrito('.')).toBe('.');
    expect(sanearMontoEscrito('350.')).toBe('350.');
    expect(sanearMontoEscrito('.5')).toBe('.5');
  });

  it('un texto sin ningun caracter valido queda vacio', () => {
    expect(sanearMontoEscrito('abc')).toBe('');
  });

  /**
   * El importe saneado tiene que poder leerse como numero sin sorpresas: es lo
   * que despues se suma, se simula y viaja con la solicitud.
   */
  it('lo que devuelve se interpreta como el numero esperado', () => {
    expect(Number.parseFloat(sanearMontoEscrito('350,50'))).toBe(350.5);
    expect(Number.parseFloat(sanearMontoEscrito('1 000.99'))).toBe(1000.99);
    expect(Number.isNaN(Number.parseFloat(sanearMontoEscrito('.')))).toBe(true);
  });

  it('la suma de dos importes con centimos no arrastra el error de coma flotante', () => {
    const matricula = Number.parseFloat(sanearMontoEscrito('350,50'));
    const primeraCuota = Number.parseFloat(sanearMontoEscrito('450,80'));

    expect(totalAFinanciar({ matricula, primeraCuota })).toBe(801.3);
    expect(redondearSoles(matricula + primeraCuota)).toBe(801.3);
  });
});
