import { resolveDetailVariant } from '../detailVariant';

const base = {
  landing: 'copia-home',
  overlayVariant: '' as string | null,
  isMobile: false,
  isRefurbished: true,
};

describe('resolveDetailVariant', () => {
  describe('copia-home (por slug)', () => {
    it('da la variante de escritorio cuando el equipo es reacondicionado', () => {
      expect(resolveDetailVariant(base)).toBe('grades-desktop');
    });

    it('da la variante mobile para cualquier equipo, no solo reacondicionados', () => {
      expect(resolveDetailVariant({ ...base, isMobile: true, isRefurbished: false })).toBe('grades-mobile');
    });

    it('deja el equipo nuevo en la ficha estándar en escritorio', () => {
      expect(resolveDetailVariant({ ...base, isRefurbished: false })).toBe('standard');
    });

    // El slug se conoce sin pedir nada, así que estas landings nunca esperan.
    it('no espera a que resuelva la configuración', () => {
      expect(resolveDetailVariant({ ...base, overlayVariant: null })).toBe('grades-desktop');
    });
  });

  // Segundo financiamiento: desde el 29-sep-2026 usa la ficha estándar, la
  // misma de home. Antes caía en la de grados de copia-home, que es de prueba
  // interna (renueva-tu-equipo-1, Dell Latitude 7420 combo 186).
  describe('renueva-* (segundo financiamiento)', () => {
    const renueva = { ...base, landing: 'renueva-tu-equipo-1', overlayVariant: '' };

    it.each(['renueva-tu-equipo-1', 'renueva-tu-equipo-2', 'RENUEVA-lima'])(
      'deja a %s en la ficha estándar con un reacondicionado',
      (landing) => {
        expect(resolveDetailVariant({ ...renueva, landing })).toBe('standard');
      },
    );

    it.each([false, true])('deja la ficha estándar en mobile (isRefurbished=%s)', (isRefurbished) => {
      expect(resolveDetailVariant({ ...renueva, isMobile: true, isRefurbished })).toBe('standard');
    });
  });

  describe('Family Farms (por variante de overlay)', () => {
    const ff = { ...base, landing: 'family-farms-baldecash-b', overlayVariant: 'familyfarm' };

    it('da la variante de escritorio a un reacondicionado', () => {
      expect(resolveDetailVariant(ff)).toBe('grades-desktop');
    });

    it('da la variante mobile a un reacondicionado', () => {
      expect(resolveDetailVariant({ ...ff, isMobile: true })).toBe('grades-mobile');
    });

    // A diferencia de copia-home, acá el equipo nuevo NO cambia de ficha: el
    // pedido es mostrar grados, y un equipo nuevo no tiene.
    it.each([false, true])('deja el equipo nuevo en la ficha estándar (isMobile=%s)', (isMobile) => {
      expect(resolveDetailVariant({ ...ff, isRefurbished: false, isMobile })).toBe('standard');
    });
  });

  describe('mientras la configuración no resolvió', () => {
    const desconocida = { ...base, landing: 'una-landing-cualquiera', overlayVariant: null };

    // Decidir con overlayVariant en null dibujaría la ficha estándar y saltaría
    // al selector medio segundo después. Mejor esperar: es media columna que
    // cambia entera.
    it('pide esperar en vez de arriesgar el salto', () => {
      expect(resolveDetailVariant(desconocida)).toBe('pending');
    });

    it('resuelve a estándar apenas se sabe que no es Family Farms', () => {
      expect(resolveDetailVariant({ ...desconocida, overlayVariant: '' })).toBe('standard');
    });

    it('no espera si el equipo no es reacondicionado: ninguna variante lo cambia', () => {
      expect(resolveDetailVariant({ ...desconocida, isRefurbished: false })).toBe('standard');
    });
  });

  describe('otras variantes de overlay', () => {
    it.each(['cade', 'otra'])('deja a %s en la ficha estándar', (overlayVariant) => {
      expect(resolveDetailVariant({ ...base, landing: 'cade-2026', overlayVariant })).toBe('standard');
    });
  });
});
