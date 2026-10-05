/// <reference types="jest" />
/**
 * Decisión de error del sub-paso DNI + selfie.
 *
 * Lo que se prueba no es el texto sino **qué acción se ofrece**: ante una foto
 * que el servicio no pudo leer, "Reintentar" repite la misma llamada con la
 * misma imagen y vuelve a fallar, así que la salida tiene que ser repetir la
 * foto. Esa distinción era la que faltaba: la UI anterior ponía "Reintentar"
 * como acción principal en todos los fallos.
 *
 * Se prueban las funciones puras y no el componente porque llegar a estas
 * ramas exige dos capturas de cámara, y jsdom no tiene `getUserMedia`.
 */
import { documentFailure, faceFailure } from '../DniSelfieStep';

describe('documentFailure — lectura del documento', () => {
  it('el número no está en la foto: pide repetir, con consejos', () => {
    const f = documentFailure({ success: true, status: 'not_found' });
    expect(f.primary).toBe('retake');
    expect(f.tips.length).toBeGreaterThan(0);
    expect(f.title).toMatch(/no es tu DNI/i);
  });

  it.each(['low_confidence', 'unreadable'] as const)(
    'foto ilegible (%s): pide repetir, con consejos',
    (status) => {
      const f = documentFailure({ success: true, status });
      expect(f.primary).toBe('retake');
      expect(f.tips.length).toBeGreaterThan(0);
    },
  );

  it('DNI ajeno a la solicitud: no sirve repetir la foto, sino corregir el número', () => {
    const f = documentFailure({ success: false, reason: 'ownership_check_failed' });
    expect(f.primary).toBe('retry');
    expect(f.tips).toHaveLength(0);
    expect(f.title).toMatch(/no coincide/i);
  });

  it.each(['ownership_locked', 'rate_limited'])(
    'demasiados intentos (%s): esperar, no repetir fotos',
    (reason) => {
      const f = documentFailure({ success: false, reason });
      expect(f.primary).toBe('retry');
      expect(f.title).toMatch(/intentos/i);
    },
  );

  it('error de red: reintentar es la salida correcta', () => {
    const f = documentFailure({ success: false, error: 'Error de conexión.' });
    expect(f.primary).toBe('retry');
    expect(f.detail).toBe('Error de conexión.');
  });
});

describe('faceFailure — comparación de rostros', () => {
  it('Rekognition no halló rostro: repetir la foto, NO reintentar', () => {
    // El caso concreto que motivó el cambio: reintentar con la misma imagen
    // devuelve el mismo InvalidParameterException.
    const f = faceFailure({ success: false, error_code: 'InvalidParameterException' });
    expect(f.primary).toBe('retake');
    expect(f.tips.length).toBeGreaterThan(0);
    expect(f.title).toMatch(/rostro/i);
  });

  it('error transitorio de AWS: reintentar, sin consejos de foto', () => {
    const f = faceFailure({ success: false, error_code: 'ThrottlingException', error: 'Saturado.' });
    expect(f.primary).toBe('retry');
    expect(f.tips).toHaveLength(0);
  });

  it('error sin código: reintentar', () => {
    expect(faceFailure({ success: false, error: 'Vaya.' }).primary).toBe('retry');
  });

  it('rostros distintos: repetir fotos e informar el porcentaje', () => {
    const f = faceFailure({ success: true, is_match: false, similarity: 23 });
    expect(f.primary).toBe('retake');
    expect(f.detail).toContain('23%');
  });

  it('rostros distintos sin porcentaje: no inventa un número', () => {
    const f = faceFailure({ success: true, is_match: false });
    expect(f.detail).not.toMatch(/\d+%/);
  });
});
