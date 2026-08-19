import { isBlockedByRange } from './DateInput';

/**
 * Hasta BAL-3139 el calendario bloqueaba TODAS las fechas futuras, hardcodeado
 * en las 3 vistas (dias, meses y anios). Eso dejaba inutilizable cualquier
 * campo de vencimiento, como "¿Cual es la fecha limite de pago?" del
 * formulario de matricula: pedia una fecha futura y no dejaba elegir ninguna.
 *
 * El default sigue siendo 'past' porque los campos date que ya existian son
 * todos de fecha pasada (nacimiento, ingreso al trabajo): con ese default
 * siguen comportandose igual.
 *
 * Se prueba la funcion pura y no el componente montado porque el Popover de
 * NextUI no renderiza en jsdom (el mock global de framer-motion no cubre
 * LazyMotion). La regla vive aca y las 3 vistas la comparten.
 */

// Fecha fija para que los tests no dependan del dia en que corran
const HOY = new Date(2026, 7, 19, 14, 30); // 19-ago-2026, media tarde

const AYER = new Date(2026, 7, 18, 9, 0);
const MANANA = new Date(2026, 7, 20, 9, 0);
const HOY_TEMPRANO = new Date(2026, 7, 19, 0, 30);
const HOY_TARDE = new Date(2026, 7, 19, 23, 45);
const ANIO_PASADO = new Date(2025, 0, 1);
const ANIO_FUTURO = new Date(2027, 0, 1);

describe('isBlockedByRange', () => {
  describe("'past' — el comportamiento historico", () => {
    it('bloquea manana', () => {
      expect(isBlockedByRange(MANANA, 'past', HOY)).toBe(true);
    });

    it('permite ayer', () => {
      expect(isBlockedByRange(AYER, 'past', HOY)).toBe(false);
    });

    it('permite hoy a cualquier hora, incluso casi medianoche', () => {
      expect(isBlockedByRange(HOY_TEMPRANO, 'past', HOY)).toBe(false);
      expect(isBlockedByRange(HOY_TARDE, 'past', HOY)).toBe(false);
    });

    it('bloquea un anio futuro y permite uno pasado', () => {
      expect(isBlockedByRange(ANIO_FUTURO, 'past', HOY)).toBe(true);
      expect(isBlockedByRange(ANIO_PASADO, 'past', HOY)).toBe(false);
    });
  });

  describe("'future' — lo que necesita la fecha limite de pago", () => {
    it('permite manana', () => {
      expect(isBlockedByRange(MANANA, 'future', HOY)).toBe(false);
    });

    it('bloquea ayer', () => {
      expect(isBlockedByRange(AYER, 'future', HOY)).toBe(true);
    });

    it('permite hoy: un vencimiento puede ser hoy mismo', () => {
      expect(isBlockedByRange(HOY_TEMPRANO, 'future', HOY)).toBe(false);
      expect(isBlockedByRange(HOY_TARDE, 'future', HOY)).toBe(false);
    });

    it('permite un anio futuro y bloquea uno pasado', () => {
      expect(isBlockedByRange(ANIO_FUTURO, 'future', HOY)).toBe(false);
      expect(isBlockedByRange(ANIO_PASADO, 'future', HOY)).toBe(true);
    });
  });

  describe("'any' — sin limite", () => {
    it('no bloquea nada', () => {
      expect(isBlockedByRange(AYER, 'any', HOY)).toBe(false);
      expect(isBlockedByRange(MANANA, 'any', HOY)).toBe(false);
      expect(isBlockedByRange(ANIO_PASADO, 'any', HOY)).toBe(false);
      expect(isBlockedByRange(ANIO_FUTURO, 'any', HOY)).toBe(false);
    });
  });

  describe('no-rotura', () => {
    it("'past' y 'future' son opuestos salvo en el propio dia de hoy", () => {
      // Fuera de hoy, lo que uno bloquea el otro lo permite
      for (const fecha of [AYER, MANANA, ANIO_PASADO, ANIO_FUTURO]) {
        expect(isBlockedByRange(fecha, 'past', HOY)).toBe(
          !isBlockedByRange(fecha, 'future', HOY)
        );
      }
      // Hoy es valido en los dos
      expect(isBlockedByRange(HOY_TEMPRANO, 'past', HOY)).toBe(false);
      expect(isBlockedByRange(HOY_TEMPRANO, 'future', HOY)).toBe(false);
    });
  });
});
