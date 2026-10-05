import { stripHtml } from '../stripHtml';

describe('stripHtml', () => {
  it('deja igual un texto que no trae HTML', () => {
    expect(stripHtml('Respuestas a las preguntas más comunes')).toBe(
      'Respuestas a las preguntas más comunes'
    );
  });

  it('quita una etiqueta <p> envolvente', () => {
    expect(stripHtml('<p>Respuestas a las preguntas más comunes</p>')).toBe(
      'Respuestas a las preguntas más comunes'
    );
  });

  it('quita etiquetas anidadas', () => {
    expect(stripHtml('<p>Hola <strong>mundo</strong>, <em>bienvenido</em></p>')).toBe(
      'Hola mundo, bienvenido'
    );
  });

  it('decodifica entidades HTML comunes', () => {
    expect(stripHtml('Preguntas &amp; respuestas')).toBe('Preguntas & respuestas');
    expect(stripHtml('Garantía&nbsp;incluida')).toBe('Garantía incluida');
    expect(stripHtml('&quot;Seminuevo&quot;')).toBe('"Seminuevo"');
  });

  it('devuelve string vacío para string vacío', () => {
    expect(stripHtml('')).toBe('');
  });

  it('devuelve string vacío para null o undefined', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
  });

  it('colapsa espacios repetidos que puede dejar el editor rich-text', () => {
    expect(stripHtml('<p>Uno   Dos</p>')).toBe('Uno Dos');
  });

  it('no pega palabras de párrafos distintos que no tenían espacio entre etiquetas', () => {
    // Comportamiento esperado: <p>Uno</p><p>Dos</p> no trae un espacio en el
    // HTML fuente, así que no se inventa uno al quitar las etiquetas.
    expect(stripHtml('<p>Uno</p><p>Dos</p>')).toBe('UnoDos');
  });
});
